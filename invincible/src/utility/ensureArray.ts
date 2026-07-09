export const ensureArray = <T = any>(val: any): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    
    const keys = Object.keys(val).filter(k => !isNaN(Number(k)));
    if (keys.length > 0) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map(k => val[k]);
    }
    
    return Object.values(val) as T[];
  }
  return [];
};
