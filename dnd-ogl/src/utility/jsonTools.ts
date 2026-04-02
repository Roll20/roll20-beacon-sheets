export const jsonClone = <T>(value: T): T => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.error('Error cloning value:', error);
    return value;
  }
};

export function stripIds<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(stripIds) as T;
  }
  if (obj && typeof obj === 'object') {
    const { _id, ...rest } = obj as any;
    for (const key in rest) {
      rest[key] = stripIds(rest[key]);
    }
    return rest as T;
  }
  return obj;
}