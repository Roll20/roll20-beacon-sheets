import { clampLevel } from './progression.js';
import { ABILITY_IDS } from './skills.js';

export const RECOVERIES = [
  { id: 'short', name: 'Short' },
  { id: 'short1', name: '1/Short' },
  { id: 'long', name: 'Long' },
];

export const RECOVERY_IDS = RECOVERIES.map((r) => r.id);

export const recoveryLabel = (id) => RECOVERIES.find((r) => r.id === id)?.name ?? '';

export const MAX_PIPS = 10;

const int = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export const normalizeUsesMax = (max = {}) => {
  if (!max || typeof max !== 'object') {
    const n = int(max);
    return { fixed: n !== null && n > 0 ? n : 0 };
  }
  if (typeof max.column === 'string' && max.column) return { column: max.column };
  if (max.byLevel && typeof max.byLevel === 'object') {
    const byLevel = {};
    for (const [k, v] of Object.entries(max.byLevel)) {
      const level = int(String(k).replace(/^lv/, ''));
      const n = int(v);
      if (level >= 1 && level <= 20 && n !== null) byLevel[`lv${level}`] = n;
    }
    if (Object.keys(byLevel).length) return { byLevel };
  }
  if (ABILITY_IDS.includes(max.ability)) {
    const min = int(max.min);
    return { ability: max.ability, ...(min !== null ? { min } : {}) };
  }
  if (int(max.perLevel) > 0) return { perLevel: int(max.perLevel) };
  const fixed = int(max.fixed);
  return { fixed: fixed !== null && fixed > 0 ? fixed : 0 };
};

export const normalizeResource = (row = {}) => ({
  feature: typeof row.feature === 'string' ? row.feature : '',
  name: typeof row.name === 'string' ? row.name : '',
  max: normalizeUsesMax(row.max),
  maxOverride: int(row.maxOverride),
  used: Math.max(0, int(row.used) ?? 0),
  recovery: RECOVERY_IDS.includes(row.recovery) ? row.recovery : 'long',
  pool: row.pool === true,
  unit: typeof row.unit === 'string' ? row.unit : '',
  ...(row._id ? { _id: row._id } : {}),
});

const columnUses = (professionStats, column, level) => {
  const row = professionStats?.levels?.[`lv${clampLevel(level)}`];
  return int(row?.columns?.[column]?.uses);
};

const byLevelValue = (byLevel, level) => {
  const l = clampLevel(level);
  let best = null;
  let at = 0;
  for (const [k, v] of Object.entries(byLevel)) {
    const step = int(k.replace(/^lv/, ''));
    if (step <= l && step > at) {
      at = step;
      best = int(v);
    }
  }
  return best ?? 0;
};

export const resourceMax = (resource, { level = 1, abilities = {}, professionStats = null } = {}) => {
  const r = normalizeResource(resource);
  if (r.maxOverride !== null) return Math.max(0, r.maxOverride);
  const m = r.max;
  let n = 0;
  if ('column' in m) n = columnUses(professionStats, m.column, level) ?? 0;
  else if ('byLevel' in m) n = byLevelValue(m.byLevel, level);
  else if ('ability' in m) n = Math.max(int(abilities[m.ability]) ?? 0, m.min ?? -Infinity);
  else if ('perLevel' in m) n = m.perLevel * clampLevel(level);
  else n = m.fixed;
  return Math.max(0, n);
};

export const resourceLeft = (resource, max) => Math.max(0, max - Math.min(max, normalizeResource(resource).used));

export const showsAsNumber = (resource, max) => normalizeResource(resource).pool || max > MAX_PIPS;

export const usedAfterRest = (resource, period) => {
  const r = normalizeResource(resource);
  if (period === 'long') return 0;
  if (r.recovery === 'short') return 0;
  if (r.recovery === 'short1') return Math.max(0, r.used - 1);
  return r.used;
};
