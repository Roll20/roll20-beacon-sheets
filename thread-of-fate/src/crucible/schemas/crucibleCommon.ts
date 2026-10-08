/**
 * Shared primitives for every Crucible schema.
 *
 * The Crucible is the GM-facing entity creation engine. Its cardinal rule is that
 * every field can be traced back to where its value came from - see FieldOrigin.
 */

import type { AttributeKey } from '@/maker/types';

export type { AttributeKey };

/** Where a generated field's value came from. Tracked for every inferred value. */
export type FieldOrigin =
  | 'userProvided'
  | 'rulesCalculated'
  | 'registryDefault'
  | 'templateApplied'
  | 'inferred'
  | 'manualOverride';

/**
 * Values the offline intent parser deduced from the Storyteller's prompt use
 * this origin. Everything runs locally in the sheet; the parse is deterministic,
 * so the same prompt always yields the same values.
 */
export const INFERRED: FieldOrigin = 'inferred';

export type CrucibleEntityKind =
  | 'npc'
  | 'monster'
  | 'boss'
  | 'mythicBoss'
  | 'minion'
  | 'swarm'
  | 'summon'
  | 'companion'
  | 'hazard'
  | 'trap'
  | 'vehicle'
  | 'encounterObject';

export const ENTITY_KINDS: CrucibleEntityKind[] = [
  'npc',
  'monster',
  'boss',
  'mythicBoss',
  'minion',
  'swarm',
  'summon',
  'companion',
  'hazard',
  'trap',
  'vehicle',
  'encounterObject',
];

export const ENTITY_KIND_LABELS: Record<CrucibleEntityKind, string> = {
  npc: 'NPC',
  monster: 'Monster',
  boss: 'Boss',
  mythicBoss: 'Mythic Boss',
  minion: 'Minion',
  swarm: 'Swarm',
  summon: 'Summon',
  companion: 'Companion',
  hazard: 'Hazard',
  trap: 'Trap',
  vehicle: 'Vehicle',
  encounterObject: 'Encounter Object',
};

/** How much the GM wants to fill in themselves. */
export type CrucibleDepth = 'spark' | 'ember' | 'forge' | 'masterwork';

export const DEPTH_LABELS: Record<CrucibleDepth, string> = {
  spark: 'Spark',
  ember: 'Ember',
  forge: 'Forge',
  masterwork: 'Masterwork',
};

export type SaveId = 'body' | 'mind' | 'soul';
export const SAVE_IDS: SaveId[] = ['body', 'mind', 'soul'];
export const SAVE_LABELS: Record<SaveId, string> = {
  body: 'Body',
  mind: 'Mind',
  soul: 'Soul',
};

/** Print order used by the Convergence statblock header (differs from AttributeKey order). */
export const STATBLOCK_ATTRIBUTE_ORDER: AttributeKey[] = [
  'might',
  'instinct',
  'conviction',
  'focus',
  'resonance',
  'presence',
];

export type CurioRarity = 'common' | 'uncommon' | 'rare' | 'veryRare' | 'legendary' | 'mythic';

export const CURIO_RARITIES: CurioRarity[] = [
  'common',
  'uncommon',
  'rare',
  'veryRare',
  'legendary',
  'mythic',
];

/** Steps above Common. Each step adds +1 Threat Rating / +1 Threat Budget. */
export const CURIO_RARITY_STEPS: Record<CurioRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  veryRare: 3,
  legendary: 4,
  mythic: 5,
};

export type OfficialStatus = 'official' | 'playtest' | 'homebrew' | 'proposed';

/** A generic additive/multiplicative modifier the engine can apply to a numeric path. */
export interface ModifierDefinition {
  id?: string;
  /** Dot path into the entity, e.g. "defenses.armorClass" or "movement.ground". */
  target: string;
  op: 'add' | 'multiply' | 'set' | 'min' | 'max';
  value: number;
  /** Human-readable reason, shown in the source trace. */
  reason?: string;
}

export interface ThreatModifier {
  id: string;
  label: string;
  value: number;
  reason?: string;
}

export interface CrucibleMeta {
  createdAt: string;
  updatedAt: string;
  /** Content revision, bumped by the library on each save. */
  contentVersion: number;
  source: string;
  officialStatus: OfficialStatus;
  /** Free-form GM tags for library filtering. */
  libraryTags: string[];
  archived: boolean;
  /** Prompt that produced this entity, when it came from Spark/Ember mode. */
  originPrompt?: string;
  /** Seed used by the deterministic generator, so the same entity can be reproduced. */
  seed?: number;
}

export interface CrucibleIdentity {
  name: string;
  /** Short evocative line, e.g. "a war beast fused with blackstone". */
  concept: string;
  description: string;
  /** GM-only text. Never written to player-visible Roll20 attributes. */
  gmNotes: string;
  portrait: string | null;
  /** Optional pronunciation / voice note. */
  epithet?: string;
}

export interface CrucibleClassification {
  sizeId: string;
  /** Creature tag strings, e.g. ["Humanoid (Any Race)", "Undead"]. */
  tagIds: string[];
  /** Registry ids from creatureRoles.registry. */
  roleIds: string[];
  /** Alignment-ish philosophy label, optional in Convergence. */
  philosophy?: string;
  languages: string[];
}

export interface CrucibleCreationContext {
  depth: CrucibleDepth;
  /** The party this entity was balanced against. */
  partyTarget: PartyTarget;
  desiredDifficulty: EncounterDifficulty | 'any';
  /** How many of this entity the GM plans to field. */
  plannedCount: number;
  /** Ids of templates applied, in order. */
  appliedTemplateIds: string[];
}

export interface PartyTarget {
  size: number;
  averageLevel: number;
  /** Per-member overrides; when empty, size x averageLevel is used. */
  members: PartyMemberThreatInput[];
}

export interface PartyMemberThreatInput {
  id?: string;
  name?: string;
  level: number;
  proficiencyBonus?: number;
  highestCurioRarity?: CurioRarity;
  manualThreatBudgetOverride?: number;
}

export type EncounterDifficulty = 'easy' | 'medium' | 'hard' | 'deadly';

export const DIFFICULTY_LABELS: Record<EncounterDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  deadly: 'Deadly',
};

export interface CrucibleProgression {
  /** Effective level; drives PB and scaling. */
  level: number;
  threatRating: number;
  /** Null = derive from level via the proficiency progression registry. */
  proficiencyBonusOverride: number | null;
  /** Curio rarity carried by this creature (raises its Threat Rating). */
  highestCurioRarity: CurioRarity | null;
}

export type CrucibleAttributes = Record<AttributeKey, number>;

export interface CrucibleSaves {
  /** Proficiency in each save group. */
  proficient: Record<SaveId, boolean>;
  /** Flat manual adjustment on top of the computed value. */
  bonus: Record<SaveId, number>;
  /** Full manual override; null = computed. */
  override: Record<SaveId, number | null>;
}

export type TalentTier = 'none' | 'proficient' | 'expert' | 'masterful' | 'mythical';

export const TALENT_TIER_MULTIPLIER: Record<TalentTier, number> = {
  none: 0,
  proficient: 1,
  expert: 2,
  masterful: 3,
  mythical: 4,
};

export interface CrucibleTalentEntry {
  /** Skill id from the maker's skill list, or a free-form talent name. */
  talentId: string;
  tier: TalentTier;
  /** Manual override of the final bonus. */
  override?: number | null;
}

export interface CrucibleTalentBlock {
  entries: CrucibleTalentEntry[];
  /** Passive Perception override; null = 10 + Perception bonus. */
  passivePerceptionOverride: number | null;
}

export type ArmorMode = 'natural' | 'toughenedHide' | 'armor' | 'manual';

export interface CrucibleDefenses {
  armorMode: ArmorMode;
  /** Descriptor printed in parentheses after AC, e.g. "Blackstone Plating". */
  armorDescriptor: string;
  /** Bonus from worn armor when armorMode === 'armor'. */
  armorBonus: number;
  shieldBonus: number;
  /** Applied in every mode. */
  miscAcBonus: number;
  /** Full manual AC; used when armorMode === 'manual'. */
  manualArmorClass: number;

  /** Hit dice count; size determines the die. Null = recommended for level/role. */
  hitDiceCount: number | null;
  /** Overrides the size's die, e.g. 8 for d8. Null = from size registry. */
  hitDieOverride: number | null;
  /** Full manual HP; null = computed from hit dice. */
  manualHitPoints: number | null;
  temporaryHitPoints: number;
  regeneration: number;

  vulnerabilities: string[];
  resistances: string[];
  immunities: string[];
  conditionImmunities: string[];
  wards: string[];
}

export interface CrucibleMovement {
  ground: number;
  climb: number;
  swim: number;
  fly: number;
  burrow: number;
  /** Extra named speeds, e.g. { "Phase": 20 }. */
  other: Record<string, number>;
  hover: boolean;
}

export interface CrucibleSenses {
  /** e.g. ["Darkvision 60 ft.", "Tremorsense 30 ft."]. */
  entries: string[];
  passivePerception: number | null;
}

export type ResourceKind = 'aether' | 'stamina' | 'actionPoints' | 'custom';

export interface CrucibleResource {
  id: string;
  name: string;
  kind: ResourceKind;
  max: number;
  /** Current value for live play; null = at max. */
  current: number | null;
  /** Show this resource on a token bar. */
  tokenBar: boolean;
  /** Restores on: full rest, quick rest, round start, phase change, never. */
  refresh: 'fullRest' | 'quickRest' | 'roundStart' | 'phase' | 'never';
  description?: string;
}

export interface CrucibleTraitInstance {
  id: string;
  /** Registry id when it came from creatureTraits.registry; null for bespoke. */
  registryId: string | null;
  name: string;
  description: string;
  /** Uses/recharge, when the trait is limited. */
  uses?: LimitedUseRule;
  /** Threat contribution used by the Threat Rating recommender. */
  threatCost: number;
  origin: FieldOrigin;
  /** Hidden from players in exports and chat. */
  gmOnly?: boolean;
}

export interface LimitedUseRule {
  count: number;
  per: 'fullRest' | 'quickRest' | 'round' | 'turn' | 'encounter' | 'day';
}

export interface RechargeRule {
  /** Recharges on a d6 result of this value or higher, e.g. 5 for "Recharge 5-6". */
  min: number;
  /** Die size; almost always 6. */
  die: number;
}

export interface CrucibleAssumption {
  id: string;
  fieldPath: string;
  assumedValue: unknown;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  canQuickEdit: boolean;
  /** The user has reviewed and kept this assumption. */
  accepted?: boolean;
}

export type ValidationLevel = 'error' | 'warning' | 'info';

export interface CrucibleValidationIssue {
  id: string;
  level: ValidationLevel;
  code: string;
  message: string;
  fieldPath?: string;
  /** Suggested fix the UI can offer as a one-click action. */
  suggestion?: string;
}

/** Origin trace for a single field, surfaced by CrucibleSourceTrace.vue. */
export interface FieldTrace {
  fieldPath: string;
  origin: FieldOrigin;
  detail?: string;
}
