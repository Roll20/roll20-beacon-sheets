import { isWeaponProficient, hasWeaponMastery } from './proficiencies.js';
import { weaponAbility } from './equipment.js';

const int = (v) => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : 0;
};

export const WEAPON_PROPERTIES = [
  { id: 'ammunition', name: 'Ammunition' },
  { id: 'concealed', name: 'Concealed' },
  { id: 'finesse', name: 'Finesse' },
  { id: 'focus', name: 'Focus' },
  { id: 'heavy', name: 'Heavy' },
  { id: 'light', name: 'Light' },
  { id: 'reach', name: 'Reach' },
  { id: 'thrown', name: 'Thrown' },
  { id: 'two_handed', name: 'Two-Handed' },
  { id: 'versatile', name: 'Versatile' },
];

export const WEAPON_PROPERTY_IDS = WEAPON_PROPERTIES.map((p) => p.id);

export const normalizeWeaponProperties = (value) => {
  const held = Array.isArray(value)
    ? new Set(value)
    : new Set(Object.entries(value && typeof value === 'object' ? value : {}).filter(([, on]) => on).map(([id]) => id));
  return Object.fromEntries(WEAPON_PROPERTY_IDS.map((id) => [id, held.has(id)]));
};

export const weaponPropertyLabels = (attack = {}) =>
  WEAPON_PROPERTIES.filter((p) => attack.properties?.[p.id]).map((p) => {
    const detail =
      p.id === 'thrown' ? String(attack.thrownRange ?? '').trim()
        : p.id === 'ammunition' ? String(attack.ammunitionType ?? '').trim()
          : '';
    return detail ? `${p.name} (${detail})` : p.name;
  });

export const attackAbility = (attack = {}, abilities = {}) => {
  if (attack.ability) return attack.ability;
  if (attack.properties?.finesse) {
    return int(abilities.dexterity) > int(abilities.strength) ? 'dexterity' : 'strength';
  }
  return weaponAbility(attack.kind, '');
};

export const heavyDisadvantage = (attack = {}, abilities = {}) =>
  !!attack.properties?.heavy && int(abilities.strength) <= 0;

export const versatileBonus = (attack = {}) =>
  attack.properties?.versatile && attack.twoHanded && attack.kind !== 'ranged' ? 1 : 0;

export const gradeNumber = (grade) => Math.max(0, int(grade));

export const GRADE_DAMAGE_DICE = {
  '1d4': ['1d6', '1d8', '1d10', '1d12'],
  '1d6': ['1d8', '1d10', '1d12', '2d6'],
  '1d8': ['1d10', '1d12', '2d6', '2d6 + 1'],
  '1d10': ['1d12', '2d6', '2d6 + 1', '2d8'],
  '1d12': ['2d6', '2d6 + 1', '2d8', '3d6'],
};

const diceKey = (dice) => String(dice ?? '').toLowerCase().replace(/\s+/g, '');

export const gradedDice = (baseDice, grade, byGrade = false) => {
  const g = gradeNumber(grade);
  const row = byGrade && g > 0 ? GRADE_DAMAGE_DICE[diceKey(baseDice)] : null;
  if (!row) return { dice: String(baseDice ?? '').trim(), gradeBonus: g, replaced: false };
  return { dice: row[Math.min(g, row.length) - 1], gradeBonus: 0, replaced: true };
};

export const addFlat = (formula, n) => {
  const base = String(formula ?? '').trim();
  const add = int(n);
  if (!base) return '';
  const m = /^(.*?)\s*([+-])\s*(\d+)$/.exec(base);
  const [dice, flat] = m && /d/i.test(m[1]) ? [m[1], (m[2] === '-' ? -1 : 1) * Number(m[3])] : [base, 0];
  const total = flat + add;
  if (total === 0) return dice;
  return `${dice} ${total < 0 ? '-' : '+'} ${Math.abs(total)}`;
};

export const typedDamage = (typed, versatile = 0) => {
  const text = String(typed ?? '').trim();
  return text && int(versatile) ? addFlat(text, versatile) : text;
};

export const rowProficiency = (attack = {}, proficiencies = {}) => {
  const type = attack.type || '';
  const proficient =
    attack.proficient === true || attack.proficient === false
      ? attack.proficient
      : type ? isWeaponProficient(proficiencies, type) : true;
  const masteryAuto = type ? hasWeaponMastery(proficiencies, type) : false;
  const mastered =
    proficient &&
    (attack.isMastery === true || attack.isMastery === false ? attack.isMastery : masteryAuto);
  const grade = gradeNumber(attack.grade);
  return { proficient, mastered, grade, gradeInUse: proficient ? grade : 0 };
};

export const weaponDamage = ({
  baseDamage = '', gradeInUse = 0, abilityMod = 0, proficient = true, misc = 0, byGrade = false,
  versatile = 0,
} = {}) => {
  const base = String(baseDamage ?? '').trim();
  const ability = proficient ? int(abilityMod) : Math.min(0, int(abilityMod));
  const empty = { formula: '', dice: '', gradeBonus: 0, ability, misc: int(misc), versatile: 0, replaced: false };
  if (!base) return empty;
  const { dice, gradeBonus, replaced } = gradedDice(base, gradeInUse, byGrade);
  return {
    formula: addFlat(dice, gradeBonus + ability + int(misc) + int(versatile)),
    dice,
    gradeBonus,
    ability,
    misc: int(misc),
    versatile: int(versatile),
    replaced,
  };
};

export const normalizeWeaponText = (value) => {
  let list = value;
  if (typeof list === 'string') {
    if (!list.startsWith('$__$')) return list.trim() ? [{ text: list.trim() }] : [];
    try {
      list = JSON.parse(list.slice(4));
    } catch {
      return [];
    }
  }
  if (list && typeof list === 'object' && !Array.isArray(list)) {
    list = Object.keys(list)
      .sort((a, b) => int(a.replace(/\D/g, '')) - int(b.replace(/\D/g, '')))
      .map((k) => list[k]);
  }
  if (!Array.isArray(list)) return [];
  return list
    .map((e) => (typeof e === 'string' ? { text: e } : e))
    .filter((e) => e && typeof e.text === 'string' && e.text.trim())
    .map((e) => {
      const grade = e.minGrade === '' || e.minGrade == null ? NaN : Number(e.minGrade);
      return {
        text: e.text.trim(),
        ...(Number.isInteger(grade) ? { minGrade: grade } : {}),
        ...(e.requires === 'mastery' ? { requires: 'mastery' } : {}),
      };
    });
};

export const storeWeaponText = (list) =>
  Object.fromEntries(normalizeWeaponText(list).map((e, i) => [`t${i}`, e]));

export const activeWeaponText = (list, { mastered = false, gradeInUse = 0 } = {}) =>
  normalizeWeaponText(list)
    .filter((e) => (e.requires !== 'mastery' || mastered) && (e.minGrade == null || gradeInUse >= e.minGrade))
    .map((e) => e.text);

export const migrateAttackRow = (row = {}) => {
  const current = 'type' in row
    ? row
    : {
      ...row,
      type: '',
      proficient: row.proficient === false ? false : 'auto',
      isMastery: row.isMastery === true ? true : 'auto',
    };
  return {
    ...current,
    properties: normalizeWeaponProperties(current.properties),
    text: normalizeWeaponText(current.text),
  };
};
