export const spine = {
  themes: {
    'Origin': {
      types: ['Circumstance', 'Devotion', 'Past', 'People', 'Personality', 'Skill Or Trade', 'Trait'],
      improvements: [
        'Comfort Zone',
        'Expected Role',
        'Familiar Matters',
        'Strength From Adversity',
        'Trudging Along'
      ]
    },
    'Adventure': {
      types: ['Duty', 'Influence', 'Knowledge', 'Prodigious Ability', 'Relic', 'Uncanny Being'],
      improvements: [
        'Dutiful Anticipation',
        'Grim Determination',
        'Painful Lessons',
        'Driven by Shame',
        'Unstoppable'
      ]
    },
    'Greatness': {
      types: ['Destiny', 'Dominion', 'Mastery', 'Monstrosity'],
      improvements: [
        'As Foretold',
        'Meet It Head-On',
        'Not How It Ends',
        'Reincarnation',
        'Pull of Destiny'
      ]
    },
    'Variable': {
      types: ['Companion', 'Magic', 'Possessions'],
      improvements: [
        'Everyone’s Best Friend',
        'Here For You',
        'Perfect Positioning',
        'Reliable Ally',
        'Retaliation'
      ]
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
  themeMights: ['Origin', 'Adventure', 'Greatness'],
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
  ]
} as const;