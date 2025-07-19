import type { DiceComponent } from '../rolltemplates';

export const sumComponents = (components: DiceComponent[], multiplier = 1) => {
  let sum = components.reduce((sum, component) => sum + (component.value ?? 0), 0) * multiplier;
  if (components[0] && components[0].trained === false) {
    console.log
    sum = Math.ceil(sum / 2);
  }
  return sum;
};