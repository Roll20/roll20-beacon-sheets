/**
 * Prompt -> playable entity.
 *
 * Takes a parsed intent, fills every gap from the registries and the rules engine,
 * and records an assumption for each gap it filled. Nothing here invents a rule:
 * mechanical values come from recommendCreatureStats() and the benchmark tables,
 * flavour comes from registry content selected by a prompt-seeded PRNG so the same
 * sentence always yields the same creature.
 */

import type { AttributeKey } from '@/maker/types';
import type {
  CrucibleAssumption,
  CrucibleEntityKind,
  CrucibleResource,
  CrucibleTraitInstance,
  EncounterDifficulty,
  PartyTarget,
} from '@/crucible/schemas/crucibleCommon';
import { INFERRED } from '@/crucible/schemas/crucibleCommon';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { createEmptyEntity } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import { createAction } from '@/crucible/schemas/crucibleAction.schema';
import { createPhase } from '@/crucible/schemas/cruciblePhase.schema';
import { createNpcBlock } from '@/crucible/schemas/crucibleNpc.schema';
import { createMonsterBlock } from '@/crucible/schemas/crucibleMonster.schema';
import { createHazardBlock } from '@/crucible/schemas/crucibleHazard.schema';
import { createVehicleBlock } from '@/crucible/schemas/crucibleVehicle.schema';

import { sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';
import { roleById } from '@/crucible/data/registries/creatureRoles.registry';
import {
  creatureTypeById,
  CREATURE_TYPES,
} from '@/crucible/data/registries/creatureTypes.registry';
import { CREATURE_TRAITS, traitById } from '@/crucible/data/registries/creatureTraits.registry';
import {
  CREATURE_ACTIONS,
  actionTemplateById,
} from '@/crucible/data/registries/creatureActions.registry';
import {
  npcArchetypeById,
  NPC_ARCHETYPES,
} from '@/crucible/data/registries/npcArchetypes.registry';
import {
  npcMotivationById,
  NPC_MOTIVATIONS,
} from '@/crucible/data/registries/npcMotivations.registry';
import { hazardTypeById } from '@/crucible/data/registries/hazardTypes.registry';
import { environmentById } from '@/crucible/data/registries/encounterEnvironments.registry';
import { KIND_SCALING } from '@/crucible/data/registries/threatBalance.registry';

import { createRng, type Rng } from './seededRandom';
import { parseCrucibleIntent, type CrucibleIntent } from './parseCrucibleIntent';
import { recommendCreatureStats } from './recommendCreatureStats';
import { computeCrucibleDerived, trueDieAverage } from './computeCrucibleDerived';
import { validateCrucibleEntity } from './validateCrucibleEntity';
import { applyTemplates } from './applyCrucibleTemplate';
import { generateName } from './nameGenerator';

// ---------------------------------------------------------------------------
// Defaults used when the prompt says nothing
// ---------------------------------------------------------------------------

const DEFAULTS = {
  partySize: 4,
  partyLevel: 1,
  difficulty: 'medium' as EncounterDifficulty,
  kind: 'monster' as CrucibleEntityKind,
  sizeId: 'medium',
  roleId: 'bruiser',
};

/** Attribute priority per creature role, strongest first. */
const ROLE_ATTRIBUTE_PRIORITY: Record<string, AttributeKey[]> = {
  tank: ['conviction', 'might', 'instinct', 'presence', 'focus', 'resonance'],
  bruiser: ['might', 'conviction', 'instinct', 'presence', 'focus', 'resonance'],
  caster: ['resonance', 'focus', 'conviction', 'presence', 'instinct', 'might'],
  scout: ['instinct', 'might', 'focus', 'conviction', 'presence', 'resonance'],
  blaster: ['instinct', 'focus', 'conviction', 'might', 'resonance', 'presence'],
  controller: ['focus', 'resonance', 'conviction', 'presence', 'instinct', 'might'],
  healer: ['conviction', 'resonance', 'focus', 'presence', 'instinct', 'might'],
  coordinator: ['presence', 'conviction', 'focus', 'instinct', 'might', 'resonance'],
  minion: ['might', 'instinct', 'conviction', 'focus', 'presence', 'resonance'],
};

const KIND_FOR_ENTITY: Record<string, keyof typeof KIND_SCALING> = {
  monster: 'standard',
  npc: 'standard',
  boss: 'boss',
  mythicBoss: 'mythic',
  minion: 'minion',
  swarm: 'swarm',
  summon: 'standard',
  companion: 'standard',
  hazard: 'standard',
  trap: 'standard',
  vehicle: 'standard',
  encounterObject: 'standard',
};

// ---------------------------------------------------------------------------

export interface GenerateOptions {
  /** Overrides that beat anything the prompt said. */
  kind?: CrucibleEntityKind;
  partyTarget?: PartyTarget;
  difficulty?: EncounterDifficulty;
  count?: number;
  /** Entity id; generated when absent. */
  id?: string;
  now?: string;
  /** Force a seed instead of hashing the prompt. */
  seed?: number;
}

export interface GenerateResult {
  entity: CrucibleEntitySchema;
  intent: CrucibleIntent;
  notes: string[];
}

let autoId = 0;
const makeId = () => `crucible-${Date.now().toString(36)}-${(++autoId).toString(36)}`;

export function generateEntityFromPrompt(
  prompt: string,
  options: GenerateOptions = {},
): GenerateResult {
  return generateEntityDraft(parseCrucibleIntent(prompt), options);
}

export function generateEntityDraft(
  intent: CrucibleIntent,
  options: GenerateOptions = {},
): GenerateResult {
  const now = options.now ?? new Date().toISOString();
  const rng = createRng(options.seed ?? intent.seed);
  const assumptions: CrucibleAssumption[] = [];
  const notes: string[] = [];
  let assumptionSeq = 0;
  const assume = (
    fieldPath: string,
    assumedValue: unknown,
    reason: string,
    confidence: CrucibleAssumption['confidence'] = 'medium',
  ) => {
    assumptions.push({
      id: `assume-${++assumptionSeq}`,
      fieldPath,
      assumedValue,
      reason,
      confidence,
      canQuickEdit: true,
    });
  };

  // --- Resolve the build order ----------------------------------------------
  const kind: CrucibleEntityKind =
    options.kind ?? ((intent.kind?.value as CrucibleEntityKind) || DEFAULTS.kind);
  if (!options.kind && !intent.kind) {
    assume('kind', kind, 'No entity type was named, so a standard monster was built.', 'low');
  }

  const partySize =
    options.partyTarget?.size ?? Number(intent.partySize?.value ?? DEFAULTS.partySize);
  const partyLevel =
    options.partyTarget?.averageLevel ?? Number(intent.partyLevel?.value ?? DEFAULTS.partyLevel);
  if (!options.partyTarget && !intent.partySize) {
    assume(
      'creationContext.partyTarget.size',
      partySize,
      `Party size assumed as ${partySize} because none was given.`,
      'low',
    );
  }
  if (!options.partyTarget && !intent.partyLevel) {
    const fromLevel = intent.level ? Number(intent.level.value) : null;
    if (fromLevel != null) {
      assume(
        'creationContext.partyTarget.averageLevel',
        fromLevel,
        `Party level assumed to match the requested creature level (${fromLevel}).`,
        'low',
      );
    } else {
      assume(
        'creationContext.partyTarget.averageLevel',
        partyLevel,
        `Party level assumed as ${partyLevel} because none was given.`,
        'low',
      );
    }
  }
  const effectivePartyLevel =
    options.partyTarget?.averageLevel ??
    (intent.partyLevel
      ? Number(intent.partyLevel.value)
      : intent.level
      ? Number(intent.level.value)
      : partyLevel);

  const difficulty: EncounterDifficulty =
    options.difficulty ??
    ((intent.difficulty?.value as EncounterDifficulty) || DEFAULTS.difficulty);
  if (!options.difficulty && !intent.difficulty) {
    assume(
      'creationContext.desiredDifficulty',
      difficulty,
      'Difficulty assumed as Medium because none was requested.',
      'low',
    );
  }

  const count =
    options.count ?? Number(intent.count?.value ?? (kind === 'minion' ? partySize * 2 : 1));
  if (!options.count && !intent.count && kind === 'minion') {
    assume(
      'creationContext.plannedCount',
      count,
      `Minions only work in numbers, so ${count} were assumed for a party of ${partySize}.`,
      'medium',
    );
  }

  // --- Roles ----------------------------------------------------------------
  let roleIds = intent.roleIds.map((r) => r.value);
  if (kind === 'minion' && !roleIds.includes('minion')) roleIds = ['minion'];
  if (!roleIds.length) {
    const typeDef = intent.creatureTypeId ? creatureTypeById[intent.creatureTypeId.value] : null;
    const fromType = typeDef?.commonRoles?.[0];
    roleIds = [fromType || DEFAULTS.roleId];
    assume(
      'classification.roleIds',
      roleIds,
      fromType
        ? `Role set to ${
            roleById[fromType]?.name ?? fromType
          } because that is the typical role for a ${typeDef?.name}.`
        : `Role set to ${roleById[DEFAULTS.roleId]?.name} as the neutral default.`,
      fromType ? 'medium' : 'low',
    );
  }
  const primaryRole = roleById[roleIds[0]] ?? roleById[DEFAULTS.roleId];

  // --- Recommendation -------------------------------------------------------
  const scalingKey = KIND_FOR_ENTITY[kind] ?? 'standard';
  const recommendation = recommendCreatureStats({
    partySize,
    partyLevels: Array.from({ length: Math.max(1, partySize) }, () => effectivePartyLevel),
    desiredDifficulty: difficulty,
    enemyCount: count,
    roleIds,
    kind: scalingKey as 'standard' | 'elite' | 'boss' | 'mythic' | 'minion' | 'swarm',
    environmentId: intent.environmentId?.value,
  });
  notes.push(recommendation.reason);
  recommendation.warnings.forEach((w) => notes.push(w));

  const threatRating = intent.threatRating
    ? Number(intent.threatRating.value)
    : Math.round((recommendation.threatRatingLow + recommendation.threatRatingHigh) / 2);
  if (!intent.threatRating) {
    assume(
      'progression.threatRating',
      threatRating,
      `Threat Rating ${threatRating} is the midpoint of the ${recommendation.threatRatingLow}-${recommendation.threatRatingHigh} band recommended for a ${difficulty} fight against ${partySize} level-${effectivePartyLevel} PCs.`,
      'high',
    );
  }

  const level = intent.level ? Number(intent.level.value) : recommendation.level;
  if (!intent.level) {
    assume(
      'progression.level',
      level,
      `Level ${level} gives Proficiency Bonus +${recommendation.proficiencyBonus}, matching the party.`,
      'medium',
    );
  }

  // --- Size -----------------------------------------------------------------
  let sizeId = intent.sizeId?.value ?? '';
  if (!sizeId) {
    sizeId =
      kind === 'swarm'
        ? 'large'
        : kind === 'mythicBoss'
        ? 'huge'
        : kind === 'boss'
        ? 'large'
        : DEFAULTS.sizeId;
    assume(
      'classification.sizeId',
      sizeId,
      `Size assumed as ${sizeOrDefault(sizeId).name} for a ${kind}.`,
      'low',
    );
  }
  const size = sizeOrDefault(sizeId);

  // --- Build the entity -----------------------------------------------------
  const entity = createEmptyEntity(options.id ?? makeId(), kind, now);
  entity.meta.originPrompt = intent.prompt;
  entity.meta.seed = rng.seed;
  entity.meta.officialStatus = 'homebrew';
  entity.creationContext = {
    depth: intent.depth,
    partyTarget: { size: partySize, averageLevel: effectivePartyLevel, members: [] },
    desiredDifficulty: difficulty,
    plannedCount: count,
    appliedTemplateIds: [],
  };
  entity.progression = {
    level,
    threatRating,
    proficiencyBonusOverride: null,
    highestCurioRarity: null,
  };
  entity.classification.sizeId = sizeId;
  entity.classification.roleIds = roleIds;

  // --- Creature type and tags ----------------------------------------------
  const typeDef = intent.creatureTypeId
    ? creatureTypeById[intent.creatureTypeId.value]
    : pickTypeForKind(rng, kind);
  if (!intent.creatureTypeId && typeDef) {
    assume(
      'monster.creatureTypeIds',
      [typeDef.id],
      `Creature type assumed as ${typeDef.name} from the prompt's wording.`,
      'low',
    );
  }
  const tagNames = intent.tagNames.map((t) => t.value);
  if (!tagNames.length && typeDef?.defaultTagNames?.length) {
    tagNames.push(typeDef.defaultTagNames[0]);
    assume(
      'classification.tagIds',
      tagNames,
      `Tag assumed as "${tagNames[0]}" from the creature type.`,
      'low',
    );
  }
  entity.classification.tagIds = tagNames;
  entity.classification.languages =
    kind === 'npc'
      ? ['Common']
      : typeDef?.defaultIntelligence === 'animal' || typeDef?.defaultIntelligence === 'mindless'
      ? []
      : ['Common'];

  // --- Identity -------------------------------------------------------------
  const name =
    intent.properName ??
    generateName(rng.fork('name'), {
      themeWords: intent.themeWords,
      descriptors: intent.descriptors,
      typeName: typeDef?.name,
      kind,
      roleName: primaryRole?.name,
    });
  entity.identity.name = name;
  if (!intent.properName) {
    assume('identity.name', name, 'Name generated from the prompt words; rename freely.', 'low');
  }
  entity.identity.concept = buildConcept(intent, typeDef?.name, primaryRole?.name, size.name);
  entity.identity.description = buildDescription(
    rng.fork('desc'),
    intent,
    typeDef?.name,
    size.name,
    primaryRole?.name,
  );

  // --- Attributes -----------------------------------------------------------
  const priority =
    ROLE_ATTRIBUTE_PRIORITY[primaryRole?.id ?? DEFAULTS.roleId] ?? ROLE_ATTRIBUTE_PRIORITY.bruiser;
  const topMod = Math.max(1, Math.min(12, 2 + Math.floor(threatRating / 2.5)));
  const spread = [topMod, topMod - 1, topMod - 2, topMod - 3, topMod - 4, topMod - 5].map((m) =>
    Math.max(kind === 'minion' ? -1 : 0, m),
  );
  priority.forEach((attr, i) => {
    entity.attributes[attr] = 10 + spread[i] * 2;
  });
  assume(
    'attributes',
    { ...entity.attributes },
    `Attributes spread from +${topMod} down, ordered by the ${primaryRole?.name} role, sized for Threat Rating ${threatRating}.`,
    'medium',
  );

  // --- Defenses -------------------------------------------------------------
  const convMod = Math.floor((entity.attributes.conviction - 10) / 2);
  const instMod = Math.floor((entity.attributes.instinct - 10) / 2);
  const targetHp = Math.round((recommendation.hitPointsLow + recommendation.hitPointsHigh) / 2);
  const perDie = trueDieAverage(size.hitDieSize) + convMod;
  const roleHitDiceAdd = roleIds.includes('tank')
    ? recommendation.proficiencyBonus
    : roleIds.includes('bruiser') || roleIds.includes('healer')
    ? Math.max(1, Math.floor(recommendation.proficiencyBonus / 2))
    : 0;
  const hitDiceCount = Math.max(1, Math.round(targetHp / Math.max(1, perDie)) - roleHitDiceAdd);
  entity.defenses.hitDiceCount = hitDiceCount;
  assume(
    'defenses.hitDiceCount',
    hitDiceCount,
    `${hitDiceCount}d${size.hitDieSize} lands in the ${recommendation.hitPointsLow}-${recommendation.hitPointsHigh} hit-point band for Threat Rating ${threatRating}.`,
    'high',
  );

  // Armour: pick the mode that best reaches the recommended AC.
  const targetAc = Math.round((recommendation.armorClassLow + recommendation.armorClassHigh) / 2);
  const naturalAc = 10 + instMod;
  const hideAc = 10 + instMod + convMod;
  if (kind === 'npc' || roleIds.includes('coordinator')) {
    entity.defenses.armorMode = 'armor';
    entity.defenses.armorBonus = Math.max(
      0,
      targetAc - naturalAc - Math.floor(recommendation.proficiencyBonus / 2),
    );
    entity.defenses.armorDescriptor =
      entity.defenses.armorBonus >= 6
        ? 'Plate'
        : entity.defenses.armorBonus >= 3
        ? 'Mail'
        : 'Leather Armor';
  } else if (Math.abs(hideAc - targetAc) <= Math.abs(naturalAc - targetAc)) {
    entity.defenses.armorMode = 'toughenedHide';
    entity.defenses.armorDescriptor = 'Toughened Hide';
    entity.defenses.miscAcBonus = targetAc - hideAc;
  } else {
    entity.defenses.armorMode = 'natural';
    entity.defenses.armorDescriptor = 'Natural Armor';
    entity.defenses.miscAcBonus = targetAc - naturalAc;
  }
  assume(
    'defenses.armorMode',
    entity.defenses.armorMode,
    `${entity.defenses.armorDescriptor} reaches AC ${targetAc}, the middle of the Threat Rating ${threatRating} band.`,
    'medium',
  );

  if (typeDef) {
    entity.defenses.resistances = [...typeDef.typicalResistances];
    entity.defenses.immunities = [...typeDef.typicalImmunities];
    entity.defenses.conditionImmunities = [...typeDef.typicalConditionImmunities];
    entity.senses.entries = [...typeDef.typicalSenses];
  }
  recommendation.recommendedResistances.forEach((r) => {
    if (!entity.defenses.resistances.includes(r)) entity.defenses.resistances.push(r);
  });

  // --- Movement -------------------------------------------------------------
  entity.movement.ground = size.defaultSpeed;
  if (typeDef?.id === 'dragon' || /wing|fly|avian|bird/.test(intent.prompt.toLowerCase())) {
    entity.movement.fly = size.defaultSpeed + 20;
  }
  if (/swim|aquatic|sea|ocean|water/.test(intent.prompt.toLowerCase())) {
    entity.movement.swim = size.defaultSpeed;
  }
  if (/burrow|tunnel|underground/.test(intent.prompt.toLowerCase())) {
    entity.movement.burrow = Math.round(size.defaultSpeed / 2);
  }

  // --- Saves and talents ----------------------------------------------------
  const saveProficiencies = pickSaveProficiencies(primaryRole?.id ?? DEFAULTS.roleId);
  saveProficiencies.forEach((s) => {
    entity.saves.proficient[s] = true;
  });
  entity.talents.entries = pickTalents(
    rng.fork('talents'),
    primaryRole?.id ?? DEFAULTS.roleId,
    threatRating,
  );

  // --- Traits ---------------------------------------------------------------
  const traitCount = recommendation.recommendedTraitCount;
  const traitPool = CREATURE_TRAITS.filter((t) => {
    if (t.suitedTo?.length && !t.suitedTo.includes(kind)) return false;
    if (kind === 'minion' && t.threatCost > 1) return false;
    return true;
  });
  const roleMatched = traitPool.filter((t) => t.recommendedRoles?.some((r) => roleIds.includes(r)));
  const promptMatched = traitPool.filter((t) =>
    t.keywords?.some((k) => intent.prompt.toLowerCase().includes(k.toLowerCase())),
  );
  const bossTraits =
    kind === 'boss' || kind === 'mythicBoss' ? traitPool.filter((t) => t.category === 'boss') : [];
  const swarmTraits = kind === 'swarm' ? traitPool.filter((t) => t.category === 'swarm') : [];

  const chosenTraits = dedupeById([
    ...swarmTraits.slice(0, 3),
    ...bossTraits.slice(0, 2),
    ...promptMatched.slice(0, 2),
    ...rng.fork('traits').sample(roleMatched, traitCount),
    ...rng.fork('traits2').sample(traitPool, traitCount),
  ]).slice(0, Math.max(traitCount, swarmTraits.length ? 4 : 2));

  entity.traits = chosenTraits.map<CrucibleTraitInstance>((t, i) => ({
    id: `${entity.id}-trait-${i}`,
    registryId: t.id,
    name: t.name,
    description: t.description,
    uses: t.uses,
    threatCost: t.threatCost,
    origin: INFERRED,
  }));
  if (entity.traits.length) {
    assume(
      'traits',
      entity.traits.map((t) => t.name),
      `${entity.traits.length} traits chosen for a ${primaryRole?.name} at Threat Rating ${threatRating}.`,
      'low',
    );
  }

  // --- Actions --------------------------------------------------------------
  const scaling = KIND_SCALING[scalingKey];
  const targetDpr = Math.round(
    (recommendation.damagePerRoundLow + recommendation.damagePerRoundHigh) / 2,
  );
  buildActions(entity, {
    rng: rng.fork('actions'),
    roleIds,
    kind,
    threatRating,
    targetDpr,
    actionPoints: scaling.actionPoints,
    recommendation,
    prompt: intent.prompt.toLowerCase(),
  });
  assume(
    'actions',
    entity.actions.map((a) => a.name),
    `Actions sized to about ${targetDpr} damage per round, the benchmark for Threat Rating ${threatRating}.`,
    'medium',
  );

  // --- Magic ----------------------------------------------------------------
  if (
    roleIds.includes('caster') ||
    roleIds.includes('healer') ||
    /arte|spell|magic|cast/.test(intent.prompt.toLowerCase())
  ) {
    entity.magic.isCaster = true;
    entity.magic.casterType = roleIds.includes('caster') ? 'High-Caster' : 'Mid-Caster';
    entity.magic.castingAttribute = roleIds.includes('healer') ? 'conviction' : 'resonance';
    entity.magic.sources = [pickArteSource(rng.fork('source'), typeDef?.id)];
    entity.magic.innateNote = `Casts Artes from the ${entity.magic.sources[0]} source. Aether is spent as usual; Arte tier is capped by caster level.`;
    assume(
      'magic',
      { casterType: entity.magic.casterType, source: entity.magic.sources[0] },
      `Caster role implies ${entity.magic.casterType} progression on the ${entity.magic.sources[0]} list.`,
      'low',
    );
  }

  // --- Resources ------------------------------------------------------------
  entity.resources = buildResources(entity, scaling.actionPoints);

  // --- Kind-specific blocks -------------------------------------------------
  applyKindBlocks(entity, {
    rng: rng.fork('blocks'),
    intent,
    kind,
    typeDefId: typeDef?.id,
    threatRating,
    assume,
  });

  // --- Token / Roll20 defaults ---------------------------------------------
  const generic = kind === 'minion' || kind === 'swarm' || count > 1;
  entity.token.identity = generic ? 'generic' : 'unique';
  entity.token.gridWidth = size.gridWidth;
  entity.token.gridHeight = size.gridHeight;
  entity.token.bar1 = { computed: 'crucible_hp', linked: !generic, visibility: 'all' };
  entity.token.bar2 = {
    computed: entity.magic.isCaster ? 'crucible_aether' : 'crucible_stamina',
    linked: !generic,
    visibility: 'gm',
  };
  entity.token.bar3 = { computed: 'crucible_ap', linked: !generic, visibility: 'gm' };
  entity.roll20.defaultOutput = kind === 'npc' ? 'gmWhisper' : 'public';
  entity.roll20.playerVisible = false;
  if (generic) {
    assume(
      'token.identity',
      'generic',
      'Multiple copies will be on the map, so the token is generic with unlinked bars - otherwise damaging one would damage them all.',
      'high',
    );
  }

  // --- Templates ------------------------------------------------------------
  let finished = entity;
  if (intent.templateIds.length) {
    const result = applyTemplates(
      entity,
      intent.templateIds.map((t) => t.value),
    );
    finished = result.entity;
    notes.push(...result.notes);
  }

  finished.assumptions = assumptions;
  finished.derived = computeCrucibleDerived(finished);
  finished.validation = validateCrucibleEntity(finished);

  return { entity: finished, intent, notes };
}

// ---------------------------------------------------------------------------
// Sub-builders
// ---------------------------------------------------------------------------

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (!i || seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

function pickTypeForKind(rng: Rng, kind: CrucibleEntityKind) {
  if (kind === 'npc') return creatureTypeById.humanoid ?? CREATURE_TYPES[0];
  if (kind === 'swarm') return creatureTypeById.beast ?? CREATURE_TYPES[0];
  return rng.pick(CREATURE_TYPES) ?? CREATURE_TYPES[0];
}

function pickArteSource(rng: Rng, typeId?: string): string {
  if (typeId === 'celestial' || typeId === 'god') return 'Divine';
  if (typeId === 'aberration' || typeId === 'fiend') return 'Eldritch';
  if (typeId === 'construct') return 'Paracausal';
  return rng.pick(['Arcane', 'Divine', 'Eldritch', 'Paracausal']) ?? 'Arcane';
}

function pickSaveProficiencies(roleId: string): ('body' | 'mind' | 'soul')[] {
  switch (roleId) {
    case 'tank':
    case 'bruiser':
      return ['body'];
    case 'caster':
    case 'controller':
      return ['mind'];
    case 'healer':
    case 'coordinator':
      return ['soul'];
    case 'scout':
    case 'blaster':
      return ['body'];
    default:
      return [];
  }
}

const ROLE_TALENTS: Record<string, string[]> = {
  tank: ['Athletics', 'Intimidation', 'Perception'],
  bruiser: ['Athletics', 'Intimidation', 'Survival'],
  caster: ['Arcana', 'Insight', 'Perception'],
  scout: ['Stealth', 'Perception', 'Acrobatics', 'Survival'],
  blaster: ['Perception', 'Acrobatics'],
  controller: ['Arcana', 'Insight', 'Deception'],
  healer: ['Medicine', 'Insight', 'Religion'],
  coordinator: ['Persuasion', 'Insight', 'Intimidation'],
  minion: ['Perception'],
};

function pickTalents(rng: Rng, roleId: string, threatRating: number) {
  const pool = ROLE_TALENTS[roleId] ?? ROLE_TALENTS.bruiser;
  const count = Math.max(1, Math.min(pool.length, 2 + Math.floor(threatRating / 5)));
  return rng.sample(pool, count).map((talentId) => ({
    talentId,
    tier: (threatRating >= 12 ? 'expert' : 'proficient') as 'expert' | 'proficient',
  }));
}

function buildResources(entity: CrucibleEntitySchema, actionPoints: number): CrucibleResource[] {
  const resources: CrucibleResource[] = [
    {
      id: 'ap',
      name: 'Action Points',
      kind: 'actionPoints',
      max: actionPoints,
      current: null,
      tokenBar: true,
      refresh: 'roundStart',
      description: "Spent on actions each turn; refreshed at the start of the creature's turn.",
    },
  ];
  if (entity.magic.isCaster) {
    resources.push({
      id: 'aether',
      name: 'Aether',
      kind: 'aether',
      max: 0,
      current: null,
      tokenBar: true,
      refresh: 'fullRest',
      description: 'Spent to cast Artes. Max is derived from caster level.',
    });
  }
  if (entity.kind === 'boss' || entity.kind === 'mythicBoss') {
    resources.push({
      id: 'apex',
      name: 'Apex Actions',
      kind: 'custom',
      max: 3,
      current: null,
      tokenBar: false,
      refresh: 'roundStart',
      description: "Off-turn actions taken between other creatures' turns.",
    });
  }
  return resources;
}

interface ActionBuildContext {
  rng: Rng;
  roleIds: string[];
  kind: CrucibleEntityKind;
  threatRating: number;
  targetDpr: number;
  actionPoints: number;
  recommendation: ReturnType<typeof recommendCreatureStats>;
  prompt: string;
}

function buildActions(entity: CrucibleEntitySchema, ctx: ActionBuildContext): void {
  const eligible = CREATURE_ACTIONS.filter((a) => a.minThreatRating <= ctx.threatRating);
  const byCategory = (category: string) => {
    const pool = eligible.filter((a) => a.category === category);
    const roleMatch = pool.filter((a) => a.recommendedRoles.some((r) => ctx.roleIds.includes(r)));
    const promptMatch = pool.filter((a) =>
      a.keywords.some((k) => ctx.prompt.includes(k.toLowerCase())),
    );
    return dedupeById([...promptMatch, ...roleMatch, ...pool]);
  };

  const role = roleById[ctx.roleIds[0]] ?? roleById.bruiser;
  const wantCore = ctx.kind === 'minion' ? 1 : role?.suggestedCoreActions ?? 2;
  const wantQuick = ctx.kind === 'minion' ? 0 : role?.suggestedQuickActions ?? 1;
  const wantReaction = ctx.kind === 'minion' ? 0 : Math.min(2, role?.suggestedReactions ?? 1);

  const instantiate = (
    template: (typeof CREATURE_ACTIONS)[number],
    index: number,
  ): CrucibleActionInstance =>
    createAction({
      ...template,
      id: `${entity.id}-act-${template.category}-${index}`,
      registryId: template.id,
      origin: INFERRED,
    });

  entity.actions = byCategory('core').slice(0, wantCore).map(instantiate);
  entity.quickActions = byCategory('quick').slice(0, wantQuick).map(instantiate);
  entity.reactions = byCategory('reaction').slice(0, wantReaction).map(instantiate);

  if (ctx.recommendation.allowApex) {
    entity.apexActions = byCategory('apex').slice(0, 3).map(instantiate);
  }
  if (ctx.recommendation.allowOverture) {
    entity.overtureActions = byCategory('overture').slice(0, 2).map(instantiate);
  }
  if (entity.kind === 'hazard' || entity.kind === 'trap') {
    entity.actions = byCategory('hazard').slice(0, 2).map(instantiate);
  }

  // Scale damage so the creature actually hits its damage-per-round benchmark.
  const mods = {
    might: Math.floor((entity.attributes.might - 10) / 2),
    instinct: Math.floor((entity.attributes.instinct - 10) / 2),
    focus: Math.floor((entity.attributes.focus - 10) / 2),
    conviction: Math.floor((entity.attributes.conviction - 10) / 2),
    resonance: Math.floor((entity.attributes.resonance - 10) / 2),
    presence: Math.floor((entity.attributes.presence - 10) / 2),
  };

  const primary = entity.actions.find((a) => (a.damage?.length ?? 0) > 0);
  if (primary?.damage?.length) {
    const cost = Math.max(1, primary.actionPointCost ?? 2);
    const attacksPerRound = Math.max(1, Math.floor(ctx.actionPoints / cost));
    const perAttack = ctx.targetDpr / attacksPerRound;
    for (const action of entity.actions) {
      if (!action.damage?.length) continue;
      const current = action.damage.reduce(
        (s, d) =>
          s +
          d.count * trueDieAverage(d.die) +
          d.flat +
          (d.abilityBonus ? mods[d.abilityBonus] : 0),
        0,
      );
      if (current <= 0) continue;
      const factor = perAttack / current;
      action.damage = action.damage.map((d) => ({
        ...d,
        count: Math.max(
          1,
          Math.round((d.count * trueDieAverage(d.die) * factor) / trueDieAverage(d.die)),
        ),
      }));
    }
    if (attacksPerRound > 1) {
      entity.actions.unshift(
        createAction({
          id: `${entity.id}-act-multiattack`,
          name: 'Multiattack',
          category: 'core',
          actionPointCost: ctx.actionPoints,
          targeting: { mode: 'multipleTargets', count: attacksPerRound },
          range: null,
          roll: { type: 'automatic' },
          description: `${entity.identity.name || 'The creature'} makes ${attacksPerRound} ${
            primary.name
          } attacks.`,
          roll20Template: 'convergence-action',
          multiattackOf: Array.from({ length: attacksPerRound }, () => primary.id),
          origin: INFERRED,
          threatCost: 1,
        }),
      );
    }
  }
}

interface BlockContext {
  rng: Rng;
  intent: CrucibleIntent;
  kind: CrucibleEntityKind;
  typeDefId?: string;
  threatRating: number;
  assume: (
    path: string,
    value: unknown,
    reason: string,
    confidence?: CrucibleAssumption['confidence'],
  ) => void;
}

function applyKindBlocks(entity: CrucibleEntitySchema, ctx: BlockContext): void {
  const { rng, intent, kind, assume } = ctx;
  const typeDef = ctx.typeDefId ? creatureTypeById[ctx.typeDefId] : null;

  // Every combatant gets a monster block for tactics/loot; NPCs get one only if statted.
  if (kind !== 'hazard' && kind !== 'trap' && kind !== 'vehicle' && kind !== 'encounterObject') {
    entity.monster = createMonsterBlock({
      creatureTypeIds: typeDef ? [typeDef.id] : [],
      roleIds: entity.classification.roleIds,
      environmentIds: intent.environmentId ? [intent.environmentId.value] : [],
      origin: (typeDef?.defaultOrigin as never) ?? 'natural',
      intelligence: (typeDef?.defaultIntelligence as never) ?? 'animal',
      habitat: intent.environmentId ? environmentById[intent.environmentId.value]?.name : '',
      combatProfile: {
        preferredRange: entity.classification.roleIds.includes('blaster')
          ? 'long'
          : entity.classification.roleIds.includes('caster')
          ? 'mid'
          : 'melee',
        openingMove: entity.actions[0] ? `Opens with ${entity.actions[0].name}.` : '',
        standardTurn: `Spends its ${entity.derived.actionPoints || 3} Action Points on ${
          entity.actions[0]?.name ?? 'attacks'
        }, holding its Reaction.`,
        bloodiedBehavior:
          kind === 'boss' || kind === 'mythicBoss'
            ? 'Enters its next phase and fights harder.'
            : 'Fights on, but looks for an opening to disengage.',
        retreatBehavior:
          kind === 'minion'
            ? 'Breaks and scatters.'
            : 'Withdraws when reduced below a quarter of its hit points.',
        morale: kind === 'minion' ? 3 : kind === 'boss' || kind === 'mythicBoss' ? 10 : 6,
      },
      weaknessClues: buildWeaknessClues(rng, entity),
      ecology: typeDef?.description ?? '',
    });
  }

  if (kind === 'npc') {
    const archetype = intent.npcArchetypeId
      ? npcArchetypeById[intent.npcArchetypeId.value]
      : rng.pick(NPC_ARCHETYPES);
    const motivation = intent.npcMotivationId
      ? npcMotivationById[intent.npcMotivationId.value]
      : archetype?.motivationIds?.length
      ? npcMotivationById[rng.pick(archetype.motivationIds) as string]
      : rng.pick(NPC_MOTIVATIONS);

    entity.npc = createNpcBlock({
      npcDepth: intent.socialLean ? 'quick' : 'standard',
      archetypeId: archetype?.id,
      occupation: archetype?.occupation ?? '',
      publicRole: archetype?.publicRole ?? '',
      motivation: motivation?.statement ?? '',
      fear: motivation?.fear ?? '',
      flaw: motivation?.flaw ?? '',
      secret: motivation?.secret ?? '',
      contradiction: motivation?.contradiction ?? '',
      breakingPoint: motivation?.breakingPoint ?? '',
      negotiationLevers: motivation?.negotiationLevers ?? [],
      dispositionTowardParty: motivation?.dispositionBias ?? 0,
      voice: (archetype?.voiceSeeds?.length ? rng.pick(archetype.voiceSeeds) : '') ?? '',
      mannerisms: archetype?.mannerismSeeds ? rng.sample(archetype.mannerismSeeds, 2) : [],
      ancestry: 'Human',
      knowledge: (archetype?.knowledgeTopics ?? []).slice(0, 3).map((topic, i) => ({
        id: `${entity.id}-know-${i}`,
        topic,
        content: `Knows the local situation regarding ${topic.toLowerCase()}.`,
        difficulty: i === 0 ? ('ifAsked' as const) : ('ifTrusted' as const),
        dc: i === 0 ? null : 10 + Math.floor(ctx.threatRating / 2),
        isMisinformation: false,
        gmOnly: true,
      })),
    });
    if (motivation) {
      assume(
        'npc.motivation',
        motivation.name,
        `Motivation "${motivation.name}" chosen to fit the ${archetype?.name ?? 'NPC'} archetype.`,
        'low',
      );
    }
    // A purely social NPC needs no statblock; keep its secrets off the player channel.
    if (intent.socialLean) {
      entity.roll20.defaultOutput = 'gmWhisper';
      entity.roll20.playerVisible = false;
    }
  }

  if (kind === 'boss' || kind === 'mythicBoss') {
    const phaseCount = kind === 'mythicBoss' ? 3 : 2;
    entity.boss = {
      phases: Array.from({ length: phaseCount }, (_, i) =>
        createPhase({
          id: `${entity.id}-phase-${i + 1}`,
          name: i === 0 ? 'Opening' : i === phaseCount - 1 ? 'Final Stand' : `Escalation ${i}`,
          order: i + 1,
          trigger:
            i === 0
              ? { type: 'manual' }
              : { type: 'hpThreshold', value: Math.round(100 - (100 / phaseCount) * i) },
          hpBehavior: 'sharedPool',
          transitionText:
            i === 0
              ? `${entity.identity.name} sizes up its attackers.`
              : `${entity.identity.name} is driven past restraint and changes how it fights.`,
        }),
      ),
      activePhaseId: null,
      apexActionsPerRound: kind === 'mythicBoss' ? 3 : 2,
      overtureUnlocksAtPhase: kind === 'mythicBoss' ? phaseCount : null,
      legendaryResistances: kind === 'mythicBoss' ? 3 : 2,
      lairInitiative: 20,
      lairDescription: '',
    };
    assume(
      'boss.phases',
      entity.boss.phases.map((p) => p.name),
      `${phaseCount} phases keep a solo ${
        kind === 'mythicBoss' ? 'mythic boss' : 'boss'
      } interesting across a long fight.`,
      'medium',
    );
  }

  if (kind === 'hazard' || kind === 'trap') {
    const hazardType = intent.hazardTypeId ? hazardTypeById[intent.hazardTypeId.value] : null;
    entity.hazard = createHazardBlock({
      hazardTypeId: hazardType?.id ?? '',
      trigger: {
        kind: (hazardType?.triggerKind as never) ?? 'proximity',
        description: hazardType?.triggerDescription ?? 'Triggers when a creature enters the area.',
        noticeDc: 10 + Math.floor(ctx.threatRating / 2) + (hazardType?.noticeDcOffset ?? 0),
        avoidSave: (hazardType?.avoidSave as never) ?? 'body',
        avoidDc: null,
      },
      area: hazardType?.area ? { ...hazardType.area, unit: 'ft' as const } : null,
      disable: {
        method: hazardType?.disableMethod ?? '',
        talent: hazardType?.disableTalent ?? 'Sleight of Hand',
        dc: 10 + Math.floor(ctx.threatRating / 2),
        failureTriggers: true,
      },
      escalation: {
        enabled: hazardType?.escalates ?? false,
        perRound: hazardType?.escalationText ?? '',
        maxRounds: hazardType?.escalates ? 5 : null,
      },
      takesTurns: hazardType?.takesTurns ?? false,
      initiativeCount: hazardType?.takesTurns ? 20 : null,
      reusable: hazardType?.reusable ?? false,
      countsTowardThreat: true,
    });
    entity.token.identity = 'generic';
  }

  if (kind === 'vehicle') {
    const size = sizeOrDefault(entity.classification.sizeId);
    entity.vehicle = createVehicleBlock({
      capacityCrew: Math.max(1, size.gridWidth * 2),
      capacityPassengers: Math.max(0, size.gridWidth * 4),
      hullPoints: entity.derived.hitPoints || 100,
      hullArmorClass: 10 + Math.floor(ctx.threatRating / 2),
      minimumCrew: 1,
      destructionEffect:
        'The vehicle is wrecked. Everyone aboard takes falling or crushing damage as the situation dictates.',
      passengerRules: 'Passengers may act normally but have half cover from outside attacks.',
      movementSystems: [
        {
          id: 'primary',
          name: 'Primary Drive',
          kind: 'ground',
          speed: size.defaultSpeed * 2,
          requiresCrew: 1,
          description: 'Standard propulsion; speed halves if crew falls below the minimum.',
        },
      ],
    });
  }
}

function buildWeaknessClues(rng: Rng, entity: CrucibleEntitySchema): string[] {
  const clues: string[] = [];
  for (const vuln of entity.defenses.vulnerabilities) {
    clues.push(`It flinches from ${vuln.toLowerCase()}.`);
  }
  if (entity.defenses.resistances.length) {
    clues.push(
      `Blows seem to slide off it - ${entity.defenses.resistances[0].toLowerCase()} does little.`,
    );
  }
  if (!clues.length) {
    clues.push(
      rng.pick([
        'It favours one side, as though an old wound never healed.',
        'It will not step onto consecrated ground.',
        'Its movements slow noticeably in bright light.',
        'It pauses whenever it hears its own name.',
      ]) ?? '',
    );
  }
  return clues.filter(Boolean);
}

function buildConcept(
  intent: CrucibleIntent,
  typeName?: string,
  roleName?: string,
  sizeName?: string,
): string {
  const descriptor = intent.descriptors[0];
  const theme = intent.themeWords.slice(0, 2).join(' ');
  const bits = [
    descriptor ? descriptor.charAt(0).toUpperCase() + descriptor.slice(1) : sizeName,
    theme,
    typeName?.toLowerCase(),
  ].filter(Boolean);
  const lead = bits.join(' ').trim() || 'Creature';
  return roleName ? `${lead} - fights as a ${roleName}.` : lead;
}

function buildDescription(
  rng: Rng,
  intent: CrucibleIntent,
  typeName?: string,
  sizeName?: string,
  roleName?: string,
): string {
  const theme = intent.themeWords.slice(0, 3).join(' ');
  const descriptor = intent.descriptors.join(' and ');
  const openers = [
    `A ${sizeName?.toLowerCase() ?? 'medium'} ${typeName?.toLowerCase() ?? 'creature'}`,
    `${sizeName ?? 'Medium'} and ${descriptor || 'unremarkable'} at a glance`,
    `Standing ${sizeName?.toLowerCase() ?? 'medium'} against the light`,
  ];
  const opener = rng.pick(openers) ?? openers[0];
  const themeLine = theme ? ` marked by ${theme}.` : '.';
  const roleLine = roleName
    ? ` It fights as a ${roleName.toLowerCase()} - read its actions before committing.`
    : '';
  return `[PROPOSED] ${opener}${themeLine}${roleLine} Rewrite this description in your own voice; only the numbers came from the rules.`;
}

/** Re-export so callers can go straight from text to entity. */
export { parseCrucibleIntent };
export { actionTemplateById, traitById };
