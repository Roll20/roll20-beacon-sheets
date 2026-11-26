import type { CharacterDraft } from '@/maker/draftModel';
import { draftDerived, totalLevel } from './selectors';
import { casterInfo } from './casting';

/** The number of death-save failures that kills a dying creature. */
export const DEATH_FAILURE_LIMIT = 6;

export interface PlayResources {
  maxHp: number;
  currentHp: number;
  tempHp: number;
  maxStamina: number;
  currentStamina: number;
  isCaster: boolean;
  maxAether: number;
  currentAether: number;
  totalHitDice: number;
  hitDiceSpent: number;
  hitDiceRemaining: number;
  deathFailures: number;
  dying: boolean;
  conditions: string[];
}

/**
 * Live play resources: derived maxes from the build, combined with the draft's
 * current spent/remaining values. `null` current values are treated as "at full".
 */
export function playResources(draft: CharacterDraft): PlayResources {
  const d = draftDerived(draft);
  const ci = casterInfo(draft);
  const p = draft.play;

  const maxHp = d.health;
  const maxStamina = d.stamina;
  const maxAether = ci.isCaster ? ci.aether : 0;
  const totalHitDice = Math.max(0, totalLevel(draft));
  const currentHp = p.currentHp ?? maxHp;

  return {
    maxHp,
    currentHp,
    tempHp: p.tempHp,
    maxStamina,
    currentStamina: p.currentStamina ?? maxStamina,
    isCaster: ci.isCaster,
    maxAether,
    currentAether: p.currentAether ?? maxAether,
    totalHitDice,
    hitDiceSpent: p.hitDiceSpent,
    hitDiceRemaining: Math.max(0, totalHitDice - p.hitDiceSpent),
    deathFailures: p.deathFailures,
    dying: currentHp <= 0,
    conditions: p.conditions,
  };
}
