import { parse, serialize } from 'dice-notation';

/**
 * Extracts only the dice components from a damage expression string.
 */
export function getDiceFromExpression(expression: string): string {
  if (!expression || typeof expression !== 'string') {
    return '';
  }

  try {
    let components: ReturnType<typeof parse>;
    try {
      components = parse(expression);
    } catch {
      return '';
    }
    const diceComponents = components.filter(c => c.type === 'rollable');
    
    if (diceComponents.length === 0) {
      return '';
    }

    return serialize(diceComponents);
  } catch (error) {
    console.error("Dice parsing failed for placeholder:", error);
    return '';
  }
}
