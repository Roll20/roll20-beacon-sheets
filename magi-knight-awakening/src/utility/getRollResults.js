import { dispatchRef } from '@/relay';

export default async (
  components,
  customDispatch,
) => {
  const dispatch = customDispatch || dispatchRef.value; // Need a different Relay instance when handling sheet-actions

  const rolls = {};
  for (const i in components) {
    const component = components[i];
    if (component.sides) {
      const sides = component.sides;
      const dieCount = component.count ?? 1;
      rolls[`dice-${i}`] = `${dieCount}d${sides} with text`;
    }else if(component.formula){
      rolls[`dice-${i}`] = component.formula;
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
      const rollParts = [];
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