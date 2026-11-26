/** Dice helpers for stat generation. */

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/** A single Convergence stat roll: 2d6 + 6 (range 8-18). */
export function rollStat(): number {
  return rollDie(6) + rollDie(6) + 6;
}

/** Roll a complete six-value array. */
export function rollStatArray(): number[] {
  return Array.from({ length: 6 }, rollStat);
}

export function arrayAverage(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
