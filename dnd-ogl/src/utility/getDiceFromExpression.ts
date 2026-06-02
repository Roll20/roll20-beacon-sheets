import { parse, serialize } from 'dice-notation';

type ParsedComponent = {
  type: 'rollable' | 'constant';
};

/**
 * Extracts only the dice components from a damage expression string.
 */
export function getDiceFromExpression(expression: string): string {
  if (!expression || typeof expression !== 'string') {
    return '';
  }

  try {
    let components: ParsedComponent[];
    try {
      components = parse(expression) as ParsedComponent[];
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