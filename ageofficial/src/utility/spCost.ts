export function parseSpOptions(
  cost: string | number,
  availableSP: number
): number[] {
  const s = String(cost).trim();
  if (!s) return [];

  // N-M range
  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1], 10);
    const hi = parseInt(rangeMatch[2], 10);
    const result: number[] = [];
    for (let i = lo; i <= hi && i <= availableSP; i++) result.push(i);
    return result;
  }

  // N+ open-ended (multiples of N)
  const openMatch = s.match(/^(\d+)\+$/);
  if (openMatch) {
    const step = parseInt(openMatch[1], 10);
    if (step === 0) return [];
    const result: number[] = [];
    for (let i = step; i <= availableSP; i += step) result.push(i);
    return result;
  }

  // Static N
  const n = parseInt(s, 10);
  if (!isNaN(n)) return n <= availableSP ? [n] : [];

  return [];
}

export function getMinSpCost(cost: string | number): number {
  const s = String(cost).trim();
  if (!s) return 0;

  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) return parseInt(rangeMatch[1], 10);

  const openMatch = s.match(/^(\d+)\+$/);
  if (openMatch) return parseInt(openMatch[1], 10);

  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}
