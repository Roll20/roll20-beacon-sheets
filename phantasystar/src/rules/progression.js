export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

export const MAX_LEVEL = 20;

export const clampLevel = (level) =>
  Math.min(MAX_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));

export const saveBonus = (level) => {
  const l = clampLevel(level);
  if (l <= 4) return 2;
  if (l <= 8) return 3;
  if (l <= 12) return 4;
  if (l <= 16) return 5;
  return 6;
};

export const maxSkillRank = (level) => {
  const l = clampLevel(level);
  if (l <= 5) return 3;
  if (l <= 10) return 4;
  if (l <= 15) return 5;
  return 6;
};

export const levelFromXp = (xp) => {
  const x = Math.max(0, Math.floor(Number(xp) || 0));
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i += 1) {
    if (x >= XP_THRESHOLDS[i]) level = i + 1;
  }
  return level;
};

export const xpToNextLevel = (xp) => {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return null;
  return XP_THRESHOLDS[level] - Math.max(0, Math.floor(Number(xp) || 0));
};

export const levelProgress = (xp, level) => {
  const l = clampLevel(level);
  if (l >= MAX_LEVEL) return null;
  const x = Math.max(0, Math.floor(Number(xp) || 0));
  const from = XP_THRESHOLDS[l - 1];
  const next = XP_THRESHOLDS[l];
  return { next, fraction: Math.min(1, Math.max(0, (x - from) / (next - from))) };
};

export const fatePoints = (level) => {
  const l = clampLevel(level);
  if (l >= 17) return { points: 6, die: 'd12' };
  if (l >= 11) return { points: 5, die: 'd10' };
  if (l >= 5) return { points: 4, die: 'd8' };
  return { points: 3, die: 'd6' };
};

export const fatePoolContribution = (level) => Math.floor(fatePoints(level).points / 2);
