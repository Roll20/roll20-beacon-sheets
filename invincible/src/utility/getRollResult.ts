import { dispatchRef } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';

type RollResults = {
  total: number;
  components: Array<DiceComponent>;
};

function getKeptDiceSum(results: number[], modifier: string): number {
  if (!modifier) {
    return results.reduce((sum, val) => sum + val, 0);
  }

  
  const khMatch = modifier.match(/k(?:h)?(\d+)/i);
  if (khMatch) {
    const n = parseInt(khMatch[1], 10);
    const sorted = [...results].sort((a, b) => b - a);
    return sorted.slice(0, n).reduce((sum, val) => sum + val, 0);
  }

  
  const klMatch = modifier.match(/kl(\d+)/i);
  if (klMatch) {
    const n = parseInt(klMatch[1], 10);
    const sorted = [...results].sort((a, b) => a - b);
    return sorted.slice(0, n).reduce((sum, val) => sum + val, 0);
  }

  
  const dhMatch = modifier.match(/dh(\d+)/i);
  if (dhMatch) {
    const n = parseInt(dhMatch[1], 10);
    const sorted = [...results].sort((a, b) => b - a);
    return sorted.slice(n).reduce((sum, val) => sum + val, 0);
  }

  
  const dlMatch = modifier.match(/d(?:l)?(\d+)/i);
  if (dlMatch) {
    const n = parseInt(dlMatch[1], 10);
    const sorted = [...results].sort((a, b) => a - b);
    return sorted.slice(n).reduce((sum, val) => sum + val, 0);
  }

  return results.reduce((sum, val) => sum + val, 0);
}

function getFormattedDiceList(results: number[], modifier: string): string[] {
  if (!modifier) {
    return results.map(String);
  }

  const paired = results.map((val, idx) => ({ val, idx }));
  let keptPairs: typeof paired = [];

  const khMatch = modifier.match(/k(?:h)?(\d+)/i);
  const klMatch = modifier.match(/kl(\d+)/i);
  const dhMatch = modifier.match(/dh(\d+)/i);
  const dlMatch = modifier.match(/d(?:l)?(\d+)/i);

  if (khMatch) {
    const n = parseInt(khMatch[1], 10);
    const sorted = [...paired].sort((a, b) => b.val - a.val);
    keptPairs = sorted.slice(0, n);
  } else if (klMatch) {
    const n = parseInt(klMatch[1], 10);
    const sorted = [...paired].sort((a, b) => a.val - b.val);
    keptPairs = sorted.slice(0, n);
  } else if (dhMatch) {
    const n = parseInt(dhMatch[1], 10);
    const sorted = [...paired].sort((a, b) => b.val - a.val);
    keptPairs = sorted.slice(n);
  } else if (dlMatch) {
    const n = parseInt(dlMatch[1], 10);
    const sorted = [...paired].sort((a, b) => a.val - b.val);
    keptPairs = sorted.slice(n);
  } else {
    keptPairs = paired;
  }

  const keptIndices = new Set(keptPairs.map(p => p.idx));

  return results.map((val, idx) => {
    if (keptIndices.has(idx)) {
      return String(val);
    } else {
      return `<del style="opacity: 0.5; text-decoration: line-through;">${val}</del>`;
    }
  });
}

function getRollsTooltip(results: number[], modifier: string): string {
  if (!modifier) {
    return `Rolls: ${results.join(', ')}`;
  }

  const paired = results.map((val, idx) => ({ val, idx }));
  let keptPairs: typeof paired = [];

  const khMatch = modifier.match(/k(?:h)?(\d+)/i);
  const klMatch = modifier.match(/kl(\d+)/i);
  const dhMatch = modifier.match(/dh(\d+)/i);
  const dlMatch = modifier.match(/d(?:l)?(\d+)/i);

  if (khMatch) {
    const n = parseInt(khMatch[1], 10);
    const sorted = [...paired].sort((a, b) => b.val - a.val);
    keptPairs = sorted.slice(0, n);
  } else if (klMatch) {
    const n = parseInt(klMatch[1], 10);
    const sorted = [...paired].sort((a, b) => a.val - b.val);
    keptPairs = sorted.slice(0, n);
  } else if (dhMatch) {
    const n = parseInt(dhMatch[1], 10);
    const sorted = [...paired].sort((a, b) => b.val - a.val);
    keptPairs = sorted.slice(n);
  } else if (dlMatch) {
    const n = parseInt(dlMatch[1], 10);
    const sorted = [...paired].sort((a, b) => a.val - b.val);
    keptPairs = sorted.slice(n);
  } else {
    keptPairs = paired;
  }

  const keptIndices = new Set(keptPairs.map(p => p.idx));

  const parts = results.map((val, idx) => {
    if (keptIndices.has(idx)) {
      return String(val);
    } else {
      return `${val} (dropped)`;
    }
  });

  return `Rolls: ${parts.join(', ')}`;
}

export default async (
  components: Array<DiceComponent>,
  customDispatch?: Dispatch,
): Promise<RollResults> => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); 

  const rolls: any = {};
  for (const i in components) {
    const component = components[i];
    if (component.rollFormula) {
      rolls[`dice-${i}`] = component.rollFormula;
    } else if (component.sides) {
      const sides = component.sides;
      const dieCount = component.count ?? 1;
      rolls[`dice-${i}`] = `${dieCount}d${sides}`;
    }
  }

  const rollResult = await dispatch.roll({ rolls });

  const finalComponents: DiceComponent[] = [];

  for (let i = 0; i < components.length; i++) {
    const component = { ...components[i] };
    const result = rollResult.results[`dice-${i}`];

    if (result) {
      component.value = result.results.result;
      if (!component.label) {
        component.label = result.results.expression;
      }

      if (component.rollFormula) {
        const rollParts: DiceComponent[] = [];
        const overallSum = component.value;
        let diceSum = 0;

        if (result.results.rolls) {
          const diceRegex = /(?<![a-zA-Z0-9])(\d*)d(\d+)([a-zA-Z!><=]*\d*)*/gi;
          const formulaMatches = [...component.rollFormula.matchAll(diceRegex)];

          for (let subIdx = 0; subIdx < result.results.rolls.length; subIdx++) {
            const subcomponent = result.results.rolls[subIdx];
            const formulaMatch = formulaMatches[subIdx];
            const modifier = formulaMatch ? (formulaMatch[3] || '') : '';

            const sum = getKeptDiceSum(subcomponent.results, modifier);
            diceSum += sum;
            const sublabel = `${subcomponent.dice}d${subcomponent.sides}${modifier}`;

            rollParts.push({
              sides: subcomponent.sides,
              count: subcomponent.dice,
              value: sum,
              label: component.label ? `${component.label} [${sublabel}]` : sublabel,
              rolledDice: getFormattedDiceList(subcomponent.results, modifier),
              rolledDiceTooltip: getRollsTooltip(subcomponent.results, modifier),
              isDamage: component.isDamage,
              rawResults: [...subcomponent.results],
            });
          }

          const manualBonus = overallSum - diceSum;
          if (manualBonus !== 0) {
            rollParts.push({
              label: component.label ? `${component.label} [Bonus]` : `Manual Bonus`,
              value: manualBonus,
              isDamage: component.isDamage,
            });
          }
        } else {
          rollParts.push(component);
        }

        finalComponents.push(...rollParts);
      } else {
        if (result.results.rolls && result.results.rolls.length > 0) {
          const subcomponent = result.results.rolls[0];
          component.rolledDice = getFormattedDiceList(subcomponent.results, '');
          component.rolledDiceTooltip = getRollsTooltip(subcomponent.results, '');
          component.rawResults = [...subcomponent.results];
        } else if (result.results.dice) {
          component.rolledDice = result.results.dice.map(String);
          component.rolledDiceTooltip = `Rolls: ${result.results.dice.join(', ')}`;
          component.rawResults = [...result.results.dice];
        }
        finalComponents.push(component);
      }
    } else {
      finalComponents.push(component);
    }
  }

  const total = finalComponents.reduce((accum, next) => accum + (next?.value || 0), 0);
  return { total, components: finalComponents };
};
