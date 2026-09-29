export const MONSTER_TABLE = [
  { cr: '0', value: 0.0, proficiencyBonus: 2, xp: 10 },
  { cr: '1/8', value: 0.125, proficiencyBonus: 2, xp: 25 },
  { cr: '1/4', value: 0.25, proficiencyBonus: 2, xp: 50 },
  { cr: '1/2', value: 0.5, proficiencyBonus: 2, xp: 100 },
  { cr: '1', value: 1.0, proficiencyBonus: 2, xp: 200 },
  { cr: '2', value: 2.0, proficiencyBonus: 2, xp: 450 },
  { cr: '3', value: 3.0, proficiencyBonus: 2, xp: 700 },
  { cr: '4', value: 4.0, proficiencyBonus: 2, xp: 1100 },
  { cr: '5', value: 5.0, proficiencyBonus: 3, xp: 1800 },
  { cr: '6', value: 6.0, proficiencyBonus: 3, xp: 2300 },
  { cr: '7', value: 7.0, proficiencyBonus: 3, xp: 2900 },
  { cr: '8', value: 8.0, proficiencyBonus: 3, xp: 3900 },
  { cr: '9', value: 9.0, proficiencyBonus: 4, xp: 5000 },
  { cr: '10', value: 10.0, proficiencyBonus: 4, xp: 5900 },
  { cr: '11', value: 11.0, proficiencyBonus: 4, xp: 7200 },
  { cr: '12', value: 12.0, proficiencyBonus: 4, xp: 8400 },
  { cr: '13', value: 13.0, proficiencyBonus: 5, xp: 10000 },
  { cr: '14', value: 14.0, proficiencyBonus: 5, xp: 11500 },
  { cr: '15', value: 15.0, proficiencyBonus: 5, xp: 13000 },
  { cr: '16', value: 16.0, proficiencyBonus: 5, xp: 15000 },
  { cr: '17', value: 17.0, proficiencyBonus: 6, xp: 18000 },
  { cr: '18', value: 18.0, proficiencyBonus: 6, xp: 20000 },
  { cr: '19', value: 19.0, proficiencyBonus: 6, xp: 22000 },
  { cr: '20', value: 20.0, proficiencyBonus: 6, xp: 25000 },
  { cr: '21', value: 21.0, proficiencyBonus: 7, xp: 33000 },
  { cr: '22', value: 22.0, proficiencyBonus: 7, xp: 41000 },
  { cr: '23', value: 23.0, proficiencyBonus: 7, xp: 50000 },
  { cr: '24', value: 24.0, proficiencyBonus: 7, xp: 62000 },
  { cr: '25', value: 25.0, proficiencyBonus: 8, xp: 75000 },
  { cr: '26', value: 26.0, proficiencyBonus: 8, xp: 90000 },
  { cr: '27', value: 27.0, proficiencyBonus: 8, xp: 105000 },
  { cr: '28', value: 28.0, proficiencyBonus: 8, xp: 120000 },
  { cr: '29', value: 29.0, proficiencyBonus: 9, xp: 135000 },
  { cr: '30', value: 30.0, proficiencyBonus: 9, xp: 155000 },
];

export const CR_LABELS = MONSTER_TABLE.map((row) => row.cr);

export const monsterRow = (cr) => {
  if (cr === null || cr === undefined) return null;
  const text = String(cr).trim();
  if (text === '') return null;
  const byLabel = MONSTER_TABLE.find((row) => row.cr === text);
  if (byLabel) return byLabel;
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return MONSTER_TABLE.find((row) => row.value === value) ?? null;
};

export const xpForCR = (cr) => monsterRow(cr)?.xp ?? null;

export const proficiencyForCR = (cr) => monsterRow(cr)?.proficiencyBonus ?? null;
