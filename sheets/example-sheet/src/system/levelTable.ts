//  In this example system, Level/HP/MP/Prof/HeroDie are determined by your current XP.
// here's a table with the entire progression for doing the calculations.
export default {
  0: { level: 0, life: 5, mana: 2, profBonus: 1, heroDice: 0, xp: 0 },
  1: { level: 1, life: 8, mana: 4, profBonus: 2, heroDice: 1, xp: 300 },
  2: { level: 2, life: 14, mana: 6, profBonus: 2, heroDice: 2, xp: 750 },
  3: { level: 3, life: 20, mana: 8, profBonus: 2, heroDice: 3, xp: 1500 },
  4: { level: 4, life: 26, mana: 10, profBonus: 2, heroDice: 3, xp: 3000 },
  5: { level: 5, life: 32, mana: 12, profBonus: 3, heroDice: 3, xp: 6000 },
  6: { level: 6, life: 38, mana: 14, profBonus: 3, heroDice: 4, xp: 12500 },
  7: { level: 7, life: 44, mana: 16, profBonus: 3, heroDice: 4, xp: 25000 },
  8: { level: 8, life: 48, mana: 18, profBonus: 3, heroDice: 5, xp: 50000 },
  9: { level: 9, life: 50, mana: 20, profBonus: 4, heroDice: 5, xp: 99999 },
};
