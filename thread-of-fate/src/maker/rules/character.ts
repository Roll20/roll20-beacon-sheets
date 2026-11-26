import type { AttributeRecord, ClassDef } from '@/maker/types';
import { modifier } from './stats';

/**
 * Derived combat stats (HP, Stamina, AC, Saves, Proficiency), per
 * "Convergence Playtest Rules.md". All functions take final attribute SCORES.
 */

export interface DerivedStats {
  health: number;
  stamina: number;
  armorClass: number;
  quickRestHeal: number;
  hitDice: string[];
}

/**
 * Proficiency Bonus: +1 at levels 0-3, then +1 every 3 levels
 * (+2 at 4, +3 at 7, +4 at 10 ... up to +20 at 60). = 1 + floor((level-1)/3).
 */
export function proficiencyBonus(level: number): number {
  if (level <= 0) return 1;
  return 1 + Math.floor((level - 1) / 3);
}

/** Level 0 HP = 1 + Might mod + Conviction mod (min 1). */
export function level0Health(scores: AttributeRecord): number {
  return Math.max(1, 1 + modifier(scores.might) + modifier(scores.conviction));
}

/** Level 0 Quick Rest heal = max(1, higher of Might/Conviction mod). */
export function level0QuickRestHeal(scores: AttributeRecord): number {
  return Math.max(1, Math.max(modifier(scores.might), modifier(scores.conviction)));
}

/** Level 0 Stamina = 1 + Might mod (min 1). */
export function level0Stamina(scores: AttributeRecord): number {
  return Math.max(1, 1 + modifier(scores.might));
}

/**
 * HP for a class build. Level 1 of the primary class uses the hit die MAX; each
 * additional level uses the hit die average (rounded up) by default. Every level
 * adds Might + Conviction modifiers. `perLevelBonus` adds racial/feature HP per level
 * (e.g. Dwarf "Built Like a Dwarf" = 1), `flatBonus` adds a one-time amount.
 */
export function classHealth(
  scores: AttributeRecord,
  classes: { cls: ClassDef; level: number }[],
  useAverage = true,
  perLevelBonus = 0,
  flatBonus = 0,
): number {
  const mightMod = modifier(scores.might);
  const convMod = modifier(scores.conviction);
  let total = flatBonus;
  let isFirstLevelOverall = true;
  for (const { cls, level } of classes) {
    for (let lvl = 0; lvl < level; lvl++) {
      const dieMax = cls.hitDie;
      const dieAvg = Math.ceil((cls.hitDie + 1) / 2);
      total +=
        (isFirstLevelOverall ? dieMax : useAverage ? dieAvg : dieMax) +
        mightMod +
        convMod +
        perLevelBonus;
      isFirstLevelOverall = false;
    }
  }
  return Math.max(1, total);
}

/** Stamina (level 1+) = Might mod + floor(highest hit die max / 2), min 1. */
export function stamina(
  scores: AttributeRecord,
  classes: { cls: ClassDef; level: number }[],
): number {
  const highestHitDie = classes.reduce((max, c) => Math.max(max, c.cls.hitDie), 0);
  return Math.max(1, modifier(scores.might) + Math.floor(highestHitDie / 2));
}

/**
 * Armor Class = 10 + min(Instinct mod, armor attribute cap) + floor(1/2 PB)
 *   + armor bonus + shield AC + other (racial/feature) bonuses.
 */
export function armorClass(
  scores: AttributeRecord,
  proficiencyBonus = 1,
  armorBonus = 0,
  attributeCap: number | null = null,
  shieldAc = 0,
  other = 0,
): number {
  const cap = attributeCap == null ? Infinity : attributeCap;
  const instinct = Math.min(modifier(scores.instinct), cap);
  return 10 + instinct + Math.floor(proficiencyBonus / 2) + armorBonus + shieldAc + other;
}

export type SaveGroup = 'Body' | 'Mind' | 'Soul';

const SAVE_PAIRS: Record<SaveGroup, [keyof AttributeRecord, keyof AttributeRecord]> = {
  Body: ['might', 'instinct'],
  Mind: ['focus', 'conviction'],
  Soul: ['resonance', 'presence'],
};

/** Body/Mind/Soul save = sum of the two attribute mods + PB if proficient. */
export function saveBonus(
  scores: AttributeRecord,
  proficiencyBonus: number,
  group: SaveGroup,
  proficient: boolean,
): number {
  const [a, b] = SAVE_PAIRS[group];
  return modifier(scores[a]) + modifier(scores[b]) + (proficient ? proficiencyBonus : 0);
}

/** Concentration save = Focus mod + Resonance mod + Proficiency Bonus. */
export function concentrationSave(scores: AttributeRecord, proficiencyBonus: number): number {
  return modifier(scores.focus) + modifier(scores.resonance) + proficiencyBonus;
}

export function hitDiceList(classes: { cls: ClassDef; level: number }[]): string[] {
  return classes
    .filter((c) => c.level > 0)
    .map((c) => `${c.level}d${c.cls.hitDie} (${c.cls.name})`);
}
