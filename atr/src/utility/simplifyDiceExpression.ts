import { type DicePool } from '@/sheet/stores/modifiers/modifiersStore';
import { parse } from 'dice-notation';

const simplifyDiceExpression = (
  expression: string | ReturnType<typeof parse>
): string => {
  const entries = typeof expression === 'string' ? parse(expression) : expression;
  const diceMap: Record<string, number> = {};
  let constant = 0;

  for (const entry of entries) {
    const sign = entry.sign === '-' ? -1 : 1;

    if (entry.type === 'constant') {
      constant += sign * entry.constant.value;
    } else if (entry.type === 'rollable') {
      const { size, count } = entry.rollable;
      const key = `d${size}`;
      diceMap[key] = (diceMap[key] || 0) + sign * count;
    }
  }

  const parts: string[] = [];

  for (const [die, count] of Object.entries(diceMap)) {
    if (count === 0) continue;
    const abs = Math.abs(count);
    const prefix = count < 0 ? '-' : parts.length > 0 ? '+' : '';
    parts.push(`${prefix}${abs > 1 ? abs : ''}${die}`);
  }

  if (constant !== 0) {
    const prefix = constant < 0 ? '-' : parts.length > 0 ? '+' : '';
    parts.push(`${prefix}${Math.abs(constant)}`);
  }

  return parts.join('');
};


export const createDiceExpression = (pool: DicePool): string => {
  const isMathRegex = /^\+|^\-|^\*|^\\|^\//g
  const parts = pool.map((die, index) => {
    const trimmed = typeof die === 'number' ? String(die) : (die as string).replace(/ /g, '');
    if(index === 0) return trimmed;
    return isMathRegex.test(trimmed)
      ? trimmed
      : `+${trimmed}`
    ;
  });
  return simplifyDiceExpression(parts.join(''));
};



