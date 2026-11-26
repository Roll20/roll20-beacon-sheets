const int = (v) => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : null;
};

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const normalizeInitiate = (value) => {
  if (!isObject(value) || !isObject(value.byLevel)) return null;
  const byLevel = {};
  for (const [key, row] of Object.entries(value.byLevel)) {
    if (!/^lv\d+$/.test(key) || !isObject(row)) continue;
    byLevel[key] = { maxTechRank: int(row.maxTechRank), maxTP: int(row.maxTP), techBonus: int(row.techBonus) };
  }
  if (!Object.keys(byLevel).length) return null;
  return {
    profession: typeof value.profession === 'string' ? value.profession : '',
    techAbility: typeof value.techAbility === 'string' ? value.techAbility : '',
    byLevel,
  };
};

export const initiateNumbers = (features = [], level = 1) => {
  const list = Array.isArray(features) ? features : Object.values(features ?? {});
  const rows = list
    .map((f) => normalizeInitiate(f?.initiate))
    .filter(Boolean)
    .map((i) => {
      const keys = Object.keys(i.byLevel).sort((a, b) => int(a.slice(2)) - int(b.slice(2)));
      const at = keys.filter((k) => int(k.slice(2)) <= level).pop() ?? keys[0];
      return { techAbility: i.techAbility, ...i.byLevel[at] };
    });
  if (!rows.length) return null;
  const most = (key) => Math.max(...rows.map((r) => r[key] ?? 0));
  return {
    techAbility: rows[0].techAbility,
    maxTechRank: most('maxTechRank'),
    maxTP: most('maxTP'),
    techBonus: most('techBonus'),
  };
};

const ARMOR_ORDER = ['light_armor', 'medium_armor', 'heavy_armor'];

export const armorAdeptTraining = (armor = {}) => {
  const out = [];
  if (!armor.shields) out.push('shields');
  const next = ARMOR_ORDER.find((id) => !armor[id]);
  if (next) out.push(next);
  return next ? out : [];
};

export const featCopies = (features = [], id = '') =>
  features.filter((f) => String(f.source ?? '').startsWith(`feat:${id}:`));

export const featDrop = (features = [], mapped = {}, { armor = {} } = {}) => {
  const copies = featCopies(features, mapped.id);
  if (copies.length && !mapped.repeatable) {
    return { mode: 'refresh', rows: mapped.features, resources: mapped.resources, armor: [] };
  }
  const training = mapped.armorStep ? armorAdeptTraining(armor) : [];
  if (mapped.armorStep && !training.length) {
    return { refuse: `${mapped.name}: already trained with heavy armor and shields.` };
  }
  let rows = mapped.features;
  let resources = mapped.resources;
  rows = rows.map((row) => {
    if (!row.extraUseOf) return row;
    const { extraUseOf, ...rest } = row;
    if (features.some((f) => f.ref === extraUseOf)) {
      resources = resources.filter((r) => r.ref !== row.ref);
      return { ...rest, roll: null, addUses: { ref: extraUseOf, count: 1 } };
    }
    resources = resources.map((r) => (r.ref === row.ref ? { ...r, ref: extraUseOf } : r));
    return { ...rest, ref: extraUseOf };
  });
  return { mode: copies.length ? 'again' : 'add', rows, resources, armor: training };
};

export const extraUsesFor = (feature, features = []) => {
  const ref = feature?.ref;
  if (!ref) return 0;
  return features
    .filter((f) => f.addUses?.ref === ref)
    .reduce((n, f) => n + Math.max(0, int(f.addUses.count) ?? 0), 0);
};

export const normalizeAddUses = (value) =>
  isObject(value) && typeof value.ref === 'string' && value.ref
    ? { ref: value.ref, count: Math.max(1, int(value.count) ?? 1) }
    : null;
