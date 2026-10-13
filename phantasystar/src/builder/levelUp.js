import { featuresOf, choicesOf, pathLevelOf } from './choices.js';
import { ABILITY_IDS, IMPROVED_CAP } from './abilities.js';
import {
  levelRanks, overflowAllotment, allotmentSpent, placedIn, proficiencyOptions, keyCurrent, countAt, doublingChoice,
} from './skills.js';
import { levelRow, eligibleFor } from './techniques.js';
import { featAllowed, featBlocks, sheetHolds, FEAT_PENDING } from './feats.js';
import { featChoices, featOptionDone, featPrefix, initiateGrowth, parseFeatKey, settleFeat } from './featChoices.js';
import { SKILLS, SKILL_IDS } from '../rules/skills.js';
import { maxSkillRank } from '../rules/progression.js';
import { averageHpPerLevel } from '../rules/derived.js';

export const MAX_LEVEL = 20;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asList = (choice) => (Array.isArray(choice) ? choice : choice ? [choice] : []).filter(isObject);
const names = (value) => String(value ?? '').split('|').filter(Boolean);
const sum = (map) => Object.values(map).reduce((a, b) => a + b, 0);
const levelOf = (key) => parseInt(String(key).slice(6), 10);

export const emptyLevelUp = (from = 1) => ({
  from,
  to: Math.min(MAX_LEVEL, from + 1),
  hp: { method: 'average', rolled: '' },
  choices: {},
  path: '',
  skills: { ranks: {}, picks: {} },
  techniques: { picks: {} },
  improvements: {},
});

const text = (value) => String(value ?? '');
const stringMap = (value) => Object.fromEntries(Object.entries(isObject(value) ? value : {})
  .map(([k, v]) => [k, text(v)]).filter(([, v]) => v !== ''));

export const normalizeLevelUp = (stored) => {
  if (!isObject(stored)) return null;
  const from = Math.trunc(Number(stored.from));
  if (!(from >= 1 && from < MAX_LEVEL)) return null;
  const to = Math.min(MAX_LEVEL, Math.max(from + 1, Math.trunc(Number(stored.to)) || from + 1));
  const ranks = Object.fromEntries(Object.entries(isObject(stored.skills?.ranks) ? stored.skills.ranks : {})
    .map(([key, placed]) => [key, Object.fromEntries(Object.entries(isObject(placed) ? placed : {})
      .map(([id, n]) => [id, Number(n)]).filter(([, n]) => Number.isInteger(n) && n > 0))])
    .filter(([, placed]) => Object.keys(placed).length));
  const improvements = Object.fromEntries(Object.entries(isObject(stored.improvements) ? stored.improvements : {})
    .filter(([, c]) => isObject(c) && ['ability', 'feat'].includes(c.kind))
    .map(([key, c]) => [key, c.kind === 'ability'
      ? { kind: 'ability', ability: text(c.ability) }
      : { kind: 'feat', feat: text(c.feat), pick: text(c.pick) }]));
  return {
    from,
    to,
    hp: { method: stored.hp?.method === 'roll' ? 'roll' : 'average', rolled: text(stored.hp?.rolled) },
    choices: stringMap(stored.choices),
    path: text(stored.path),
    skills: { ranks, picks: stringMap(stored.skills?.picks) },
    techniques: { picks: stringMap(stored.techniques?.picks) },
    improvements,
  };
};

export const levelUpStarted = (lu) =>
  !!lu && (lu.to > lu.from + 1 || !!lu.path || lu.hp?.method === 'roll' || !!lu.hp?.rolled
    || [lu.choices, lu.skills?.ranks, lu.skills?.picks, lu.techniques?.picks, lu.improvements]
      .some((m) => Object.keys(m ?? {}).length > 0));

export const newLevels = (lu) => Array.from({ length: Math.max(0, lu.to - lu.from) }, (_, i) => lu.from + 1 + i);
const inRange = (level, lu) => level > lu.from && level <= lu.to;

export const pathWanted = (ctx, lu) => {
  const at = pathLevelOf(ctx.profession);
  return at != null && lu.to >= at && !ctx.pathName;
};

export const pathOption = (ctx, lu, paths = []) =>
  ctx.pathName ? ctx.path : (pathWanted(ctx, lu) ? paths.find((p) => p.pageName === lu.path) ?? null : null);

const sources = (ctx, lu, paths) => {
  const out = [];
  if (ctx.profession) out.push({ kind: 'profession', option: ctx.profession, after: lu.from });
  const path = pathOption(ctx, lu, paths);
  if (path) out.push({ kind: 'path', option: path, after: ctx.pathName ? lu.from : 0 });
  return out;
};

const entriesIn = ({ option, after }, lu) =>
  Object.entries(option?.features ?? {})
    .filter(([key]) => /^level-\d+$/.test(key) && levelOf(key) > after && levelOf(key) <= lu.to)
    .flatMap(([key, list]) => (Array.isArray(list) ? list : []).filter(isObject).map((entry) => ({ level: levelOf(key), entry })));

export const gainedFeatures = (ctx, lu, paths = []) =>
  sources(ctx, lu, paths).flatMap((s) => featuresOf(s.option, lu.to)
    .filter((f) => f.level > s.after)
    .map((f) => ({ source: s.kind, level: f.level, id: f.id, name: f.name, text: f.text })))
    .sort((a, b) => a.level - b.level);

export const levelUpChoices = (ctx, lu, paths = []) => {
  const out = [];
  if (pathWanted(ctx, lu)) {
    const options = paths.filter((p) => {
      const id = ctx.profession?.payload?.id;
      return (id && p.payload?.profession === id) || (ctx.profession?.payload?.paths ?? []).includes(p.payload?.id);
    });
    out.push({ key: 'path', source: 'profession', ref: '', level: pathLevelOf(ctx.profession), label: 'Path', count: 1,
      options: options.map((p) => ({ value: p.pageName, name: p.pageName, text: '' })) });
  }
  for (const s of sources(ctx, lu, paths)) {
    const levels = Object.fromEntries(featuresOf(s.option, lu.to).map((f) => [f.id, f.level]));
    for (const c of choicesOf(s.option, lu.to).now) {
      const [, ref, asked = ''] = c.key.split(':');
      const level = levels[ref];
      if (!level || level <= s.after) continue;
      out.push({ ...c, key: `${s.kind}:${c.key}`, source: s.kind, ref, asked, level });
    }
  }
  return out.sort((a, b) => a.level - b.level);
};

export const improvementSlots = (ctx, lu, paths = []) =>
  sources(ctx, lu, paths).flatMap((s) => entriesIn(s, lu).flatMap(({ level, entry }) =>
    asList(entry.choice).filter((c) => c.type === 'ability').map((c, i) => ({
      key: `${s.kind}:${level}:${entry.id ?? entry.name}:${i}`,
      level,
      name: entry.name,
      points: Number.isInteger(c.points) ? c.points : 1,
      feat: featAllowed(entry.id),
      from: Array.isArray(c.from) && c.from.length ? c.from : null,
    }))))
    .sort((a, b) => a.level - b.level);

export const improvementBlocks = (ctx, lu, paths = []) => {
  const slots = improvementSlots(ctx, lu, paths);
  const chosen = Object.fromEntries(slots
    .filter((s) => s.feat && lu.improvements?.[s.key]?.kind === 'feat')
    .map((s) => [s.key, lu.improvements[s.key].feat || FEAT_PENDING]));
  return featBlocks({
    slots,
    chosen,
    feats: ctx.feats ?? [],
    holdsAt: (level) => sheetHolds({
      ...ctx.holds,
      maxTP: Math.max(Number(ctx.holds?.maxTP) || 0, Number(levelRow(ctx.profession, level)?.maxTP) || 0),
      gained: gainedFeatures(ctx, { ...lu, to: level }, paths).map((f) => f.id),
    }),
  });
};

export const improvementDone = (choice, blocked = {}, slot = null) =>
  (choice?.kind === 'ability' && ABILITY_IDS.includes(choice.ability) && (!slot?.from || slot.from.includes(choice.ability)))
  || (choice?.kind === 'feat' && !!choice.feat && !blocked[choice.feat]);

export const levelUpFeats = (ctx, lu, paths = []) => {
  const blocks = improvementBlocks(ctx, lu, paths);
  const fctx = { level: lu.to, profession: ctx.profession, professions: ctx.professions ?? [],
    mastery: ctx.mastery ?? [], held: new Set(ctx.held ?? []) };
  return improvementSlots(ctx, lu, paths).flatMap((slot) => {
    const c = lu.improvements?.[slot.key];
    if (!slot.feat || c?.kind !== 'feat' || !c.feat || blocks[slot.key]?.[c.feat]) return [];
    const option = (ctx.feats ?? []).find((f) => f.pageName === c.feat);
    return option ? [{ slotKey: slot.key, option, choices: featChoices(option, slot.key, fctx) }] : [];
  });
};

export const featOptionsDone = (ctx, lu, paths = []) =>
  levelUpFeats(ctx, lu, paths).every((f) => featOptionDone(f.choices.option, lu.improvements[f.slotKey]?.pick));

export const abilitiesAfter = (ctx, lu, paths = []) => {
  const out = Object.fromEntries(ABILITY_IDS.map((id) => [id, Number(ctx.abilities?.[id]) || 0]));
  for (const slot of improvementSlots(ctx, lu, paths)) {
    const c = lu.improvements?.[slot.key];
    if (c?.kind !== 'ability' || !(c.ability in out) || (slot.from && !slot.from.includes(c.ability))) continue;
    out[c.ability] = Math.min(IMPROVED_CAP, out[c.ability] + slot.points);
  }
  return out;
};

export const hpRolls = (lu) => String(lu.hp?.rolled ?? '').split('|').map(Number).filter((n) => Number.isInteger(n) && n >= 1);

export const hpGain = (ctx, lu, paths = []) => {
  const hitDie = ctx.profession?.payload?.professionStats?.hitDie ?? null;
  const con = abilitiesAfter(ctx, lu, paths).constitution;
  const perLevel = Number(ctx.species?.payload?.hpPerLevel) || 0;
  const rolls = hpRolls(lu);
  const levels = newLevels(lu).map((level, i) => {
    const die = lu.hp?.method === 'roll' ? rolls[i] ?? null : null;
    const base = lu.hp?.method === 'roll' ? (die == null ? null : Math.max(1, die + con)) : averageHpPerLevel(hitDie, con);
    return { level, die, value: base == null ? null : base + perLevel };
  });
  const flat = sources(ctx, lu, paths)
    .flatMap((s) => entriesIn(s, lu))
    .reduce((n, { entry }) => n + (Number.isInteger(entry.maxHp) ? entry.maxHp : 0), 0);
  const conRise = con - (Number(ctx.abilities?.constitution) || 0);
  const earlier = conRise > 0 ? conRise * lu.from : 0;
  const ready = !!hitDie && levels.every((l) => l.value != null);
  return {
    hitDie, levels, flat, earlier, ready,
    total: ready ? levels.reduce((n, l) => n + l.value, 0) + flat + earlier : null,
  };
};

const skillIds = (from) => (Array.isArray(from) ? from.filter((id) => SKILL_IDS.includes(id)) : null);

const allotment = (key, source, choice, from) => {
  const ranks = Number.isInteger(choice.ranks) ? choice.ranks : 1;
  const count = Number.isInteger(choice.count) ? choice.count : 1;
  return ranks > 1
    ? { key, source, label: choice.label ?? '', mode: 'pick', count, ranks, total: count * ranks, from }
    : { key, source, label: choice.label ?? '', mode: 'points', count, ranks: 1, total: count, from };
};

export const levelUpAllotments = (ctx, lu, paths = []) => {
  const out = [];
  const perLevel = levelRanks(lu.to) - levelRanks(lu.from);
  if (perLevel > 0) {
    out.push({ key: 'level', source: lu.to - lu.from > 1 ? `Levels ${lu.from + 1}–${lu.to}` : `Level ${lu.to}`,
      label: 'A rank a level, 3 at levels 5, 11 and 17', mode: 'points', count: perLevel, ranks: 1, total: perLevel, from: null });
  }
  const professionFrom = skillIds(ctx.profession?.payload?.skillChoice?.from);
  for (const s of sources(ctx, lu, paths)) {
    for (const { entry } of entriesIn(s, lu)) {
      asList(entry.choice).forEach((c, i) => {
        if (c.type !== 'skills' || !Number.isInteger(c.ranks)) return;
        out.push(allotment(`${s.kind}:${s.option.pageName}:${entry.id}:${i}`, s.option.pageName,
          { ...c, label: `${entry.name}: ${c.label ?? ''}` }, skillIds(c.from) ?? (s.kind === 'profession' ? professionFrom : null)));
      });
    }
  }
  for (const f of levelUpFeats(ctx, lu, paths)) out.push(...f.choices.allotments);
  return out.flatMap((a) => {
    const over = overflowAllotment(a, lu.skills);
    return over ? [a, over] : [a];
  });
};

export const levelUpSkillRows = (ctx, lu, allotments = []) => {
  const placed = Object.fromEntries(SKILL_IDS.map((id) => [id, 0]));
  for (const a of allotments) for (const [id, n] of Object.entries(placedIn(lu.skills, a.key))) if (id in placed) placed[id] += n;
  const cap = maxSkillRank(lu.to);
  return SKILLS.map((s) => {
    const before = Number(ctx.skills?.[s.id]) || 0;
    const total = before + placed[s.id];
    return { id: s.id, name: s.name, ability: s.ability, before, placed: placed[s.id], total, cap, overCap: total > cap,
      doubled: (ctx.doubled ?? []).includes(s.id) };
  });
};

export const levelUpProficiencies = (ctx, lu, paths = []) => {
  const out = [];
  for (const s of sources(ctx, lu, paths)) {
    for (const f of featuresOf(s.option, lu.from)) {
      if (f.level <= s.after) {
        asList(f.entry.choice).forEach((c, i) => {
          if (c.type !== 'skills' || Number.isInteger(c.ranks)) return;
          const more = countAt(c, lu.to) - countAt(c, lu.from);
          if (more > 0) {
            out.push(doublingChoice(`${s.kind}:${s.option.pageName}:${f.id}:${i}:to${lu.to}`, s.option.pageName,
              { ...c, label: `${f.name}: ${c.label ?? ''}` }, more));
          }
        });
      }
    }
    for (const { entry } of entriesIn(s, lu)) {
      asList(entry.choice).forEach((c, i) => {
        if (c.type === 'skills' && !Number.isInteger(c.ranks)) {
          out.push(doublingChoice(`${s.kind}:${s.option.pageName}:${entry.id}:${i}`, s.option.pageName,
            { ...c, label: `${entry.name}: ${c.label ?? ''}` }, countAt(c, lu.to)));
          return;
        }
        if (c.type !== 'proficiency') return;
        const kinds = Array.isArray(c.kind) ? c.kind : [c.kind];
        const options = kinds.includes('mastery')
          ? (ctx.mastery ?? []).map((w) => ({ value: `mastery:${w.id}`, name: w.name }))
          : proficiencyOptions(c).map((p) => ({ value: `${p.kind}:${p.id}`, name: p.name }));
        out.push({ key: `${s.kind}:${s.option.pageName}:${entry.id}:${i}`, source: s.option.pageName,
          label: `${entry.name}: ${c.label ?? ''}`, count: Number.isInteger(c.count) ? c.count : 1, options });
      });
    }
  }
  for (const f of levelUpFeats(ctx, lu, paths)) out.push(...f.choices.picks);
  return out;
};

export const skillsDone = (ctx, lu, paths = []) =>
  levelUpAllotments(ctx, lu, paths).every((a) => allotmentSpent(a, lu.skills) === a.total)
  && levelUpProficiencies(ctx, lu, paths).filter((c) => c.options.length)
    .every((c) => names(lu.skills.picks?.[c.key]).length >= Math.min(c.count, c.options.length));

const counted = (known, low, high) => known.filter((t) => t.countsAsKnown !== false && t.rank >= low && t.rank <= high).length;

export const levelUpPools = (ctx, lu, paths = []) => {
  const feats = [
    ...levelUpFeats(ctx, lu, paths).flatMap((f) => f.choices.pools),
    ...initiateGrowth(ctx, lu.from, lu.to),
  ];
  const row = levelRow(ctx.profession, lu.to);
  if (!row) return feats;
  const known = ctx.known ?? [];
  const pools = [];
  const primes = Number(row.columns?.prime_techniques?.value) || 0;
  const primeLeft = primes - counted(known, 0, 0);
  if (primeLeft > 0) pools.push({ key: 'level:prime', label: 'Prime Techniques', count: primeLeft, minRank: 0, maxRank: 0 });
  const knownLeft = (row.techniquesKnown ?? 0) - counted(known, 1, 5);
  if (knownLeft > 0) {
    pools.push({ key: 'level:known', label: 'Techniques', count: knownLeft, minRank: 1, maxRank: row.maxTechRank ?? 1 });
  }
  for (let rank = 6; rank <= (row.advancedRank ?? 0); rank += 1) {
    if (!known.some((t) => t.rank === rank)) {
      pools.push({ key: `level:advanced:${rank}`, label: `Advanced Technique (Rank ${rank})`, count: 1, minRank: rank, maxRank: rank });
    }
  }
  for (const s of sources(ctx, lu, paths)) {
    for (const { entry } of entriesIn(s, lu)) {
      asList(entry.choice).forEach((c, i) => {
        if (c.type !== 'technique') return;
        pools.push({ key: `${s.kind}:${s.option.pageName}:${entry.id}:${i}`, label: `${entry.name}: ${c.label ?? ''}`,
          count: Number.isInteger(c.count) ? c.count : 1, minRank: 1,
          maxRank: Number.isInteger(c.maxRank) ? c.maxRank : row.maxTechRank ?? 1 });
      });
    }
  }
  return [...pools, ...feats];
};

export const levelUpEligible = (ctx, pool, techniques, { showAll = false } = {}) => {
  const known = new Set((ctx.known ?? []).map((t) => t.name));
  return eligibleFor(pool, techniques, { profession: ctx.profession?.pageName ?? '', showAll }).filter((t) => !known.has(t.name));
};

export const techniquesDone = (ctx, lu, techniques = [], paths = []) =>
  levelUpPools(ctx, lu, paths)
    .every((p) => names(lu.techniques.picks?.[p.key]).length >= Math.min(p.count, levelUpEligible(ctx, p, techniques).length));

export const levelUpSteps = (ctx, lu, techniques = [], paths = []) => [
  { id: 'levels', label: 'Levels', title: 'Gain Levels',
    done: () => hpGain(ctx, lu, paths).ready
      && levelUpChoices(ctx, lu, paths).every((c) => (c.key === 'path' ? !!lu.path : names(lu.choices[c.key]).length >= Math.min(c.count, c.options.length))) },
  { id: 'abilities', label: 'Abilities', title: 'Ability Improvements',
    show: improvementSlots(ctx, lu, paths).length > 0,
    done: () => {
      const blocks = improvementBlocks(ctx, lu, paths);
      return improvementSlots(ctx, lu, paths).every((s) => improvementDone(lu.improvements[s.key], blocks[s.key], s))
        && featOptionsDone(ctx, lu, paths);
    } },
  { id: 'skills', label: 'Skills', title: 'Assign Skill Ranks',
    show: levelUpAllotments(ctx, lu, paths).length > 0 || levelUpProficiencies(ctx, lu, paths).length > 0,
    done: () => skillsDone(ctx, lu, paths) },
  { id: 'techniques', label: 'Techniques', title: 'Choose Techniques',
    show: levelUpPools(ctx, lu, paths).length > 0,
    done: () => techniquesDone(ctx, lu, techniques, paths) },
].filter((s) => s.show !== false);

const keyHeld = (ctx, lu, paths, key) => {
  if (key.startsWith('level') || key.startsWith('initiate:')) return true;
  const feat = parseFeatKey(key);
  if (feat) return levelUpFeats(ctx, lu, paths).some((f) => f.slotKey === feat.slotKey && f.option.pageName === feat.name);
  const path = pathOption(ctx, lu, paths);
  return keyCurrent({ profession: ctx.profession, path }, key);
};

export const applyLevelUp = async ({ ctx, lu, paths = [], app, fetchPage, hasLevelRow = () => true }) => {
  const applied = [];
  const failed = [];
  const fetchKind = async (pointer, kind) => {
    try {
      const read = await fetchPage(pointer);
      if (read?.ok && read.kind === kind) return read.mapped;
      failed.push({ step: kind, error: read?.error ?? `Couldn't fetch ${pointer.pageName}.` });
    } catch (error) {
      failed.push({ step: kind, error: `Couldn't fetch ${pointer.pageName}: ${error?.message ?? error}` });
    }
    return null;
  };
  const sheet = app.sheet;
  const tpBefore = Number(sheet.maxTP);

  if (!hasLevelRow(lu.to) && ctx.profession) {
    const mapped = await fetchKind({ pageName: ctx.profession.pageName, categoryName: 'Professions', expansionId: ctx.profession.expansionId }, 'profession');
    if (mapped) app.applyProfession(mapped, { refresh: true });
  }
  sheet.level = lu.to;
  applied.push('level');

  const path = pathWanted(ctx, lu) ? pathOption(ctx, lu, paths) : null;
  if (path) {
    const mapped = await fetchKind({ pageName: path.pageName, categoryName: 'Paths', expansionId: path.expansionId }, 'path');
    if (mapped) {
      app.applyPath(mapped);
      applied.push('path');
    }
  }

  const pathId = path?.payload?.id ?? sheet.professionStats?.pathId ?? '';
  for (const c of levelUpChoices(ctx, lu, paths)) {
    if (c.key === 'path') continue;
    const pick = names(lu.choices[c.key]).join('|');
    if (!pick) continue;
    const prefix = c.source === 'path' ? `path:${pathId}:` : `profession:${ctx.profession?.payload?.id ?? ''}:`;
    const feature = (sheet.features ?? []).find((f) => f.ref === c.ref && String(f.source ?? '').startsWith(prefix));
    if (!feature) continue;
    if (!c.asked) feature.pick = pick;
    else feature.text = [feature.text, `${c.label.split(': ').pop()}: ${pick.split('|').join(', ')}`].filter(Boolean).join('\n\n');
  }

  const after = abilitiesAfter(ctx, lu, paths);
  for (const id of ABILITY_IDS) if (after[id] !== (Number(ctx.abilities?.[id]) || 0)) sheet.abilities[id] = after[id];
  for (const slot of improvementSlots(ctx, lu, paths)) {
    const c = lu.improvements?.[slot.key];
    if (!slot.feat || c?.kind !== 'feat' || !c.feat) continue;
    const mapped = await fetchKind({ pageName: c.feat, categoryName: 'Feats', expansionId: '' }, 'feat');
    if (!mapped) continue;
    const plan = app.applyFeat(mapped);
    if (plan?.refuse) {
      failed.push({ step: 'abilities', error: plan.refuse });
      continue;
    }
    applied.push('feat');
    const prefix = featPrefix(slot.key, c.feat);
    settleFeat(app, mapped.id, prefix, { [prefix]: c.pick ?? '' });
  }

  const hp = hpGain(ctx, lu, paths);
  if (hp.total != null) {
    sheet.hp.max = (Number(sheet.hp.max) || 0) + hp.total;
    sheet.hp.current = (Number(sheet.hp.current) || 0) + hp.total;
    applied.push('hp');
  } else {
    failed.push({ step: 'levels', error: 'Max HP needs every new level\'s hit die rolled.' });
  }

  const cap = maxSkillRank(lu.to);
  for (const [key, ranks] of Object.entries(lu.skills?.ranks ?? {})) {
    if (!keyHeld(ctx, lu, paths, key)) continue;
    for (const [id, n] of Object.entries(ranks)) {
      const skill = sheet.skills?.[id];
      if (skill && n > 0) skill.ranks = Math.min(cap, (Number(skill.ranks) || 0) + n);
    }
  }
  for (const [key, value] of Object.entries(lu.skills?.picks ?? {})) {
    if (!keyHeld(ctx, lu, paths, key)) continue;
    for (const pick of names(value)) {
      const [kind, id] = pick.split(':');
      if (kind === 'mastery') {
        if (id in (sheet.proficiencies?.mastery ?? {})) sheet.proficiencies.mastery[id] = true;
      } else if (kind === 'skill') {
        if (sheet.skills?.[id]) sheet.skills[id].doubled = true;
      } else if (['tool', 'vehicle', 'weapon'].includes(kind)) sheet.addProficiency(kind, { id });
    }
  }
  if (Object.keys(lu.skills?.ranks ?? {}).length || Object.keys(lu.skills?.picks ?? {}).length) applied.push('skills');

  const pools = new Set(levelUpPools(ctx, lu, paths).map((p) => p.key));
  for (const [key, value] of Object.entries(lu.techniques?.picks ?? {})) {
    if (!pools.has(key)) continue;
    for (const name of names(value)) {
      const mapped = await fetchKind({ pageName: name, categoryName: 'Techniques', expansionId: '' }, 'technique');
      if (mapped) {
        app.techniques.importTechnique(mapped);
        applied.push('techniques');
      }
    }
  }

  const tpRise = Number(sheet.maxTP) - tpBefore;
  if (Number.isFinite(tpRise) && tpRise > 0 && sheet.tp) {
    sheet.tp.current = (Number(sheet.tp.current) || 0) + tpRise;
    applied.push('tp');
  }

  return { applied: [...new Set(applied)], failed };
};
