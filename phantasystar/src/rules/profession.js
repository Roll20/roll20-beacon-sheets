import { clampLevel } from './progression.js';

export const PROFESSION_LEVEL_STATS = [
  'attackBonus',
  'techBonus',
  'techniquesKnown',
  'maxTechRank',
  'advancedRank',
  'maxTP',
];

export const HIT_DICE = [6, 8, 10, 12];

const blank = (v) => v === null || v === undefined || v === '';

const numOrNull = (v) => {
  if (blank(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const levelKey = (level) => `lv${level}`;

const normalizeCells = (cells) => {
  if (!cells || typeof cells !== 'object') return null;
  const out = {};
  for (const [id, cell] of Object.entries(cells)) {
    if (!cell || typeof cell !== 'object') continue;
    const uses = numOrNull(cell.uses);
    const value = typeof cell.value === 'string' && cell.value.trim() ? cell.value : null;
    if (uses !== null || value !== null) {
      out[id] = { ...(uses !== null ? { uses } : {}), ...(value !== null ? { value } : {}) };
    }
  }
  return Object.keys(out).length ? out : null;
};

const normalizeRow = (row = {}) => {
  const out = Object.fromEntries(PROFESSION_LEVEL_STATS.map((stat) => [stat, numOrNull(row?.[stat])]));
  const columns = normalizeCells(row?.columns);
  return columns ? { ...out, columns } : out;
};

const normalizeColumns = (columns) => {
  const list = Array.isArray(columns) ? columns : Object.entries(columns ?? {}).map(([id, c]) => ({ ...c, id }));
  const out = {};
  for (const c of list) {
    if (!c || typeof c.id !== 'string' || !c.id) continue;
    out[c.id] = {
      name: typeof c.name === 'string' ? c.name : c.id,
      feature: typeof c.feature === 'string' ? c.feature : '',
      label: typeof c.label === 'string' ? c.label : '',
      uses: c.uses === true,
    };
  }
  return out;
};

export const normalizeLevels = (levels) => {
  if (!levels) return null;
  const out = {};
  if (Array.isArray(levels)) {
    levels.forEach((row, i) => {
      if (!row) return;
      const level = clampLevel(row.level ?? row.Level ?? i + 1);
      out[levelKey(level)] = normalizeRow(row);
    });
  } else if (typeof levels === 'object') {
    for (const [key, row] of Object.entries(levels)) {
      const level = Number(String(key).replace(/^lv/, ''));
      if (Number.isInteger(level) && level >= 1 && level <= 20) out[levelKey(level)] = normalizeRow(row);
    }
  }
  return Object.keys(out).length ? out : null;
};

export const normalizeProfessionStats = (stats = {}) => ({
  id: typeof stats?.id === 'string' ? stats.id : '',
  pathId: typeof stats?.pathId === 'string' ? stats.pathId : '',
  hitDie: numOrNull(stats?.hitDie),
  techAbility: stats?.techAbility || '',
  levels: normalizeLevels(stats?.levels),
  columns: normalizeColumns(stats?.columns),
  current: Object.fromEntries(PROFESSION_LEVEL_STATS.map((stat) => [stat, numOrNull(stats?.current?.[stat])])),
});

export const featureColumnValues = (stats, level, featureRef) => {
  if (!featureRef) return [];
  const s = normalizeProfessionStats(stats);
  const row = s.levels?.[levelKey(clampLevel(level))];
  return Object.entries(s.columns)
    .filter(([, c]) => c.feature === featureRef)
    .map(([id, c]) => ({ id, label: c.label, value: row?.columns?.[id]?.value ?? null }))
    .filter((c) => c.value !== null);
};

export const professionRow = (stats, level) => {
  const s = normalizeProfessionStats(stats);
  const tableRow = s.levels?.[levelKey(clampLevel(level))] ?? {};
  return Object.fromEntries(
    PROFESSION_LEVEL_STATS.map((stat) => [stat, s.current[stat] ?? tableRow[stat] ?? null]),
  );
};

export const hasLevelTable = (stats) => !!normalizeProfessionStats(stats).levels;
