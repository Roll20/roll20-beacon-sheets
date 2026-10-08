/**
 * The character-bound entity: the Roll20-parity "NPC sheet" model.
 *
 * In Roll20's D&D system every NPC is its own character whose sheet shows the
 * statblock. The Crucible mirrors that: "Deploy to this sheet" binds a library
 * entity onto the CURRENT Roll20 character (attributes.crucible + cruciblePlay,
 * the same keys the crucible_* token-bar computed getters read), and from then
 * on this sheet opens as that creature's statblock with working rolls and bars.
 *
 * Play-state changes made here (HP, Aether, AP, phases, recharges) sync through
 * the master store's dehydrate, so token bars and the sheet always agree.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { migrateEntity } from '@/crucible/schemas/crucibleValidation';
import { computeCrucibleDerived } from '@/crucible/engine/computeCrucibleDerived';
import { validateCrucibleEntity } from '@/crucible/engine/validateCrucibleEntity';
import { playerSafeEntity } from '@/crucible/engine/convertEntityToRoll20';
import {
  emptyPlayState,
  crucibleMaxStamina,
  type CruciblePlayState,
} from '@/relay/handlers/crucibleComputed';

export type { CruciblePlayState };

export const useCrucibleCharacterStore = defineStore('crucibleCharacter', () => {
  /** The entity this Roll20 character IS; null for PC sheets. */
  const bound = ref<CrucibleEntitySchema | null>(null);
  const play = ref<CruciblePlayState>(emptyPlayState());
  /** True once a hydrate has run, so the UI can distinguish "no data yet". */
  const hydrated = ref(false);

  const isBound = computed(() => bound.value !== null);

  const maxHp = computed(() => bound.value?.derived.hitPoints ?? 0);
  const currentHp = computed(() => (play.value.currentHp ?? maxHp.value) + play.value.tempHp);
  const maxAether = computed(() => bound.value?.derived.aether ?? 0);
  const currentAether = computed(() => play.value.currentAether ?? maxAether.value);
  const maxAp = computed(() => bound.value?.derived.actionPoints ?? 0);
  const currentAp = computed(() => play.value.currentAp ?? maxAp.value);
  const maxStamina = computed(() => (bound.value ? crucibleMaxStamina(bound.value) : 0));
  const currentStamina = computed(() => play.value.currentStamina ?? maxStamina.value);

  /** Bind an entity to this character (Deploy). Resets play state to full. */
  function bind(entity: CrucibleEntitySchema) {
    const copy: CrucibleEntitySchema = JSON.parse(JSON.stringify(entity));
    copy.derived = computeCrucibleDerived(copy);
    copy.validation = validateCrucibleEntity(copy);
    bound.value = copy;
    play.value = emptyPlayState();
  }

  /** Remove the binding (turn the sheet back into a plain character sheet). */
  function unbind() {
    bound.value = null;
    play.value = emptyPlayState();
  }

  /** Replace the bound entity (edits saved from the builder). */
  function replace(entity: CrucibleEntitySchema) {
    const keepPlay = { ...play.value };
    bind(entity);
    play.value = keepPlay;
  }

  // --- Live play actions -----------------------------------------------------

  function adjustHp(delta: number) {
    if (!bound.value) return;
    const p = play.value;
    if (delta < 0) {
      let dmg = -delta;
      const absorbed = Math.min(p.tempHp, dmg);
      p.tempHp -= absorbed;
      dmg -= absorbed;
      p.currentHp = Math.max(0, (p.currentHp ?? maxHp.value) - dmg);
    } else {
      p.currentHp = Math.min(maxHp.value, (p.currentHp ?? maxHp.value) + delta);
    }
  }

  function adjustAether(delta: number) {
    if (!bound.value) return;
    play.value.currentAether = Math.max(
      0,
      Math.min(maxAether.value, (play.value.currentAether ?? maxAether.value) + delta),
    );
  }

  function adjustAp(delta: number) {
    if (!bound.value) return;
    play.value.currentAp = Math.max(
      0,
      Math.min(maxAp.value, (play.value.currentAp ?? maxAp.value) + delta),
    );
  }

  function resetAp() {
    play.value.currentAp = null;
  }

  function setPhase(phaseId: string | null) {
    play.value.activePhaseId = phaseId;
  }

  function markRechargeSpent(actionId: string, spent = true) {
    if (spent) play.value.spentRecharges = { ...play.value.spentRecharges, [actionId]: true };
    else {
      const next = { ...play.value.spentRecharges };
      delete next[actionId];
      play.value.spentRecharges = next;
    }
  }

  /** Full restore (new encounter). */
  function rest() {
    play.value = emptyPlayState();
  }

  // --- Beacon sync (master store calls these) --------------------------------

  function dehydrateEntity(): CrucibleEntitySchema | null {
    return bound.value;
  }
  function dehydratePlay(): CruciblePlayState {
    return play.value;
  }
  /**
   * Hydrate from Roll20 attributes. `isGM` decides whether GM-only content is
   * kept: players get the player-safe projection even if raw data arrived.
   */
  function hydrate(storedEntity?: unknown, storedPlay?: unknown, isGM = true) {
    hydrated.value = true;
    if (storedEntity && typeof storedEntity === 'object') {
      const migrated = migrateEntity(storedEntity as Record<string, unknown>);
      migrated.derived = computeCrucibleDerived(migrated);
      bound.value = isGM ? migrated : playerSafeEntity(migrated);
    }
    if (storedPlay && typeof storedPlay === 'object') {
      play.value = { ...emptyPlayState(), ...(storedPlay as Partial<CruciblePlayState>) };
    }
  }

  return {
    bound,
    play,
    hydrated,
    isBound,
    maxHp,
    currentHp,
    maxAether,
    currentAether,
    maxAp,
    currentAp,
    maxStamina,
    currentStamina,
    bind,
    unbind,
    replace,
    adjustHp,
    adjustAether,
    adjustAp,
    resetAp,
    setPhase,
    markRechargeSpent,
    rest,
    dehydrateEntity,
    dehydratePlay,
    hydrate,
  };
});
