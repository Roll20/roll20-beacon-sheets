export const CRIT_SUCCESS = 20;
export const CRIT_FAIL = 1;

export const NORMAL = 'normal';
export const ADVANTAGE = 'advantage';
export const DISADVANTAGE = 'disadvantage';

export const rollMode = ({ advantage = false, disadvantage = false } = {}) => {
  if (advantage && disadvantage) return NORMAL;
  if (advantage) return ADVANTAGE;
  if (disadvantage) return DISADVANTAGE;
  return NORMAL;
};

export const d20Count = (mode) => (mode === NORMAL ? 1 : 2);

export const resolveD20 = (results, mode = NORMAL) => {
  const faces = results.filter((n) => Number.isFinite(n));
  if (faces.length === 0) return { natural: null, dropped: null };
  if (mode === NORMAL || faces.length === 1) return { natural: faces[0], dropped: null };
  const kept = mode === ADVANTAGE ? Math.max(...faces) : Math.min(...faces);
  const dropIndex = faces.indexOf(kept) === 0 ? 1 : 0;
  return { natural: kept, dropped: faces[dropIndex] };
};

export const CRIT_RANGE_MIN = 18;

export const critRange = (from) => {
  const n = Math.trunc(Number(from));
  if (!Number.isFinite(n) || n < CRIT_RANGE_MIN || n > CRIT_SUCCESS) return CRIT_SUCCESS;
  return n;
};

export const attackOutcome = (natural, critFrom = CRIT_SUCCESS) => {
  if (natural >= critRange(critFrom)) return 'crit-success';
  if (natural === CRIT_FAIL) return 'crit-fail';
  return null;
};

export const deathSaveOutcome = (natural, dc = 10, bonus = 0) => {
  if (natural === CRIT_SUCCESS) return { survive: 0, perish: 0, revived: true, label: 'Back on your feet at 1 HP' };
  if (natural === CRIT_FAIL) return { survive: 0, perish: 2, revived: false, label: 'Two failures' };
  if (natural + (Number(bonus) || 0) >= dc) return { survive: 1, perish: 0, revived: false, label: 'Success' };
  return { survive: 0, perish: 1, revived: false, label: 'Failure' };
};

export const DEATH_SAVE_DC = 10;

export const critDamage = (formula) =>
  String(formula ?? '').replace(/(\d*)d(\d+)/gi, (_, count, sides) => {
    const n = count === '' ? 1 : Number(count);
    return `${n * 2}d${sides}`;
  });

export const critFormula = (damage, extra) => {
  const doubled = critDamage(damage);
  const bonus = String(extra ?? '').trim();
  if (!doubled) return bonus;
  return bonus ? `${doubled} + ${bonus}` : doubled;
};

export const withModifier = (formula, mod) => {
  const base = String(formula ?? '').trim();
  const n = Number(mod) || 0;
  if (!base || n === 0) return base;
  return `${base} ${n < 0 ? '-' : '+'} ${Math.abs(n)}`;
};

export const FATE_DICE = ['d6', 'd8', 'd10', 'd12'];

export const dieSides = (die) => {
  const m = /^d(\d+)$/i.exec(String(die ?? '').trim());
  return m ? Number(m[1]) : null;
};

export const FATE_BONUS_DIE_COST = 1;
export const FATE_ADVANTAGE_COST = 2;

export const describeFateSpend = ({ use, remaining }) => {
  const cost = use === 'advantage' ? FATE_ADVANTAGE_COST : FATE_BONUS_DIE_COST;
  return { cost, affordable: remaining >= cost };
};
