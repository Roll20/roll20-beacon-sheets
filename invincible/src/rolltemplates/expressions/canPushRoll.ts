import type { DiceComponent } from '../rolltemplates';

export const canPushRoll = (components: DiceComponent[] | Record<string, DiceComponent[]>): boolean => {
  if (!components) return false;
  const flatComponents = Array.isArray(components) ? components : Object.values(components).flat();
  for (const component of flatComponents) {
    if (component.sides === 6 && component.rawResults && component.rawResults.length > 0) {
      for (const result of component.rawResults) {
        const val = typeof result === 'object' ? result.value : result;
        if (val >= 2 && val <= 5) {
          return true;
        }
      }
    }
  }
  return false;
};
