/**
 * Creature size categories.
 *
 * Provenance: supplied by the Crucible directive citing the Convergence Bestiary
 * updated 2026-08-04. The Bestiary copy vendored in Design/ predates that revision
 * and contains no size table - see docs/CRUCIBLE_AUDIT.md section 6.4.
 */

export interface CreatureSizeDef {
  id: string;
  name: string;
  /** Grid footprint as printed, e.g. "2x2". */
  grid: string;
  /** Squares wide/high on the Roll20 grid (fractions round up to 1 token). */
  gridWidth: number;
  gridHeight: number;
  /** Hit die as printed, e.g. "d10". */
  hitDie: string;
  /** Numeric die size used by the HP engine. */
  hitDieSize: number;
  /** Default ground speed for a creature of this size. */
  defaultSpeed: number;
  /** Ordering index, smallest first. */
  order: number;
  source: string;
}

const SRC = 'directive-2026-08-04';

export const CREATURE_SIZES: CreatureSizeDef[] = [
  {
    id: 'fine',
    name: 'Fine',
    grid: '0.25x0.25',
    gridWidth: 1,
    gridHeight: 1,
    hitDie: 'd1',
    hitDieSize: 1,
    defaultSpeed: 5,
    order: 0,
    source: SRC,
  },
  {
    id: 'diminutive',
    name: 'Diminutive',
    grid: '0.25x0.25',
    gridWidth: 1,
    gridHeight: 1,
    hitDie: 'd2',
    hitDieSize: 2,
    defaultSpeed: 10,
    order: 1,
    source: SRC,
  },
  {
    id: 'tiny',
    name: 'Tiny',
    grid: '0.5x0.5',
    gridWidth: 1,
    gridHeight: 1,
    hitDie: 'd4',
    hitDieSize: 4,
    defaultSpeed: 15,
    order: 2,
    source: SRC,
  },
  {
    id: 'small',
    name: 'Small',
    grid: '1x1',
    gridWidth: 1,
    gridHeight: 1,
    hitDie: 'd6',
    hitDieSize: 6,
    defaultSpeed: 25,
    order: 3,
    source: SRC,
  },
  {
    id: 'medium',
    name: 'Medium',
    grid: '1x1',
    gridWidth: 1,
    gridHeight: 1,
    hitDie: 'd8',
    hitDieSize: 8,
    defaultSpeed: 30,
    order: 4,
    source: SRC,
  },
  {
    id: 'large',
    name: 'Large',
    grid: '2x2',
    gridWidth: 2,
    gridHeight: 2,
    hitDie: 'd10',
    hitDieSize: 10,
    defaultSpeed: 40,
    order: 5,
    source: SRC,
  },
  {
    id: 'huge',
    name: 'Huge',
    grid: '3x3',
    gridWidth: 3,
    gridHeight: 3,
    hitDie: 'd12',
    hitDieSize: 12,
    defaultSpeed: 40,
    order: 6,
    source: SRC,
  },
  {
    id: 'gargantuan',
    name: 'Gargantuan',
    grid: '4x4',
    gridWidth: 4,
    gridHeight: 4,
    hitDie: 'd20',
    hitDieSize: 20,
    defaultSpeed: 50,
    order: 7,
    source: SRC,
  },
  {
    id: 'titanic',
    name: 'Titanic',
    grid: '5x5',
    gridWidth: 5,
    gridHeight: 5,
    hitDie: 'd50',
    hitDieSize: 50,
    defaultSpeed: 60,
    order: 8,
    source: SRC,
  },
  {
    id: 'tremendous',
    name: 'Tremendous',
    grid: '10x10',
    gridWidth: 10,
    gridHeight: 10,
    hitDie: 'd100',
    hitDieSize: 100,
    defaultSpeed: 80,
    order: 9,
    source: SRC,
  },
  {
    id: 'colossal',
    name: 'Colossal',
    grid: '20x20',
    gridWidth: 20,
    gridHeight: 20,
    hitDie: 'd150',
    hitDieSize: 150,
    defaultSpeed: 100,
    order: 10,
    source: SRC,
  },
  {
    id: 'supermassive',
    name: 'Supermassive',
    grid: '30x30',
    gridWidth: 30,
    gridHeight: 30,
    hitDie: 'd200',
    hitDieSize: 200,
    defaultSpeed: 120,
    order: 11,
    source: SRC,
  },
  {
    id: 'planetary',
    name: 'Planetary',
    grid: '100x100',
    gridWidth: 100,
    gridHeight: 100,
    hitDie: 'd500',
    hitDieSize: 500,
    defaultSpeed: 200,
    order: 12,
    source: SRC,
  },
  {
    id: 'superplanetary',
    name: 'Superplanetary',
    grid: '500x500',
    gridWidth: 500,
    gridHeight: 500,
    hitDie: 'd1000',
    hitDieSize: 1000,
    defaultSpeed: 400,
    order: 13,
    source: SRC,
  },
];

export const sizeById: Record<string, CreatureSizeDef> = Object.fromEntries(
  CREATURE_SIZES.map((s) => [s.id, s]),
);

export const DEFAULT_SIZE_ID = 'medium';

export function sizeOrDefault(id: string | null | undefined): CreatureSizeDef {
  return sizeById[String(id)] ?? sizeById[DEFAULT_SIZE_ID];
}

/** Ordered die sizes, used by role modifiers that step the die up or down. */
export const HIT_DIE_LADDER: number[] = CREATURE_SIZES.map((s) => s.hitDieSize);

/** Step a hit die up (+1) or down (-1) the ladder, clamped to d1..d1000. */
export function stepHitDie(dieSize: number, steps: number): number {
  const idx = HIT_DIE_LADDER.indexOf(dieSize);
  if (idx === -1) {
    // Not a ladder value (a manual override); approximate by nearest.
    const nearest = HIT_DIE_LADDER.reduce((best, d) =>
      Math.abs(d - dieSize) < Math.abs(best - dieSize) ? d : best,
    );
    return stepHitDie(nearest, steps);
  }
  const next = Math.min(HIT_DIE_LADDER.length - 1, Math.max(0, idx + steps));
  return HIT_DIE_LADDER[next];
}

/** Average of a die, rounded up - the Convergence default for non-rolled HP. */
export function dieAverage(dieSize: number): number {
  return Math.ceil((dieSize + 1) / 2);
}
