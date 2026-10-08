/**
 * Beacon computed values for Crucible entities.
 *
 * A Roll20 character deployed by The Crucible stores its entity under
 * character.attributes.crucible (see convertEntityToRoll20). These getters expose
 * token-bar-safe values from that blob: crucible_hp, crucible_stamina,
 * crucible_aether, crucible_ap, crucible_ac.
 *
 * Live current-values (hp lost, aether spent, AP used) are tracked in
 * attributes.cruciblePlay so the canonical entity stays pristine.
 */

import type { Character, Dispatch } from '@roll20-official/beacon-sdk';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';

export interface CruciblePlayState {
  currentHp: number | null;
  tempHp: number;
  currentStamina: number | null;
  currentAether: number | null;
  currentAp: number | null;
  activePhaseId: string | null;
  /** action id -> recharge spent (true = unavailable). */
  spentRecharges: Record<string, boolean>;
}

export const emptyPlayState = (): CruciblePlayState => ({
  currentHp: null,
  tempHp: 0,
  currentStamina: null,
  currentAether: null,
  currentAp: null,
  activePhaseId: null,
  spentRecharges: {},
});

export const getCrucibleEntity = (character: Character): CrucibleEntitySchema | null =>
  (character.attributes?.crucible as unknown as CrucibleEntitySchema | undefined) ?? null;

export const getCruciblePlay = (character: Character): CruciblePlayState => ({
  ...emptyPlayState(),
  ...((character.attributes?.cruciblePlay as unknown as Partial<CruciblePlayState> | undefined) ??
    {}),
});

/** Stamina for a statted creature: Might mod + half its hit die (same as PCs). */
export const crucibleMaxStamina = (entity: CrucibleEntitySchema): number =>
  Math.max(1, (entity.derived.modifiers.might ?? 0) + Math.floor(entity.derived.hitDieSize / 2));

const applyChange = (oldValue: number, newValue: number | string): number => {
  if (typeof newValue === 'string') newValue = newValue.trim();
  const operator = typeof newValue === 'string' ? newValue[0] : false;
  if (typeof newValue === 'string' && (operator === '-' || operator === '+')) {
    const intValue = parseInt(newValue.substring(1));
    if (isNaN(intValue)) return oldValue;
    return operator === '+' ? oldValue + intValue : oldValue - intValue;
  }
  const intValue = typeof newValue === 'string' ? parseInt(newValue) : newValue;
  return isNaN(intValue) ? oldValue : intValue;
};

const writePlay = (dispatch: Dispatch, character: Character, play: CruciblePlayState) => {
  dispatch.update({
    character: {
      id: character.id,
      attributes: {
        updateId: 'TOKENCHANGE',
        cruciblePlay: play as unknown as Record<string, never>,
      },
    },
  });
};

// --- crucible_hp -------------------------------------------------------------

export const getCrucibleHp = ({ character }: { character: Character }) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return { current: 0, max: 0 };
  const play = getCruciblePlay(character);
  const max = entity.derived.hitPoints;
  return { current: (play.currentHp ?? max) + play.tempHp, max };
};

export const setCrucibleHp = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: unknown[]
) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return;
  const play = getCruciblePlay(character);
  const max = entity.derived.hitPoints;
  const current = play.currentHp ?? max;
  const requested = applyChange(current + play.tempHp, args[0] as number | string);
  const delta = requested - (current + play.tempHp);
  let nextTemp = play.tempHp;
  let nextHp = current;
  if (delta < 0) {
    // Damage burns temporary hit points first, exactly like the PC sheet.
    const absorbed = Math.min(nextTemp, -delta);
    nextTemp -= absorbed;
    nextHp = Math.max(0, nextHp - (-delta - absorbed));
  } else {
    nextHp = Math.min(max, nextHp + delta);
  }
  writePlay(dispatch, character, { ...play, currentHp: nextHp, tempHp: nextTemp });
};

// --- crucible_stamina --------------------------------------------------------

export const getCrucibleStamina = ({ character }: { character: Character }) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return { current: 0, max: 0 };
  const play = getCruciblePlay(character);
  const max = crucibleMaxStamina(entity);
  return { current: play.currentStamina ?? max, max };
};

export const setCrucibleStamina = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: unknown[]
) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return;
  const play = getCruciblePlay(character);
  const max = crucibleMaxStamina(entity);
  const next = Math.max(
    0,
    Math.min(max, applyChange(play.currentStamina ?? max, args[0] as number | string)),
  );
  writePlay(dispatch, character, { ...play, currentStamina: next });
};

// --- crucible_aether ---------------------------------------------------------

export const getCrucibleAether = ({ character }: { character: Character }) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return { current: 0, max: 0 };
  const play = getCruciblePlay(character);
  const max = entity.derived.aether;
  return { current: play.currentAether ?? max, max };
};

export const setCrucibleAether = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: unknown[]
) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return;
  const play = getCruciblePlay(character);
  const max = entity.derived.aether;
  const next = Math.max(
    0,
    Math.min(max, applyChange(play.currentAether ?? max, args[0] as number | string)),
  );
  writePlay(dispatch, character, { ...play, currentAether: next });
};

// --- crucible_ap -------------------------------------------------------------

export const getCrucibleAp = ({ character }: { character: Character }) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return { current: 0, max: 0 };
  const play = getCruciblePlay(character);
  const max = entity.derived.actionPoints;
  return { current: play.currentAp ?? max, max };
};

export const setCrucibleAp = (
  { character, dispatch }: { character: Character; dispatch: Dispatch },
  ...args: unknown[]
) => {
  const entity = getCrucibleEntity(character);
  if (!entity) return;
  const play = getCruciblePlay(character);
  const max = entity.derived.actionPoints;
  const next = Math.max(
    0,
    Math.min(max, applyChange(play.currentAp ?? max, args[0] as number | string)),
  );
  writePlay(dispatch, character, { ...play, currentAp: next });
};

// --- crucible_ac (read-only) -------------------------------------------------

export const getCrucibleAc = ({ character }: { character: Character }) => {
  const entity = getCrucibleEntity(character);
  return { current: entity ? entity.derived.armorClass : 0 };
};
