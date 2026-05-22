import type { DiceComponent } from '../rolltemplates';

export const getRollResultType = (components: DiceComponent[], multiplier = 1) => {
  if (components.length < 2) return 'Success';
  const dice_1 = components[0].value ?? 1;
  const dice_2 = components[1].value ?? 1;
  const total = components.reduce((sum, component) => sum + (component.value ?? 0), 0) * multiplier;
  if(dice_1 + dice_2 === 2) {
    return 'failure';
  }
  if(dice_1 + dice_2 === 12) {
    return 'success';
  }
  if(total >= 10) {
    return 'success';
  } else {
    if(total <= 6) {
      return 'failure';
    }
    return 'partial-success';
  }
}
  
