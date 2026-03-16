import type { DiceComponent } from '../rolltemplates';

export const getRollPower = (components: DiceComponent[], multiplier = 1) => {
  if (components.length < 2) return 'Success';
  const dice_1 = components[0].value ?? 1;
  const dice_2 = components[1].value ?? 1;
  const total = components.reduce((sum, component) => sum + (component.value ?? 0), 0) * multiplier;
  const power = total - (dice_1 + dice_2);
  if (power === 0) return '0';
  if (power > 0) return `+${power}`;
  return `${power}`;
}