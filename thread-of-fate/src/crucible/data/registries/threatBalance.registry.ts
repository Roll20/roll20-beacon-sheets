/**
 * The balancing constants behind Threat Rating, Threat Budget, and the stat
 * recommender. Everything here is DATA so a rules revision is a one-file change.
 *
 * Rules source: Convergence Bestiary.md L66-91.
 * The Proficiency Bonus progression deliberately delegates to the character
 * maker's own proficiencyBonus() so the Crucible and the maker can never
 * disagree - see docs/CRUCIBLE_AUDIT.md section 6.2 for why this matters.
 */

import { proficiencyBonus as makerProficiencyBonus } from '@/maker/rules/character';
import type { EncounterDifficulty } from '@/crucible/schemas/crucibleCommon';

// ---------------------------------------------------------------------------
// Proficiency progression
// ---------------------------------------------------------------------------

export interface ProficiencyProgression {
  id: string;
  name: string;
  /** PB for a given level. */
  bonusForLevel: (level: number) => number;
  description: string;
}

export const proficiencyProgressionRegistry: Record<string, ProficiencyProgression> = {
  convergence: {
    id: 'convergence',
    name: 'Convergence (1 + floor((level-1)/3))',
    bonusForLevel: (level: number) => makerProficiencyBonus(level),
    description:
      '+1 at levels 0-3, then +1 every three levels: +2 at 4, +3 at 7, +4 at 10, up to +20 at 60.',
  },
};

export const ACTIVE_PROFICIENCY_PROGRESSION = 'convergence';

export function proficiencyBonusForLevel(level: number): number {
  return proficiencyProgressionRegistry[ACTIVE_PROFICIENCY_PROGRESSION].bonusForLevel(level);
}

/** True when levelling from `level - 1` to `level` raised the Proficiency Bonus. */
export function proficiencyIncreasesAt(level: number): boolean {
  if (level <= 1) return false;
  return proficiencyBonusForLevel(level) > proficiencyBonusForLevel(level - 1);
}

// ---------------------------------------------------------------------------
// Threat Budget
// ---------------------------------------------------------------------------

export const THREAT_BUDGET = {
  /** "At level 0 a PC's Threat Budget is 3". */
  level0: 3,
  /** "at level 1 it becomes 5" - and the value it resets to when PB rises. */
  level1: 5,
  /** "when the PC gains a level their Threat Budget increases by 1". */
  perLevel: 1,
  /** "When a PC gets to a level that increases their PB their Threat Budget resets to 5". */
  resetOnProficiencyIncrease: 5,
};

/**
 * Threat Budget for a single PC level, walked from level 1 so the PB resets land
 * on exactly the levels the active progression says they do.
 */
export function threatBudgetForLevel(level: number): number {
  if (level <= 0) return THREAT_BUDGET.level0;
  let budget = THREAT_BUDGET.level1;
  for (let l = 2; l <= level; l++) {
    budget = proficiencyIncreasesAt(l)
      ? THREAT_BUDGET.resetOnProficiencyIncrease
      : budget + THREAT_BUDGET.perLevel;
  }
  return budget;
}

// ---------------------------------------------------------------------------
// Encounter modifiers
// ---------------------------------------------------------------------------

export const ENCOUNTER_MODIFIERS = {
  /**
   * "When the enemies outnumber the PCs increase the Total Rating by 1 and then
   * another 1 for every time the enemies double the PCs" - 5 v 10 = +2, 5 v 15 = +3.
   * "If the PCs outnumber the enemies, decrease the Total Rating by 1 instead."
   */
  outnumberedPenalty: -1,
  /**
   * "If a creature's Threat Rating is reduced to 0, you can treat every 10 of them
   * as increasing the Total Rating by 1."
   */
  zeroedCreaturesPerPoint: 10,
  /** Each Curio rarity step above Common is worth +1. */
  curioStepValue: 1,
};

/** Bestiary outnumbering rule, expressed as a pure function. */
export function outnumberingModifier(enemyCount: number, pcCount: number): number {
  if (pcCount <= 0 || enemyCount <= 0) return 0;
  if (enemyCount > pcCount) return Math.floor(enemyCount / pcCount);
  if (pcCount > enemyCount) return ENCOUNTER_MODIFIERS.outnumberedPenalty;
  return 0;
}

// ---------------------------------------------------------------------------
// Difficulty bands
// ---------------------------------------------------------------------------

export interface DifficultyBand {
  id: EncounterDifficulty;
  label: string;
  /** Inclusive lower bound as a function of budget and party size; -Infinity for open. */
  lower: (budget: number, partySize: number) => number;
  /** Exclusive upper bound; Infinity for open. */
  upper: (budget: number, partySize: number) => number;
  description: string;
}

/**
 * The Bestiary's printed bands overlap ("Medium: above half Budget", "Deadly:
 * above Budget"). These are the directive's disambiguated, strictly-ordered
 * version - see docs/CRUCIBLE_AUDIT.md section 6.3. The raw doc text is quoted below
 * for the Threat panel.
 */
export const DIFFICULTY_BANDS: DifficultyBand[] = [
  {
    id: 'easy',
    label: 'Easy',
    lower: () => -Infinity,
    upper: (budget) => budget / 2,
    description: 'Enemy threat is below half the party budget.',
  },
  {
    id: 'medium',
    label: 'Medium',
    lower: (budget) => budget / 2,
    upper: (budget, size) => budget - size,
    description: 'Enemy threat is at least half the budget but still comfortably under it.',
  },
  {
    id: 'hard',
    label: 'Hard',
    lower: (budget, size) => budget - size,
    upper: (budget, size) => budget + size,
    description: 'Enemy threat sits within one party-size of the budget.',
  },
  {
    id: 'deadly',
    label: 'Deadly',
    lower: (budget, size) => budget + size,
    upper: () => Infinity,
    description: 'Enemy threat exceeds the budget by more than the party size.',
  },
];

export const BESTIARY_BAND_TEXT = [
  'Easy: Total Rating = below half Budget',
  'Medium: Total Rating = above half Budget',
  'Hard: Total Rating = Budget +/- number of PCs',
  'Deadly: Total Rating = above Budget',
];

export function bandFor(
  enemyThreat: number,
  budget: number,
  partySize: number,
): EncounterDifficulty {
  for (const band of DIFFICULTY_BANDS) {
    const lo = band.lower(budget, partySize);
    const hi = band.upper(budget, partySize);
    if (enemyThreat >= lo && enemyThreat < hi) return band.id;
  }
  return 'deadly';
}

// ---------------------------------------------------------------------------
// Stat benchmarks for the recommender
// ---------------------------------------------------------------------------

/**
 * Target stats per Threat Rating. Derived by regressing the ~60 exemplar
 * statblocks in Convergence Bestiary.md (e.g. TR 5 Bandit Veteran: AC 16,
 * HP 112, PB +3; TR 8 Crime Boss: AC 17, HP 168, PB +3).
 * Values are per single standard creature; the recommender scales by kind.
 */
export interface ThreatBenchmark {
  threatRating: number;
  hitPointsLow: number;
  hitPointsHigh: number;
  armorClassLow: number;
  armorClassHigh: number;
  damagePerRoundLow: number;
  damagePerRoundHigh: number;
  saveDcLow: number;
  saveDcHigh: number;
  attackBonusLow: number;
  attackBonusHigh: number;
}

export const THREAT_BENCHMARKS: ThreatBenchmark[] = [
  {
    threatRating: 0,
    hitPointsLow: 4,
    hitPointsHigh: 10,
    armorClassLow: 10,
    armorClassHigh: 12,
    damagePerRoundLow: 1,
    damagePerRoundHigh: 3,
    saveDcLow: 8,
    saveDcHigh: 10,
    attackBonusLow: 2,
    attackBonusHigh: 3,
  },
  {
    threatRating: 1,
    hitPointsLow: 12,
    hitPointsHigh: 22,
    armorClassLow: 11,
    armorClassHigh: 13,
    damagePerRoundLow: 4,
    damagePerRoundHigh: 7,
    saveDcLow: 9,
    saveDcHigh: 11,
    attackBonusLow: 3,
    attackBonusHigh: 4,
  },
  {
    threatRating: 2,
    hitPointsLow: 22,
    hitPointsHigh: 36,
    armorClassLow: 12,
    armorClassHigh: 14,
    damagePerRoundLow: 7,
    damagePerRoundHigh: 11,
    saveDcLow: 10,
    saveDcHigh: 12,
    attackBonusLow: 3,
    attackBonusHigh: 5,
  },
  {
    threatRating: 3,
    hitPointsLow: 34,
    hitPointsHigh: 52,
    armorClassLow: 13,
    armorClassHigh: 15,
    damagePerRoundLow: 10,
    damagePerRoundHigh: 15,
    saveDcLow: 11,
    saveDcHigh: 13,
    attackBonusLow: 4,
    attackBonusHigh: 6,
  },
  {
    threatRating: 4,
    hitPointsLow: 48,
    hitPointsHigh: 72,
    armorClassLow: 14,
    armorClassHigh: 16,
    damagePerRoundLow: 14,
    damagePerRoundHigh: 20,
    saveDcLow: 12,
    saveDcHigh: 14,
    attackBonusLow: 5,
    attackBonusHigh: 6,
  },
  {
    threatRating: 5,
    hitPointsLow: 64,
    hitPointsHigh: 112,
    armorClassLow: 15,
    armorClassHigh: 17,
    damagePerRoundLow: 18,
    damagePerRoundHigh: 25,
    saveDcLow: 13,
    saveDcHigh: 15,
    attackBonusLow: 5,
    attackBonusHigh: 7,
  },
  {
    threatRating: 6,
    hitPointsLow: 78,
    hitPointsHigh: 128,
    armorClassLow: 15,
    armorClassHigh: 18,
    damagePerRoundLow: 21,
    damagePerRoundHigh: 29,
    saveDcLow: 13,
    saveDcHigh: 15,
    attackBonusLow: 6,
    attackBonusHigh: 7,
  },
  {
    threatRating: 7,
    hitPointsLow: 92,
    hitPointsHigh: 145,
    armorClassLow: 16,
    armorClassHigh: 18,
    damagePerRoundLow: 24,
    damagePerRoundHigh: 33,
    saveDcLow: 14,
    saveDcHigh: 16,
    attackBonusLow: 6,
    attackBonusHigh: 8,
  },
  {
    threatRating: 8,
    hitPointsLow: 108,
    hitPointsHigh: 168,
    armorClassLow: 16,
    armorClassHigh: 19,
    damagePerRoundLow: 28,
    damagePerRoundHigh: 37,
    saveDcLow: 14,
    saveDcHigh: 16,
    attackBonusLow: 7,
    attackBonusHigh: 8,
  },
  {
    threatRating: 9,
    hitPointsLow: 124,
    hitPointsHigh: 186,
    armorClassLow: 17,
    armorClassHigh: 19,
    damagePerRoundLow: 31,
    damagePerRoundHigh: 41,
    saveDcLow: 15,
    saveDcHigh: 17,
    attackBonusLow: 7,
    attackBonusHigh: 9,
  },
  {
    threatRating: 10,
    hitPointsLow: 140,
    hitPointsHigh: 205,
    armorClassLow: 17,
    armorClassHigh: 20,
    damagePerRoundLow: 35,
    damagePerRoundHigh: 46,
    saveDcLow: 15,
    saveDcHigh: 17,
    attackBonusLow: 8,
    attackBonusHigh: 9,
  },
  {
    threatRating: 12,
    hitPointsLow: 170,
    hitPointsHigh: 245,
    armorClassLow: 18,
    armorClassHigh: 21,
    damagePerRoundLow: 42,
    damagePerRoundHigh: 55,
    saveDcLow: 16,
    saveDcHigh: 18,
    attackBonusLow: 8,
    attackBonusHigh: 10,
  },
  {
    threatRating: 15,
    hitPointsLow: 215,
    hitPointsHigh: 310,
    armorClassLow: 18,
    armorClassHigh: 22,
    damagePerRoundLow: 53,
    damagePerRoundHigh: 68,
    saveDcLow: 17,
    saveDcHigh: 19,
    attackBonusLow: 9,
    attackBonusHigh: 11,
  },
  {
    threatRating: 20,
    hitPointsLow: 290,
    hitPointsHigh: 420,
    armorClassLow: 19,
    armorClassHigh: 23,
    damagePerRoundLow: 70,
    damagePerRoundHigh: 92,
    saveDcLow: 18,
    saveDcHigh: 21,
    attackBonusLow: 10,
    attackBonusHigh: 12,
  },
  {
    threatRating: 25,
    hitPointsLow: 370,
    hitPointsHigh: 530,
    armorClassLow: 20,
    armorClassHigh: 24,
    damagePerRoundLow: 88,
    damagePerRoundHigh: 115,
    saveDcLow: 19,
    saveDcHigh: 22,
    attackBonusLow: 11,
    attackBonusHigh: 13,
  },
  {
    threatRating: 30,
    hitPointsLow: 450,
    hitPointsHigh: 640,
    armorClassLow: 21,
    armorClassHigh: 25,
    damagePerRoundLow: 105,
    damagePerRoundHigh: 138,
    saveDcLow: 20,
    saveDcHigh: 23,
    attackBonusLow: 12,
    attackBonusHigh: 14,
  },
];

/** Benchmark for any TR, interpolating between the anchors above. */
export function benchmarkFor(threatRating: number): ThreatBenchmark {
  const tr = Math.max(0, threatRating);
  const exact = THREAT_BENCHMARKS.find((b) => b.threatRating === tr);
  if (exact) return { ...exact };

  const below = [...THREAT_BENCHMARKS].reverse().find((b) => b.threatRating < tr);
  const above = THREAT_BENCHMARKS.find((b) => b.threatRating > tr);
  if (!below) return { ...THREAT_BENCHMARKS[0], threatRating: tr };
  if (!above) {
    // Extrapolate past the top anchor at the top slope.
    const last = THREAT_BENCHMARKS[THREAT_BENCHMARKS.length - 1];
    const prev = THREAT_BENCHMARKS[THREAT_BENCHMARKS.length - 2];
    const span = last.threatRating - prev.threatRating;
    const steps = (tr - last.threatRating) / span;
    const grow = (a: number, b: number) => Math.round(b + (b - a) * steps);
    return {
      threatRating: tr,
      hitPointsLow: grow(prev.hitPointsLow, last.hitPointsLow),
      hitPointsHigh: grow(prev.hitPointsHigh, last.hitPointsHigh),
      armorClassLow: grow(prev.armorClassLow, last.armorClassLow),
      armorClassHigh: grow(prev.armorClassHigh, last.armorClassHigh),
      damagePerRoundLow: grow(prev.damagePerRoundLow, last.damagePerRoundLow),
      damagePerRoundHigh: grow(prev.damagePerRoundHigh, last.damagePerRoundHigh),
      saveDcLow: grow(prev.saveDcLow, last.saveDcLow),
      saveDcHigh: grow(prev.saveDcHigh, last.saveDcHigh),
      attackBonusLow: grow(prev.attackBonusLow, last.attackBonusLow),
      attackBonusHigh: grow(prev.attackBonusHigh, last.attackBonusHigh),
    };
  }

  const t = (tr - below.threatRating) / (above.threatRating - below.threatRating);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return {
    threatRating: tr,
    hitPointsLow: lerp(below.hitPointsLow, above.hitPointsLow),
    hitPointsHigh: lerp(below.hitPointsHigh, above.hitPointsHigh),
    armorClassLow: lerp(below.armorClassLow, above.armorClassLow),
    armorClassHigh: lerp(below.armorClassHigh, above.armorClassHigh),
    damagePerRoundLow: lerp(below.damagePerRoundLow, above.damagePerRoundLow),
    damagePerRoundHigh: lerp(below.damagePerRoundHigh, above.damagePerRoundHigh),
    saveDcLow: lerp(below.saveDcLow, above.saveDcLow),
    saveDcHigh: lerp(below.saveDcHigh, above.saveDcHigh),
    attackBonusLow: lerp(below.attackBonusLow, above.attackBonusLow),
    attackBonusHigh: lerp(below.attackBonusHigh, above.attackBonusHigh),
  };
}

// ---------------------------------------------------------------------------
// Kind scaling
// ---------------------------------------------------------------------------

/** How each creature kind deviates from the standard benchmark. */
export interface KindScaling {
  id: string;
  label: string;
  hitPointMultiplier: number;
  damageMultiplier: number;
  /** Threat Rating multiplier applied on top of the recommended TR. */
  threatMultiplier: number;
  allowApex: boolean;
  allowOverture: boolean;
  allowPhases: boolean;
  actionPoints: number;
  note: string;
}

export const KIND_SCALING: Record<string, KindScaling> = {
  standard: {
    id: 'standard',
    label: 'Standard',
    hitPointMultiplier: 1,
    damageMultiplier: 1,
    threatMultiplier: 1,
    allowApex: false,
    allowOverture: false,
    allowPhases: false,
    actionPoints: 3,
    note: 'A single enemy the party can drop in 2-3 rounds.',
  },
  elite: {
    id: 'elite',
    label: 'Elite',
    hitPointMultiplier: 1.5,
    damageMultiplier: 1.2,
    threatMultiplier: 1.35,
    allowApex: true,
    allowOverture: false,
    allowPhases: false,
    actionPoints: 4,
    note: 'Worth two standard enemies; gets Apex Actions.',
  },
  boss: {
    id: 'boss',
    label: 'Boss',
    hitPointMultiplier: 2.75,
    damageMultiplier: 1.5,
    threatMultiplier: 2.2,
    allowApex: true,
    allowOverture: false,
    allowPhases: true,
    actionPoints: 5,
    note: 'Solo threat; needs phases and off-turn actions to survive focus fire.',
  },
  mythic: {
    id: 'mythic',
    label: 'Mythic',
    hitPointMultiplier: 4,
    damageMultiplier: 1.8,
    threatMultiplier: 3.2,
    allowApex: true,
    allowOverture: true,
    allowPhases: true,
    actionPoints: 6,
    note: 'Campaign-ending encounter; Overture Actions and multiple phases.',
  },
  minion: {
    id: 'minion',
    label: 'Minion',
    hitPointMultiplier: 0.12,
    damageMultiplier: 0.6,
    threatMultiplier: 0.25,
    allowApex: false,
    allowOverture: false,
    allowPhases: false,
    actionPoints: 2,
    note: 'Dies on the first hit; fielded in numbers.',
  },
  swarm: {
    id: 'swarm',
    label: 'Swarm',
    hitPointMultiplier: 1.6,
    damageMultiplier: 1.1,
    threatMultiplier: 1.15,
    allowApex: false,
    allowOverture: false,
    allowPhases: false,
    actionPoints: 3,
    note: 'One statblock representing many bodies; resists single-target damage.',
  },
};

export const EXPECTED_ROUNDS_DEFAULT = 3;

/** Rough party damage-per-round per PC, used by the encounter length estimate. */
export function estimatedPcDamagePerRound(level: number): { low: number; high: number } {
  const pb = proficiencyBonusForLevel(level);
  const low = Math.round(4 + level * 1.8 + pb);
  const high = Math.round(7 + level * 3.1 + pb * 2);
  return { low, high };
}

/** Rough PC hit points at a level, used by the lethality estimate. */
export function estimatedPcHitPoints(level: number): number {
  if (level <= 0) return 3;
  return Math.round(10 + (level - 1) * 7.5);
}
