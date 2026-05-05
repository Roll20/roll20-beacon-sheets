import { describe, it, expect } from 'vitest';
import { parseSpOptions, getMinSpCost } from './spCost';

describe('parseSpOptions', () => {
  it('static cost returns single-element array', () => {
    expect(parseSpOptions('2', 5)).toEqual([2]);
  });

  it('static cost not affordable returns empty array', () => {
    expect(parseSpOptions('3', 2)).toEqual([]);
  });

  it('range returns every integer in range when fully affordable', () => {
    expect(parseSpOptions('1-3', 5)).toEqual([1, 2, 3]);
  });

  it('range clips to affordable values', () => {
    expect(parseSpOptions('1-3', 2)).toEqual([1, 2]);
  });

  it('range not affordable returns empty array', () => {
    expect(parseSpOptions('2-4', 1)).toEqual([]);
  });

  it('open-ended N+ returns multiples of N up to availableSP', () => {
    expect(parseSpOptions('2+', 6)).toEqual([2, 4, 6]);
  });

  it('open-ended 1+ returns every value up to availableSP', () => {
    expect(parseSpOptions('1+', 4)).toEqual([1, 2, 3, 4]);
  });

  it('open-ended not affordable returns empty array', () => {
    expect(parseSpOptions('3+', 2)).toEqual([]);
  });

  it('handles legacy numeric value coerced to string', () => {
    expect(parseSpOptions(String(2), 5)).toEqual([2]);
  });
});

describe('getMinSpCost', () => {
  it('static cost', () => expect(getMinSpCost('2')).toBe(2));
  it('range picks lower bound', () => expect(getMinSpCost('1-3')).toBe(1));
  it('open-ended picks N', () => expect(getMinSpCost('2+')).toBe(2));
  it('returns 0 for empty string', () => expect(getMinSpCost('')).toBe(0));
});
