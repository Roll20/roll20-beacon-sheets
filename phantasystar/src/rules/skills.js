export const SKILLS = [
  { id: 'acrobatics',      name: 'Acrobatics',      ability: 'dexterity' },
  { id: 'astrophysics',    name: 'Astrophysics',    ability: 'intelligence' },
  { id: 'athletics',       name: 'Athletics',       ability: 'strength' },
  { id: 'computers',       name: 'Computers',       ability: 'intelligence' },
  { id: 'deception',       name: 'Deception',       ability: 'charisma' },
  { id: 'insight',         name: 'Insight',         ability: 'wisdom' },
  { id: 'intimidation',    name: 'Intimidation',    ability: 'charisma' },
  { id: 'investigation',   name: 'Investigation',   ability: 'intelligence' },
  { id: 'lore',            name: 'Lore',            ability: 'intelligence' },
  { id: 'mechanics',       name: 'Mechanics',       ability: 'wisdom' },
  { id: 'medicine',        name: 'Medicine',        ability: 'wisdom' },
  { id: 'perception',      name: 'Perception',      ability: 'wisdom' },
  { id: 'performance',     name: 'Performance',     ability: 'charisma' },
  { id: 'persuasion',      name: 'Persuasion',      ability: 'charisma' },
  { id: 'sleight_of_hand', name: 'Sleight of Hand', ability: 'dexterity' },
  { id: 'stealth',         name: 'Stealth',         ability: 'dexterity' },
  { id: 'survival',        name: 'Survival',        ability: 'wisdom' },
  { id: 'xenobiology',     name: 'Xenobiology',     ability: 'intelligence' },
];

export const SKILL_IDS = SKILLS.map((s) => s.id);

export const getSkill = (id) => SKILLS.find((s) => s.id === id) || null;

export const ABILITIES = [
  { id: 'strength',     name: 'Strength',     abbr: 'STR' },
  { id: 'dexterity',    name: 'Dexterity',    abbr: 'DEX' },
  { id: 'constitution', name: 'Constitution', abbr: 'CON' },
  { id: 'intelligence', name: 'Intelligence', abbr: 'INT' },
  { id: 'wisdom',       name: 'Wisdom',       abbr: 'WIS' },
  { id: 'charisma',     name: 'Charisma',     abbr: 'CHA' },
];

export const ABILITY_IDS = ABILITIES.map((a) => a.id);

export const ABILITY_MIN = -5;
export const ABILITY_MAX = 5;

export const resolveSkillAbility = (skillId, entry) => {
  const base = getSkill(skillId)?.ability ?? null;
  const override = entry?.ability;
  return override && ABILITY_IDS.includes(override) ? override : base;
};

export const resolveSkills = (sheet = {}) => {
  const stored = sheet.skills || {};
  return SKILLS.map((skill) => {
    const ability = resolveSkillAbility(skill.id, stored[skill.id]);
    return { ...skill, ability, baseAbility: skill.ability, overridden: ability !== skill.ability };
  });
};
