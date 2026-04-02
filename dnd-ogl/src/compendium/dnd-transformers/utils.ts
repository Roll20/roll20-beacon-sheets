export const abilityMap: Record<string, string> = {
  str: 'strength',
  dex: 'dexterity',
  con: 'constitution',
  int: 'intelligence',
  wis: 'wisdom',
  cha: 'charisma',
};

/**
 * Transforms a single formula placeholder.
 * e.g., @{charisma_mod} -> @{charisma-modifier}
 * e.g., @{Strength} -> @{strength}
 */
const transformFormulaSyntax = (formula: string): string => {
  if (typeof formula !== 'string') return formula;

  // Regex to find all @{...} placeholders
  return formula.replace(/@\{([^}]+)\}/g, (match, content) => {
    let key = content.trim().toLowerCase();
    
    if (key.endsWith('_mod')) {
      const rawKey = key.replace('_mod', '');
      const ability = abilityMap[rawKey] || rawKey; 
      return `@{${ability}-modifier}`;
    }

    if (abilityMap[key]) {
      return `@{${abilityMap[key]}}`;
    }

    key = key.replace(/_/g, '-');
    
    return `@{${key}}`;
  });
};

/**
 * Recursively traverses an object or array and applies the formula transformation to every string value it finds.
 */
export const deepTransformFormulas = (data: any): any => {
  if (typeof data === 'string') {
    return transformFormulaSyntax(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => deepTransformFormulas(item));
  }

  if (data && typeof data === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = deepTransformFormulas(data[key]);
      }
    }
    return newObj;
  }

  return data;
};

export const parseStatBlock = (statString?: string): Record<string, number> => {
  if (!statString) return {};
  const stats: Record<string, number> = {};
  statString.split(',').forEach(part => {
    const match = part.trim().match(/([a-zA-Z\s]+?)\s*\+?(-?\d+)/);
    if (match) {
      // Convert "Con" to "constitution", "Arcana" to "arcana"
      const abilityMap: Record<string, string> = { con: 'constitution', str: 'strength', dex: 'dexterity', int: 'intelligence', wis: 'wisdom', cha: 'charisma' };
      let statName = match[1].trim().toLowerCase();
      statName = abilityMap[statName] || statName.replace(/\s+/g, '-');
      stats[statName] = parseInt(match[2], 10);
    }
  });
  return stats;
};

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);