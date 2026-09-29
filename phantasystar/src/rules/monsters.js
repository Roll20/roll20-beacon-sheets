import { MONSTER_TABLE, monsterRow, proficiencyForCR } from './monsterTable.js';

const int = (v) => Math.trunc(Number(v) || 0);

export const CREATURE_SIZES = [
  { id: 'tiny', name: 'Tiny' },
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' },
  { id: 'huge', name: 'Huge' },
  { id: 'gargantuan', name: 'Gargantuan' },
];

export const CREATURE_SIZE_IDS = CREATURE_SIZES.map((s) => s.id);

export const DEFAULT_CREATURE_SIZE = 'medium';

export const CREATURE_TYPES = [
  'Aberration',
  'Automaton',
  'Beast',
  'Dragon',
  'Elemental',
  'Giant',
  'Golem',
  'Humanoid',
  'Monstrosity',
  'Netherant',
  'Ooze',
  'Plant',
  'Protean',
  'Robot',
  'Undead',
];

export const initiativeScore = (bonus) => 10 + int(bonus);

export const CHALLENGE_RATINGS = MONSTER_TABLE.map((row) => row.cr);

export const monsterBonus = (abilityMod, cr, proficient = false, fallback = 0) =>
  int(abilityMod) + (proficient ? int(proficiencyForCR(cr) ?? fallback) : 0);

export const savingThrowPicks = (cr) => {
  const row = monsterRow(cr);
  if (!row) return 0;
  return row.value >= 11 ? 3 : 2;
};

export const SKILL_PICKS = 3;

export const monsterPassivePerception = (perceptionBonus) => 10 + int(perceptionBonus);
