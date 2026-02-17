const abilities = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const;
type Ability = (typeof abilities)[number];
export const equipmentTypes = [
  'ammunition',
  'weapon',
  'magic-item-consumable',
  'magic-item-miscellaneous',
  'magic-item-weapon',
  'magic-item-armor',
  'magic-item-wondrous',
  'armor',
  'survival-gear',
  'vehicle',
  'equipment',
  'tool',
] as const;

const conditions = [
  'blinded',
  'charmed',
  'deafened',
  'diseased',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
] as const;

const languages = [
  'common',
  'dwarvish',
  'elvish',
  'giant',
  'gnomish',
  'goblin',
  'halfling',
  'orc',
  'abyssal',
  'celestial',
  'draconic',
  'infernal',
  'primordial',
  'sylvan',
  'undercommon',
] as const;
const armorProficiencies = ['light-armor', 'medium-armor', 'heavy-armor', 'shields'] as const;

const weaponProficiencies = [
  'simple-weapons',
  'martial-weapons',
  'simple-firearms',
  'martial-firearms',
  'improvised-weapons',
  'thrown-weapons',
  'hand-crossbow',
  'rapier',
  'shortsword',
  'longsword',
  'blackpowder-pistols',
  'advanced-weapons',
] as const;

const toolProficiencies = [
  'alchemist-supplies',
  'brewer-supplies',
  'calligrapher-supplies',
  'carpenter-tools',
  'cartographer-tools',
  'cobbler-tools',
  'cook-utensils',
  'glassblower-tools',
  'jeweler-tools',
  'leatherworker-tools',
  'mason-tools',
  'painter-supplies',
  'potter-tools',
  'smith-tools',
  'tinker-tools',
  'weaver-tools',
  'woodcarver-tools',
  'dice-set',
  'playing-card-set',
  'bagpipes',
  'drum',
  'dulcimer',
  'flute',
  'lute',
  'lyre',
  'horn',
  'pan-flute',
  'shawm',
  'viol',
  'navigator-tools',
  'thieves-tools',
] as const;

export const equipmentTags = [
  { text: 'attunement', isDefault: true },
  { text: 'magical', isDefault: true },
  { text: 'treasure', isDefault: true },
];

export const currencyTypes = ['cp', 'sp', 'gp', 'ep', 'pp'] as const;

export const damageTypes = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
  'ability',
  'untyped',
] as const;

export const dicePoolTypes = [...damageTypes, 'healing', 'temporary-hit-points'] as const;

export const config = {
  abilities: abilities,
  baseDC: 8,
  currencyTypes: currencyTypes,
  equipmentTypes: equipmentTypes,
  challengeRatingPB: {
    '0': 2,
    '1/8': 2,
    '1/4': 2,
    '1/2': 2,
    '1': 2,
    '2': 2,
    '3': 2,
    '4': 2,
    '5': 3,
    '6': 3,
    '7': 3,
    '8': 3,
    '9': 4,
    '10': 4,
    '11': 4,
    '12': 4,
    '13': 5,
    '14': 5,
    '15': 5,
    '16': 5,
    '17': 6,
    '18': 6,
    '19': 6,
    '20': 6,
    '21': 7,
    '22': 7,
    '23': 7,
    '24': 7,
    '25': 8,
    '26': 8,
    '27': 8,
    '28': 8,
    '29': 9,
    '30': 9,
  },
  challengeRatingXP: {
    '0': 10,
    '1/8': 25,
    '1/4': 50,
    '1/2': 100,
    '1': 200,
    '2': 450,
    '3': 700,
    '4': 1100,
    '5': 1800,
    '6': 2300,
    '7': 2900,
    '8': 3900,
    '9': 5000,
    '10': 5900,
    '11': 7200,
    '12': 8400,
    '13': 10000,
    '14': 11500,
    '15': 13000,
    '16': 15000,
    '17': 18000,
    '18': 20000,
    '19': 22000,
    '20': 25000,
    '21': 33000,
    '22': 41000,
    '23': 50000,
    '24': 62000,
    '25': 75000,
    '26': 90000,
    '27': 105000,
    '28': 120000,
    '29': 135000,
    '30': 155000,
  },
  hitDieSize: ['1d4', '1d6', '1d8', '1d10', '1d12'],
  sizes: ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'],
  senses: ['blindsight', 'darkvision', 'tremorsense', 'truesight'],
  skills: {
    acrobatics: { ability: 'dexterity' satisfies Ability },
    'animal-handling': { ability: 'wisdom' satisfies Ability },
    arcana: { ability: 'intelligence' satisfies Ability },
    athletics: { ability: 'strength' satisfies Ability },
    deception: { ability: 'charisma' satisfies Ability },
    history: { ability: 'intelligence' satisfies Ability },
    insight: { ability: 'wisdom' satisfies Ability },
    intimidation: { ability: 'charisma' satisfies Ability },
    investigation: { ability: 'intelligence' satisfies Ability },
    medicine: { ability: 'wisdom' satisfies Ability },
    nature: { ability: 'intelligence' satisfies Ability },
    perception: { ability: 'wisdom' satisfies Ability },
    performance: { ability: 'charisma' satisfies Ability },
    persuasion: { ability: 'charisma' satisfies Ability },
    religion: { ability: 'intelligence' satisfies Ability },
    'sleight-of-hand': { ability: 'dexterity' satisfies Ability },
    stealth: { ability: 'dexterity' satisfies Ability },
    survival: { ability: 'wisdom' satisfies Ability },
  },
  /*"skills": {
    "acrobatics": { "ability": "dexterity" satisfies Ability },
    "animal-handling": { "ability": "wisdom" satisfies Ability },
    "arcana": { "ability": "intelligence" satisfies Ability },
    "athletics": { "ability": "strength" satisfies Ability },
    "deception": { "ability": "charisma" satisfies Ability },
    "history": { "ability": "intelligence" satisfies Ability },
    "insight": { "ability": "wisdom" satisfies Ability },
    "intimidation": { "ability": "charisma" satisfies Ability },
    "investigation": { "ability": "intelligence" satisfies Ability },
    "medicine": { "ability": "wisdom" satisfies Ability },
    "nature": { "ability": "intelligence" satisfies Ability },
    "perception": { "ability": "wisdom" satisfies Ability },
    "performance": { "ability": "charisma" satisfies Ability },
    "persuasion": { "ability": "charisma" satisfies Ability },
    "religion": { "ability": "intelligence" satisfies Ability },
    "sleight-of-hand": { "ability": "dexterity" satisfies Ability },
    "stealth": { "ability": "dexterity" satisfies Ability },
    "survival": { "ability": "wisdom" satisfies Ability },
  },*/
  speeds: ['walk', 'burrow', 'swim', 'climb', 'fly'],
  spellComponents: ['verbal', 'somatic', 'material'],
  spellLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  spellSchools: [
    'abjuration',
    'conjuration',
    'divination',
    'enchantment',
    'evocation',
    'illusion',
    'necromancy',
    'transmutation',
  ],
  // casterTypes: {
  //   full: {
  //     multiclassMultiplier: 1,
  //     slots: [
  //       [2, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [3, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 2, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 1, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 2, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 1, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 2, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 2, 1, 0, 0, 0],
  //       [4, 3, 3, 3, 2, 1, 0, 0, 0],
  //       [4, 3, 3, 3, 2, 1, 1, 0, 0],
  //       [4, 3, 3, 3, 2, 1, 1, 0, 0],
  //       [4, 3, 3, 3, 2, 1, 1, 1, 0],
  //       [4, 3, 3, 3, 2, 1, 1, 1, 0],
  //       [4, 3, 3, 3, 2, 1, 1, 1, 1],
  //       [4, 3, 3, 3, 3, 1, 1, 1, 1],
  //       [4, 3, 3, 3, 3, 2, 1, 1, 1],
  //       [4, 3, 3, 3, 3, 2, 2, 1, 1],
  //     ],
  //   },
  //   half: {
  //     multiclassMultiplier: 0.5,
  //     slots: [
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [2, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [3, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [3, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 2, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 2, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 1, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 1, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 2, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 2, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 1, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 1, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 2, 0, 0, 0, 0],
  //       [4, 3, 3, 3, 2, 0, 0, 0, 0],
  //     ],
  //   },
  //   third: {
  //     multiclassMultiplier: 0.3333333333333333,
  //     slots: [
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [2, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [3, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [3, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [3, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 0, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 2, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 2, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 2, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 0, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 1, 0, 0, 0, 0, 0],
  //       [4, 3, 3, 1, 0, 0, 0, 0, 0],
  //     ],
  //   },
  //   pact: {
  //     multiclassMultiplier: false,
  //     slots: [
  //       [1, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [2, 0, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 2, 0, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 2, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 2, 0, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 2, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 2, 0, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 2, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 2, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 3, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 3, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 3, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 3, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 3, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 4, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 4, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 4, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 4, 0, 0, 0, 0],
  //       [0, 0, 0, 0, 4, 0, 0, 0, 0],
  //     ],
  //   },

  casterTypes: {
    full: {
      multiclassMultiplier: 1,
      slots: [
        [2, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 2, 0, 0, 0, 0, 0, 0, 0],
        [4, 3, 0, 0, 0, 0, 0, 0, 0],
        [4, 3, 2, 0, 0, 0, 0, 0, 0],
        [4, 3, 3, 0, 0, 0, 0, 0, 0],
        [4, 3, 3, 1, 0, 0, 0, 0, 0],
        [4, 3, 3, 2, 0, 0, 0, 0, 0],
        [4, 3, 3, 3, 1, 0, 0, 0, 0],
        [4, 3, 3, 3, 2, 0, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 2, 1, 1, 1],
        [4, 3, 3, 3, 3, 2, 2, 1, 1],
      ],
    },
    half: {
      multiclassMultiplier: 0.5,
      slots: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0], //1
        [2, 0, 0, 0, 0, 0, 0, 0, 0], //2
        [3, 0, 0, 0, 0, 0, 0, 0, 0], //3
        [3, 0, 0, 0, 0, 0, 0, 0, 0], //4
        [4, 2, 0, 0, 0, 0, 0, 0, 0], //5
        [4, 2, 0, 0, 0, 0, 0, 0, 0], //6
        [4, 3, 0, 0, 0, 0, 0, 0, 0], //7
        [4, 3, 0, 0, 0, 0, 0, 0, 0], //8
        [4, 3, 2, 0, 0, 0, 0, 0, 0], //9
        [4, 3, 2, 0, 0, 0, 0, 0, 0], //10
        [4, 3, 3, 0, 0, 0, 0, 0, 0], //11
        [4, 3, 3, 0, 0, 0, 0, 0, 0], //12
        [4, 3, 3, 1, 0, 0, 0, 0, 0], //13
        [4, 3, 3, 1, 0, 0, 0, 0, 0], //14
        [4, 3, 3, 2, 0, 0, 0, 0, 0], //15
        [4, 3, 3, 2, 0, 0, 0, 0, 0], //16
        [4, 3, 3, 3, 1, 0, 0, 0, 0], //17
        [4, 3, 3, 3, 1, 0, 0, 0, 0], //18
        [4, 3, 3, 3, 2, 0, 0, 0, 0], //19
        [4, 3, 3, 3, 2, 0, 0, 0, 0], //20
      ],
    },
    pact: {
      slots: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 0], //2
        [0, 2, 0, 0, 0, 0, 0, 0, 0], //3
        [0, 2, 0, 0, 0, 0, 0, 0, 0], //4
        [0, 0, 2, 0, 0, 0, 0, 0, 0], //5
        [0, 0, 2, 0, 0, 0, 0, 0, 0], //6
        [0, 0, 0, 2, 0, 0, 0, 0, 0], //7
        [0, 0, 0, 2, 0, 0, 0, 0, 0], //8
        [0, 0, 0, 0, 2, 0, 0, 0, 0], //9
        [0, 0, 0, 0, 2, 0, 0, 0, 0], //10
        [0, 0, 0, 0, 3, 0, 0, 0, 0], //11
        [0, 0, 0, 0, 3, 0, 0, 0, 0], //12
        [0, 0, 0, 0, 3, 0, 0, 0, 0], //13
        [0, 0, 0, 0, 3, 0, 0, 0, 0], //14
        [0, 0, 0, 0, 3, 0, 0, 0, 0], //15
        [0, 0, 0, 0, 3, 0, 0, 0, 0], //16
        [0, 0, 0, 0, 4, 0, 0, 0, 0], //17
        [0, 0, 0, 0, 4, 0, 0, 0, 0], //18
        [0, 0, 0, 0, 4, 0, 0, 0, 0], //19
        [0, 0, 0, 0, 4, 0, 0, 0, 0], //20
      ],
    },
    third: {
      multiclassMultiplier: 0.3333333333333333,
      slots: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0], //1
        [0, 0, 0, 0, 0, 0, 0, 0, 0], //2
        [2, 0, 0, 0, 0, 0, 0, 0, 0], //3
        [3, 0, 0, 0, 0, 0, 0, 0, 0], //4
        [3, 0, 0, 0, 0, 0, 0, 0, 0], //5
        [3, 0, 0, 0, 0, 0, 0, 0, 0], //6
        [4, 2, 0, 0, 0, 0, 0, 0, 0], //7
        [4, 2, 0, 0, 0, 0, 0, 0, 0], //8
        [4, 2, 0, 0, 0, 0, 0, 0, 0], //9
        [4, 3, 0, 0, 0, 0, 0, 0, 0], //10
        [4, 3, 0, 0, 0, 0, 0, 0, 0], //11
        [4, 3, 0, 0, 0, 0, 0, 0, 0], //12
        [4, 3, 0, 0, 0, 0, 0, 0, 0], //13
        [4, 3, 2, 0, 0, 0, 0, 0, 0], //14
        [4, 3, 2, 0, 0, 0, 0, 0, 0], //15
        [4, 3, 2, 0, 0, 0, 0, 0, 0], //16
        [4, 3, 3, 0, 0, 0, 0, 0, 0], //17
        [4, 3, 3, 0, 0, 0, 0, 0, 0], //18
        [4, 3, 3, 1, 0, 0, 0, 0, 0], //19
        [4, 3, 3, 1, 0, 0, 0, 0, 0], //20
      ],
    },
  },
  casterMulticlassing: [
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 2, 1, 1],
  ],
  damageTypes: damageTypes,
  dicePoolTypes: dicePoolTypes,
  autocomplete: {
    conditions,
    damageTypes,
    languages,
    armorProficiencies,
    weaponProficiencies,
    toolProficiencies,
    equipmentTags,
  },
} as const;
