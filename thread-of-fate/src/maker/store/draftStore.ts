import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
  createEmptyDraft,
  STEP_ORDER,
  SCHEMA_VERSION,
  type CharacterDraft,
} from '@/maker/draftModel';
import type { AttributeKey, CharacterMakerStep, SelectedBackgroundTrait } from '@/maker/types';
import { rollStatArray } from '@/maker/rules/dice';
import {
  draftDerived,
  draftFinalScores,
  draftModifiers,
  draftRacialBonuses,
  hasCasterAccess,
  totalLevel,
} from '@/maker/rules/selectors';
import { validateDraft, isReadyToStart, warningsForStep } from '@/maker/rules/validation';
import { playResources, DEATH_FAILURE_LIMIT } from '@/maker/rules/playState';

const STORAGE_KEY = 'thread-of-fate:draft';

/**
 * Merge a saved draft onto a complete fresh template so older saves (missing
 * fields added in later versions) never crash the UI. Preserves the user's data.
 */
function migrate(p: Partial<CharacterDraft> | null | undefined): CharacterDraft {
  const base = createEmptyDraft(p?.id ?? uuidv4());
  if (!p) return base;
  return {
    ...base,
    ...p,
    schemaVersion: SCHEMA_VERSION,
    identity: { ...base.identity, ...p.identity },
    stats: {
      ...base.stats,
      ...p.stats,
      assigned: { ...base.stats.assigned, ...p.stats?.assigned },
    },
    background: { ...base.background, ...p.background },
    equipment: { ...base.equipment, ...p.equipment, packChoices: { ...p.equipment?.packChoices } },
    philosophy: { ...base.philosophy, ...p.philosophy },
    race: { ...base.race, ...p.race },
    classBuild: { ...base.classBuild, ...p.classBuild, growth: { ...p.classBuild?.growth } },
    artes: { ...base.artes, ...p.artes },
    bio: { ...base.bio, ...p.bio },
    inventory: { ...base.inventory, ...p.inventory },
    play: { ...base.play, ...p.play },
  };
}

function loadFromStorage(): CharacterDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * The primary store for the character maker. Holds the entire CharacterDraft,
 * exposes derived stats + validation, and persists to localStorage. It also
 * implements hydrate/dehydrate so the Beacon master store can sync it to Roll20.
 */
export const useDraftStore = defineStore('threadOfFate', () => {
  const draft = ref<CharacterDraft>(loadFromStorage() ?? createEmptyDraft(uuidv4()));

  /** The Overture finale (sunrise launch page) is a transient UI mode, not persisted. */
  const finale = ref(false);
  const enterFinale = () => {
    finale.value = true;
  };
  const exitFinale = () => {
    finale.value = false;
  };

  const touch = () => {
    draft.value.updatedAt = new Date().toISOString();
  };

  // --- Derived / computed ---
  const finalScores = computed(() => draftFinalScores(draft.value));
  const modifiers = computed(() => draftModifiers(draft.value));
  const racialBonuses = computed(() => draftRacialBonuses(draft.value));
  const derived = computed(() => draftDerived(draft.value));
  const level = computed(() => totalLevel(draft.value));
  const isCaster = computed(() => hasCasterAccess(draft.value));
  const warnings = computed(() => validateDraft(draft.value));
  const ready = computed(() => isReadyToStart(warnings.value));
  const stepWarnings = (step: CharacterMakerStep) => warningsForStep(warnings.value, step);
  const stepHasError = (step: CharacterMakerStep) =>
    stepWarnings(step).some((x) => x.severity === 'error');

  /** A step is "complete" if it has been visited and has no error-level warnings. */
  const stepComplete = (step: CharacterMakerStep) =>
    draft.value.visitedSteps.includes(step) && !stepHasError(step);

  // --- Navigation ---
  const currentStep = computed(() => draft.value.currentStep);

  function visit(step: CharacterMakerStep) {
    draft.value.currentStep = step;
    if (!draft.value.visitedSteps.includes(step)) draft.value.visitedSteps.push(step);
    touch();
  }
  function next() {
    const idx = STEP_ORDER.indexOf(draft.value.currentStep);
    if (idx < STEP_ORDER.length - 1) visit(STEP_ORDER[idx + 1]);
  }
  function back() {
    const idx = STEP_ORDER.indexOf(draft.value.currentStep);
    if (idx > 0) visit(STEP_ORDER[idx - 1]);
  }

  // --- Stats actions ---
  function rollArrays() {
    const count = draft.value.stats.rollMode === 'bestOfThree' ? 3 : 1;
    draft.value.stats.rollSets = Array.from({ length: count }, () => ({
      id: uuidv4(),
      values: rollStatArray(),
    }));
    draft.value.stats.chosenRollSetId = null;
    clearAssigned();
    touch();
  }
  function chooseRollSet(id: string) {
    draft.value.stats.chosenRollSetId = id;
    touch();
  }
  function assign(attr: AttributeKey, value: number | null) {
    draft.value.stats.assigned[attr] = value;
    touch();
  }
  function clearAssigned() {
    (Object.keys(draft.value.stats.assigned) as AttributeKey[]).forEach((k) => {
      draft.value.stats.assigned[k] = null;
    });
    touch();
  }

  // --- Background actions ---
  function addTrait(trait: SelectedBackgroundTrait) {
    draft.value.background.selectedTraits.push(trait);
    touch();
  }
  function removeTrait(uid: string) {
    draft.value.background.selectedTraits = draft.value.background.selectedTraits.filter(
      (t) => t.uid !== uid,
    );
    touch();
  }
  function updateTraitDetail(uid: string, detail: string) {
    const t = draft.value.background.selectedTraits.find((x) => x.uid === uid);
    if (t) t.detail = detail;
    touch();
  }

  // --- Generic patch helpers for the section forms ---
  function patch<K extends keyof CharacterDraft>(section: K, value: Partial<CharacterDraft[K]>) {
    draft.value[section] = { ...(draft.value[section] as object), ...value } as CharacterDraft[K];
    touch();
  }

  // --- Play-resource actions (the Play sheet) ---
  const resources = computed(() => playResources(draft.value));

  /** Apply damage (negative) or healing (positive). Damage spends Temp HP first. */
  function adjustHp(delta: number) {
    const p = draft.value.play;
    const max = resources.value.maxHp;
    if (delta < 0) {
      let dmg = -delta;
      const absorbed = Math.min(p.tempHp, dmg);
      p.tempHp -= absorbed;
      dmg -= absorbed;
      p.currentHp = Math.max(0, (p.currentHp ?? max) - dmg);
    } else {
      p.currentHp = Math.min(max, (p.currentHp ?? max) + delta);
    }
    touch();
  }
  function setHp(value: number) {
    draft.value.play.currentHp = Math.max(0, Math.min(resources.value.maxHp, Math.round(value)));
    touch();
  }
  function setTempHp(value: number) {
    draft.value.play.tempHp = Math.max(0, Math.round(value));
    touch();
  }
  function adjustStamina(delta: number) {
    const p = draft.value.play;
    p.currentStamina = Math.max(
      0,
      Math.min(
        resources.value.maxStamina,
        (p.currentStamina ?? resources.value.maxStamina) + delta,
      ),
    );
    touch();
  }
  function adjustAether(delta: number) {
    const p = draft.value.play;
    p.currentAether = Math.max(
      0,
      Math.min(resources.value.maxAether, (p.currentAether ?? resources.value.maxAether) + delta),
    );
    touch();
  }
  function spendHitDie(delta = 1) {
    const p = draft.value.play;
    p.hitDiceSpent = Math.max(0, Math.min(resources.value.totalHitDice, p.hitDiceSpent + delta));
    touch();
  }
  function setDeathFailures(n: number) {
    draft.value.play.deathFailures = Math.max(0, Math.min(DEATH_FAILURE_LIMIT, Math.round(n)));
    touch();
  }
  function toggleCondition(name: string) {
    const c = draft.value.play.conditions;
    const i = c.indexOf(name);
    if (i >= 0) c.splice(i, 1);
    else c.push(name);
    touch();
  }
  /** Full Rest: restore HP/Stamina/Aether, recover half your Hit Dice, clear dying. */
  function fullRest() {
    const r = resources.value;
    const p = draft.value.play;
    p.currentHp = r.maxHp;
    p.tempHp = 0;
    p.currentStamina = r.maxStamina;
    p.currentAether = r.maxAether;
    p.hitDiceSpent = Math.max(0, p.hitDiceSpent - Math.max(1, Math.floor(r.totalHitDice / 2)));
    p.deathFailures = 0;
    touch();
  }
  /** Reset all live tracking back to "at full". */
  function resetResources() {
    draft.value.play = {
      currentHp: null,
      tempHp: 0,
      currentStamina: null,
      currentAether: null,
      hitDiceSpent: 0,
      deathFailures: 0,
      conditions: [],
    };
    touch();
  }

  // --- Inventory actions (the Play sheet's Inventory page) ---
  type InvItem = CharacterDraft['inventory']['items'][number];
  function addInvItem(item: Partial<InvItem> = {}) {
    draft.value.inventory.items.push({
      id: uuidv4(),
      name: item.name ?? '',
      amount: item.amount ?? 1,
      weight: item.weight ?? 0,
      container: item.container ?? 'Inventory',
      type: item.type ?? 'Gear',
      slot: item.slot ?? null,
      notes: item.notes ?? '',
    });
    touch();
  }
  function setGear(value: Partial<CharacterDraft['inventory']['gear']>) {
    Object.assign(draft.value.inventory.gear, value);
    touch();
  }
  function updateInvItem(id: string, value: Partial<InvItem>) {
    const it = draft.value.inventory.items.find((i) => i.id === id);
    if (it) Object.assign(it, value);
    touch();
  }
  function removeInvItem(id: string) {
    draft.value.inventory.items = draft.value.inventory.items.filter((i) => i.id !== id);
    touch();
  }
  /** Equip an item to a slot (clearing whatever else held that slot), or unequip when slot is null. */
  function equipItem(id: string, slot: string | null) {
    const items = draft.value.inventory.items;
    if (slot)
      items.forEach((i) => {
        if (i.slot === slot) i.slot = null;
      });
    const it = items.find((i) => i.id === id);
    if (it) {
      it.slot = slot;
      if (slot) it.container = 'Inventory';
    }
    touch();
  }

  function reset() {
    draft.value = createEmptyDraft(uuidv4());
    finale.value = false;
    touch();
  }

  // --- Persistence (standalone) ---
  /** True after a save fails (usually localStorage quota, e.g. oversized images). */
  const storageFull = ref(false);
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft.value));
      storageFull.value = false;
    } catch {
      // Quota exceeded (typically large base64 portraits). Surface a flag the UI can read.
      storageFull.value = true;
      console.warn(
        'Thread of Fate: could not persist draft to localStorage (quota?). Portraits may be too large.',
      );
    }
  }

  function exportJson(): string {
    return JSON.stringify(draft.value, null, 2);
  }

  // --- Beacon sync (master store calls these). Stored under character.attributes.draft ---
  function dehydrate() {
    return draft.value;
  }
  function hydrate(stored?: CharacterDraft) {
    // Route through migrate() so older Roll20-stored drafts (missing newer
    // fields) are upgraded rather than dropped, same as the localStorage path.
    if (stored) {
      draft.value = migrate(stored);
    }
  }

  return {
    draft,
    // derived
    finalScores,
    modifiers,
    racialBonuses,
    derived,
    level,
    isCaster,
    warnings,
    ready,
    stepWarnings,
    stepHasError,
    stepComplete,
    currentStep,
    // nav
    visit,
    next,
    back,
    finale,
    enterFinale,
    exitFinale,
    // stats
    rollArrays,
    chooseRollSet,
    assign,
    clearAssigned,
    // background
    addTrait,
    removeTrait,
    updateTraitDetail,
    // play resources
    resources,
    adjustHp,
    setHp,
    setTempHp,
    adjustStamina,
    adjustAether,
    spendHitDie,
    setDeathFailures,
    toggleCondition,
    addInvItem,
    updateInvItem,
    removeInvItem,
    equipItem,
    setGear,
    fullRest,
    resetResources,
    // misc
    patch,
    reset,
    save,
    storageFull,
    exportJson,
    dehydrate,
    hydrate,
  };
});
