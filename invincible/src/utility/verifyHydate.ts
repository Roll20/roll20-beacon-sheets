export const isIterable = (x: unknown): x is any[] => {
  return Array.isArray(x) && x.length > 0;
};
