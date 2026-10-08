/**
 * Scale an existing entity to a new Threat Rating / level, keeping its identity,
 * traits, and action shapes while re-benchmarking every number that should move.
 *
 * Used by the library's "Scale" command and by the encounter builder when a GM
 * drops a creature into a fight it was not built for.
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { allActions } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleAssumption } from '@/crucible/schemas/crucibleCommon';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import {
  benchmarkFor,
  proficiencyBonusForLevel,
} from '@/crucible/data/registries/threatBalance.registry';
import { sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';
import { computeCrucibleDerived, trueDieAverage } from './computeCrucibleDerived';
import { levelForProficiencyBonus } from './recommendCreatureStats';

export interface ScaleOptions {
  targetThreatRating: number;
  /** Null = derive the level from the Threat Rating benchmark. */
  targetLevel?: number | null;
  /** Scale attribute scores toward the new tier as well. */
  scaleAttributes?: boolean;
  /** Scale damage dice on every action. */
  scaleDamage?: boolean;
  /** Keep the creature's hand-authored HP instead of re-benchmarking it. */
  preserveManualHitPoints?: boolean;
}

/** Rescale one action's damage dice by a multiplier, preferring more dice over bigger dice. */
function scaleActionDamage(action: CrucibleActionInstance, factor: number): CrucibleActionInstance {
  if (!action.damage?.length) return action;
  return {
    ...action,
    damage: action.damage.map((d) => {
      const targetAverage = d.count * trueDieAverage(d.die) * factor;
      const newCount = Math.max(1, Math.round(targetAverage / trueDieAverage(d.die)));
      return { ...d, count: newCount, flat: Math.round(d.flat * factor) };
    }),
  };
}

export interface ScaleResult {
  entity: CrucibleEntitySchema;
  assumptions: CrucibleAssumption[];
  notes: string[];
}

export function scaleCrucibleEntity(
  source: CrucibleEntitySchema,
  options: ScaleOptions,
): ScaleResult {
  const notes: string[] = [];
  const assumptions: CrucibleAssumption[] = [];

  const targetTr = Math.max(0, Math.round(options.targetThreatRating));
  const fromTr = Math.max(0, source.progression.threatRating);
  const fromBench = benchmarkFor(fromTr);
  const toBench = benchmarkFor(targetTr);

  const hpMid = (b: typeof toBench) => (b.hitPointsLow + b.hitPointsHigh) / 2;
  const dprMid = (b: typeof toBench) => (b.damagePerRoundLow + b.damagePerRoundHigh) / 2;
  const damageFactor = dprMid(fromBench) > 0 ? dprMid(toBench) / dprMid(fromBench) : 1;

  const level =
    options.targetLevel ??
    levelForProficiencyBonus(
      Math.max(1, Math.round((toBench.attackBonusLow + toBench.attackBonusHigh) / 2 - 2)),
    );
  const pb = proficiencyBonusForLevel(level);

  if (options.targetLevel == null) {
    assumptions.push({
      id: 'scale-level',
      fieldPath: 'progression.level',
      assumedValue: level,
      reason: `Level ${level} gives Proficiency Bonus +${pb}, which matches the attack bonus benchmark for Threat Rating ${targetTr}.`,
      confidence: 'medium',
      canQuickEdit: true,
    });
  }

  // --- Hit dice -------------------------------------------------------------
  const size = sizeOrDefault(source.classification.sizeId);
  const die = source.defenses.hitDieOverride ?? size.hitDieSize;
  const currentCount = source.derived.hitDiceCount || Math.max(1, source.progression.level);
  const targetHp = hpMid(toBench);
  const perDie = trueDieAverage(die) + source.derived.modifiers.conviction;
  const newCount = perDie > 0 ? Math.max(1, Math.round(targetHp / perDie)) : currentCount;

  notes.push(
    `Hit dice ${currentCount}d${die} -> ${newCount}d${die} to reach the Threat Rating ${targetTr} hit-point band (${toBench.hitPointsLow}-${toBench.hitPointsHigh}).`,
  );

  // --- Armour Class ---------------------------------------------------------
  const acDelta = Math.round(
    (toBench.armorClassLow + toBench.armorClassHigh) / 2 -
      (fromBench.armorClassLow + fromBench.armorClassHigh) / 2,
  );
  if (acDelta) notes.push(`Armor Class shifted by ${acDelta > 0 ? '+' : ''}${acDelta}.`);

  // --- Attributes -----------------------------------------------------------
  const attributes = { ...source.attributes };
  if (options.scaleAttributes !== false) {
    const attrDelta = Math.round((targetTr - fromTr) / 3) * 2;
    if (attrDelta) {
      // Raise the two strongest attributes; leave the creature's weak points weak.
      const ranked = (Object.keys(attributes) as (keyof typeof attributes)[]).sort(
        (a, b) => attributes[b] - attributes[a],
      );
      attributes[ranked[0]] = Math.max(1, attributes[ranked[0]] + attrDelta);
      attributes[ranked[1]] = Math.max(1, attributes[ranked[1]] + Math.round(attrDelta / 2));
      notes.push(
        `Raised ${ranked[0]} by ${attrDelta} and ${ranked[1]} by ${Math.round(attrDelta / 2)}.`,
      );
    }
  }

  // --- Actions --------------------------------------------------------------
  const scaleList = (list: CrucibleActionInstance[]) =>
    options.scaleDamage === false ? list : list.map((a) => scaleActionDamage(a, damageFactor));

  if (options.scaleDamage !== false && Math.abs(damageFactor - 1) > 0.05) {
    notes.push(
      `Damage scaled by x${damageFactor.toFixed(2)} to reach ${toBench.damagePerRoundLow}-${
        toBench.damagePerRoundHigh
      } per round.`,
    );
  }

  const scaled: CrucibleEntitySchema = {
    ...source,
    id: source.id,
    meta: {
      ...source.meta,
      updatedAt: new Date().toISOString(),
      contentVersion: source.meta.contentVersion + 1,
    },
    progression: {
      ...source.progression,
      level,
      threatRating: targetTr,
      proficiencyBonusOverride: null,
    },
    attributes,
    defenses: {
      ...source.defenses,
      hitDiceCount: newCount,
      manualHitPoints: options.preserveManualHitPoints ? source.defenses.manualHitPoints : null,
      miscAcBonus: source.defenses.miscAcBonus + acDelta,
    },
    actions: scaleList(source.actions),
    quickActions: scaleList(source.quickActions),
    reactions: scaleList(source.reactions),
    apexActions: scaleList(source.apexActions),
    overtureActions: scaleList(source.overtureActions),
    assumptions: [...source.assumptions, ...assumptions],
  };

  const withDerivedStats = { ...scaled, derived: computeCrucibleDerived(scaled) };
  notes.push(
    `Result: ${withDerivedStats.derived.hitPoints} HP, AC ${withDerivedStats.derived.armorClass}, ~${withDerivedStats.derived.damagePerRound} damage per round.`,
  );
  if (!allActions(withDerivedStats).length) {
    notes.push('This entity has no actions, so damage could not be scaled.');
  }

  return { entity: withDerivedStats, assumptions, notes };
}

/** Scale so that N copies together hit a target total threat. */
export function scaleForCount(
  source: CrucibleEntitySchema,
  totalThreat: number,
  count: number,
): ScaleResult {
  const per = Math.max(0, Math.round(totalThreat / Math.max(1, count)));
  return scaleCrucibleEntity(source, { targetThreatRating: per });
}

/** Estimated hit-point factor between two Threat Ratings, exposed for previews. */
export function hitPointFactor(fromTr: number, toTr: number): number {
  const from = benchmarkFor(fromTr);
  const to = benchmarkFor(toTr);
  const mid = (b: typeof to) => (b.hitPointsLow + b.hitPointsHigh) / 2;
  return mid(from) > 0 ? mid(to) / mid(from) : 1;
}
