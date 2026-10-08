import { saveBonus } from './progression.js';

const int = (v) => Math.trunc(Number(v) || 0);

export const savingThrow = (abilityMod, level, proficient) =>
  int(abilityMod) + (proficient ? saveBonus(level) : 0);

export const skillModifier = (abilityMod, ranks = 0, misc = 0) =>
  int(abilityMod) + int(ranks) + int(misc);

export const passivePerception = (perceptionModifier, misc = 0) =>
  10 + int(perceptionModifier) + int(misc);

export const unarmoredDefense = (dexMod) => 10 + int(dexMod);

export const defense = ({ base = 10, armorBonus = 0, shieldBonus = 0, dexMod = 0, armorType = 'none', techniqueMod = 0, miscMod = 0 } = {}) => {
  let dex = int(dexMod);
  if (armorType === 'medium') dex = Math.min(dex, 2);
  else if (armorType === 'heavy') dex = 0;
  return int(base) + int(armorBonus) + int(shieldBonus) + dex + int(techniqueMod) + int(miscMod);
};

export const agility = (dexMod, misc = 0) => int(dexMod) + int(misc);

export const characterAttackPower = ({
  abilityMod = 0,
  attackBonus = 0,
  proficient = true,
  misc = 0,
} = {}) =>
  int(abilityMod) + (proficient ? int(attackBonus) : 0) + int(misc);

export const techAttackPower = (techAbilityMod, techBonus, misc = 0) =>
  int(techAbilityMod) + int(techBonus) + int(misc);

export const techSaveDC = (techAbilityMod, level, misc = 0) =>
  8 + int(techAbilityMod) + saveBonus(level) + int(misc);

export const startingHp = (hitDie, conMod) =>
  hitDie ? int(hitDie) + int(conMod) : null;

export const hpFromLevelUp = (dieRoll, conMod) =>
  Math.max(1, int(dieRoll) + int(conMod));

export const hitDieHealing = (dieRoll, conMod) => Math.max(0, int(dieRoll) + int(conMod));

export const healHp = (current, max, amount) =>
  Math.min(int(max), int(current) + Math.max(0, int(amount)));

export const averageHpPerLevel = (hitDie, conMod) => {
  if (!hitDie) return null;
  return Math.max(1, Math.floor(int(hitDie) / 2) + 1 + int(conMod));
};

export const formatModifier = (n) => {
  const v = int(n);
  return v >= 0 ? `+${v}` : `${v}`;
};
