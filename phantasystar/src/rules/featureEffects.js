import { clampLevel } from './progression.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const int = (v) => {
  const n = parseInt(String(v ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

export const MOVE_ARMOR = ['noHeavy', 'lightNoShield'];

export const normalizeMove = (move) => {
  if (!isObject(move)) return null;
  const speed = isObject(move.speed) && typeof move.speed.column === 'string'
    ? { column: move.speed.column }
    : int(move.speed);
  return {
    speed,
    armor: MOVE_ARMOR.includes(move.armor) ? move.armor : '',
    agility: int(move.agility),
  };
};

const armorAllows = (condition, { armorType = 'none', shield = false } = {}) => {
  if (condition === 'noHeavy') return armorType !== 'heavy';
  if (condition === 'lightNoShield') return (armorType === 'none' || armorType === 'light') && !shield;
  return true;
};

export const featureMovement = (features, { level = 1, professionStats = null, armorType = 'none', shield = false } = {}) => {
  const list = Array.isArray(features) ? features : Object.values(features ?? {});
  const l = clampLevel(level);
  const parts = [];
  for (const f of list) {
    const move = normalizeMove(f?.move);
    if (!move) continue;
    const held = /^(profession|path):/.test(f.source ?? '') && f.level != null && f.level > l;
    if (held || !armorAllows(move.armor, { armorType, shield })) continue;
    const speed = isObject(move.speed)
      ? int(professionStats?.levels?.[`lv${l}`]?.columns?.[move.speed.column]?.value)
      : move.speed;
    if (speed || move.agility) parts.push({ name: f.name, speed, agility: move.agility });
  }
  return {
    speed: parts.reduce((s, p) => s + p.speed, 0),
    agility: parts.reduce((s, p) => s + p.agility, 0),
    parts,
  };
};

const splitNames = (names) =>
  (Array.isArray(names) ? names : String(names ?? '').split('|'))
    .map((n) => String(n).trim())
    .filter(Boolean);

export const normalizeGrants = (grants) => {
  const list = Array.isArray(grants) ? grants : isObject(grants) ? Object.keys(grants).sort().map((k) => grants[k]) : [];
  return list
    .filter(isObject)
    .map((g) => ({
      level: clampLevel(g.level),
      names: splitNames(g.names),
      free: isObject(g.free) && Number(g.free.max) > 0
        ? { per: g.free.per === 'short' ? 'short' : 'long', max: Math.trunc(Number(g.free.max)) }
        : null,
    }))
    .filter((g) => g.names.length);
};

export const storeGrants = (grants) =>
  Object.fromEntries(normalizeGrants(grants).map((g, i) => [`g${i}`, { ...g, names: g.names.join('|') }]));

export const grantedNames = (granted) => splitNames(granted);

export const pendingGrants = (features = [], level = 1) => {
  const l = clampLevel(level);
  const out = [];
  for (const f of features) {
    const grants = normalizeGrants(f?.techniques);
    if (!grants.length) continue;
    const held = /^(profession|path):/.test(f.source ?? '') && f.level != null && f.level > l;
    if (held) continue;
    const done = new Set(grantedNames(f.granted).map((n) => n.toLowerCase()));
    for (const g of grants) {
      if (g.level > l) continue;
      for (const name of g.names) {
        if (!done.has(name.toLowerCase())) out.push({ featureId: f._id, feature: f.name, name, free: g.free });
      }
    }
  }
  return out;
};
