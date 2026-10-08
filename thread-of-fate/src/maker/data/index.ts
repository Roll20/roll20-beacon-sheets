import { ATTRIBUTES, ATTRIBUTE_KEYS, ATTRIBUTE_LABELS, SKILLS } from './attributes';
import { ROLES } from './roles';
import { CLASSES } from './classes';
import { ASPECTS } from './aspects';
import { RACES } from './races';
import { PHILOSOPHIES } from './philosophies';
import { BACKGROUND_TRAITS, LANGUAGES, TOOLS } from './backgrounds';
import { ARMORS, SHIELDS, WEAPONS, EQUIPMENT_PACKS, DISCIPLINES } from './equipment';
import { ARTES } from './artes';

export * from './attributes';
export * from './roles';
export * from './classes';
export * from './aspects';
export * from './races';
export * from './philosophies';
export * from './backgrounds';
export * from './equipment';
export * from './artes';
export * from './confluxes';
export * from './constants';

/** Generic id-indexer. */
function indexBy<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
}

export const classById = indexBy(CLASSES);
export const aspectById = indexBy(ASPECTS);
export const raceById = indexBy(RACES);
export const philosophyById = indexBy(PHILOSOPHIES);
export const backgroundTraitById = indexBy(BACKGROUND_TRAITS);
export const armorById = indexBy(ARMORS);
export const shieldById = indexBy(SHIELDS);
export const weaponById = indexBy(WEAPONS);
export const arteById = indexBy(ARTES);
export const roleById = indexBy(ROLES);
export const skillById = indexBy(SKILLS);
export const disciplineById = indexBy(DISCIPLINES);

export const subraceById = (raceId: string, subraceId: string) =>
  raceById[raceId]?.subraces.find((s) => s.id === subraceId);

/** Aspects a given class can select, matched by the class's roles against each aspect's "AVAILABLE TO". */
export function aspectsForClass(classId: string) {
  const cls = classById[classId];
  if (!cls) return [];
  const classRoleNames = cls.roles.map((r) => roleById[r]?.name).filter(Boolean) as string[];
  return ASPECTS.filter((a) => a.availableTo.some((role) => classRoleNames.includes(role)));
}

export {
  ATTRIBUTES,
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  SKILLS,
  ROLES,
  CLASSES,
  ASPECTS,
  RACES,
  PHILOSOPHIES,
  BACKGROUND_TRAITS,
  LANGUAGES,
  TOOLS,
  ARMORS,
  SHIELDS,
  WEAPONS,
  EQUIPMENT_PACKS,
  DISCIPLINES,
  ARTES,
};
