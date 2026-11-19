import { normalizeDraft } from './draft.js';

export const PREMADES_CATEGORY = 'Ready-to-Play Characters';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => (typeof value === 'string' ? value : '');

export const premadeOf = (option) => {
  const p = option?.payload;
  if (!isObject(p) || p.category !== 'premades' || !isObject(p.levels)) return null;
  const levels = Object.keys(p.levels)
    .map(Number)
    .filter((n) => Number.isInteger(n) && isObject(p.levels[n]?.draft))
    .sort((a, b) => a - b);
  if (!levels.length) return null;
  return {
    pageName: option.pageName,
    name: text(p.name) || option.pageName,
    concept: text(p.concept),
    bio: text(p.bio),
    species: text(p.species),
    background: text(p.background),
    profession: text(p.profession),
    path: text(p.path),
    setting: Array.isArray(p.settings) ? text(p.settings[0]) : '',
    art: text(option.art),
    levels,
    summaries: Object.fromEntries(levels.map((n) => [n, isObject(p.levels[n].summary) ? p.levels[n].summary : {}])),
    drafts: Object.fromEntries(levels.map((n) => [n, p.levels[n].draft])),
  };
};

export const levelRange = (premade) => {
  const ls = premade?.levels ?? [];
  if (!ls.length) return '';
  return ls[0] === ls[ls.length - 1] ? String(ls[0]) : `${ls[0]}–${ls[ls.length - 1]}`;
};

export const premadeDraft = (premade, level) => {
  const stored = premade?.drafts?.[level];
  if (!isObject(stored)) return null;
  return { ...normalizeDraft(stored), built: false, skipped: false, levelUp: null };
};

export const premadesOf = (options = []) =>
  options.map(premadeOf).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
