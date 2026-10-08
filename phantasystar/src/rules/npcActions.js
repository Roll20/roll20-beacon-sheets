import { arrayToObject, objectToArray } from '../utility/objectify.js';

const int = (v, fallback = 0) => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export const AT_WILL = 'at_will';
export const TECHNIQUE_USES = [AT_WILL, 1, 2, 3, 4, 5];

export const techniqueUsesLabel = (uses) =>
  uses === AT_WILL ? 'At Will' : `${int(uses, 1)}/Day Each`;

const normalizeUses = (uses) => {
  if (uses === AT_WILL) return AT_WILL;
  const n = int(uses, 0);
  return n > 0 ? n : AT_WILL;
};

export const slugId = (name) =>
  str(name).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export const normalizeEntry = (row = {}) => ({
  ...(row._id ? { _id: row._id } : {}),
  name: str(row.name),
  text: str(row.text),
  isAttack: !!row.isAttack,
  attackPower: row.attackPower ?? '',
  range: str(row.range),
  damage: str(row.damage),
  damageType: str(row.damageType),
  cost: Math.max(1, int(row.cost, 1)),
  technique: str(row.technique),
});

export const normalizeLegendary = (value = {}) => ({
  enabled: !!value?.enabled,
  uses: Math.max(0, int(value?.uses, 3)),
  used: Math.max(0, int(value?.used, 0)),
  text: str(value?.text),
  actions: (Array.isArray(value?.actions) ? value.actions : []).map(normalizeEntry),
});

export const normalizeBoss = (value = {}) => ({
  enabled: !!value?.enabled,
  uses: Math.max(0, int(value?.uses, 0)),
  used: Math.max(0, int(value?.used, 0)),
  enraged: !!value?.enraged,
  text: str(value?.text),
  actions: (Array.isArray(value?.actions) ? value.actions : []).map(normalizeEntry),
});

export const bossUses = (boss = {}) => Math.max(0, int(boss.uses)) + (boss.enraged ? 1 : 0);

export const spendUses = (used, total, cost = 1) => {
  const next = int(used) + Math.max(1, int(cost, 1));
  return next > int(total) ? null : next;
};

export const normalizeCreatureTechnique = (row = {}) => ({
  ...(row._id ? { _id: row._id } : {}),
  id: str(row.id) || slugId(row.name),
  name: str(row.name),
  rank: row.rank === '' || row.rank == null ? '' : int(row.rank, 0),
  note: str(row.note),
  castingTime: str(row.castingTime),
  range: str(row.range),
  duration: str(row.duration),
  attack: !!row.attack,
  saveAbility: str(row.saveAbility),
  saveEffect: str(row.saveEffect),
  damage: str(row.damage),
  damageType: str(row.damageType),
  healing: str(row.healing),
  text: Array.isArray(row.text) ? row.text.filter((p) => typeof p === 'string').join('\n\n') : str(row.text),
  used: Math.max(0, int(row.used, 0)),
});

export const normalizeTechniqueGroup = (row = {}) => ({
  ...(row._id ? { _id: row._id } : {}),
  uses: normalizeUses(row.uses),
  list: (Array.isArray(row.list) ? row.list : []).map(normalizeCreatureTechnique),
});

export const normalizeCreatureTechniques = (value = {}) => ({
  enabled: !!value?.enabled,
  ability: str(value?.ability),
  attack: value?.attack ?? '',
  saveDC: value?.saveDC ?? '',
  note: str(value?.note),
  groups: (Array.isArray(value?.groups) ? value.groups : []).map(normalizeTechniqueGroup),
  extra: (Array.isArray(value?.extra) ? value.extra : []).map(normalizeCreatureTechnique),
});

export const allCreatureTechniques = (techniques = {}) => [
  ...(techniques.groups ?? []).flatMap((g) => g.list ?? []),
  ...(techniques.extra ?? []),
];

export const findCreatureTechnique = (techniques, id) =>
  (id && allCreatureTechniques(techniques).find((t) => t.id === id)) || null;

export const castsLeft = (group, technique) =>
  group?.uses === AT_WILL ? Infinity : Math.max(0, int(group?.uses) - int(technique?.used));

const toStoredList = (list = [], makeId) =>
  arrayToObject(list.map((item) => (item._id ? item : { ...item, _id: makeId() })));

const fromStoredList = (stored) =>
  Array.isArray(stored) ? stored : objectToArray(stored);

export const storeActionBlock = (block, makeId) => ({
  ...block,
  actions: toStoredList(block.actions, makeId),
});

export const loadActionBlock = (stored, normalize) =>
  normalize({ ...(stored ?? {}), actions: fromStoredList(stored?.actions) });

export const storeCreatureTechniques = (block, makeId) => ({
  ...block,
  groups: toStoredList(
    block.groups.map((g) => ({ ...g, list: toStoredList(g.list, makeId) })),
    makeId,
  ),
  extra: toStoredList(block.extra, makeId),
});

export const loadCreatureTechniques = (stored) =>
  normalizeCreatureTechniques({
    ...(stored ?? {}),
    groups: fromStoredList(stored?.groups).map((g) => ({ ...g, list: fromStoredList(g?.list) })),
    extra: fromStoredList(stored?.extra),
  });
