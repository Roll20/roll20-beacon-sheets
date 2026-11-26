import { averageHpPerLevel } from '../rules/derived.js';

export const HP_METHODS = [
  { id: 'average', label: 'Take Average' },
  { id: 'roll', label: 'Roll' },
];

export const hpRolls = (hp) => String(hp?.rolled ?? '').split('|').map(Number).filter((n) => Number.isInteger(n) && n >= 1);

export const levelsPastFirst = (level) => Math.max(0, (Number(level) || 1) - 1);

export const hpReady = (hp, level, hitDie) => {
  if (!levelsPastFirst(level) || hp?.method !== 'roll') return true;
  return Number(hp.die) === Number(hitDie) && hpRolls(hp).length >= levelsPastFirst(level);
};

export const levelGains = ({ hitDie, con = 0, level = 1, hp = {} }) => {
  const count = levelsPastFirst(level);
  if (hp.method !== 'roll') return Array.from({ length: count }, () => averageHpPerLevel(hitDie, con));
  const rolls = hpRolls(hp);
  if (Number(hp.die) !== Number(hitDie) || rolls.length < count) return null;
  return rolls.slice(0, count).map((face) => Math.max(1, face + con));
};

export const maxHp = ({ hitDie, con = 0, level = 1, hp = {}, hpPerLevel = 0, flat = 0 }) => {
  if (!hitDie) return null;
  const gains = levelGains({ hitDie, con, level, hp });
  if (!gains) return null;
  return hitDie + con + gains.reduce((a, b) => a + b, 0) + hpPerLevel * level + flat;
};
