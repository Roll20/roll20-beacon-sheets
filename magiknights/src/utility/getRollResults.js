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
      } else if (component.formula) {
          rolls[`dice-${i}`] = component.formula;
      }
  }

  const rollResult = await dispatch.roll({ rolls });

  // Store the results in components array
  for (const rollTerm in rollResult.results) {
      const result = rollResult.results[rollTerm];
      const rollIndex = parseInt(rollTerm.split(`-`)[1]);
      const component = components[rollIndex]; // Correct component for each result
      component.value = result.results.result;

      // If there is no label, use the expression
      if (!component.label) {
          component.label = result.results.expression;
      }

      // Store each roll result for the breakdown
      component.results = result.results; // Save the full results object to access rolls later

      // For advantage/disadvantage rolls, extract individual d20 values
      if (component.results?.rolls?.[0]?.results?.length === 2) {
        const dice = component.results.rolls[0].results;
        // Handle both formats: objects with .result property or direct numbers
        const d1 = typeof dice[0] === 'object' ? dice[0].result : dice[0];
        const d2 = typeof dice[1] === 'object' ? dice[1].result : dice[1];
        const kept = component.value; // The result after kh1/kl1

        component.advantageRoll = {
          die1: d1,
          die2: d2,
          kept: kept,
          isAdvantage: component.isAdvantage || false,
          isDisadvantage: component.isDisadvantage || false
        };
      }
  }

  // Process the roll formula for each component
  components.forEach(component => {
      if (component.rollFormula) {
          const rollParts = [];
          const overallSum = component.value;
          let diceSum = 0;

          if (component.results?.rolls) {
              for (const subcomponent of component.results.rolls) {
                  const sum = subcomponent.results.reduce((sum, roll) => sum + roll.result, 0); // Get each dice roll sum
                  diceSum += sum;
                  const sublabel = `${subcomponent.dice}d${subcomponent.sides}`; // Format dice roll breakdown
                  rollParts.push({
                      sides: subcomponent.sides,
                      count: subcomponent.dice,
                      value: sum,
                      label: component.label ? `${component.label} [${sublabel}]` : sublabel,
                  });
              }
          }

          rollParts.push({
              label: 'Manual Bonus',
              value: overallSum - diceSum,
          });

          const rollIndex = components.indexOf(component);
          components.splice(rollIndex, 1, ...rollParts);
      }
  });

  // Return the final result that includes each component's total and breakdown
  const total = components.reduce((accum, next) => accum + (next?.value || 0), 0);
  return { total, components };
};



// export default async (
//   components,
//   customDispatch,
// ) => {
//   const dispatch = customDispatch || dispatchRef.value; // Need a different Relay instance when handling sheet-actions

//   const rolls = {};
//   for (const i in components) {
//     const component = components[i];
//     if (component.sides) {
//       const sides = component.sides;
//       const dieCount = component.count ?? 1;
//       rolls[`dice-${i}`] = `${dieCount}d${sides} with text`;
//     }else if(component.formula){
//       rolls[`dice-${i}`] = component.formula;
//     }
//   }
//   const rollResult = await dispatch.roll({ rolls });

//   for (const rollTerm in rollResult.results) {
//     const result = rollResult.results[rollTerm];
//     const rollIndex = parseInt(rollTerm.split(`-`)[1]);
//     const component = components[rollIndex];
//     component.value = result.results.result;
//     if (!component.label) {
//       component.label = result.results.expression;
//     }

//     /*
// 				This utilizes the Beacon results to split the formula into it's individual
// 				parts so that we don't need to write the formula parsing ourselves because
// 				it's a complicated thing that Beacon already has to do as it is lol
// 				*/
//     if (component.rollFormula) {
//       const rollParts = [];
//       const overallSum = component.value;
//       let diceSum = 0;
//       if (result.results.rolls) {
//         for (const subcomponent of result.results.rolls) {
//           const sum = subcomponent.results.reduce((sum, result) => sum + result, 0);
//           diceSum += sum;
//           const sublabel = `${subcomponent.dice}d${subcomponent.sides}`;
//           rollParts.push({
//             sides: subcomponent.sides,
//             count: subcomponent.dice,
//             value: sum,
//             label: component.label ? `${component.label} [${sublabel}]` : sublabel,
//           });
//         }

//         rollParts.push({
//           label: `Manual Bonus`,
//           value: overallSum - diceSum,
//         });
//       }

//       components.splice(rollIndex, 1, ...rollParts);
//     }
//   }

//   const total = components.reduce((accum, next) => accum + (next?.value || 0), 0);
//   return { total, components };
// };