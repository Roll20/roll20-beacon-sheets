export const constrain = (value: number, constrainTo: number[]) => {
  const candidates = constrainTo.filter((v) => v <= value);
  if (candidates.length === 0) return Math.min(...constrainTo);
  return Math.max(...candidates);
};