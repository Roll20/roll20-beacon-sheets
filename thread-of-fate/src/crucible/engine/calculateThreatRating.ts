/**
 * Per-creature Threat Rating adjustment.
 *
 * Rules source: Convergence Bestiary.md L85-89.
 *   Greater Proficiency: "treat its individual Threat Rating as if it was 1 higher
 *     for every 1 higher that creature's PB is than the PC's ... (Minimum 0).
 *     If a creature's Threat Rating is reduced to 0, you can treat every 10 of them
 *     as increasing the Total Rating by 1."
 *   Curios: "increase that creature's Threat Rating by 1 for every rarity above Common."
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { EnemyThreatContribution } from '@/crucible/schemas/crucibleThreat.schema';
import { CURIO_RARITY_STEPS, type CurioRarity } from '@/crucible/schemas/crucibleCommon';
import {
  ENCOUNTER_MODIFIERS,
  proficiencyBonusForLevel,
} from '@/crucible/data/registries/threatBalance.registry';

/** +1 Threat Rating per Curio rarity step above Common. */
export function curioThreatBonus(rarity: CurioRarity | null | undefined): number {
  if (!rarity) return 0;
  return (CURIO_RARITY_STEPS[rarity] ?? 0) * ENCOUNTER_MODIFIERS.curioStepValue;
}

/** The highest-rarity Curio the creature carries, from its equipment block. */
export function highestCurioRarity(entity: CrucibleEntitySchema): CurioRarity | null {
  const explicit = entity.progression.highestCurioRarity;
  if (explicit) return explicit;
  let best: CurioRarity | null = null;
  let bestStep = -1;
  for (const curio of entity.equipment.curios) {
    const key = curio.rarity as CurioRarity;
    const step = CURIO_RARITY_STEPS[key];
    if (step != null && step > bestStep) {
      bestStep = step;
      best = key;
    }
  }
  return best;
}

export interface ThreatRatingOptions {
  /** How many copies are in the encounter. */
  count?: number;
  /** Average PB across the party, used by the Greater Proficiency rule. */
  averagePartyProficiencyBonus: number;
  /** Per-encounter Threat Rating override. */
  threatOverride?: number | null;
}

/**
 * Adjusted Threat Rating for one creature (and the total across `count` copies).
 * Never returns a negative value; a creature floored to 0 is flagged so the
 * caller can apply the ten-per-point rule.
 */
export function calculateThreatRating(
  entity: CrucibleEntitySchema,
  options: ThreatRatingOptions,
): EnemyThreatContribution {
  const count = Math.max(1, Math.round(options.count ?? 1));
  const baseThreat =
    options.threatOverride ?? Math.max(0, Math.round(entity.progression.threatRating));

  const curioBonus = curioThreatBonus(highestCurioRarity(entity));

  const enemyPb =
    entity.progression.proficiencyBonusOverride ??
    proficiencyBonusForLevel(entity.progression.level);
  const proficiencyAdjustment = Math.round(enemyPb - options.averagePartyProficiencyBonus);

  const adjustedThreat = Math.max(0, baseThreat + curioBonus + proficiencyAdjustment);
  const zeroed = adjustedThreat === 0;

  const parts = [`base ${baseThreat}`];
  if (curioBonus) parts.push(`Curio +${curioBonus}`);
  if (proficiencyAdjustment) {
    parts.push(
      `Greater Proficiency ${
        proficiencyAdjustment > 0 ? '+' : ''
      }${proficiencyAdjustment} (PB +${enemyPb} vs party +${options.averagePartyProficiencyBonus.toFixed(
        1,
      )})`,
    );
  }
  if (zeroed && baseThreat + curioBonus + proficiencyAdjustment < 0) {
    parts.push('floored at 0');
  }

  return {
    entityId: entity.id,
    name: entity.identity.name || 'Unnamed',
    count,
    baseThreat,
    curioBonus,
    proficiencyAdjustment,
    adjustedThreat,
    total: adjustedThreat * count,
    zeroed,
    derivation: `${parts.join(', ')}${count > 1 ? ` x${count}` : ''} = ${adjustedThreat * count}`,
  };
}

/**
 * Threat contributed by creatures whose adjusted rating floored to 0:
 * every 10 of them count as +1.
 */
export function zeroedCreatureThreat(zeroedCount: number): number {
  return Math.floor(zeroedCount / ENCOUNTER_MODIFIERS.zeroedCreaturesPerPoint);
}
