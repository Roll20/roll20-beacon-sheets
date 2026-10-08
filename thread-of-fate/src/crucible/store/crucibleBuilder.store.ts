/**
 * The builder store: the entity currently on the anvil. Holds a working copy so
 * cancelling an edit never corrupts the library, plus the prompt flow state for
 * Spark / Ember modes.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { createEmptyEntity } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleAssumption, CrucibleEntityKind } from '@/crucible/schemas/crucibleCommon';
import { computeCrucibleDerived } from '@/crucible/engine/computeCrucibleDerived';
import { validateCrucibleEntity } from '@/crucible/engine/validateCrucibleEntity';
import {
  generateEntityFromPrompt,
  type GenerateResult,
} from '@/crucible/engine/generateEntityDraft';
import { parseCrucibleIntent, type CrucibleIntent } from '@/crucible/engine/parseCrucibleIntent';
import { recommendCreatureStats } from '@/crucible/engine/recommendCreatureStats';
import type { ThreatRecommendation } from '@/crucible/schemas/crucibleThreat.schema';
import { budgetForTarget } from '@/crucible/engine/calculateThreatBudget';
import { bandFor } from '@/crucible/data/registries/threatBalance.registry';
import { useCrucibleLibraryStore } from './crucibleLibrary.store';
import { useCrucibleCharacterStore } from './crucibleCharacter.store';

export type BuilderStep =
  | 'concept'
  | 'classification'
  | 'party'
  | 'stats'
  | 'defenses'
  | 'movement'
  | 'traits'
  | 'actions'
  | 'magic'
  | 'phases'
  | 'npc'
  | 'behavior'
  | 'loot'
  | 'token'
  | 'review';

export const BUILDER_STEP_LABELS: Record<BuilderStep, string> = {
  concept: 'Concept',
  classification: 'Classification',
  party: 'Party Target',
  stats: 'Stats',
  defenses: 'Defenses',
  movement: 'Movement & Senses',
  traits: 'Traits',
  actions: 'Actions',
  magic: 'Artes',
  phases: 'Phases',
  npc: 'Persona',
  behavior: 'Behavior',
  loot: 'Loot',
  token: 'Token',
  review: 'Review',
};

/** Steps that apply to a given entity kind, in order. */
export function stepsForKind(kind: CrucibleEntityKind): BuilderStep[] {
  const base: BuilderStep[] = [
    'concept',
    'classification',
    'party',
    'stats',
    'defenses',
    'movement',
    'traits',
    'actions',
  ];
  const tail: BuilderStep[] = ['loot', 'token', 'review'];
  switch (kind) {
    case 'npc':
      return [
        'concept',
        'npc',
        'classification',
        'party',
        'stats',
        'defenses',
        'movement',
        'traits',
        'actions',
        'magic',
        'behavior',
        ...tail,
      ];
    case 'boss':
    case 'mythicBoss':
      return [...base, 'magic', 'phases', 'behavior', ...tail];
    case 'hazard':
    case 'trap':
      return [
        'concept',
        'classification',
        'party',
        'stats',
        'defenses',
        'actions',
        'token',
        'review',
      ];
    case 'vehicle':
      return [
        'concept',
        'classification',
        'stats',
        'defenses',
        'movement',
        'actions',
        'token',
        'review',
      ];
    default:
      return [...base, 'magic', 'behavior', ...tail];
  }
}

export const useCrucibleBuilderStore = defineStore('crucibleBuilder', () => {
  const library = useCrucibleLibraryStore();

  /** The working copy being edited; null when the builder is idle. */
  const working = ref<CrucibleEntitySchema | null>(null);
  const currentStep = ref<BuilderStep>('concept');
  const isNew = ref(true);

  /** Spark/Ember prompt state. */
  const prompt = ref('');
  const lastIntent = ref<CrucibleIntent | null>(null);
  const generationNotes = ref<string[]>([]);

  const steps = computed(() => (working.value ? stepsForKind(working.value.kind) : []));
  const validation = computed(() => working.value?.validation ?? []);
  const derived = computed(() => working.value?.derived ?? null);
  const assumptions = computed(() => working.value?.assumptions ?? []);

  /** Live difficulty read against the entity's own party target. */
  const partyCheck = computed(() => {
    const w = working.value;
    if (!w || w.creationContext.partyTarget.size <= 0) return null;
    const budget = budgetForTarget(w.creationContext.partyTarget);
    const count = Math.max(1, w.creationContext.plannedCount);
    const total = w.progression.threatRating * count;
    return {
      budget: budget.total,
      partySize: budget.size,
      enemyThreat: total,
      difficulty: bandFor(total, budget.total, budget.size),
    };
  });

  const recommendation = computed<ThreatRecommendation | null>(() => {
    const w = working.value;
    if (!w) return null;
    const target = w.creationContext.partyTarget;
    if (target.size <= 0) return null;
    const desired =
      w.creationContext.desiredDifficulty === 'any'
        ? 'medium'
        : w.creationContext.desiredDifficulty;
    const kindKey =
      w.kind === 'boss'
        ? 'boss'
        : w.kind === 'mythicBoss'
        ? 'mythic'
        : w.kind === 'minion'
        ? 'minion'
        : w.kind === 'swarm'
        ? 'swarm'
        : 'standard';
    return recommendCreatureStats({
      partySize: target.size,
      partyLevels: Array.from({ length: target.size }, () => target.averageLevel),
      desiredDifficulty: desired,
      enemyCount: Math.max(1, w.creationContext.plannedCount),
      roleIds: w.classification.roleIds,
      kind: kindKey,
    });
  });

  // --- Lifecycle -------------------------------------------------------------

  function recompute() {
    if (!working.value) return;
    working.value.derived = computeCrucibleDerived(working.value);
    working.value.validation = validateCrucibleEntity(working.value);
  }

  function startNew(kind: CrucibleEntityKind) {
    working.value = createEmptyEntity(uuidv4(), kind, new Date().toISOString());
    isNew.value = true;
    currentStep.value = 'concept';
    lastIntent.value = null;
    generationNotes.value = [];
    recompute();
  }

  function open(id: string): boolean {
    const entity = library.byId(id);
    if (!entity) return false;
    working.value = JSON.parse(JSON.stringify(entity));
    isNew.value = false;
    currentStep.value = 'concept';
    recompute();
    return true;
  }

  /** Spark / Ember: one prompt in, a reviewed draft out. */
  function generateFromPrompt(input: string): GenerateResult {
    prompt.value = input;
    const result = generateEntityFromPrompt(input, { id: uuidv4() });
    working.value = result.entity;
    lastIntent.value = result.intent;
    generationNotes.value = result.notes;
    isNew.value = true;
    currentStep.value = 'review';
    return result;
  }

  /** Re-generate with a different seed but the same prompt ("reroll"). */
  function reroll(): GenerateResult | null {
    if (!prompt.value) return null;
    const result = generateEntityFromPrompt(prompt.value, {
      id: working.value?.id ?? uuidv4(),
      seed: (lastIntent.value?.seed ?? 0) + 1 + Math.floor(Math.random() * 1_000_000),
    });
    working.value = result.entity;
    lastIntent.value = result.intent;
    generationNotes.value = result.notes;
    return result;
  }

  /** Preview the parse without generating (drives the prompt hint UI). */
  function previewIntent(input: string): CrucibleIntent {
    return parseCrucibleIntent(input);
  }

  function saveToLibrary(): CrucibleEntitySchema | null {
    if (!working.value) return null;
    const saved = library.upsert(JSON.parse(JSON.stringify(working.value)));
    working.value = JSON.parse(JSON.stringify(saved));
    isNew.value = false;
    // If this entity is bound to the current Roll20 character, keep the sheet
    // (and its token bars) in step with the edit.
    const characterStore = useCrucibleCharacterStore();
    if (characterStore.bound?.id === saved.id) {
      characterStore.replace(JSON.parse(JSON.stringify(saved)));
    }
    return saved;
  }

  function discard() {
    working.value = null;
    lastIntent.value = null;
    generationNotes.value = [];
    prompt.value = '';
  }

  // --- Editing helpers -------------------------------------------------------

  /** Patch a top-level section then recompute. */
  function patch<K extends keyof CrucibleEntitySchema>(
    section: K,
    value: Partial<CrucibleEntitySchema[K]>,
  ) {
    if (!working.value) return;
    const current = working.value[section];
    working.value[section] =
      current && typeof current === 'object' && !Array.isArray(current)
        ? ({ ...(current as object), ...(value as object) } as CrucibleEntitySchema[K])
        : (value as CrucibleEntitySchema[K]);
    recompute();
  }

  /** Replace a whole section (for arrays / kind blocks). */
  function set<K extends keyof CrucibleEntitySchema>(section: K, value: CrucibleEntitySchema[K]) {
    if (!working.value) return;
    working.value[section] = value;
    recompute();
  }

  /** Accept an assumption (mark reviewed) or reject it (clear for manual entry). */
  function acceptAssumption(id: string) {
    if (!working.value) return;
    const a = working.value.assumptions.find((x) => x.id === id);
    if (a) a.accepted = true;
  }
  function dismissAssumption(id: string) {
    if (!working.value) return;
    working.value.assumptions = working.value.assumptions.filter((x) => x.id !== id);
  }

  function goTo(step: BuilderStep) {
    currentStep.value = step;
  }
  function next() {
    const list = steps.value;
    const idx = list.indexOf(currentStep.value);
    if (idx >= 0 && idx < list.length - 1) currentStep.value = list[idx + 1];
  }
  function back() {
    const list = steps.value;
    const idx = list.indexOf(currentStep.value);
    if (idx > 0) currentStep.value = list[idx - 1];
  }

  return {
    working,
    currentStep,
    isNew,
    prompt,
    lastIntent,
    generationNotes,
    steps,
    validation,
    derived,
    assumptions,
    partyCheck,
    recommendation,
    startNew,
    open,
    generateFromPrompt,
    reroll,
    previewIntent,
    saveToLibrary,
    discard,
    patch,
    set,
    recompute,
    acceptAssumption,
    dismissAssumption,
    goTo,
    next,
    back,
  };
});

export type { CrucibleAssumption };
