export const SIZES = [
  { id: 'tiny', name: 'Tiny', mult: 15, base: 75 },
  { id: 'small', name: 'Small', mult: 30, base: 150 },
  { id: 'medium', name: 'Medium', mult: 30, base: 150 },
  { id: 'large', name: 'Large', mult: 60, base: 300 },
  { id: 'huge', name: 'Huge', mult: 120, base: 600 },
  { id: 'gargantuan', name: 'Gargantuan', mult: 1200, base: 600 },
];

export const SIZE_IDS = SIZES.map((s) => s.id);

export const DEFAULT_SIZE = 'medium';

export const getSize = (id) => SIZES.find((s) => s.id === id) ?? null;

export const carryingCapacity = (strMod, size = DEFAULT_SIZE) => {
  const row = getSize(size) ?? getSize(DEFAULT_SIZE);
  return (Number(strMod) || 0) * row.mult + row.base;
};

export const liftDragPush = (strMod, size = DEFAULT_SIZE) =>
  carryingCapacity(strMod, size) * 2;

export const ENCUMBERED_SPEED = 5;

export const describeLoad = (pounds, strMod, size = DEFAULT_SIZE) => {
  const capacity = carryingCapacity(strMod, size);
  const carried = Math.max(0, Number(pounds) || 0);
  return {
    carried,
    capacity,
    max: liftDragPush(strMod, size),
    overloaded: carried > capacity,
    speedCap: carried > capacity ? ENCUMBERED_SPEED : null,
  };
};

export const ITEM_GRADES = [
  { grade: 0, rarity: 'Common', minLevel: 1 },
  { grade: 1, rarity: 'Uncommon', minLevel: 3 },
  { grade: 2, rarity: 'Rare', minLevel: 7 },
  { grade: 3, rarity: 'Very Rare', minLevel: 11 },
  { grade: 4, rarity: 'Epic', minLevel: 16 },
];

export const MAX_ITEM_GRADE = 4;

export const getItemGrade = (grade) =>
  ITEM_GRADES.find((g) => g.grade === Number(grade)) ?? null;

export const gradeMinLevel = (grade) => getItemGrade(grade)?.minLevel ?? null;

export const isAboveLevel = (grade, level) => {
  const min = gradeMinLevel(grade);
  return min != null && Number(level) < min;
};

export const LIFESTYLES = [
  { id: 'vagrant', name: 'Vagrant', perDay: 0 },
  { id: 'squalid', name: 'Squalid', perDay: 1 },
  { id: 'poor', name: 'Poor', perDay: 2 },
  { id: 'modest', name: 'Modest', perDay: 10 },
  { id: 'comfortable', name: 'Comfortable', perDay: 20 },
  { id: 'wealthy', name: 'Wealthy', perDay: 40 },
  { id: 'luxury', name: 'Luxury', perDay: 100 },
];

export const LIFESTYLE_IDS = LIFESTYLES.map((l) => l.id);

export const getLifestyle = (id) => LIFESTYLES.find((l) => l.id === id) ?? null;

export const lifestyleCost = (id, days = 1) => {
  const lifestyle = getLifestyle(id);
  if (!lifestyle) return null;
  return lifestyle.perDay * Math.max(0, Number(days) || 0);
};

export const CURRENCY = 'mst';

export const sellValue = (cost) => Math.floor((Number(cost) || 0) / 2);

export const WEAPON_KINDS = [
  { id: 'melee', name: 'Melee', distanceLabel: 'Reach' },
  { id: 'ranged', name: 'Ranged', distanceLabel: 'Range' },
];

export const distanceLabel = (kind) =>
  WEAPON_KINDS.find((k) => k.id === kind)?.distanceLabel ?? 'Range';

export const weaponAbility = (kind, override = '') =>
  override || (kind === 'ranged' ? 'dexterity' : 'strength');

export const MASTERY_FEATURES = [
  'Burst',
  'Cleave',
  'Flurry',
  'Mark',
  'Rend',
  'Sap',
  'Smash',
  'Snipe',
  'Sunder',
  'Volley',
];
