/**
 * Threat Rating / Threat Budget math types.
 *
 * Rules source: Convergence Bestiary.md L66-91 (Threat Rating, Threat Budget,
 * Outnumbering, Friendly Monsters, Environmental Hazards, Greater Proficiency, Curios).
 */

import type {
  CurioRarity,
  EncounterDifficulty,
  PartyMemberThreatInput,
  ThreatModifier,
} from './crucibleCommon';

/** One line of the difficulty derivation, shown to the GM so the math is never a black box. */
export interface ThreatMathLine {
  label: string;
  value: number;
  /** Rule text that produced this line. */
  rule: string;
  /** Sub-lines, e.g. per-creature contributions. */
  detail?: string[];
}

export interface PartyBudgetResult {
  total: number;
  size: number;
  averageProficiencyBonus: number;
  perMember: {
    name: string;
    level: number;
    proficiencyBonus: number;
    budget: number;
    curioBonus: number;
    overridden: boolean;
    /** Why this member's budget is what it is. */
    derivation: string;
  }[];
  lines: ThreatMathLine[];
}

export interface EnemyThreatContribution {
  entityId: string;
  name: string;
  count: number;
  baseThreat: number;
  curioBonus: number;
  proficiencyAdjustment: number;
  /** After the Greater Proficiency rule, floored at 0. */
  adjustedThreat: number;
  /** Total across `count` copies. */
  total: number;
  /** True when adjustedThreat hit the 0 floor and the ten-per-point rule applies. */
  zeroed: boolean;
  derivation: string;
}

export interface EncounterThreatResult {
  partyBudget: PartyBudgetResult;
  enemies: EnemyThreatContribution[];
  allies: EnemyThreatContribution[];
  hazards: EnemyThreatContribution[];
  enemyCount: number;
  outnumberingModifier: number;
  /** Threat contributed by creatures whose adjusted rating floored to 0 (10 per +1). */
  zeroedThreat: number;
  environmentModifiers: ThreatModifier[];
  /** Sum of everything. */
  enemyThreatTotal: number;
  difficulty: EncounterDifficulty;
  /** Plain-English explanation shown in the Threat panel. */
  reason: string;
  lines: ThreatMathLine[];
  warnings: string[];
}

export interface EncounterThreatInputLike {
  party: PartyMemberThreatInput[];
  environmentModifiers: ThreatModifier[];
}

/** Inputs to the "what should this monster be?" recommender. */
export interface ThreatRecommendationInput {
  partySize: number;
  partyLevels: number[];
  desiredDifficulty: EncounterDifficulty;
  enemyCount: number;
  roleIds: string[];
  environmentId?: string;
  /** Rounds the GM wants the fight to last. */
  expectedRounds?: number;
  kind: 'standard' | 'elite' | 'boss' | 'mythic' | 'minion' | 'swarm';
  partyCurioRarity?: CurioRarity | null;
  alliedThreat?: number;
  hazardThreat?: number;
}

export interface ThreatRecommendation {
  threatRatingLow: number;
  threatRatingHigh: number;
  proficiencyBonus: number;
  level: number;
  hitPointsLow: number;
  hitPointsHigh: number;
  armorClassLow: number;
  armorClassHigh: number;
  damagePerRoundLow: number;
  damagePerRoundHigh: number;
  saveDcLow: number;
  saveDcHigh: number;
  actionPoints: number;
  recommendedActionCount: number;
  recommendedTraitCount: number;
  recommendedTraitIds: string[];
  recommendedResistances: string[];
  /** Should this creature get Apex / Overture actions? */
  allowApex: boolean;
  allowOverture: boolean;
  reason: string;
  warnings: string[];
  lines: ThreatMathLine[];
}
