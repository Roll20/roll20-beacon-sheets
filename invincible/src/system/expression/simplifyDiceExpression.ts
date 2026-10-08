import { simplify } from 'mathjs';

interface DiceToken {
  count: number;
  sides: string;
  modifier: string;
  key: string;
  varName: string;
}

export const simplifyDiceExpression = (expression: string): string => {
  const diceRegex = /(?<![a-zA-Z0-9])(\d*)d(\d+)([a-zA-Z!><=]*\d*)*/gi;

  const registry: Record<string, DiceToken> = {};
  let varCounter = 0;

  const matches: Array<{ raw: string; count: number; key: string }> = [];

  let match;
  const localRegex = new RegExp(diceRegex);
  while ((match = localRegex.exec(expression)) !== null) {
    const raw = match[0];
    const countStr = match[1];
    const sides = match[2];
    const modifier = match[3] || '';
    const count = countStr ? parseInt(countStr, 10) : 1;
    const key = `d${sides}${modifier}`;

    if (!registry[key]) {
      registry[key] = {
        count,
        sides,
        modifier,
        key,
        varName: `dice_${varCounter++}`
      };
    }
    matches.push({ raw, count, key });
  }

  
  if (matches.length === 0) {
    return expression;
  }

  
  let protectedExpr = expression;
  const sortedMatches = [...matches].sort((a, b) => b.raw.length - a.raw.length);
  for (const m of sortedMatches) {
    const token = registry[m.key];
    protectedExpr = protectedExpr.replace(m.raw, `${m.count} * ${token.varName}`);
  }

  
  const simplified = simplify(protectedExpr).toString();

  
  let restored = simplified;
  const tokens = Object.values(registry).sort((a, b) => b.varName.length - a.varName.length);

  for (const token of tokens) {
    const patternMultiply = new RegExp(`(\\d+)\\s*\\*\\s*${token.varName}`, 'g');
    const patternMultiplyRev = new RegExp(`${token.varName}\\s*\\*\\s*(\\d+)`, 'g');

    restored = restored.replace(patternMultiply, (_, count) => `${count}${token.key}`);
    restored = restored.replace(patternMultiplyRev, (_, count) => `${count}${token.key}`);

    const patternStandalone = new RegExp(`(?<![a-zA-Z0-9_])${token.varName}(?![a-zA-Z0-9_])`, 'g');
    restored = restored.replace(patternStandalone, () => token.key);
  }

  
  const factorPattern = /\b(\d+)\s*\*\s*\(([^)]+)\)/g;
  restored = restored.replace(factorPattern, (match, multiplierStr, content) => {
    const multiplier = parseInt(multiplierStr, 10);
    const termsPattern = /([+-]?)\s*([^+-]+)/g;
    let termMatch;
    const expandedTerms: string[] = [];
    
    while ((termMatch = termsPattern.exec(content)) !== null) {
      const sign = termMatch[1] || '+';
      const termContent = termMatch[2].trim();
      
      if (!isNaN(Number(termContent))) {
        const val = Number(termContent) * multiplier;
        expandedTerms.push(`${sign} ${val}`);
      } else {
        const dicePattern = /^(\d*)d(.+)$/;
        const diceMatch = termContent.match(dicePattern);
        if (diceMatch) {
          const currentCount = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1;
          const newCount = currentCount * multiplier;
          expandedTerms.push(`${sign} ${newCount}d${diceMatch[2]}`);
        } else {
          expandedTerms.push(`${sign} ${multiplier}${termContent}`);
        }
      }
    }
    
    let joined = expandedTerms.join(' ');
    joined = joined.trim();
    if (joined.startsWith('+')) {
      joined = joined.substring(1).trim();
    }
    return joined;
  });

  
  return restored
    .replace(/\+/g, ' + ')
    .replace(/(?<![dD\s])-/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
};
