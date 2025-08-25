import { dispatchRef } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';

type RollResults = {
  total: number;
  components: Array<DiceComponent>;
  resultType?: 'crit-success' | 'crit-fail';
  naturalRoll?: number;
  confirmationRoll?: number;
};
// Adds together a series of dice components and outputs the result. Beacon handles the dice rolling to ensure randomness.
export default async (
  components: Array<DiceComponent>,
  customDispatch?: Dispatch,
  allowCrit?: boolean,
): Promise<RollResults> => {
  const dispatch = customDispatch || (dispatchRef.value as Dispatch); // Need a different Relay instance when handling sheet-actions

  const rolls: any = {};
  let dieType = '';
  for (const i in components) {
    const component = components[i];
    if (component.sides) {
      const sides = component.sides;
      const dieCount = component.count ?? 1;
      rolls[`dice-${i}`] = `${dieCount}d${sides}`;
      dieType = `dice-${i}`;
    }
  }

  const rollResult = await dispatch.roll({ rolls });

  for (const rollTerm in rollResult.results) {
    const result = rollResult.results[rollTerm];
    const rollIndex = parseInt(rollTerm.split(`-`)[1]);
    const component = components[rollIndex];
    component.value = result.results.result;
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

  let naturalRoll: number | undefined;
  let resultType: 'crit-success' | 'crit-fail' | undefined;
  let confirmationRoll: number | undefined;

  if (allowCrit) {
    naturalRoll = rollResult.results[dieType].results.result;

    // Check if we need a confirmation roll (natural 1 or 10)
    if (naturalRoll === 1 || naturalRoll === 10) {
      // Roll confirmation die
      const confirmationRollResult = await dispatch.roll({ rolls });
      confirmationRoll = confirmationRollResult.results[dieType].results.result;

      // Check if confirmation matches original roll
      if (confirmationRoll === naturalRoll) {
        if (naturalRoll === 10) {
          resultType = 'crit-success';
          console.log('CRIT SUCCESS');
        } else if (naturalRoll === 1) {
          resultType = 'crit-fail';
          console.log('CRIT FAIL');
        }
      }
      console.log('confirmationRoll', confirmationRoll);
    }
  }

  return { total, components, resultType, naturalRoll, confirmationRoll };
};
