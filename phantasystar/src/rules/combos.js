export const COMBO_MIN_LEVEL = 6;

export const COMBO_FATE_COST = 2;

export const COMBO_TABLE = [
  { min: 6, max: 10, tp: 20, range: 60, area: 20, damage: '8d8' },
  { min: 11, max: 15, tp: 30, range: 120, area: 30, damage: '11d8' },
  { min: 16, max: 20, tp: 40, range: 300, area: 40, damage: '14d8' },
];

export const parseLevels = (text) =>
  String(text ?? '')
    .split(/[^\d]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 20);

export const averageLevel = (levels = []) => {
  const list = levels.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (!list.length) return 0;
  return Math.floor(list.reduce((a, b) => a + b, 0) / list.length);
};

export const comboTier = (avgLevel) => {
  const level = Math.min(20, Number(avgLevel) || 0);
  return COMBO_TABLE.find((row) => level >= row.min && level <= row.max) ?? null;
};

export const comboSaveDC = (directorDC, participantMods = []) => {
  if (directorDC == null || directorDC === '') return null;
  const dc = Number(directorDC);
  if (!Number.isFinite(dc)) return null;
  const mods = participantMods.map(Number).filter(Number.isFinite);
  return dc + (mods.length ? Math.max(...mods) : 0);
};

export const describeCombo = ({
  level,
  otherLevels = [],
  required = COMBO_MIN_LEVEL,
  fateRemaining = 0,
  fateCost = COMBO_FATE_COST,
  currentTP = 0,
  tpShare = null,
}) => {
  const avg = averageLevel([level, ...otherLevels]);
  const tier = comboTier(avg);
  const share = tpShare == null ? (tier?.tp ?? 0) : Math.max(0, Number(tpShare) || 0);
  const levelOk = (Number(level) || 0) >= COMBO_MIN_LEVEL;
  const avgOk = !!tier && avg >= Math.max(COMBO_MIN_LEVEL, Number(required) || 0);
  return {
    average: avg,
    tier,
    tpShare: share,
    fateCost,
    levelOk,
    avgOk,
    fateOk: fateRemaining >= fateCost,
    tpOk: currentTP >= share && (!tier || share <= tier.tp),
  };
};
