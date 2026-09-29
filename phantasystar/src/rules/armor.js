const int = (v) => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : 0;
};

export const ARMOR_CATEGORIES = [
  { id: 'light', name: 'Light', base: 11, proficiency: 'light_armor' },
  { id: 'medium', name: 'Medium', base: 13, proficiency: 'medium_armor' },
  { id: 'heavy', name: 'Heavy', base: 16, proficiency: 'heavy_armor' },
];

export const ARMOR_CATEGORY_IDS = ARMOR_CATEGORIES.map((c) => c.id);

export const getArmorCategory = (id) => ARMOR_CATEGORIES.find((c) => c.id === id) ?? null;

export const ITEM_TYPES = [
  { id: 'gear', name: 'Gear' },
  { id: 'weapon', name: 'Weapon' },
  { id: 'armor', name: 'Armor' },
  { id: 'shield', name: 'Shield' },
  { id: 'consumable', name: 'Consumable' },
  { id: 'accessory', name: 'Accessory' },
  { id: 'tool', name: 'Tool' },
];

export const ITEM_TYPE_IDS = ITEM_TYPES.map((t) => t.id);

export const DEFAULT_ITEM_TYPE = 'gear';

const trainingFor = (category) => getArmorCategory(category)?.proficiency ?? null;

export const armorContribution = (parts = {}, proficiencies = {}, strengthMod = 0) => {
  const armorLinked = !!parts.armorItemId;
  const shieldLinked = !!parts.shieldItemId;
  const category = getArmorCategory(parts.armorType);
  const armorProf = proficiencies?.armor ?? {};

  const armorBonus = armorLinked
    ? (category ? category.base - 10 : 0) + int(parts.armorGrade)
    : int(parts.armorBonus);

  const armorUntrained = !!category && !armorProf[trainingFor(category.id)];

  const shieldUntrained = shieldLinked && !armorProf.shields;
  const shieldBonus = shieldLinked
    ? (shieldUntrained ? 0 : 1 + int(parts.shieldGrade))
    : int(parts.shieldBonus);

  const strengthRequired = armorLinked && String(parts.armorStrength ?? '').trim() !== ''
    ? int(parts.armorStrength)
    : null;
  const tooWeak = strengthRequired !== null && int(strengthMod) < strengthRequired;

  return {
    armorLinked,
    shieldLinked,
    armorBonus,
    shieldBonus,
    armorUntrained,
    shieldUntrained,
    strengthRequired,
    speedPenalty: tooWeak ? 10 : 0,
  };
};

export const armorDisadvantage = (armorUntrained, abilityId) =>
  !!armorUntrained && (abilityId === 'strength' || abilityId === 'dexterity');

export const normalizeItem = (item = {}) => ({
  ...item,
  itemType: ITEM_TYPE_IDS.includes(item.itemType) ? item.itemType : DEFAULT_ITEM_TYPE,
  category: ARMOR_CATEGORY_IDS.includes(item.category) ? item.category : 'light',
  strength: item.strength ?? '',
  stealthDisadvantage: !!item.stealthDisadvantage,
  attackId: typeof item.attackId === 'string' ? item.attackId : '',
  text: typeof item.text === 'string' ? item.text : '',
});

export const defensePartsFromEquipment = (equipment = [], parts = {}) => {
  const worn = (type) => equipment.find((i) => i?.itemType === type && i.equipped) ?? null;
  const armor = worn('armor');
  const shield = worn('shield');
  const patch = {};

  if (armor) {
    Object.assign(patch, {
      armorItemId: armor._id,
      armorType: ARMOR_CATEGORY_IDS.includes(armor.category) ? armor.category : 'light',
      armorGrade: int(armor.grade),
      armorName: armor.name ?? '',
      armorStrength: armor.strength ?? '',
      stealthDisadvantage: !!armor.stealthDisadvantage,
    });
    if (parts.armorItemId !== armor._id) patch.armorBonus = 0;
  } else if (parts.armorItemId) {
    Object.assign(patch, {
      armorItemId: '', armorType: 'none', armorGrade: 0, armorName: '', armorStrength: '',
      stealthDisadvantage: false,
    });
  }

  if (shield) {
    Object.assign(patch, { shieldItemId: shield._id, shieldGrade: int(shield.grade), shieldName: shield.name ?? '' });
    if (parts.shieldItemId !== shield._id) patch.shieldBonus = 0;
  } else if (parts.shieldItemId) {
    Object.assign(patch, { shieldItemId: '', shieldGrade: 0, shieldName: '' });
  }

  return Object.fromEntries(Object.entries(patch).filter(([key, value]) => parts[key] !== value));
};
