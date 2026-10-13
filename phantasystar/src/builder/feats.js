import { levelRow } from './techniques.js';
import { optionGrants } from './skills.js';
import { armorAdeptTraining } from '../rules/feats.js';
import { ARMOR_PROFICIENCY_IDS, ARTISAN_TOOL_IDS, VEHICLES } from '../rules/proficiencies.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const names = (value) => String(value ?? '').split('|').filter(Boolean);
const levelOf = (key) => parseInt(String(key).slice(6), 10);

export const featAllowed = (entryId) => /^ability_improvement(_\d+)?$/.test(String(entryId ?? ''));

export const normalizeRequires = (value) => {
  const r = isObject(value) ? value : {};
  return {
    level: Number.isInteger(r.level) ? r.level : 0,
    features: (Array.isArray(r.features) ? r.features : []).filter((id) => typeof id === 'string' && id),
    casts: r.casts === true,
    tp: r.tp === true,
    proficiencies: (Array.isArray(r.proficiencies) ? r.proficiencies : []).filter((p) => isObject(p) && p.kind),
    notSpecies: (Array.isArray(r.notSpecies) ? r.notSpecies : []).filter((id) => typeof id === 'string'),
    notFeature: typeof r.notFeature === 'string' ? r.notFeature : '',
  };
};

const SMALL_WORDS = { tp: 'TP' };
const title = (id) => String(id).split('_').map((w) => SMALL_WORDS[w] ?? w.replace(/^\w/, (c) => c.toUpperCase())).join(' ');

const proficiencyName = (p) => {
  if (p.kind === 'tool' && p.group === 'artisan') return 'an artisan\'s tool';
  if (p.kind === 'vehicle') return p.id ? `Vehicles (${VEHICLES.find((v) => v.id === p.id)?.name ?? title(p.id)})` : 'a vehicle';
  return p.id ? title(p.id) : `a ${p.kind}`;
};

const hasProficiency = (held, p) => {
  if (p.kind === 'tool' && p.group === 'artisan') return ARTISAN_TOOL_IDS.some((id) => held.has(`tool:${id}`));
  if (p.id) return held.has(`${p.kind}:${p.id}`);
  return [...held].some((key) => key.startsWith(`${p.kind}:`));
};

export const unmetRequirement = (requires, level, holds) => {
  const r = normalizeRequires(requires);
  if (r.level && level < r.level) return `Requires level ${r.level}.`;
  const feature = r.features.find((id) => !holds.features.has(id));
  if (feature) return `Requires the ${title(feature)} feature.`;
  if (r.casts && !holds.casts) return 'Requires the ability to cast techniques.';
  if (r.tp && !holds.tp) return 'Requires a TP maximum.';
  const proficiency = r.proficiencies.find((p) => !hasProficiency(holds.proficiencies, p));
  if (proficiency) return `Requires proficiency with ${proficiencyName(proficiency)}.`;
  if (r.notSpecies.includes(holds.species)) return 'Not available to your species.';
  if (r.notFeature && holds.features.has(r.notFeature)) return `Already has ${title(r.notFeature)}.`;
  return '';
};

const armorOf = (holds) => Object.fromEntries(ARMOR_PROFICIENCY_IDS.map((id) => [id, holds.proficiencies.has(`armor:${id}`)]));

const teachesTechniques = (feat) =>
  Object.values(feat?.features ?? {}).some((list) => Array.isArray(list) && list.some((e) => isObject(e) && e.initiate));

const featReason = (feat, slot, holds, slots, chosen) => {
  const payload = feat.payload ?? {};
  const why = unmetRequirement(payload.requires, slot.level, holds);
  if (why) return why;
  if (payload.armorStep && !armorAdeptTraining(armorOf(holds)).length) return 'Already trained with heavy armor and shields.';
  if (!payload.repeatable) {
    if (slots.some((s) => s.key !== slot.key && chosen[s.key] === feat.pageName)) return 'Taken at another level.';
    if (holds.taken.has(payload.id)) return 'Already taken.';
  }
  return '';
};

export const featBlocks = ({ slots = [], chosen = {}, feats = [], holdsAt }) => {
  const ordered = slots.filter((s) => s.feat).sort((a, b) => a.level - b.level);
  const gained = { proficiencies: new Set(), taken: new Set(), casts: false };
  const out = {};
  for (const slot of ordered) {
    const base = holdsAt(slot.level);
    const holds = {
      ...base,
      proficiencies: new Set([...base.proficiencies, ...gained.proficiencies]),
      taken: new Set([...base.taken, ...gained.taken]),
      casts: base.casts || gained.casts,
      tp: base.tp || gained.casts,
    };
    const blocked = {};
    for (const feat of feats) {
      const why = featReason(feat, slot, holds, ordered, chosen);
      if (why) blocked[feat.pageName] = why;
    }
    out[slot.key] = blocked;
    const pick = feats.find((f) => f.pageName === chosen[slot.key]);
    if (chosen[slot.key] && !pick) blocked[chosen[slot.key]] = chosen[slot.key] === FEAT_PENDING ? 'No feat chosen.' : 'Not in the compendium.';
    if (!pick || blocked[pick.pageName]) continue;
    const payload = pick.payload ?? {};
    gained.taken.add(payload.id);
    for (const p of payload.proficiencies ?? []) if (p?.kind && p?.id) gained.proficiencies.add(`${p.kind}:${p.id}`);
    if (payload.armorStep) for (const id of armorAdeptTraining(armorOf(holds))) gained.proficiencies.add(`armor:${id}`);
    if (teachesTechniques(pick)) gained.casts = true;
  }
  return out;
};

export const featSlotDone = (slot, chosen, blocks) => !!chosen[slot.key] && !blocks[slot.key]?.[chosen[slot.key]];

const featureIds = (option, level) =>
  Object.entries(option?.features ?? {})
    .filter(([key]) => /^level-\d+$/.test(key) && levelOf(key) <= level)
    .flatMap(([, list]) => (Array.isArray(list) ? list : []))
    .filter((e) => isObject(e) && typeof e.id === 'string')
    .map((e) => e.id);

const maxTpAt = (profession, level) => Number(levelRow(profession, level)?.maxTP) || 0;

export const draftHolds = (pages = {}, draft = {}, level = 1) => {
  const features = new Set();
  for (const kind of ['species', 'background', 'profession', 'path']) {
    for (const id of featureIds(pages[kind], kind === 'background' ? 1 : level)) features.add(id);
  }
  const proficiencies = new Set();
  for (const kind of ['species', 'background', 'profession', 'path']) {
    for (const p of pages[kind]?.payload?.proficiencies ?? []) if (p?.kind && p?.id) proficiencies.add(`${p.kind}:${p.id}`);
  }
  const picks = draft.skills?.picks ?? {};
  for (const value of [...Object.values(picks), ...Object.values(optionGrants(pages, picks))]) {
    for (const pick of names(value)) if (/^\w+:\w+$/.test(pick)) proficiencies.add(pick);
  }
  const tp = maxTpAt(pages.profession, level) > 0;
  return {
    features, proficiencies, tp,
    species: pages.species?.payload?.id ?? '',
    casts: tp || features.has('techniques'),
    taken: new Set(),
  };
};

export const proficiencyKeys = (proficiencies = {}) => {
  const out = new Set();
  for (const kind of ['armor', 'weapon', 'tool', 'vehicle']) {
    for (const [id, on] of Object.entries(proficiencies[kind] ?? {})) if (on) out.add(`${kind}:${id}`);
  }
  const custom = Array.isArray(proficiencies.custom) ? proficiencies.custom : Object.values(proficiencies.custom ?? {});
  for (const c of custom) if (c?.kind && c?.id) out.add(`${c.kind}:${c.id}`);
  return out;
};

export const sheetHolds = ({ features = [], proficiencies = {}, species = '', maxTP = 0, gained = [] } = {}) => {
  const ids = new Set([...features.map((f) => f?.ref).filter(Boolean), ...gained]);
  const taken = new Set(features
    .map((f) => /^feat:([^:]+):/.exec(String(f?.source ?? ''))?.[1])
    .filter(Boolean));
  const tp = Number(maxTP) > 0;
  return { features: ids, proficiencies: proficiencyKeys(proficiencies), species, tp, casts: tp || ids.has('techniques'), taken };
};

export const creationSlots = (pages = {}, level = 1) =>
  ['profession', 'path'].flatMap((kind) => {
    const option = pages[kind];
    if (!option) return [];
    return Object.entries(option.features ?? {})
      .filter(([key]) => /^level-\d+$/.test(key) && levelOf(key) <= level)
      .flatMap(([key, list]) => (Array.isArray(list) ? list : []).filter(isObject).flatMap((entry) =>
        (Array.isArray(entry.choice) ? entry.choice : entry.choice ? [entry.choice] : [])
          .filter((c) => isObject(c) && c.type === 'ability')
          .map((c, i) => ({
            key: `${kind}:${option.pageName}:${levelOf(key)}:${entry.id ?? entry.name}:${i}`,
            level: levelOf(key),
            name: entry.name,
            points: Number.isInteger(c.points) ? c.points : 1,
            feat: featAllowed(entry.id),
            from: Array.isArray(c.from) && c.from.length ? c.from : null,
          }))));
  }).sort((a, b) => a.level - b.level);

export const FEAT_PENDING = '*';

export const currentFeats = (draft = {}) => {
  const out = {};
  for (const [key, name] of Object.entries(draft.abilities?.feats ?? {})) {
    const [kind, pageName, level] = key.split(':');
    if (!name || !['profession', 'path'].includes(kind)) continue;
    if (draft[kind]?.pageName !== pageName || Number(level) > (draft.level ?? 1)) continue;
    out[key] = name;
  }
  return out;
};

export const featsBasis = (draft = {}) => JSON.stringify([
  draft.level, draft.species?.pageName ?? '', draft.background?.pageName ?? '', draft.profession?.pageName ?? '',
  draft.path?.pageName ?? '', currentFeats(draft), draft.skills?.picks ?? {}, draft.abilities?.featPicks ?? {},
]);

export const draftFeats = (draft = {}) =>
  Object.entries(currentFeats(draft))
    .filter(([, name]) => name !== FEAT_PENDING)
    .map(([key, name]) => ({ key, name, level: Number(key.split(':')[2]) || 0 }))
    .sort((a, b) => a.level - b.level)
    .map(({ key, name }) => ({ key, name }));
