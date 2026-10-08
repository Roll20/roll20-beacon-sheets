/**
 * Creature combat roles and the mechanical modifiers each applies.
 *
 * Provenance: supplied by the Crucible directive citing the Convergence Bestiary
 * updated 2026-08-04 - see docs/CRUCIBLE_AUDIT.md section 6.4. The role names match the
 * eight PC roles already in src/maker/data/roles.ts, plus `minion`.
 */

export type RoleEffectKind =
  | 'hitDieStep'
  | 'hitDiceAdd'
  | 'damageBonus'
  | 'aetherAdd'
  | 'speedAdd'
  | 'talentBonus'
  | 'attackBonus'
  | 'rangeMultiplier'
  | 'effectDcBonus'
  | 'healingBonus'
  | 'commandActionPoints'
  | 'minionRules';

export interface RoleEffect {
  kind: RoleEffectKind;
  /** Flat amount, when the effect is a constant. */
  flat?: number;
  /** Fraction of Proficiency Bonus, e.g. 0.5 for "half PB". */
  pbFraction?: number;
  /** Floor applied after the fraction. */
  min?: number;
  /** Ceiling applied after the fraction. */
  max?: number;
  /** Extra payload: talent id, multiplier, etc. */
  detail?: string;
  description: string;
}

export interface CreatureRoleDef {
  id: string;
  name: string;
  summary: string;
  effects: RoleEffect[];
  /** Roles that pull in opposite directions; stacking these raises a warning. */
  conflictsWith: string[];
  /** Keywords the intent parser matches to infer this role from a prompt. */
  keywords: string[];
  /** Recommended action mix for a creature in this role. */
  suggestedCoreActions: number;
  suggestedQuickActions: number;
  suggestedReactions: number;
  source: string;
}

const SRC = 'directive-2026-08-04';

export const CREATURE_ROLES: CreatureRoleDef[] = [
  {
    id: 'tank',
    name: 'Tank',
    summary: 'Absorbs punishment and holds the line.',
    effects: [
      {
        kind: 'hitDieStep',
        flat: 1,
        max: 1000,
        description: 'Increase hit die size by 1 step (max d1000).',
      },
      {
        kind: 'hitDiceAdd',
        pbFraction: 1,
        min: 1,
        description: 'Add hit dice equal to Proficiency Bonus.',
      },
    ],
    conflictsWith: ['caster', 'minion'],
    keywords: [
      'tank',
      'guardian',
      'bulwark',
      'wall',
      'defender',
      'juggernaut',
      'armored',
      'shield',
      'warden',
      'sentinel',
    ],
    suggestedCoreActions: 2,
    suggestedQuickActions: 1,
    suggestedReactions: 2,
    source: SRC,
  },
  {
    id: 'bruiser',
    name: 'Bruiser',
    summary: 'Heavy, sustained melee damage.',
    effects: [
      {
        kind: 'hitDiceAdd',
        pbFraction: 0.5,
        min: 1,
        description: 'Add hit dice equal to half Proficiency Bonus (minimum 1).',
      },
      {
        kind: 'damageBonus',
        pbFraction: 1,
        min: 1,
        description: 'Add Proficiency Bonus to all damage.',
      },
    ],
    conflictsWith: ['minion'],
    keywords: [
      'bruiser',
      'brute',
      'war beast',
      'warbeast',
      'berserker',
      'smasher',
      'crusher',
      'savage',
      'ravager',
      'beast',
    ],
    suggestedCoreActions: 3,
    suggestedQuickActions: 1,
    suggestedReactions: 1,
    source: SRC,
  },
  {
    id: 'caster',
    name: 'Caster',
    summary: 'Fragile, but wields Artes.',
    effects: [
      {
        kind: 'hitDieStep',
        flat: -1,
        min: 1,
        description: 'Decrease hit die size by 1 step (minimum d1).',
      },
      {
        kind: 'aetherAdd',
        pbFraction: 2,
        min: 2,
        description: 'Add Aether equal to double Proficiency Bonus.',
      },
    ],
    conflictsWith: ['tank', 'minion'],
    keywords: [
      'caster',
      'mage',
      'wizard',
      'sorcerer',
      'witch',
      'warlock',
      'shaman',
      'priest',
      'cleric',
      'arcane',
      'spellcaster',
      'magus',
      'necromancer',
      'oracle',
    ],
    suggestedCoreActions: 2,
    suggestedQuickActions: 2,
    suggestedReactions: 1,
    source: SRC,
  },
  {
    id: 'scout',
    name: 'Scout',
    summary: 'Fast, evasive, hard to pin down.',
    effects: [
      { kind: 'speedAdd', flat: 10, description: 'Increase movement by 10 ft.' },
      {
        kind: 'speedAdd',
        pbFraction: 0.25,
        detail: 'x5',
        description: 'Increase movement by a further 5 ft. per quarter Proficiency Bonus.',
      },
      {
        kind: 'talentBonus',
        detail: 'stealth',
        flat: 1,
        description: 'Increase Stealth proficiency by one tier.',
      },
    ],
    conflictsWith: ['tank'],
    keywords: [
      'scout',
      'skirmisher',
      'stalker',
      'hunter',
      'rogue',
      'assassin',
      'shadow',
      'swift',
      'ambusher',
      'prowler',
      'tracker',
    ],
    suggestedCoreActions: 2,
    suggestedQuickActions: 2,
    suggestedReactions: 1,
    source: SRC,
  },
  {
    id: 'blaster',
    name: 'Blaster',
    summary: 'Ranged artillery.',
    effects: [
      {
        kind: 'attackBonus',
        pbFraction: 1 / 3,
        min: 1,
        description: 'Add attack bonus equal to one-third Proficiency Bonus (minimum 1).',
      },
      {
        kind: 'rangeMultiplier',
        flat: 0.15,
        description: 'Increase ranged attack range by 10-20% (15% applied).',
      },
    ],
    conflictsWith: ['tank', 'minion'],
    keywords: [
      'blaster',
      'artillery',
      'archer',
      'sniper',
      'gunner',
      'ranged',
      'bombardier',
      'marksman',
      'cannon',
    ],
    suggestedCoreActions: 2,
    suggestedQuickActions: 1,
    suggestedReactions: 1,
    source: SRC,
  },
  {
    id: 'controller',
    name: 'Controller',
    summary: 'Locks down the battlefield.',
    effects: [
      {
        kind: 'effectDcBonus',
        pbFraction: 0.25,
        min: 1,
        description: 'Increase effect DC by one-quarter Proficiency Bonus (minimum 1).',
      },
    ],
    conflictsWith: ['minion'],
    keywords: [
      'controller',
      'binder',
      'ensnarer',
      'weaver',
      'puppeteer',
      'manipulator',
      'hexer',
      'trapper',
      'warper',
    ],
    suggestedCoreActions: 2,
    suggestedQuickActions: 2,
    suggestedReactions: 1,
    source: SRC,
  },
  {
    id: 'healer',
    name: 'Healer',
    summary: 'Keeps its allies standing.',
    effects: [
      {
        kind: 'hitDiceAdd',
        pbFraction: 0.5,
        min: 1,
        description: 'Add hit dice equal to half Proficiency Bonus.',
      },
      {
        kind: 'healingBonus',
        pbFraction: 1,
        min: 1,
        description: 'Healing gains a flat Proficiency Bonus.',
      },
    ],
    conflictsWith: ['minion'],
    keywords: ['healer', 'medic', 'mender', 'restorer', 'sustainer', 'chirurgeon', 'lifebinder'],
    suggestedCoreActions: 2,
    suggestedQuickActions: 2,
    suggestedReactions: 1,
    source: SRC,
  },
  {
    id: 'coordinator',
    name: 'Coordinator',
    summary: 'Commands and buffs its allies.',
    effects: [
      {
        kind: 'commandActionPoints',
        pbFraction: 0.1,
        min: 1,
        description:
          'Gain command/buff-only Action Points equal to one-tenth Proficiency Bonus (minimum 1).',
      },
    ],
    conflictsWith: ['minion'],
    keywords: [
      'coordinator',
      'commander',
      'captain',
      'warlord',
      'leader',
      'marshal',
      'tactician',
      'overseer',
      'conductor',
    ],
    suggestedCoreActions: 2,
    suggestedQuickActions: 2,
    suggestedReactions: 2,
    source: SRC,
  },
  {
    id: 'minion',
    name: 'Minion',
    summary: 'Dies fast; fielded in numbers.',
    effects: [
      {
        kind: 'minionRules',
        description:
          'Dies when first hit or when it fails a save. Takes no damage on a successful save against damage. Dies after 2 successful saves.',
      },
    ],
    conflictsWith: ['tank', 'bruiser', 'caster', 'blaster', 'controller', 'healer', 'coordinator'],
    keywords: [
      'minion',
      'mook',
      'grunt',
      'chaff',
      'fodder',
      'rabble',
      'lackey',
      'thrall',
      'underling',
    ],
    suggestedCoreActions: 1,
    suggestedQuickActions: 0,
    suggestedReactions: 0,
    source: SRC,
  },
];

export const roleById: Record<string, CreatureRoleDef> = Object.fromEntries(
  CREATURE_ROLES.map((r) => [r.id, r]),
);

export const DEFAULT_ROLE_ID = 'bruiser';

export function rolesOf(ids: string[]): CreatureRoleDef[] {
  return ids.map((id) => roleById[id]).filter(Boolean);
}

/** Pairs of chosen roles that fight each other, for the stacking warning. */
export function roleConflicts(ids: string[]): { a: string; b: string }[] {
  const out: { a: string; b: string }[] = [];
  for (let i = 0; i < ids.length; i++) {
    const role = roleById[ids[i]];
    if (!role) continue;
    for (let j = i + 1; j < ids.length; j++) {
      if (role.conflictsWith.includes(ids[j])) out.push({ a: ids[i], b: ids[j] });
    }
  }
  return out;
}
