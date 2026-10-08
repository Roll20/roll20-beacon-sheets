/**
 * A tiny seeded PRNG so Spark Mode is reproducible: the same sentence always
 * produces the same creature. The Crucible has no model call at runtime (see
 * docs/CRUCIBLE_AUDIT.md section 6.1) - variety comes from here, determinism from the seed.
 */

/** FNV-1a 32-bit hash. Stable across runs and platforms. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Uniform pick. Returns undefined for an empty list. */
  pick<T>(items: T[]): T | undefined;
  /** N distinct picks (fewer if the list is shorter). */
  sample<T>(items: T[], count: number): T[];
  /** True with the given probability. */
  chance(probability: number): boolean;
  /** A new independent stream, derived from this one plus a label. */
  fork(label: string): Rng;
  readonly seed: number;
}

/** mulberry32 - small, fast, good enough for content selection. */
export function createRng(seedInput: number | string): Rng {
  const seed = typeof seedInput === 'string' ? hashString(seedInput) : seedInput >>> 0;
  let state = seed || 1;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const rng: Rng = {
    seed,
    next,
    int: (min, max) => {
      if (max < min) return min;
      return min + Math.floor(next() * (max - min + 1));
    },
    pick: <T>(items: T[]): T | undefined =>
      items.length ? items[Math.floor(next() * items.length)] : undefined,
    sample: <T>(items: T[], count: number): T[] => {
      const pool = [...items];
      const out: T[] = [];
      const take = Math.min(count, pool.length);
      for (let i = 0; i < take; i++) {
        out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      }
      return out;
    },
    chance: (probability) => next() < probability,
    fork: (label) => createRng(hashString(`${seed}:${label}`)),
  };
  return rng;
}

/** Weighted pick. Items with weight <= 0 are never chosen. */
export function weightedPick<T>(rng: Rng, items: { value: T; weight: number }[]): T | undefined {
  const pool = items.filter((i) => i.weight > 0);
  const total = pool.reduce((s, i) => s + i.weight, 0);
  if (!total) return undefined;
  let roll = rng.next() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }
  return pool[pool.length - 1].value;
}
