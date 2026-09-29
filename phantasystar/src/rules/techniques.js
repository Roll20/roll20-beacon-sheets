export const TP_COST_BY_RANK = [0, 4, 6, 10, 12, 14, 18, 20, 22, 26];

export const MIN_RANK = 0;
export const MAX_RANK = 9;

export const ADVANCED_RANK_THRESHOLD = 6;

export const BOOST_COST_PER_RANK = 4;

export const isValidRank = (rank) =>
  Number.isInteger(rank) && rank >= MIN_RANK && rank <= MAX_RANK;

export const rankLabel = (rank) => (rank === 0 ? 'Prime' : `Rank ${rank}`);

export const COMPONENT_TYPES = [
  { id: 'perishable', name: 'Perishable', abbr: 'P' },
  { id: 'static', name: 'Static', abbr: 'S' },
];

export const componentsLabel = (components, { short = false } = {}) => {
  if (!components?.type) return '';
  const kind = COMPONENT_TYPES.find((t) => t.id === components.type);
  const name = short ? `Comp (${kind?.abbr ?? components.type})` : (kind?.name ?? components.type);
  const text = String(components.text ?? '').trim();
  return text ? `${name}: ${text}` : name;
};

export const tpCost = (rank) => (isValidRank(rank) ? TP_COST_BY_RANK[rank] : null);

export const boostedTpCost = (baseRank, castRank) => {
  if (!isValidRank(baseRank) || !isValidRank(castRank)) return null;
  if (castRank < baseRank) return null;
  return TP_COST_BY_RANK[baseRank] + (castRank - baseRank) * BOOST_COST_PER_RANK;
};

export const isAdvancedCast = (castRank) => castRank >= ADVANCED_RANK_THRESHOLD;

export const canCastAtRank = (castRank, maxTechRank, advancedRank) => {
  if (!isValidRank(castRank)) return false;
  if (maxTechRank != null && castRank <= maxTechRank) return true;
  return advancedRank != null && castRank <= advancedRank;
};

export const FREE_CAST_PERIODS = ['atWill', 'long', 'short'];

export const freeCastLabel = (per) =>
  ({ atWill: 'At will', long: 'Per long rest', short: 'Per short rest' })[per] ?? null;

export const freeCastsLeft = (freeCasts) => {
  if (!freeCasts || !FREE_CAST_PERIODS.includes(freeCasts.per)) return 0;
  if (freeCasts.per === 'atWill') return Infinity;
  const max = Number(freeCasts.max);
  const used = Number(freeCasts.used);
  return Math.max(0, (Number.isFinite(max) ? max : 0) - (Number.isFinite(used) ? used : 0));
};

export const freeCastApplies = (freeCasts, baseRank, castRank) =>
  castRank === baseRank && freeCastsLeft(freeCasts) > 0;

export const refreshFreeCasts = (freeCasts, period = 'long') => {
  if (!freeCasts) return freeCasts;
  if (period === 'long' || freeCasts.per === period) return { ...freeCasts, used: 0 };
  return freeCasts;
};

export const describeCast = ({
  baseRank,
  castRank = baseRank,
  currentTP = 0,
  maxTechRank = null,
  advancedRank = null,
  rankUsed = false,
  freeCasts = null,
}) => {
  const fullCost = boostedTpCost(baseRank, castRank);
  if (fullCost == null) return null;
  const advanced = isAdvancedCast(castRank);
  const withinReach = canCastAtRank(castRank, maxTechRank, advancedRank);
  const rankSpent = advanced && rankUsed;
  const free = freeCastApplies(freeCasts, baseRank, castRank);
  const cost = free ? 0 : fullCost;
  return {
    cost,
    fullCost,
    free,
    freeLeft: freeCastsLeft(freeCasts),
    advanced,
    allowed: withinReach && !rankSpent,
    affordable: currentTP >= cost,
    rankSpent,
    forceBreach: rankSpent && withinReach ? describeForceBreach(castRank) : null,
  };
};

export const limitBreachUses = (techAbilityMod) => Math.max(0, techAbilityMod);

export const limitBreachDC = (rank) => (isValidRank(rank) ? 10 + rank : null);

export const describeLimitBreach = (rank) => ({
  dc: limitBreachDC(rank),
  ability: 'constitution',
  onFailure: 'The technique fails, your TP drops to 0, and you gain 1 level of exhaustion.',
});

export const forceBreachDC = (rank) => (isValidRank(rank) ? 8 + rank : null);

export const forceBreachDamage = (rank) => (isValidRank(rank) ? `${rank}d6` : null);

export const describeForceBreach = (rank) => ({
  dc: forceBreachDC(rank),
  damage: forceBreachDamage(rank),
  onFailure: 'The technique fails, you lose the expended TP, and you take the psychic damage.',
});

export const CONCENTRATION_DC_MIN = 10;
export const CONCENTRATION_DC_MAX = 30;

export const concentrationDC = (damage) => {
  const half = Math.floor(Math.max(0, Number(damage) || 0) / 2);
  return Math.min(CONCENTRATION_DC_MAX, Math.max(CONCENTRATION_DC_MIN, half));
};

export const blankTechniqueFields = () => ({
  name: '',
  rank: 0,
  castingTime: 'Action',
  range: 'Self',
  duration: 'Instant',
  concentration: false,
  attack: false,
  saveAbility: null,
  components: null,
  text: [],
  boost: [],
});

export const groupByRank = (techniques = []) => {
  const groups = new Map();
  for (const t of techniques) {
    if (!groups.has(t.rank)) groups.set(t.rank, []);
    groups.get(t.rank).push(t);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rank, list]) => ({ rank, techniques: list }));
};

export const PRIME_UPGRADE_LEVELS = [5, 11, 17];

export const primeUpgrades = (level) =>
  PRIME_UPGRADE_LEVELS.filter((l) => (Number(level) || 0) >= l).length;

export const boostSteps = (baseRank, castRank = baseRank, level = 1) =>
  baseRank === 0 ? primeUpgrades(level) : Math.max(0, (Number(castRank) || 0) - baseRank);

export const addDice = (formula, dice, times = 1) => {
  const base = String(formula ?? '').trim();
  const step = String(dice ?? '').trim().match(/^(\d*)\s*d\s*(\d+)$/i);
  const n = Math.max(0, Math.floor(Number(times) || 0));
  if (!step || n === 0) return base;
  const count = (Number(step[1]) || 1) * n;
  const sides = step[2];
  if (!base) return `${count}d${sides}`;
  let merged = false;
  const out = base.replace(/(^|[^\w])(\d*)d(\d+)(?!\d)/gi, (whole, lead, c, s) => {
    if (merged || s !== sides) return whole;
    merged = true;
    return `${lead}${(Number(c) || 1) + count}d${s}`;
  });
  return merged ? out : `${base} + ${count}d${sides}`;
};

export const boostedFormulas = (t, steps) => ({
  damage: addDice(t.damage, t.boostDamage, steps),
  damage2: addDice(t.damage2, t.boostDamage2, steps),
  healing: addDice(t.healing, t.boostHealing, steps),
});
