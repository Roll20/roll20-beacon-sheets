import type { WaysScore } from '@/sheet/stores/ways/waysStore';

// Bidirectional mapping for domains
const DOMAIN_NAME_MAP = {
  closeCombat: 'Close Combat',
  communication: 'Communication',
  compassion: 'Compassion',
  craft: 'Craft',
  erudition: 'Erudition',
  feats: 'Feats',
  healing: 'Healing',
  inspiration: 'Inspiration',
  leadership: 'Leadership',
  magic: 'Magic',
  monsters: 'Monsters',
  mountedCombat: 'Mounted Combat',
  naturalEnvironment: 'Natural Environment',
  perception: 'Perception',
  performance: 'Performance',
  religion: 'Religion',
  shootingAndThrowing: 'Shooting and Throwing',
  stealth: 'Stealth',
  travel: 'Travel',
  wyrdnessMysteries: 'Wyrdness Mysteries',
} as const;

// Create reverse mapping
const FRIENDLY_NAME_TO_DOMAIN_MAP = Object.fromEntries(Object.entries(DOMAIN_NAME_MAP).map(([key, value]) => [value, key])) as Record<
  string,
  keyof typeof DOMAIN_NAME_MAP
>;

export const domainToFriendlyName = (domain: string): string => {
  return DOMAIN_NAME_MAP[domain as keyof typeof DOMAIN_NAME_MAP] || domain;
};

export const friendlyNameToDomain = (friendlyName: string): string => {
  return FRIENDLY_NAME_TO_DOMAIN_MAP[friendlyName] || friendlyName.toLowerCase().replace(/\s+/g, '');
};

// Bidirectional mapping for spell disciplines
export const SPELL_DISCIPLINE_NAME_MAP = {
  sorcery: 'Sorcery',
  wyrdMagic: 'Wyrdmagic',
  lowMagic: 'Low Magic',
  druidism: 'Druidism',
} as const;

export const wayToFaultName = (way: WaysScore): string => {
  switch (way) {
    case 'combativeness':
      return 'Passion';
    case 'creativity':
      return 'Subversion';
    case 'awareness':
      return 'Influence';
    case 'reason':
      return 'Doubt';
    case 'conviction':
      return 'Guilt';
    default:
      return way;
  }
};

// Create reverse mapping for spell disciplines
const FRIENDLY_NAME_TO_SPELL_DISCIPLINE_MAP = Object.fromEntries(
  Object.entries(SPELL_DISCIPLINE_NAME_MAP).map(([key, value]) => [value, key]),
) as Record<string, keyof typeof SPELL_DISCIPLINE_NAME_MAP>;

export const spellDisciplineToFriendlyName = (discipline: string): string => {
  return SPELL_DISCIPLINE_NAME_MAP[discipline as keyof typeof SPELL_DISCIPLINE_NAME_MAP] || discipline;
};

export const friendlyNameToSpellDiscipline = (friendlyName: string): string => {
  return FRIENDLY_NAME_TO_SPELL_DISCIPLINE_MAP[friendlyName] || friendlyName.toLowerCase().replace(/\s+/g, '');
};

export const capitalizeFirstLetter = (string: string): string => {
  return string.slice(0, 1).toUpperCase() + string.slice(1);
};
