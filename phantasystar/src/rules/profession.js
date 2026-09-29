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

const normalizeRow = (row = {}) =>
  Object.fromEntries(PROFESSION_LEVEL_STATS.map((stat) => [stat, numOrNull(row?.[stat])]));

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
  hitDie: numOrNull(stats?.hitDie),
  techAbility: stats?.techAbility || '',
  levels: normalizeLevels(stats?.levels),
  current: normalizeRow(stats?.current),
});

export const professionRow = (stats, level) => {
  const s = normalizeProfessionStats(stats);
  const tableRow = s.levels?.[levelKey(clampLevel(level))] ?? {};
  return Object.fromEntries(
    PROFESSION_LEVEL_STATS.map((stat) => [stat, s.current[stat] ?? tableRow[stat] ?? null]),
  );
};

export const hasLevelTable = (stats) => !!normalizeProfessionStats(stats).levels;
