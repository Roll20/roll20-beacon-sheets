import { parse } from 'dice-notation';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';
import { type DicePool } from '@/sheet/stores/modifiers/modifiersStore';

/**
 * Parses a dice formula string into an array of DiceComponent objects.
 */
export function createComponentsFromFormula(formula: string, baseLabel?: string): DiceComponent[] {
  if (!formula) return [];

  try {
    const parsed = parse(formula);
    const components: DiceComponent[] = [];

    parsed.forEach((term) => {
      const sign = term.sign === '-' ? -1 : 1;

      if (term.type === 'rollable') {
        components.push({
          sides: term.rollable.size,
          count: sign * term.rollable.count,
        });
      } else if (term.type === 'constant') {
        if (term.value !== 0) {
          components.push({
            value: sign * term.constant.value,
            label: baseLabel,
          });
        }
      }
    });

    return components;
  } catch (error) {
    console.error(`Failed to parse dice formula "${formula}":`, error);
    return [{ label: `${baseLabel} (Invalid Formula)`, value: 0 }];
  }
}

export function getDicePoolAverage(pool: DicePool): number {
  let totalAverage = 0;
  for (const item of pool) {
    if (typeof item === 'number') {
      totalAverage += item;
    } else if (typeof item === 'string') {
      try {
        const parsed = parse(item);
        for (const term of parsed) {
          const sign = term.sign === '-' ? -1 : 1;
          if (term.type === 'rollable') {
            const avgDie = (term.rollable.size + 1) / 2;
            totalAverage += sign * term.rollable.count * avgDie;
          } else if (term.type === 'constant') {
            totalAverage += sign * term.constant.value;
          }
        }
      } catch (e) {
        // Ignore invalid formulas
      }
    }
  }
  return totalAverage;
}
