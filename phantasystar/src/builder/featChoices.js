import { allotment, doublingChoice } from './skills.js';
import { levelRow } from './techniques.js';
import { SKILL_IDS } from '../rules/skills.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asList = (choice) => (Array.isArray(choice) ? choice : choice ? [choice] : []).filter(isObject);
const names = (value) => String(value ?? '').split('|').filter(Boolean);
const skillIds = (from) => (Array.isArray(from) ? from.filter((id) => SKILL_IDS.includes(id)) : null);

export const featPrefix = (slotKey, name) => `feat:${slotKey}=${name}`;

export const parseFeatKey = (key) => {
  const m = /^feat:([^=]+)=([^:]+)/.exec(String(key ?? ''));
  return m ? { slotKey: m[1], name: m[2] } : null;
};

export const featEntry = (feat) => {
  const list = feat?.features?.['level-1'];
  return Array.isArray(list) && isObject(list[0]) ? list[0] : null;
};

export const initiateRank = (profession, initiate, level) => {
  const own = Number(levelRow(profession, level)?.maxTechRank) || 0;
  if (own > 0) return Math.min(5, own);
  const rows = Object.entries(initiate?.byLevel ?? {})
    .map(([key, row]) => [parseInt(key.slice(2), 10), Number(row?.maxTechRank) || 0])
    .sort((a, b) => a[0] - b[0]);
  if (!rows.length) return 0;
  return (rows.filter(([at]) => at <= level).pop() ?? rows[0])[1];
};

const professionById = (professions, id) => (professions ?? []).find((p) => p.payload?.id === id) ?? null;

const hasPrimes = (profession) =>
  (profession?.payload?.professionStats?.levels ?? []).some((r) => Number(r?.columns?.prime_techniques?.value) > 0);

export const featChoices = (feat, slotKey, ctx = {}) => {
  const out = { option: null, allotments: [], picks: [], pools: [] };
  const entry = featEntry(feat);
  if (!entry) return out;
  const name = feat.pageName;
  const prefix = featPrefix(slotKey, name);
  const held = ctx.held ?? new Set();

  const options = (Array.isArray(entry.options) ? entry.options : []).filter((o) => isObject(o) && o.name);
  if (options.length) {
    out.option = {
      key: `${prefix}:option`,
      label: name,
      count: Number.isInteger(entry.pickCount) ? entry.pickCount : 1,
      options: options.map((o) => ({ value: o.name, name: o.name, text: typeof o.text === 'string' ? o.text : '' })),
      held: Object.fromEntries(options.filter((o) => held.has(o.name)).map((o) => [o.name, `Already has ${o.name}.`])),
    };
  }

  asList(entry.choice).forEach((c, i) => {
    const key = `${prefix}:${i}`;
    const label = `${name}: ${c.label ?? ''}`;
    const count = Number.isInteger(c.count) ? c.count : 1;
    if (c.type === 'skills' && Number.isInteger(c.ranks)) {
      out.allotments.push(allotment(key, name, { ...c, label }, skillIds(c.from)));
    } else if (c.type === 'skills') {
      out.picks.push(doublingChoice(key, name, { ...c, label }, count));
    } else if (c.type === 'proficiency' && [c.kind].flat().includes('mastery')) {
      out.picks.push({ key, source: name, label, count, mode: 'pick',
        options: (ctx.mastery ?? []).map((w) => ({ value: `mastery:${w.id}`, name: w.name })) });
    } else if (c.type === 'technique' && isObject(entry.initiate)) {
      const chosen = professionById(ctx.professions, entry.initiate.profession);
      const list = chosen?.pageName ?? entry.initiate.profession.replace(/^\w/, (x) => x.toUpperCase());
      const primes = hasPrimes(chosen);
      if (primes) out.pools.push({ key: `${key}:prime`, label: `${name}: Prime Techniques`, count: 2, minRank: 0, maxRank: 0, profession: list });
      const top = Math.max(1, initiateRank(ctx.profession, entry.initiate, ctx.level ?? 1));
      for (let rank = 1; rank <= top; rank += 1) {
        const count = rank === 1 && !primes ? 2 : 1;
        out.pools.push({ key: `${key}:rank:${rank}`, label: `${name}: Rank ${rank} ${count > 1 ? 'Techniques' : 'Technique'}`, count,
          minRank: rank, maxRank: rank, profession: list });
      }
    } else if (c.type === 'technique') {
      const ranks = Array.isArray(c.ranks) ? c.ranks.filter(Number.isInteger) : [];
      if (ranks.length) {
        for (const rank of ranks) {
          out.pools.push({ key: `${key}:rank:${rank}`, label: `${name}: Rank ${rank} Technique`, count: 1, minRank: rank, maxRank: rank });
        }
      } else {
        out.pools.push({ key, label, count, minRank: 1, maxRank: Number(levelRow(ctx.profession, ctx.level)?.maxTechRank) || 1 });
      }
    }
  });
  return out;
};

export const featOptionDone = (option, pick) => {
  if (!option) return true;
  const open = option.options.filter((o) => !option.held[o.value]).length;
  return names(pick).filter((p) => !option.held[p]).length >= Math.min(option.count, open);
};

export const initiateGrowth = ({ initiates = [], profession = null, professions = [] } = {}, from, to) =>
  initiates.flatMap((f) => {
    const before = initiateRank(profession, f.initiate, from);
    const after = initiateRank(profession, f.initiate, to);
    const list = professionById(professions, f.initiate?.profession)?.pageName
      ?? String(f.initiate?.profession ?? '').replace(/^\w/, (x) => x.toUpperCase());
    const out = [];
    for (let rank = before + 1; rank <= after; rank += 1) {
      out.push({ key: `initiate:${f.ref}:rank:${rank}`, label: `${f.name}: Rank ${rank} or Below`, count: 1,
        minRank: 1, maxRank: rank, profession: list });
    }
    return out;
  });

export const settleFeat = (app, id, prefix, optionPicks = {}) => {
  const rows = (app.sheet.features ?? []).filter((f) => String(f.source ?? '').startsWith(`feat:${id}:`));
  const feature = rows[rows.length - 1];
  if (!feature) return;
  const pick = optionPicks[prefix] ?? '';
  if (pick) feature.pick = pick;
};
