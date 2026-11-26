import type { AttributeDef, AttributeKey, SkillDef } from '@/maker/types';

/** The six Convergence attributes, grouped into Body / Mind / Soul. */
export const ATTRIBUTES: AttributeDef[] = [
  {
    key: 'might',
    label: 'Might',
    category: 'Body',
    description: 'Strength, physicality, melee weapons, carrying capacity, and HP calculations.',
  },
  {
    key: 'instinct',
    label: 'Instinct',
    category: 'Body',
    description: 'Reflexes, agility, ranged & finesse weapons, stealth, mobility, and Armor Class.',
  },
  {
    key: 'focus',
    label: 'Focus',
    category: 'Mind',
    description: 'General talents, crafting, concentration, and spell accuracy.',
  },
  {
    key: 'conviction',
    label: 'Conviction',
    category: 'Mind',
    description: 'Recovery bonus, willpower, leadership bonus, and HP calculations.',
  },
  {
    key: 'resonance',
    label: 'Resonance',
    category: 'Soul',
    description:
      'Magic weaponry efficacy, magic power (Arte Save DC), and magic item charges / potency.',
  },
  {
    key: 'presence',
    label: 'Presence',
    category: 'Soul',
    description:
      'Light & dark psychology (Persuasion, Insight, Deception, Intimidation), command, and morale.',
  },
];

export const ATTRIBUTE_KEYS: AttributeKey[] = ATTRIBUTES.map((a) => a.key);

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = ATTRIBUTES.reduce((acc, a) => {
  acc[a.key] = a.label;
  return acc;
}, {} as Record<AttributeKey, string>);

/** The 23 Convergence skills, each tied to an attribute. */
export const SKILLS: SkillDef[] = [
  {
    id: 'acrobatics',
    name: 'Acrobatics',
    attribute: 'instinct',
    description: 'Balance, speed, and precision maneuvers; overcoming obstacles with agility.',
  },
  {
    id: 'animal-magnetism',
    name: 'Animal Magnetism',
    attribute: 'presence',
    description:
      'Engaging with animals: reading body language, taming, communicating, and riding under stress.',
  },
  {
    id: 'arcana',
    name: 'Arcana',
    attribute: 'resonance',
    description: 'Knowledge of magic and the handling of Arcane artifacts.',
  },
  {
    id: 'athletics',
    name: 'Athletics',
    attribute: 'might',
    description: 'Jumping, swimming, climbing, and feats of brute strength.',
  },
  {
    id: 'tinkering',
    name: 'Tinkering',
    attribute: 'focus',
    description: 'General craftsmanship, from smithing to artisan engineering.',
  },
  {
    id: 'deception',
    name: 'Deception',
    attribute: 'presence',
    description: 'The art of deceiving; a counter to Intuition.',
  },
  {
    id: 'persuasion',
    name: 'Persuasion',
    attribute: 'presence',
    description: 'Charm and personability: haggling, bribery, and changing minds.',
  },
  {
    id: 'driving',
    name: 'Driving',
    attribute: 'instinct',
    description: 'Controlling vehicles on ground, air, or sea, including evasive stunts.',
  },
  {
    id: 'historical-lore',
    name: 'Historical Lore',
    attribute: 'focus',
    description: 'Long-term memory, historical knowledge, and nuanced concepts.',
  },
  {
    id: 'intimidation',
    name: 'Intimidation',
    attribute: 'presence',
    description: 'Exuding malice, inspiring uncertainty, and leveraging fear.',
  },
  {
    id: 'intuition',
    name: 'Intuition',
    attribute: 'instinct',
    description: 'Gut instincts and feeling out a situation and its participants.',
  },
  {
    id: 'investigation',
    name: 'Investigation',
    attribute: 'focus',
    description: 'Analytical thinking, searching for clues, and connecting information.',
  },
  {
    id: 'leadership',
    name: 'Leadership',
    attribute: 'conviction',
    description: 'Guiding and organizing people; inspiring forces and rallying morale.',
  },
  {
    id: 'medicine',
    name: 'Medicine',
    attribute: 'focus',
    description: 'Herbal remedies, alchemical chemistry, and drug production.',
  },
  {
    id: 'naturalism',
    name: 'Naturalism',
    attribute: 'focus',
    description: 'Study of the natural sciences: flora, fauna, and ecosystems.',
  },
  {
    id: 'occultism',
    name: 'Occultism',
    attribute: 'focus',
    description: 'Engaging the otherworldly, unknowable, and eldritch.',
  },
  {
    id: 'perception',
    name: 'Perception',
    attribute: 'instinct',
    description: 'Visual acuity, spatial awareness, and other senses.',
  },
  {
    id: 'performance',
    name: 'Performance',
    attribute: 'presence',
    description: 'Dance, song, instruments, and other performing arts.',
  },
  {
    id: 'technology',
    name: 'Technology',
    attribute: 'focus',
    description: 'Using and understanding devices, from simple machines to AI lattices.',
  },
  {
    id: 'theology',
    name: 'Theology',
    attribute: 'conviction',
    description: 'Knowledge of faith and the divine.',
  },
  {
    id: 'sleight-of-hand',
    name: 'Sleight of Hand',
    attribute: 'instinct',
    description: 'Quick, subtle, dexterous acts and tricks of the hand.',
  },
  {
    id: 'stealth',
    name: 'Stealth',
    attribute: 'instinct',
    description: 'Slipping in unseen, hiding, and blending into a crowd.',
  },
  {
    id: 'survivalism',
    name: 'Survivalism',
    attribute: 'focus',
    description: 'Navigation, tracking, gathering, and hunting in the wild.',
  },
];
