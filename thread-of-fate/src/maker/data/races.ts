import type { RaceDef } from '@/maker/types';

/**
 * Races of Convergence, transcribed from "Races Of Convergence.md".
 * Attribute bonuses are parsed from each subrace's closing trait.
 */
export const RACES: RaceDef[] = [
  {
    id: 'humankind',
    name: 'Humankind',
    bio: 'The most abundant race across all of the Great Forest, carving out their place using their one-of-a-kind state of mind and admirable talent for meeting the moment no matter the circumstances. While not as long-lived as many other races, that same characteristic defines them, they work diligently to make a difference in the time they have.',
    classificationTags: ['Humanoid'],
    averageLifespan: '80 Years',
    sizeClass: 'Medium (5-6 ft. tall)',
    senses: 'None',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 3,
      options: [
        'Arcana',
        'Athletics',
        'Animal Magnetism',
        'Intuition',
        'Investigation',
        'Leadership',
        'Medicine',
        'Occultism',
        'Survivalism',
      ],
    },
    traits: [
      {
        name: 'Indomitable Human Spirit',
        description:
          'When you would fail a Saving Throw, you may apply a bonus to the Save equal to your Conviction Modifier. If this would turn the fail into a success, you succeed. Usable a number of times equal to your Proficiency Bonus.',
      },
      {
        name: 'Ingenuity and Adaptability',
        description:
          'You may select one Discipline and one Talent Proficiency of your choice to gain when selecting Humankind as your race.',
      },
    ],
    subraces: [
      {
        id: 'aethertouched',
        name: 'Aethertouched',
        traits: [
          {
            name: 'Magic In Hand',
            description:
              'You may select two Cantrips of your choice from the Arcane Artes List. If you do not have a casting attribute, your casting attribute for these cantrips is Resonance.',
          },
          {
            name: 'Blood Of Aether',
            description:
              'The aetherically-charged blood in your veins grants you a +2 Bonus to Resonance and a +2 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'focus', bonus: 2 },
        ],
      },
      {
        id: 'null',
        name: 'Null',
        traits: [
          {
            name: 'Magical Severance',
            description:
              'You have Advantage on Saving Throws against Artes and other magical effects. However, you are unable to cast traditional magic of any kind.',
          },
          {
            name: 'Honed Physicality',
            description:
              'You gain a +2 Bonus to Instinct, a +2 Bonus to Presence, and a +2 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'presence', bonus: 2 },
          { attribute: 'conviction', bonus: 2 },
        ],
      },
      {
        id: 'augmented',
        name: 'Augmented',
        traits: [
          {
            name: 'The Weakness Of Flesh',
            description:
              'You may support up to two additional "Augment" tagged items in addition to any outlined limitations (serums, cybernetics, gene/aether modification, etc.).',
          },
          {
            name: 'Altered Biology',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
      {
        id: 'psionic',
        name: 'Psionic',
        traits: [
          {
            name: 'To Be Determined',
            description: 'Rules for the Psionic subrace are still in development.',
          },
        ],
        attributeBonuses: [],
        todo: true,
      },
      {
        id: 'biracial',
        name: 'Biracial',
        traits: [
          {
            name: 'Best Of Both Worlds',
            description:
              "You may select two Racial or Subrace Features from one other biological Race and/or its subraces, gaining those characteristics, plus any Swim/Climb/Flying/Burrow Speed or Classification Tag they grant. In place of one feature you may instead gain that race's Extra Senses/Sight.",
          },
        ],
        attributeBonuses: [],
      },
    ],
  },
  {
    id: 'elves',
    name: 'Elves',
    bio: 'A humanoid race born with a strong natural affinity for magic and nature. Known for their long lifespans and stoic wisdom, the Elves stand as sentinels to the ages, watching the rise and fall of entire civilizations.',
    classificationTags: ['Humanoid', 'Elf'],
    averageLifespan: '1,000 Years',
    sizeClass: 'Medium (5-6 ft. tall)',
    senses: 'Darksight 60 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds:
      "You require food and water, but don't need to sleep, and magic can't put you to sleep. You can finish a Full Rest in 4 hours of trancelike meditation.",
    skillChoices: {
      count: 3,
      options: [
        'Acrobatics',
        'Arcana',
        'Animal Magnetism',
        'Historical Lore',
        'Intuition',
        'Investigation',
        'Medicine',
        'Naturalism',
        'Perception',
        'Survivalism',
      ],
    },
    traits: [
      {
        name: 'Resilience Of Mind',
        description:
          'You have advantage on Saving Throws against Illusion and Compulsion School magic.',
      },
      {
        name: 'Fey Stride',
        description:
          'As a Quick Action, magically teleport up to 30 feet to an unoccupied space you can see. Usable a number of times equal to your Proficiency Bonus, regained on a Full Rest. Gains an extra effect based on subrace.',
      },
    ],
    subraces: [
      {
        id: 'high-elves',
        name: 'High-Elves',
        traits: [
          {
            name: 'Grace Of The Noble',
            description:
              'Gain Proficiency in Leadership, and Advantage on Persuasion and Deception Checks when interacting with High Society.',
          },
          {
            name: 'Elven Countenance',
            description: 'You gain a +2 Bonus to Resonance and a +1 Bonus to Presence.',
          },
          {
            name: 'Arcane Fey Stride',
            description:
              'When you Fey Stride, a 10-ft-radius pulse bursts forth; hostile creatures must succeed on a Body Save or be knocked back 5 feet and fall prone.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
      {
        id: 'dark-elves',
        name: 'Dark-Elves',
        traits: [
          {
            name: 'Bend To Will',
            description:
              'You know the Thorn Whip cantrip and are proficient in one weapon in the Whip category.',
          },
          {
            name: 'Domineering Disposition',
            description: 'You gain a +2 Bonus to Instinct and a +1 Bonus to Presence.',
          },
          {
            name: 'Shadow Fey Stride',
            description:
              'When you Fey Stride you vanish in shadow, becoming invisible until you act, interact, or your next turn begins.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
      {
        id: 'fey-elves',
        name: 'Fey-Elves',
        traits: [
          {
            name: 'Medium Of The Elements',
            description:
              'When casting Elemental School Artes, apply a bonus equal to half your Focus Modifier to Artes Attack, Damage, and/or Save DC.',
          },
          {
            name: 'Fey Magicks',
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Resonance.',
          },
          {
            name: 'Wild Fey Stride',
            description:
              'When you Fey Stride, a 15-ft-radius pulse of Chaos Magic bursts forth; roll on the Chaos Magic table.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'resonance', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'dwarves',
    name: 'Dwarves',
    bio: 'A stout humanoid race born with a strong natural affinity for earth and stone. Long-lived, slow to change, and with a strong work ethic and talent for craft that many other races envy.',
    classificationTags: ['Humanoid', 'Dwarf'],
    averageLifespan: '350 Years',
    sizeClass: 'Medium (4-5 ft. tall)',
    senses: 'Darksight 60 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Athletics',
        'Driving',
        'Historical Lore',
        'Investigation',
        'Naturalism',
        'Survivalism',
        'Technology',
        'Tinkering',
      ],
    },
    traits: [
      {
        name: 'Built Like A Dwarf',
        description:
          'Your maximum Hit Points are increased by 1. For every level you have, your maximum HP is increased by an additional 1.',
      },
      {
        name: 'Stonekin',
        description:
          'You have resistance to Poison damage, and Advantage on saving throws to avoid or end the Poisoned Condition or Diseases.',
      },
    ],
    subraces: [
      {
        id: 'mountain-dwarves',
        name: 'Mountain Dwarves',
        traits: [
          {
            name: 'Stonesense',
            description:
              'As a Quick Action, gain Tremorsense 60 ft. for 10 minutes while on/touching stone. Usable a number of times equal to your Proficiency Bonus.',
          },
          {
            name: 'Strength of the Mountain',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'deep-dwarves',
        name: 'Deep Dwarves',
        traits: [
          {
            name: 'Deepstone Thinking',
            description:
              'You have Advantage on Saving Throws against the Charmed or Stunned condition.',
          },
          {
            name: 'Bedrock Body',
            description: 'You gain a +2 Bonus to Conviction and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'conviction', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'urban-dwarves',
        name: 'Urban Dwarves',
        traits: [
          {
            name: 'Built to Purpose',
            description:
              'Advantage on Tinkering Talent Checks and Tools Checks used to craft, build, or repair an object or structure.',
          },
          {
            name: 'Urban Mountaineer',
            description: 'You gain a +2 Bonus to Focus and a +1 Bonus to Resonance.',
          },
        ],
        attributeBonuses: [
          { attribute: 'focus', bonus: 2 },
          { attribute: 'resonance', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'halflings',
    name: 'Halflings',
    bio: 'A homely, indulgent, and generally jovial people who live in a world unto themselves. Quick with their hands, sharp of wit, and with an unerring luck that always strikes when it counts.',
    classificationTags: ['Humanoid', 'Smallfolk'],
    averageLifespan: '250 Years',
    sizeClass: 'Small (2-3 ft. tall)',
    senses: 'None',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Deception',
        'Occultism',
        'Persuasion',
        'Performance',
        'Sleight Of Hand',
        'Stealth',
        'Tinkering',
      ],
    },
    traits: [
      {
        name: 'Unheeded Presence',
        description:
          'You can move through the space of any creature one size larger than you (but not stop there), and can Hide when obscured only by a creature at least one size larger.',
      },
      {
        name: 'Uncanny Luck',
        description:
          'When you roll a 1 on an Ability Check, Talent Check, or Saving Throw, you can use a Reaction to reroll, but must use the new roll.',
      },
    ],
    subraces: [
      {
        id: 'hearthling',
        name: 'Hearthling',
        traits: [
          {
            name: 'A Time To Kickback',
            description:
              'Advantage on Tools Checks to prepare/cook food; those who eat your meals gain Temporary HP equal to your Focus Modifier.',
          },
          {
            name: 'People-Pleaser',
            description: 'You have a +2 Bonus to Presence and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
      {
        id: 'riverfolk',
        name: 'Riverfolk',
        traits: [
          {
            name: 'The Sea, She Calls',
            description:
              "Proficiency on Driving Checks when on a boat, and Proficiency with Navigator's Tools.",
          },
          {
            name: 'Shanty of the Soul',
            description: 'You have a +2 Bonus to Instinct and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'burrowkin',
        name: 'Burrowkin',
        traits: [
          {
            name: 'Burrow The Hills',
            description:
              'Burrow speed equal to your movement speed; while burrowing, gain Tremorsense in a 30-ft radius.',
          },
          {
            name: 'Made like Stone',
            description: 'You have a +2 Bonus to Conviction and a +1 Bonus to Might.',
          },
        ],
        attributeBonuses: [
          { attribute: 'conviction', bonus: 2 },
          { attribute: 'might', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'hell-folk',
    name: 'Hell-Folk',
    bio: 'Born from devils, bearing cursed blood, or serving as a host to demonic powers, the Hell-Folk are vast and varied. Carrying no one uniform shape, they tend to be some of the most mysterious, odd, or outright terrifying people within the Great Forest.',
    classificationTags: ['Humanoid', 'Infernal or Demonic'],
    averageLifespan: '150 Years',
    sizeClass: 'Medium (4-7 ft.) or Small (3-4 ft.), chosen at selection',
    senses: 'Devilsight 30 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Deception',
        'Intimidation',
        'Intuition',
        'Leadership',
        'Occultism',
        'Persuasion',
        'Theology',
      ],
    },
    traits: [
      { name: 'Hellish Resistance', description: 'You have resistance to Fire damage.' },
      {
        name: 'Hellish Retribution',
        description:
          'When a creature within 30 feet successfully attacks you, use a Reaction to deal (Presence Modifier)d4 Fire damage. Usable a number of times equal to your Conviction Modifier.',
      },
    ],
    subraces: [
      {
        id: 'infernalborn',
        name: 'Infernalborn',
        traits: [
          {
            name: "Devil's Tongue",
            description: 'You know the Biting Words and Distortion Cantrips.',
          },
          {
            name: 'Silver-tongued Charm',
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Resonance.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'resonance', bonus: 1 },
        ],
      },
      {
        id: 'abyssalborn',
        name: 'Abyssalborn',
        traits: [
          {
            name: 'Bastardized Beast',
            description:
              'Quick Action: transform for 1 minute, dealing bonus Necrotic damage equal to your Proficiency Bonus once per turn; nearby non-allies may be Frightened.',
          },
          {
            name: 'Demonic Fortitude',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
      {
        id: 'halfbreed',
        name: 'Halfbreed',
        traits: [
          {
            name: "Smokin' Sick Style",
            description:
              'You may apply half your Presence Modifier (rounded down) in addition to your Instinct Modifier when calculating Armor Class.',
          },
          {
            name: 'Hellish Halfbreed',
            description: 'You gain a +2 Bonus to Instinct and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'highborn',
        name: 'Highborn',
        traits: [
          {
            name: 'Infernal Hierarchy',
            description:
              'Against lower-ranked Infernal/Demonic creatures, attack with Advantage and they have Disadvantage on Saves against your effects.',
          },
          {
            name: 'Bat Out Of Hell',
            description: 'You have a flying speed of 30 feet while not wearing heavy armor.',
          },
          {
            name: 'Nobility Of The Hells',
            description: 'You gain a +2 Bonus to Presence and a +2 Bonus to Might.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'might', bonus: 2 },
        ],
      },
    ],
  },
  {
    id: 'celestials',
    name: 'Celestials',
    bio: 'Born as children of destiny, fate, or a higher power, the Celestials stand in stark contrast to the Hell-Folk, appearing as uncanny, divine entities in mortal flesh. Often meant for greater purposes, for better or worse.',
    classificationTags: ['Humanoid', 'Celestial'],
    averageLifespan: '160 Years',
    sizeClass: 'Medium (4-7 ft.) or Small (3-4 ft.), chosen at selection',
    senses: 'Darksight 60 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Intimidation',
        'Intuition',
        'Leadership',
        'Occultism',
        'Perception',
        'Persuasion',
        'Theology',
      ],
    },
    traits: [
      {
        name: 'Celestial Resistance',
        description: 'You have resistance to Radiant and Necrotic damage.',
      },
      {
        name: 'Touch of Life',
        description:
          'Quick Action: touch a creature and roll a number of d4s equal to your Proficiency Bonus; it regains that many HP. Once per Full Rest.',
      },
    ],
    subraces: [
      {
        id: 'seraphic',
        name: 'Seraphic',
        traits: [
          {
            name: 'Wings of Grace',
            description:
              'Quick Action: for 1 minute, materialize six radiant wings (Flight 60 ft.) and radiate light; hostile creatures in the light take Radiant damage equal to your Proficiency Bonus each turn.',
          },
          {
            name: 'Strength of the Righteous',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Presence.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
      {
        id: 'fallen-martyr',
        name: 'Fallen Martyr',
        traits: [
          {
            name: 'Fall From Grace',
            description:
              'Quick Action: transform for 1 minute, dealing bonus Radiant damage equal to your Proficiency Bonus once per turn; nearby non-allies may be Frightened.',
          },
          {
            name: 'Vestige of Glory',
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Might.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'might', bonus: 1 },
        ],
      },
      {
        id: 'heralds',
        name: 'Heralds',
        traits: [
          {
            name: 'Sight Yet Seen',
            description:
              'On a Full Rest, roll two d20s; replace any attack roll, save, or check made by you or a creature you see (once per turn). Unused rolls are lost on a long rest.',
          },
          {
            name: 'Heraldic Sight',
            description: 'You gain a +2 Bonus to Resonance and a +1 Bonus to Presence.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'undead',
    name: 'Undead',
    bio: "Known to take many forms, those of undeath are just as varied as the living races. Whether driven by dark ambition, a debt unpaid, or deeds unfinished, even death isn't enough to stop those with strong enough will.",
    classificationTags: ['Humanoid', 'Undead'],
    averageLifespan: 'Indefinite',
    sizeClass: 'Medium (4-7 ft.) or Small (3-4 ft.), chosen at selection',
    senses: 'Darksight 60 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds:
      'You do not require food, water, air, or sleep but must enter an inactive (conscious, unmoving) state for at least 4 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Arcana',
        'Athletics',
        'Historical Lore',
        'Intimidation',
        'Intuition',
        'Occultism',
        'Theology',
      ],
    },
    traits: [
      {
        name: 'Dredges Of The Past',
        description:
          'When you make an Attribute or Talent Check, roll a d6 after seeing the d20 and add it. Usable a number of times equal to your Proficiency Bonus.',
      },
      {
        name: 'Ceaseless Hunger',
        description:
          'You have a fanged bite (1d4 piercing, uses Conviction). On a hit against a living creature, regain HP equal to the damage, or gain a bonus to your next check/attack. Advantage while at half HP or less. Usable a number of times equal to your Proficiency Bonus.',
      },
    ],
    subraces: [
      {
        id: 'vampire',
        name: 'Vampire',
        traits: [
          {
            name: 'Feast Of Blood',
            description:
              'When you drain blood via Ceaseless Hunger, your speed increases by 10 ft. and you gain advantage on Might/Instinct Checks and Body Saves for 1 minute.',
          },
          {
            name: 'Vampiric Nature',
            description:
              'You can climb difficult surfaces freely, but suffer classic vampire weaknesses (Forbiddance, Running Water, Stake to the Heart, Sunlight).',
          },
          {
            name: 'Stalker Of The Night',
            description: 'You gain a +2 Bonus to Instinct and a +1 Bonus to Presence.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
      {
        id: 'skeleton',
        name: 'Skeleton',
        traits: [
          {
            name: 'Undead Fortitude',
            description:
              'If reduced to 0 HP (not by bludgeoning or a crit), make a Conviction save DC 5 + damage; on success drop to 1 HP. DC rises by 3 each success until a Full Rest.',
          },
          {
            name: 'Necromancy Affinity',
            description:
              'You have Advantage on Saving Throws against Artes and other magical effects.',
          },
          {
            name: 'Arcane Resonance',
            description: 'You gain a +2 Bonus to Resonance and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'zombie',
        name: 'Zombie',
        traits: [
          {
            name: 'Deadened Nerves',
            description:
              'When a creature deals 5 or less damage to you, you take no damage. Undead Fortitude-style save (not vs Radiant/crit).',
          },
          {
            name: 'Strength in Undeath',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
      {
        id: 'lich',
        name: 'Lich',
        traits: [
          {
            name: 'Dark Phylactery',
            description:
              'Your soul is bound to an artifact; if destroyed with the phylactery intact, your soul retreats into it and can reform. (See full rules for the charm/reform mechanics.)',
          },
          {
            name: 'Ambitions Into The Arcane',
            description: 'You gain a +2 Bonus to Resonance and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'revenant',
        name: 'Revenant',
        traits: [
          {
            name: 'Grudge From The Grave',
            description:
              'Regain 5 HP at the start of each turn (suppressed by Fire/Radiant). If slain, revive 24 hours later in a new humanoid body unless Dispel Evil and Good is cast on your remains.',
          },
          {
            name: 'Resentful Retribution',
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Might.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'might', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'beastmen',
    name: 'Beastmen',
    bio: "Iconic ears, a mischievous tail, animalistic behavior, when in the presence of a Beastman, you'll almost always know it. Leaning into their talents and niche, the Beastmen are a beloved people across most worlds of the Great Forest.",
    classificationTags: ['Humanoid', 'Beast'],
    averageLifespan: '70 Years',
    sizeClass: 'Medium (4-7 ft.) or Small (3-4 ft.), chosen at selection',
    senses: 'Darksight 60 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Acrobatics',
        'Athletics',
        'Animal Magnetism',
        'Naturalism',
        'Perception',
        'Survivalism',
      ],
    },
    traits: [
      {
        name: 'Bestial Footwork',
        description:
          'When you fail a Body saving throw, use your Reaction to roll a d6 and add it (not if prone or speed 0).',
      },
      {
        name: 'Beastly Reflexes',
        description:
          'When a Body Save would halve damage on success, you instead take no damage on success and half on a failure.',
      },
    ],
    subraces: [
      {
        id: 'wolf-folk',
        name: 'Wolf-Folk',
        traits: [
          {
            name: 'Hunting With The Pack',
            description: 'Attack with Advantage when an ally is within 5 ft. of your target.',
          },
          {
            name: 'Sharp Senses',
            description:
              'Advantage on Perception, Intuition, and Survivalism Checks relying on hearing or smell.',
          },
          {
            name: "Hunter's Retribution",
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Might.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'might', bonus: 1 },
        ],
      },
      {
        id: 'cat-folk',
        name: 'Cat-Folk',
        traits: [
          {
            name: 'Feline Agility',
            description:
              'When you move on your turn, double your speed until end of turn. Recharges after a turn where you move 0 feet.',
          },
          { name: 'Ambush Predator', description: 'Proficiency in Perception and Stealth.' },
          {
            name: 'Hyper-focused',
            description: 'You gain a +2 Bonus to Instinct and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'bird-folk',
        name: 'Bird-Folk',
        traits: [
          {
            name: 'Winged Threat',
            description: 'Flying speed equal to your ground speed (not in heavy armor).',
          },
          {
            name: 'Hawkeyed',
            description:
              "Proficiency in Perception; long range doesn't impose disadvantage on ranged attacks.",
          },
          {
            name: "Falcon's Fall",
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Instinct.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'instinct', bonus: 1 },
        ],
      },
      {
        id: 'lizard-folk',
        name: 'Lizard-Folk',
        traits: [
          {
            name: 'Amphibious Affinity',
            description: 'Swimming speed equal to your ground speed.',
          },
          {
            name: 'Scaled Hide',
            description: 'Unarmored base AC is 13 + Instinct modifier; shields still apply.',
          },
          {
            name: 'Prey-drive',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Instinct.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'instinct', bonus: 1 },
        ],
      },
      {
        id: 'ferret-folk',
        name: 'Ferret-Folk',
        traits: [
          {
            name: "Burrow's Instinct",
            description:
              'Burrow speed equal to ground speed; Climb speed half ground speed. Advantage on Perception/Investigation involving objects, mechanisms, or hidden spaces.',
          },
          {
            name: 'Slippery Build',
            description:
              'Advantage on Acrobatics Checks and Grappling Contests; fit through a 6-inch space without extra movement.',
          },
          {
            name: 'Small but Fearsome',
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'rabbit-kin',
        name: 'Rabbit-Kin',
        traits: [
          {
            name: 'Stop To Smell The Flowers',
            description:
              'Proficiency in Perception; Advantage on Perception relying on hearing and smell.',
          },
          {
            name: "Lucky Rabbit's Foot",
            description:
              'Quick Action: jump 5x your proficiency bonus in feet without provoking. Also, on a failed Body Save, react to roll a d4 and add it.',
          },
          {
            name: 'Hare-trigger Reflex',
            description: 'You gain a +2 Bonus to Instinct and a +1 Bonus to Presence.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
      {
        id: 'bat-folk',
        name: 'Bat-Folk',
        traits: [
          {
            name: 'Membranous Wings',
            description:
              "Flying speed equal to walking speed; while flying you can't make hand-based weapon attacks or cast somatic/material spells (except thrown weapons).",
          },
          {
            name: 'Built for the Night',
            description:
              'See in dim light within 60 ft. as bright, and darkness as dim (shades of gray). Action: shriek to gain blindsight 30 ft. until end of turn.',
          },
          {
            name: 'Sharpened Senses',
            description: 'You gain a +2 Bonus to Focus and a +1 Bonus to Instinct.',
          },
        ],
        attributeBonuses: [
          { attribute: 'focus', bonus: 2 },
          { attribute: 'instinct', bonus: 1 },
        ],
      },
      {
        id: 'dragon-folk',
        name: 'Dragon-Folk',
        traits: [
          {
            name: 'Draconic Ancestry',
            description:
              "Choose a dragon type; your breath weapon's damage type and shape follow the Draconic Ancestry table.",
          },
          {
            name: "Dragon's Breath",
            description:
              'Focused Action: exhale energy; creatures in the area make a Body Save (DC 8 + Prof + Conviction) for 2d6 (scaling) damage, half on success. Recharges on a rest.',
          },
          {
            name: 'Draconic Might',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Presence.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
      {
        id: 'moth-folk',
        name: 'Moth-Folk',
        traits: [
          {
            name: 'Moonlit Wings',
            description:
              'Flight speed equal to ground speed; can silently glide (not in Medium/Heavy armor).',
          },
          {
            name: 'Silk-spinner',
            description:
              'On a Full Rest, weave one article of clothing granting the wearer AC 14 + Instinct Modifier.',
          },
          {
            name: 'Subtle Touch',
            description:
              "You have a second set of smaller, dextrous arms (can't add Might to their weapon attacks). No attribute bonus listed.",
          },
        ],
        attributeBonuses: [],
        todo: true,
      },
    ],
  },
  {
    id: 'awakened-animal',
    name: 'Awakened Animal',
    bio: 'Unlike the Beastmen, the Awakened are fully and unabashedly animals. Talking dogs, spellcasting felines, and roguish ferrets, equal parts effective and dangerous to those who underestimate them.',
    classificationTags: ['Beast'],
    averageLifespan: '60 Years',
    sizeClass: 'Small (3-4 ft.) or Tiny (1-2 ft.), chosen at selection',
    senses: 'Darksight 120 ft.',
    movementSpeed: '40 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 3,
      options: [
        'Acrobatics',
        'Arcana',
        'Athletics',
        'Animal Magnetism',
        'Intuition',
        'Naturalism',
        'Perception',
        'Survivalism',
      ],
    },
    traits: [
      {
        name: 'Toughened Hide',
        description: 'Unarmored AC is 12 + your Conviction Modifier; shields still apply.',
      },
      {
        name: 'Animal Strength',
        description:
          'You count as one size larger for carrying capacity and what you can push, drag, or lift.',
      },
    ],
    subraces: [
      {
        id: 'carnivore',
        name: 'Carnivore',
        traits: [
          {
            name: 'Predatory Jaws',
            description: 'Natural fanged maw: 1d6 + Might modifier slashing damage on a hit.',
          },
          {
            name: 'Sharp Senses',
            description:
              'Advantage on Perception and Survivalism Checks relying on hearing or smell.',
          },
          {
            name: "Hunter's Retribution",
            description: 'You gain a +2 Bonus to Instinct and a +1 Bonus to Might.',
          },
        ],
        attributeBonuses: [
          { attribute: 'instinct', bonus: 2 },
          { attribute: 'might', bonus: 1 },
        ],
      },
      {
        id: 'herbivore',
        name: 'Herbivore',
        traits: [
          {
            name: "Nature's Intuition",
            description:
              'Proficiency with one of: Animal Magnetism, Medicine, Naturalism, Perception, Stealth, or Survivalism.',
          },
          {
            name: 'Awakened Mind',
            description: 'When you level up, gain a bonus +1 to your Aether Pool.',
          },
          {
            name: 'A Gentle Touch',
            description: 'You gain a +2 Bonus to Resonance and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
      {
        id: 'omnivore',
        name: 'Omnivore',
        traits: [
          {
            name: 'One Of The Gang',
            description:
              'When a friendly creature within 15 ft. makes a weapon attack, they can do so with Advantage.',
          },
          {
            name: 'Party Mascot',
            description:
              'Grant a friendly creature within 15 ft. Advantage on a Persuasion or Deception Check.',
          },
          {
            name: 'Strong Personality',
            description: 'You gain a +2 Bonus to Conviction and a +1 Bonus to Presence.',
          },
        ],
        attributeBonuses: [
          { attribute: 'conviction', bonus: 2 },
          { attribute: 'presence', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'orcs',
    name: 'Orcs',
    bio: 'Of all the peoples of the Forest, the Orcs have a long and storied history rife with violence, from within and without. The Orcs are resilient, courageous, and seldom shy from a challenge.',
    classificationTags: ['Humanoid'],
    averageLifespan: '75 Years',
    sizeClass: 'Medium (6-7 ft. tall)',
    senses: 'Darksight 120 ft.',
    movementSpeed: '30 feet',
    biologicalNeeds: 'You require food and water, and need to sleep at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Acrobatics',
        'Athletics',
        'Intimidation',
        'Leadership',
        'Occultism',
        'Survivalism',
      ],
    },
    traits: [
      {
        name: 'Relentless Endurance',
        description:
          'When reduced to 0 HP but not killed outright, drop to 1 HP instead. Once per Full Rest.',
      },
      {
        name: 'Adrenaline Frenzy',
        description:
          'Quick Action: enter a battle-trance for 1 minute (+1 attack & damage; Dash as a Quick Action granting Temp HP equal to Proficiency Bonus). Usable a number of times equal to your Proficiency Bonus.',
      },
    ],
    subraces: [
      {
        id: 'wartorn',
        name: 'Wartorn',
        traits: [
          {
            name: 'Naturalborn Soldier',
            description: 'You may make Body Saving Throws with Advantage.',
          },
          {
            name: 'War-Weary',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
      {
        id: 'shamanic',
        name: 'Shamanic',
        traits: [
          {
            name: 'Call Of The Wilds',
            description:
              'When casting Elemental, Warding, Enchantment, or Fatebinding Artes, gain a +2 Bonus to its Arte Save DC.',
          },
          {
            name: 'Esoteric Avatar',
            description: 'You gain a +2 Bonus to Resonance and a +1 Bonus to Focus.',
          },
        ],
        attributeBonuses: [
          { attribute: 'resonance', bonus: 2 },
          { attribute: 'focus', bonus: 1 },
        ],
      },
    ],
  },
  {
    id: 'constructed',
    name: 'Constructed',
    bio: 'None are more truly born to face the world than those Constructed. Whether built by a master craftsman, a soul bound to armor, or through more esoteric methods, the Constructed are born with purpose and the most direct means to act upon it.',
    classificationTags: ['Humanoid', 'Construct'],
    averageLifespan: 'Indefinite',
    sizeClass: 'Medium (4-9 ft.) or Small (3-4 ft.), chosen at selection',
    senses: 'None',
    movementSpeed: '30 feet',
    biologicalNeeds:
      'You do not require food, water, air, or sleep but must enter an inactive (conscious, unmoving) state for at least 6 hours a day.',
    skillChoices: {
      count: 2,
      options: [
        'Arcana',
        'Athletics',
        'Historical Lore',
        'Intimidation',
        'Investigation',
        'Leadership',
        'Perception',
        'Technology',
        'Tinkering',
      ],
    },
    traits: [
      {
        name: 'Fortified Physiology',
        description:
          'Advantage on Saving Throws against being poisoned, and resistance to poison damage.',
      },
      {
        name: 'Integrated Protection',
        description:
          '+2 bonus to Armor Class. You may incorporate armor you are proficient with into your body (1 hour to don/doff).',
      },
    ],
    subraces: [
      {
        id: 'war-machine',
        name: 'War-Machine',
        traits: [
          {
            name: 'Mechanical Nature',
            description:
              'Resistance to poison; immunity to disease; Advantage vs Paralyzed/Restrained, but Disadvantage vs Stunned.',
          },
          {
            name: 'Heavy Lifter',
            description:
              'Count as one size larger for carrying capacity and what you can push, drag, or lift.',
          },
          {
            name: 'Weapon Of War',
            description: 'You gain a +2 Bonus to Might and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'might', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
      {
        id: 'soulbound',
        name: 'Soulbound',
        traits: [
          {
            name: 'Living Armor',
            description:
              'You gain a +2 Bonus to Conviction but do not benefit from conventional magical HP restoration. Your chest piece houses your soul; protect it. (See full rules for armor damage/recovery.)',
          },
          {
            name: 'Ensouled Armaments',
            description: 'Control your limbs at range up to 20 ft. from your chest piece.',
          },
          {
            name: 'Artificial Senses',
            description:
              'Magical senses: Advantage vs Blinded/Deafened effects; immune to fatigue from temperature extremes; always sense the direction of separated armor pieces.',
          },
        ],
        attributeBonuses: [{ attribute: 'conviction', bonus: 2 }],
      },
      {
        id: 'living-doll',
        name: 'Living Doll',
        traits: [
          {
            name: 'Heart Of Gold',
            description:
              'A phylactery-like Heart of Gold powers you. Grant yourself Advantage on Saves vs spells/magic a number of times equal to your proficiency bonus. If your body is destroyed but your heart survives, you can be placed in a new body.',
          },
          {
            name: 'To Be Alive',
            description: 'You gain a +2 Bonus to Presence and a +1 Bonus to Conviction.',
          },
        ],
        attributeBonuses: [
          { attribute: 'presence', bonus: 2 },
          { attribute: 'conviction', bonus: 1 },
        ],
      },
    ],
  },
];
