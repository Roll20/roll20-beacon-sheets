import type { AttributeKey, AttributeRecord, RaceDef, SubraceDef } from '@/maker/types';
import { ATTRIBUTE_KEYS } from '@/maker/data/attributes';
import { STAT_CONFIG } from '@/maker/data/constants';

/** Attribute modifier: floor((score - 10) / 2). Confirmed in the Playtest Rules. */
export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Empty attribute record (all zero). */
export function emptyAttributes(): AttributeRecord {
  return ATTRIBUTE_KEYS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {} as AttributeRecord);
}

/** Sum the racial + subrace attribute bonuses into a record. */
export function racialBonuses(race?: RaceDef, subrace?: SubraceDef): AttributeRecord {
  const out = emptyAttributes();
  if (subrace) {
    for (const b of subrace.attributeBonuses) out[b.attribute] += b.bonus;
  }
  return out;
}

/**
 * Final scores = base assigned scores + racial/subrace bonuses + background bonuses.
 * (Racial bonuses are applied first per the rules, then background.)
 */
export function finalScores(
  base: AttributeRecord,
  racial: AttributeRecord,
  background: AttributeRecord = emptyAttributes(),
): AttributeRecord {
  return ATTRIBUTE_KEYS.reduce((acc, k) => {
    acc[k] = (base[k] ?? 0) + (racial[k] ?? 0) + (background[k] ?? 0);
    return acc;
  }, {} as AttributeRecord);
}

export function modifiers(scores: AttributeRecord): AttributeRecord {
  return ATTRIBUTE_KEYS.reduce((acc, k) => {
    acc[k] = modifier(scores[k] ?? 0);
    return acc;
  }, {} as AttributeRecord);
}

// ---------------------------------------------------------------------------
// Point Buy
// ---------------------------------------------------------------------------

/**
 * Cost of point buy is 1 point per point above the base (linear), bounded by
 * [pointBuyMin, pointBuyMax]. Returns the total spent across all six attributes.
 */
export function pointBuySpent(scores: AttributeRecord): number {
  return ATTRIBUTE_KEYS.reduce(
    (sum, k) =>
      sum + Math.max(0, (scores[k] ?? STAT_CONFIG.pointBuyBase) - STAT_CONFIG.pointBuyBase),
    0,
  );
}

export function pointBuyRemaining(scores: AttributeRecord): number {
  return STAT_CONFIG.pointBuyPoints - pointBuySpent(scores);
}

export function isValidPointBuy(scores: AttributeRecord): boolean {
  const inRange = ATTRIBUTE_KEYS.every((k) => {
    const v = scores[k] ?? 0;
    return v >= STAT_CONFIG.pointBuyMin && v <= STAT_CONFIG.pointBuyMax;
  });
  return inRange && pointBuyRemaining(scores) >= 0;
}

/** A roll set / array is fully assigned when every attribute has a value. */
export function allAssigned(scores: Record<AttributeKey, number | null>): boolean {
  return ATTRIBUTE_KEYS.every((k) => typeof scores[k] === 'number' && scores[k] !== null);
}
