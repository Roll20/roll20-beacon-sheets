/**
 * The canonical Crucible entity. One schema covers NPCs, monsters, bosses,
 * minions, swarms, summons, companions, hazards, traps, vehicles, and objects -
 * kind-specific data hangs off the optional `npc` / `monster` / `hazard` /
 * `vehicle` / `boss` blocks.
 */

import type { AttributeKey, CasterType } from '@/maker/types';
import type {
  CrucibleAssumption,
  CrucibleAttributes,
  CrucibleClassification,
  CrucibleCreationContext,
  CrucibleDefenses,
  CrucibleEntityKind,
  CrucibleIdentity,
  CrucibleMeta,
  CrucibleMovement,
  CrucibleProgression,
  CrucibleResource,
  CrucibleSaves,
  CrucibleSenses,
  CrucibleTalentBlock,
  CrucibleTraitInstance,
  CrucibleValidationIssue,
  FieldTrace,
  SaveId,
} from './crucibleCommon';
import type { CrucibleActionInstance } from './crucibleAction.schema';
import type { CrucibleBossBlock } from './cruciblePhase.schema';
import type { CrucibleNpcBlock } from './crucibleNpc.schema';
import type {
  CrucibleEquipmentBlock,
  CrucibleLootBlock,
  CrucibleMonsterBlock,
} from './crucibleMonster.schema';
import type { CrucibleHazardBlock } from './crucibleHazard.schema';
import type { CrucibleVehicleBlock } from './crucibleVehicle.schema';
import type { CrucibleRoll20Block, CrucibleTokenBlock } from './crucibleRoll20.schema';

export const CRUCIBLE_SCHEMA_VERSION = '1.0.0';

/** Arte / magic capability. Mirrors the maker's caster model so the two agree. */
export interface CrucibleMagicBlock {
  isCaster: boolean;
  casterType: CasterType;
  /** Arcane / Divine / Eldritch / Paracausal. */
  sources: string[];
  castingAttribute: AttributeKey | null;
  /** Null = derive from level and casterType. */
  casterLevelOverride: number | null;
  aetherOverride: number | null;
  maxTierOverride: number | null;
  saveDcOverride: number | null;
  arteAttackOverride: number | null;
  /** Arte ids from the maker's 830-Arte list. */
  knownArteIds: string[];
  /** Per-Arte availability limits on this creature. */
  arteUsage: Record<string, { atWill?: boolean; uses?: number; per?: string; phaseIds?: string[] }>;
  /** Free-form innate spellcasting note printed on the statblock. */
  innateNote: string;
}

/** Everything the rules engine computes. Never hand-edited; recomputed on read. */
export interface CrucibleDerivedBlock {
  proficiencyBonus: number;
  modifiers: Record<AttributeKey, number>;
  saves: Record<SaveId, number>;
  armorClass: number;
  armorClassSource: string;
  hitPoints: number;
  hitDice: string;
  hitDieSize: number;
  hitDiceCount: number;
  hitPointsFormula: string;
  initiative: number;
  actionPoints: number;
  passivePerception: number;
  talentBonuses: Record<string, number>;
  /** Caster figures. */
  casterLevel: number;
  maxArteTier: number;
  aether: number;
  arteSaveDc: number;
  arteAttack: number;
  /** Generic effect DC used by non-Arte actions: 6 + PB + best relevant mod. */
  effectSaveDc: number;
  /** Estimated damage per round across the creature's best action line. */
  damagePerRound: number;
  /** Threat Rating the engine would recommend for these stats. */
  computedThreatRating: number;
  /** Per-field origin trace. */
  traces: FieldTrace[];
}

export interface CrucibleEntitySchema {
  schemaVersion: string;
  id: string;
  kind: CrucibleEntityKind;
  meta: CrucibleMeta;
  identity: CrucibleIdentity;
  classification: CrucibleClassification;
  creationContext: CrucibleCreationContext;
  progression: CrucibleProgression;
  attributes: CrucibleAttributes;
  saves: CrucibleSaves;
  talents: CrucibleTalentBlock;
  defenses: CrucibleDefenses;
  movement: CrucibleMovement;
  senses: CrucibleSenses;
  resources: CrucibleResource[];
  traits: CrucibleTraitInstance[];
  actions: CrucibleActionInstance[];
  quickActions: CrucibleActionInstance[];
  reactions: CrucibleActionInstance[];
  apexActions: CrucibleActionInstance[];
  overtureActions: CrucibleActionInstance[];
  magic: CrucibleMagicBlock;
  equipment: CrucibleEquipmentBlock;
  loot: CrucibleLootBlock;
  npc?: CrucibleNpcBlock;
  monster?: CrucibleMonsterBlock;
  hazard?: CrucibleHazardBlock;
  vehicle?: CrucibleVehicleBlock;
  boss?: CrucibleBossBlock;
  roll20: CrucibleRoll20Block;
  token: CrucibleTokenBlock;
  assumptions: CrucibleAssumption[];
  validation: CrucibleValidationIssue[];
  derived: CrucibleDerivedBlock;
  /** Fields an import did not recognise. Never discarded. */
  _unrecognized?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createEmptyDerived(): CrucibleDerivedBlock {
  return {
    proficiencyBonus: 1,
    modifiers: { might: 0, instinct: 0, focus: 0, conviction: 0, resonance: 0, presence: 0 },
    saves: { body: 0, mind: 0, soul: 0 },
    armorClass: 10,
    armorClassSource: 'Natural Armor',
    hitPoints: 1,
    hitDice: '1d8',
    hitDieSize: 8,
    hitDiceCount: 1,
    hitPointsFormula: '1d8',
    initiative: 0,
    actionPoints: 3,
    passivePerception: 10,
    talentBonuses: {},
    casterLevel: 0,
    maxArteTier: 0,
    aether: 0,
    arteSaveDc: 0,
    arteAttack: 0,
    effectSaveDc: 7,
    damagePerRound: 0,
    computedThreatRating: 0,
    traces: [],
  };
}

export function createEmptyEntity(
  id: string,
  kind: CrucibleEntityKind,
  now: string,
): CrucibleEntitySchema {
  return {
    schemaVersion: CRUCIBLE_SCHEMA_VERSION,
    id,
    kind,
    meta: {
      createdAt: now,
      updatedAt: now,
      contentVersion: 1,
      source: 'The Crucible',
      officialStatus: 'homebrew',
      libraryTags: [],
      archived: false,
    },
    identity: {
      name: '',
      concept: '',
      description: '',
      gmNotes: '',
      portrait: null,
    },
    classification: {
      sizeId: 'medium',
      tagIds: [],
      roleIds: [],
      languages: [],
    },
    creationContext: {
      depth: 'forge',
      partyTarget: { size: 4, averageLevel: 1, members: [] },
      desiredDifficulty: 'any',
      plannedCount: 1,
      appliedTemplateIds: [],
    },
    progression: {
      level: 1,
      threatRating: 1,
      proficiencyBonusOverride: null,
      highestCurioRarity: null,
    },
    attributes: { might: 10, instinct: 10, focus: 10, conviction: 10, resonance: 10, presence: 10 },
    saves: {
      proficient: { body: false, mind: false, soul: false },
      bonus: { body: 0, mind: 0, soul: 0 },
      override: { body: null, mind: null, soul: null },
    },
    talents: { entries: [], passivePerceptionOverride: null },
    defenses: {
      armorMode: 'natural',
      armorDescriptor: 'Natural Armor',
      armorBonus: 0,
      shieldBonus: 0,
      miscAcBonus: 0,
      manualArmorClass: 10,
      hitDiceCount: null,
      hitDieOverride: null,
      manualHitPoints: null,
      temporaryHitPoints: 0,
      regeneration: 0,
      vulnerabilities: [],
      resistances: [],
      immunities: [],
      conditionImmunities: [],
      wards: [],
    },
    movement: { ground: 30, climb: 0, swim: 0, fly: 0, burrow: 0, other: {}, hover: false },
    senses: { entries: [], passivePerception: null },
    resources: [],
    traits: [],
    actions: [],
    quickActions: [],
    reactions: [],
    apexActions: [],
    overtureActions: [],
    magic: {
      isCaster: false,
      casterType: 'Non-Caster',
      sources: [],
      castingAttribute: null,
      casterLevelOverride: null,
      aetherOverride: null,
      maxTierOverride: null,
      saveDcOverride: null,
      arteAttackOverride: null,
      knownArteIds: [],
      arteUsage: {},
      innateNote: '',
    },
    equipment: { weapons: [], armor: '', shield: '', items: [], curios: [] },
    loot: { currency: '', entries: [], notes: '' },
    roll20: {
      characterId: null,
      playerVisible: false,
      defaultOutput: 'public',
      concealName: false,
      concealedAs: '',
      hideMechanics: false,
      macroMenuThreshold: 8,
      macros: [],
      attributePayload: {},
    },
    token: {
      identity: 'unique',
      imageUrl: '',
      gridWidth: 1,
      gridHeight: 1,
      showNameplate: true,
      nameplateVisibility: 'all',
      bar1: { computed: 'crucible_hp', linked: true, visibility: 'all' },
      bar2: { computed: 'crucible_stamina', linked: true, visibility: 'gm' },
      bar3: { computed: 'crucible_ap', linked: true, visibility: 'gm' },
      auraRadius: 0,
      auraColor: '#eba72e',
      nightVisionRange: 0,
      lightRadius: 0,
      lightDimRadius: 0,
      markers: [],
      phaseImages: {},
    },
    assumptions: [],
    validation: [],
    derived: createEmptyDerived(),
  };
}

/** All action lists in statblock print order. */
export const ACTION_LIST_KEYS = [
  'actions',
  'quickActions',
  'reactions',
  'apexActions',
  'overtureActions',
] as const;

export type ActionListKey = (typeof ACTION_LIST_KEYS)[number];

/** Every action on an entity, across all lists. */
export function allActions(entity: CrucibleEntitySchema): CrucibleActionInstance[] {
  return ACTION_LIST_KEYS.flatMap((k) => entity[k]);
}
