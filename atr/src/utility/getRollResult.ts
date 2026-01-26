import { dispatchRef } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';

type RollResults = {
  total: number;
  components: Array<DiceComponent>;
};
// Adds together a series of dice components and outputs the result. Beacon handles the dice rolling to ensure randomness.
export default async (
  components: Array<DiceComponent>,
  customDispatch?: Dispatch,
): Promise<RollResults> => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions

  const rolls: any = {};
  for (const i in components) {
    const component = components[i];
    if (component.sides) {
      const sides = component.sides;
      const dieCount = component.count ?? 1;
      rolls[`dice-${i}`] = `${Math.abs(dieCount)}d${sides}`;
    }
  }

  const rollResult = await dispatch.roll({ rolls });

  for (const rollTerm in rollResult.results) {
    const result = rollResult.results[rollTerm];
    const rollIndex = parseInt(rollTerm.split(`-`)[1]);
    const component = components[rollIndex];
    const sign = (component.count ?? 1) < 0 ? -1 : 1;
    component.value = result.results.result * sign;
    if (!component.label) {
      component.label = result.results.expression;
    }

    /*
				This utilizes the Beacon results to split the formula into it's individual
				parts so that we don't need to write the formula parsing ourselves because
				it's a complicated thing that Beacon already has to do as it is lol
				*/
    if (component.rollFormula) {
      const rollParts: DiceComponent[] = [];
      const overallSum = component.value;
      let diceSum = 0;
      if (result.results.rolls) {
        for (const subcomponent of result.results.rolls) {
          const sum = subcomponent.results.reduce((sum, result) => sum + result, 0);
          diceSum += sum;
          const sublabel = `${subcomponent.dice}d${subcomponent.sides}`;
          rollParts.push({
            sides: subcomponent.sides,
            count: subcomponent.dice,
            value: sum,
            label: component.label ? `${component.label} [${sublabel}]` : sublabel,
          });
        }

        rollParts.push({
          label: `Manual Bonus`,
          value: overallSum - diceSum,
        });
      }

      components.splice(rollIndex, 1, ...rollParts);
    }
  }

  const total = components.reduce((accum, next) => accum + (next?.value || 0), 0);
  return { total, components };
};
