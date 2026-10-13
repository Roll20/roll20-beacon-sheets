import { featuresOf } from './choices.js';
import { compendiumUrl } from './catalog.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asList = (choice) => (Array.isArray(choice) ? choice : choice ? [choice] : []).filter(isObject);
const picksOf = (value) => String(value ?? '').split('|').filter(Boolean);

export const techniqueInfo = (option) => {
  const fields = option?.payload?.fields ?? {};
  const rank = Number.isInteger(fields.rank) ? fields.rank : Number(option?.properties?.Rank);
  return {
    name: option?.pageName ?? '',
    rank: Number.isInteger(rank) ? rank : null,
    professions: String(option?.properties?.Professions ?? '').split(',').map((p) => p.trim()).filter(Boolean),
    castingTime: fields.castingTime ?? '',
    range: fields.range ?? '',
    duration: fields.duration ?? '',
    text: Array.isArray(fields.text) ? fields.text.filter((p) => typeof p === 'string') : [],
    url: compendiumUrl(option),
  };
};

export const levelRow = (profession, level) =>
  (profession?.payload?.professionStats?.levels ?? []).find((r) => r?.level === level) ?? null;

export const techniquePools = ({ profession, path, feats = [] } = {}, level = 1) => {
  if (!profession) return [];
  const row = levelRow(profession, level);
  const pools = [];
  const base = `profession:${profession.pageName}`;
  const primes = Number(row?.columns?.prime_techniques?.value);
  if (primes > 0) pools.push({ key: `${base}:prime`, label: 'Prime Techniques', count: primes, minRank: 0, maxRank: 0 });
  if (row?.techniquesKnown > 0) {
    pools.push({ key: `${base}:known`, label: 'Techniques', count: row.techniquesKnown, minRank: 1, maxRank: row.maxTechRank ?? 1 });
  }
  for (let rank = 6; rank <= (row?.advancedRank ?? 0); rank += 1) {
    pools.push({ key: `${base}:advanced:${rank}`, label: `Advanced Technique (Rank ${rank})`, count: 1, minRank: rank, maxRank: rank });
  }
  for (const [kind, option] of [['profession', profession], ['path', path]]) {
    if (!option) continue;
    for (const f of featuresOf(option, level)) {
      asList(f.entry.choice).forEach((c, i) => {
        if (c.type !== 'technique') return;
        pools.push({
          key: `${kind}:${option.pageName}:${f.id}:${i}`,
          label: `${f.name}: ${c.label ?? ''}`,
          count: Number.isInteger(c.count) ? c.count : 1,
          minRank: 1,
          maxRank: Number.isInteger(c.maxRank) ? c.maxRank : row?.maxTechRank ?? 1,
        });
      });
    }
  }
  for (const f of feats) pools.push(...(f.choices?.pools ?? []));
  return pools;
};

export const grantedTechniques = (pages = {}, level = 1, picks = {}) => {
  const out = [];
  const add = (grants, source) => {
    for (const g of grants ?? []) {
      if (isObject(g) && (g.level ?? 1) <= level) for (const name of g.names ?? []) out.push({ name, source });
    }
  };
  const { species, profession, path } = pages;
  for (const f of featuresOf(species, 1)) {
    add(f.entry.techniques, f.name);
    const option = asList(f.entry.choice).find((c) => c.type === 'option' && Array.isArray(c.options));
    const picked = option?.options.find((o) => o?.name === picks.species?.[`feature:${f.id}`]);
    add(picked?.techniques, f.name);
  }
  for (const option of [profession, path]) for (const f of featuresOf(option, level)) add(f.entry.techniques, f.name);
  return out;
};

export const eligibleFor = (pool, techniques, { profession, showAll = false } = {}) =>
  techniques.filter((t) => t.rank != null && t.rank >= pool.minRank && t.rank <= pool.maxRank
    && (showAll || t.professions.includes(pool.profession || profession)));

export const techniquesComplete = (pools, picks = {}, techniques = [], profession = '') =>
  pools.every((p) => picksOf(picks[p.key]).length >= Math.min(p.count, eligibleFor(p, techniques, { profession }).length));

export const techniquesBasis = (draft) =>
  [draft?.profession?.pageName ?? '', draft?.path?.pageName ?? '', String(draft?.level ?? 1),
    ...(Object.keys(draft?.abilities?.feats ?? {}).length ? [JSON.stringify(draft.abilities.feats)] : [])].join('|');
