import type { DiceComponent } from '../rolltemplates';

export const sumComponents = (components: DiceComponent[], multiplier = 1) =>
  components.reduce((sum, component) => sum + (component.value ?? 0), 0) * multiplier;
