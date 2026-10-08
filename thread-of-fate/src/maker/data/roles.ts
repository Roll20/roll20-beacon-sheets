import type { RoleDef } from '@/maker/types';

/** The eight party roles. Aspects available at level 3 key off a class's roles. */
export const ROLES: RoleDef[] = [
  {
    id: 'tank',
    name: 'Tank',
    description:
      'The traditional protector and defender, weathers the frontline, redirects attacks, and shrugs off punishment.',
  },
  {
    id: 'bruiser',
    name: 'Bruiser',
    description:
      'The firepower of most parties, trades blows and strikes down foes with stalwart resilience.',
  },
  {
    id: 'caster',
    name: 'Caster',
    description:
      'Brings the magic: long-range spells, large-area effects, elemental power, and reality-shaping.',
  },
  {
    id: 'scout',
    name: 'Scout',
    description:
      'Speed, stealth, and subtlety, getting in and out of hairy situations with cunning and guile.',
  },
  {
    id: 'blaster',
    name: 'Blaster',
    description:
      'Precision striking from afar, sustained support or spectacular bursts of ranged damage.',
  },
  {
    id: 'controller',
    name: 'Controller',
    description: 'Leverages the battlefield with detrimental effects and forced positioning.',
  },
  {
    id: 'healer',
    name: 'Healer',
    description: 'Restores, enhances, and reinforces allies, one of the few able to undo death.',
  },
  {
    id: 'coordinator',
    name: 'Coordinator',
    description:
      'Turns skill inward to create powerful cooperative options and effects for the party.',
  },
];
