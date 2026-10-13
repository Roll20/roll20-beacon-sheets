export const ABILITY_IDS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

export const METHOD_A_VALUES = [2, 2, 1, 1, 0, -1];
export const POINTS = 7;
export const FLOOR = -1;
export const CREATION_CAP = 3;
export const IMPROVED_CAP = 5;

export const METHODS = [
  { id: 'values', label: 'Assign Values' },
  { id: 'points', label: 'Assign Points' },
  { id: 'roll', label: 'Roll' },
];

export const rolledValue = (face) => (face <= 2 ? -1 : face <= 4 ? 0 : face <= 7 ? 1 : 2);

const int = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

export const rolledFaces = (abilities) =>
  String(abilities?.rolled ?? '').split('|').map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 10);

export const poolOf = (abilities) => {
  if (abilities?.method === 'values') return [...METHOD_A_VALUES];
  if (abilities?.method === 'roll') {
    const faces = rolledFaces(abilities);
    return faces.length === 6 ? faces.map(rolledValue) : [];
  }
  return null;
};

export const poolLeft = (abilities) => {
  const pool = poolOf(abilities);
  if (!pool) return null;
  const left = [...pool];
  for (const id of ABILITY_IDS) {
    const v = int(abilities.values?.[id]);
    const at = v == null ? -1 : left.indexOf(v);
    if (at >= 0) left.splice(at, 1);
  }
  return left;
};

export const pointsLeft = (abilities) => {
  const values = ABILITY_IDS.map((id) => int(abilities?.values?.[id]) ?? 0);
  const dropped = values.filter((v) => v < 0).length;
  return POINTS + dropped - values.reduce((sum, v) => sum + Math.max(v, 0), 0);
};

export const pointAllowed = (abilities, id, value) => {
  if (value < FLOOR || value > CREATION_CAP) return false;
  const next = { ...abilities, values: { ...abilities.values, [id]: value } };
  const dropped = ABILITY_IDS.filter((a) => (int(next.values[a]) ?? 0) < 0).length;
  return dropped <= 1 && pointsLeft(next) >= 0;
};

export const bonusShape = (abilities) =>
  abilities?.bonusMode === 'one' ? { count: 1, amount: 2 } : { count: 2, amount: 1 };

const total = (map) => ABILITY_IDS.reduce((sum, id) => sum + (int(map?.[id]) ?? 0), 0);

export const improvementPoints = (later = []) =>
  later.filter((c) => c.step === 'abilities').reduce((sum, c) => sum + (Number.isInteger(c.points) ? c.points : 1), 0);

export const currentLimited = (draft = {}) => {
  const out = {};
  for (const [key, ability] of Object.entries(draft.abilities?.limited ?? {})) {
    const [kind, pageName, level] = key.split(':');
    if (!ABILITY_IDS.includes(ability) || !['profession', 'path'].includes(kind)) continue;
    if (draft[kind]?.pageName !== pageName || Number(level) > (draft.level ?? 1)) continue;
    out[key] = ability;
  }
  return out;
};

export const limitedIncrease = (draft = {}) => {
  const out = {};
  for (const ability of Object.values(currentLimited(draft))) out[ability] = (out[ability] ?? 0) + 1;
  return out;
};

export const abilityRows = (abilities, extra = {}) =>
  ABILITY_IDS.map((id) => {
    const base = int(abilities?.values?.[id]);
    const bonus = int(abilities?.bonuses?.[id]) ?? 0;
    const improvement = (int(abilities?.improvements?.[id]) ?? 0) + (int(extra[id]) ?? 0);
    const created = (base ?? 0) + bonus;
    return {
      id, base, bonus, improvement,
      total: base == null ? null : created + improvement,
      overCap: created > CREATION_CAP || created + improvement > IMPROVED_CAP,
    };
  });

export const finalAbilities = (abilities, extra = {}) =>
  Object.fromEntries(abilityRows(abilities, extra).filter((r) => r.total != null).map((r) => [r.id, r.total]));

export const abilitiesDone = (abilities, points = 0) => {
  const rows = abilityRows(abilities);
  if (rows.some((r) => r.base == null)) return false;
  if (abilities.method === 'points' && pointsLeft(abilities) !== 0) return false;
  if (poolOf(abilities) && poolLeft(abilities).length) return false;
  const { count, amount } = bonusShape(abilities);
  const placed = rows.filter((r) => r.bonus > 0);
  if (placed.length !== count || placed.some((r) => r.bonus !== amount)) return false;
  return total(abilities.improvements) === points;
};
