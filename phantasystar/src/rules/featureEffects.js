import { clampLevel } from './progression.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const int = (v) => {
  const n = parseInt(String(v ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

export const MOVE_ARMOR = ['noHeavy', 'lightNoShield'];
export const DEFENSE_ARMOR = ['worn', 'lightMedium'];
const ABILITY_IDS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

const levelled = (value) => {
  if (!isObject(value?.byLevel)) return int(value);
  const byLevel = Object.fromEntries(Object.entries(value.byLevel)
    .filter(([k]) => /^lv\d+$/.test(k)).map(([k, n]) => [k, int(n)]));
  return Object.keys(byLevel).length ? { byLevel } : 0;
};

export const atLevel = (value, level) => {
  if (!isObject(value?.byLevel)) return int(value);
  const reached = Object.keys(value.byLevel).map((k) => int(k)).filter((n) => n <= level);
  return reached.length ? int(value.byLevel[`lv${Math.max(...reached)}`]) : 0;
};

export const normalizeMove = (move) => {
  if (!isObject(move)) return null;
  const speed = isObject(move.speed) && typeof move.speed.column === 'string'
    ? { column: move.speed.column }
    : int(move.speed);
  return {
    speed,
    armor: MOVE_ARMOR.includes(move.armor) ? move.armor : '',
    agility: levelled(move.agility),
    agilityAbility: ABILITY_IDS.includes(move.agilityAbility) ? move.agilityAbility : '',
    climb: move.climb === 'speed' ? 'speed' : '',
    swim: move.swim === 'speed' ? 'speed' : '',
  };
};

export const normalizeDefense = (defense) => {
  if (!isObject(defense)) return null;
  return {
    bonus: levelled(defense.bonus),
    half: ABILITY_IDS.includes(defense.half) || defense.half === 'pick' ? defense.half : '',
    armor: DEFENSE_ARMOR.includes(defense.armor) ? defense.armor : '',
    pick: typeof defense.pick === 'string' ? defense.pick : '',
  };
};

export const normalizeSense = (sense) => {
  if (!isObject(sense)) return null;
  const range = levelled(sense.range);
  if (!range) return null;
  return { range, pick: typeof sense.pick === 'string' ? sense.pick : '' };
};

export const featureNightVision = (features, { level = 1 } = {}) => {
  const list = Array.isArray(features) ? features : Object.values(features ?? {});
  const l = clampLevel(level);
  const parts = [];
  for (const f of list) {
    const sense = normalizeSense(f?.sense);
    if (!sense) continue;
    const held = /^(profession|path):/.test(f.source ?? '') && f.level != null && f.level > l;
    if (held) continue;
    if (sense.pick && !String(f.pick ?? '').split('|').includes(sense.pick)) continue;
    const range = atLevel(sense.range, l);
    if (range > 0) parts.push({ name: f.name, range });
  }
  return { range: parts.reduce((most, p) => Math.max(most, p.range), 0), parts };
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
  const abilities = [];
  const climb = [];
  const swim = [];
  for (const f of list) {
    const move = normalizeMove(f?.move);
    if (!move) continue;
    const held = /^(profession|path):/.test(f.source ?? '') && f.level != null && f.level > l;
    if (held) continue;
    if (move.climb) climb.push(f.name);
    if (move.swim) swim.push(f.name);
    if (!armorAllows(move.armor, { armorType, shield })) continue;
    const speed = isObject(move.speed)
      ? int(professionStats?.levels?.[`lv${l}`]?.columns?.[move.speed.column]?.value)
      : move.speed;
    const agility = atLevel(move.agility, l);
    if (speed || agility) parts.push({ name: f.name, speed, agility });
    if (move.agilityAbility) abilities.push({ name: f.name, ability: move.agilityAbility });
  }
  return {
    speed: parts.reduce((s, p) => s + p.speed, 0),
    agility: parts.reduce((s, p) => s + p.agility, 0),
    parts,
    abilities,
    climb,
    swim,
  };
};

const defenseArmorAllows = (condition, { armorType = 'none', armorBonus = 0 } = {}) => {
  const wearing = armorType !== 'none' || int(armorBonus) > 0;
  if (condition === 'worn') return wearing;
  if (condition === 'lightMedium') return wearing && armorType !== 'heavy';
  return true;
};

export const featureDefense = (features, { level = 1, abilities = {}, armorType = 'none', armorBonus = 0 } = {}) => {
  const list = Array.isArray(features) ? features : Object.values(features ?? {});
  const l = clampLevel(level);
  const parts = [];
  for (const f of list) {
    const defense = normalizeDefense(f?.defense);
    if (!defense) continue;
    const held = /^(profession|path):/.test(f.source ?? '') && f.level != null && f.level > l;
    if (held || !defenseArmorAllows(defense.armor, { armorType, armorBonus })) continue;
    if (defense.pick && !String(f.pick ?? '').split('|').includes(defense.pick)) continue;
    const half = defense.half === 'pick' ? String(f.pick ?? '').split('|')[0].toLowerCase() : defense.half;
    if (defense.half === 'pick' && !ABILITY_IDS.includes(half)) continue;
    const value = half ? Math.max(0, Math.floor(int(abilities[half]) / 2)) : atLevel(defense.bonus, l);
    if (value) parts.push({ name: f.name, defense: value });
  }
  return { total: parts.reduce((s, p) => s + p.defense, 0), parts };
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
