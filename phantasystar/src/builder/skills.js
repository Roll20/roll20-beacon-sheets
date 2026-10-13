import { SKILLS, SKILL_IDS } from '../rules/skills.js';
import { maxSkillRank } from '../rules/progression.js';
import { TOOLS, VEHICLES, WEAPON_TYPES } from '../rules/proficiencies.js';
import { backgroundRanks } from '../compendium/drops.js';
import { featuresOf } from './choices.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asList = (choice) => (Array.isArray(choice) ? choice : choice ? [choice] : []).filter(isObject);
const skillIds = (from) => (Array.isArray(from) ? from.filter((id) => SKILL_IDS.includes(id)) : null);

export const skillName = (id) => SKILLS.find((s) => s.id === id)?.name ?? id;

export const countAt = (choice, level = 1) => {
  const base = Number.isInteger(choice?.count) ? choice.count : 1;
  const reached = Object.entries(isObject(choice?.countAt) ? choice.countAt : {})
    .map(([key, n]) => [parseInt(key.slice(2), 10), n])
    .filter(([at, n]) => Number.isInteger(at) && at <= level && Number.isInteger(n))
    .sort((a, b) => a[0] - b[0]);
  return reached.length ? reached[reached.length - 1][1] : base;
};

export const doublingChoice = (key, source, choice, count) => ({
  key, source, label: choice.label ?? '', count, mode: 'pick', ranked: true, doubling: true,
  options: SKILLS.map((s) => ({ value: `skill:${s.id}`, name: s.name })),
});

export const levelRanks = (level) => {
  let total = 0;
  for (let l = 2; l <= level; l += 1) total += [5, 11, 17].includes(l) ? 3 : 1;
  return total;
};

export const fixedRanks = ({ species, background } = {}, level = 1) => {
  const ranks = Object.fromEntries(SKILL_IDS.map((id) => [id, 0]));
  for (const [id, n] of Object.entries(species?.payload?.skillRanks ?? {})) {
    if (id in ranks && Number.isInteger(n)) ranks[id] = Math.min(maxSkillRank(level), ranks[id] + n);
  }
  const skills = Object.fromEntries(SKILL_IDS.map((id) => [id, { ranks: ranks[id] }]));
  const { set, leftover } = backgroundRanks(skills, background?.payload?.skillRanks ?? {}, maxSkillRank(level));
  return { ranks: { ...ranks, ...set }, leftover };
};

export const allotment = (key, source, choice, from) => {
  const ranks = Number.isInteger(choice.ranks) ? choice.ranks : 1;
  const count = Number.isInteger(choice.count) ? choice.count : 1;
  return ranks > 1
    ? { key, source, label: choice.label ?? '', mode: 'pick', count, ranks, total: count * ranks, from }
    : { key, source, label: choice.label ?? '', mode: 'points', count, ranks: 1, total: count, from };
};

export const skillAllotments = (pages = {}, level = 1, skills = null) => {
  const out = [];
  const { species, background, profession, path } = pages;
  const professionFrom = skillIds(profession?.payload?.skillChoice?.from);

  const fromFeatures = (kind, option, defaultFrom) => {
    for (const f of featuresOf(option, kind === 'species' || kind === 'background' ? 1 : level)) {
      asList(f.entry.choice).forEach((c, i) => {
        if (c.type !== 'skills' || !Number.isInteger(c.ranks)) return;
        out.push(allotment(`${kind}:${option.pageName}:${f.id}:${i}`, option.pageName,
          { ...c, label: `${f.name}: ${c.label ?? ''}` }, skillIds(c.from) ?? defaultFrom));
      });
    }
  };

  if (species) fromFeatures('species', species, null);
  if (background) {
    const { leftover } = fixedRanks(pages, level);
    if (leftover) {
      out.push({ key: `background:${background.pageName}:over`, source: background.pageName,
        label: 'Ranks past the cap', mode: 'points', count: leftover, ranks: 1, total: leftover, from: null });
    }
    const c = background.payload?.skillChoice;
    if (isObject(c)) out.push(allotment(`background:${background.pageName}:skillChoice`, background.pageName, c, skillIds(c.from)));
    fromFeatures('background', background, null);
  }
  if (profession) {
    const c = profession.payload?.skillChoice;
    if (isObject(c)) out.push(allotment(`profession:${profession.pageName}:skillChoice`, profession.pageName, c, professionFrom));
    fromFeatures('profession', profession, professionFrom);
  }
  if (path) fromFeatures('path', path, null);
  for (const f of pages.feats ?? []) out.push(...(f.choices?.allotments ?? []));
  const perLevel = levelRanks(level);
  if (perLevel) {
    out.push({ key: 'level', source: `Levels 2–${level}`, label: 'A rank a level, 3 at levels 5, 11 and 17',
      mode: 'points', count: perLevel, ranks: 1, total: perLevel, from: null });
  }
  if (!skills) return out;
  return out.flatMap((a) => {
    const over = overflowAllotment(a, skills);
    return over ? [a, over] : [a];
  });
};

export const overflowAllotment = (a, skills) => {
  if (a.mode !== 'pick') return null;
  const spare = allotmentSpent(a, skills) - sum(placedIn(skills, a.key));
  if (spare <= 0) return null;
  return { key: `${a.key}:over`, source: a.source, label: 'Ranks past the cap', mode: 'points',
    count: spare, ranks: 1, total: spare, from: a.from };
};

export const allotmentSpent = (a, skills) => {
  const placed = placedIn(skills, a.key);
  return a.mode === 'pick' ? Object.keys(placed).length * a.ranks : sum(placed);
};

const BY_KIND = {
  tool: TOOLS.map((t) => ({ kind: 'tool', id: t.id, name: t.name })),
  vehicle: VEHICLES.map((v) => ({ kind: 'vehicle', id: v.id, name: v.name })),
};
const ALL = [...BY_KIND.tool, ...BY_KIND.vehicle];

export const weaponProficiencies = (pages = {}) => {
  const ids = new Set();
  for (const option of [pages.species, pages.background, pages.profession]) {
    for (const p of option?.payload?.proficiencies ?? []) if (p?.kind === 'weapon') ids.add(p.id);
  }
  return WEAPON_TYPES.filter((w) => ids.has(w.id)).map((w) => ({ kind: 'mastery', id: w.id, name: w.name }));
};

export const proficiencyOptions = (choice, pages = {}) => {
  const kinds = Array.isArray(choice.kind) ? choice.kind : choice.kind ? [choice.kind] : [];
  if (kinds.includes('mastery')) return weaponProficiencies(pages);
  const from = Array.isArray(choice.from) ? choice.from : [];
  const listed = ALL.filter((p) => from.includes(p.id));
  const whole = kinds.flatMap((k) => BY_KIND[k] ?? []);
  const seen = new Set();
  return [...listed, ...whole].filter((p) => (seen.has(`${p.kind}:${p.id}`) ? false : seen.add(`${p.kind}:${p.id}`)));
};

export const proficiencyChoices = (pages = {}, level = 1, picks = {}) => {
  const out = [];
  const add = (key, source, c) => {
    if (c.type === 'option' && Array.isArray(c.options)) {
      out.push({ key, source, label: c.label ?? '', mode: 'option', count: 1,
        options: c.options.filter((o) => isObject(o) && o.name).map((o) => ({ value: o.name, name: o.name })) });
      const chosen = c.options.find((o) => o?.name === picks[key]);
      asList(chosen?.choices).forEach((n, j) => add(`${key}:${j}`, source, n));
      return;
    }
    if (c.type !== 'proficiency') return;
    const options = proficiencyOptions(c, pages).map((p) => ({ value: `${p.kind}:${p.id}`, name: p.name }));
    out.push({ key, source, label: c.label ?? '', mode: 'pick', count: Number.isInteger(c.count) ? c.count : 1, options });
  };
  const fromFeatures = (kind, option) => {
    for (const f of featuresOf(option, kind === 'species' || kind === 'background' ? 1 : level)) {
      asList(f.entry.choice).forEach((c, i) => {
        const key = `${kind}:${option.pageName}:${f.id}:${i}`;
        const labelled = { ...c, label: `${f.name}: ${c.label ?? ''}` };
        if (c.type === 'proficiency') add(key, option.pageName, labelled);
        else if (c.type === 'skills' && !Number.isInteger(c.ranks)) out.push(doublingChoice(key, option.pageName, labelled, countAt(c, level)));
      });
    }
  };
  const { species, background, profession, path } = pages;
  if (species) fromFeatures('species', species);
  for (const [kind, option] of [['background', background], ['profession', profession]]) {
    if (!option) continue;
    asList(option.payload?.proficiencyChoices)
      .forEach((c, i) => add(`${kind}:${option.pageName}:prof:${i}`, option.pageName, c));
    fromFeatures(kind, option);
  }
  if (path) fromFeatures('path', path);
  for (const f of pages.feats ?? []) out.push(...(f.choices?.picks ?? []));
  return out;
};

export const optionGrants = (pages = {}, picks = {}) => {
  const grants = {};
  const background = pages.background;
  asList(background?.payload?.proficiencyChoices).forEach((c, i) => {
    const key = `background:${background.pageName}:prof:${i}`;
    const chosen = (c.options ?? []).find((o) => o?.name === picks[key]);
    const fixed = (chosen?.proficiencies ?? []).filter((p) => p?.kind && p?.id).map((p) => `${p.kind}:${p.id}`);
    if (fixed.length) grants[`${key}:fixed`] = fixed.join('|');
  });
  return grants;
};

const picksOf = (value) => String(value ?? '').split('|').filter(Boolean);

export const placedIn = (skills, key) =>
  Object.fromEntries(Object.entries(skills?.ranks?.[key] ?? {}).filter(([, n]) => Number.isInteger(n) && n > 0));

const sum = (map) => Object.values(map).reduce((a, b) => a + b, 0);

export const skillRows = (pages, skills, level = 1, allotments = skillAllotments(pages, level, skills)) => {
  const { ranks } = fixedRanks(pages, level);
  const placed = Object.fromEntries(SKILL_IDS.map((id) => [id, 0]));
  for (const a of allotments) for (const [id, n] of Object.entries(placedIn(skills, a.key))) if (id in placed) placed[id] += n;
  const cap = maxSkillRank(level);
  return SKILLS.map((s) => {
    const total = ranks[s.id] + placed[s.id];
    return { id: s.id, name: s.name, ability: s.ability, fixed: ranks[s.id], placed: placed[s.id], total, cap, overCap: total > cap, doubled: false };
  });
};

export const skillsComplete = (pages, skills, level = 1) => {
  const allotments = skillAllotments(pages, level, skills);
  if (allotments.some((a) => allotmentSpent(a, skills) !== a.total)) return false;
  return proficiencyChoices(pages, level, skills?.picks ?? {})
    .filter((c) => c.options.length)
    .every((c) => picksOf(skills?.picks?.[c.key]).length >= Math.min(c.count, c.options.length));
};

export const skillsBasis = (draft) =>
  [draft?.species, draft?.background, draft?.profession, draft?.path]
    .map((p) => p?.pageName ?? '').concat(String(draft?.level ?? 1), featsMark(draft)).filter((x, i) => i < 5 || x).join('|');

export const featsMark = (draft) => {
  const feats = draft?.abilities?.feats ?? {};
  return Object.keys(feats).length ? JSON.stringify(feats) : '';
};

export const keyCurrent = (draft, key) => {
  if (key === 'level') return true;
  const feat = /^feat:([^=]+)=([^:]+)/.exec(key);
  if (feat) {
    const [kind, pageName, level] = feat[1].split(':');
    return draft?.abilities?.feats?.[feat[1]] === feat[2] && draft?.[kind]?.pageName === pageName
      && Number(level) <= (draft?.level ?? 1);
  }
  const [kind, pageName] = key.split(':');
  return ['species', 'background', 'profession', 'path'].includes(kind) && draft?.[kind]?.pageName === pageName;
};
