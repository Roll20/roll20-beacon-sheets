export const spine = {
  themes: {
    'Self': {
      types: [
        "Affiliation",
        "Assets",
        "Expertise",
        "Horizon",
        "Personality",
        "Troubled Past"
      ],
      improvements: []
    },
    'Mythos': {
      types: [
        "Artifact",
        "Companion",
        "Esoterica",
        "Exposure"
      ],
      improvements: []
    },
    'Noise': {
      types: [
        "Augmentation",
        "Cutting Edge",
        "Cyberspace",
        "Drones"
      ],
      improvements: []
    },
    'Variable': {
      types: [],
      improvements: []
    },
    'Fellowship': {
      types: [],
      improvements: [
        'Campfire Stories',
        'One Of Us',
        'Sacrifice',
        'Teamwork',
        'United by the Cause'
      ]
    }
  },
  themeMights: ['Self', 'Mythos', 'Noise'],
  quintessences: [
    'Beyond Luck',
    'Canny One',
    'Dark Horse',
    'Diligent Drudge',
    'Fumbling Master',
    'Jack of Many Lives',
    'Larger Than Life',
    'Loyal Companion',
    'Lucky Bastard',
    'Magus Magnificent',
    'Master of Craft',
    'Master of the Little Things',
    'Nine Lives',
    'Old Hand',
    'Pillar of Wisdom',
    'The Bearer',
    'The Common Hero',
    'Virtuoso'
  ],
  fulfillments: [
    "Create a new type of Essence",
    "Create another broad power tag",
    "Gain a Veteran Special",
    "Gain a Veteran Special",
    "Gain a Veteran Special",
    "Ride off into the sunset",
    "Sunder the cosmology",
    "Total Reconstitution"
  ]
} as const;