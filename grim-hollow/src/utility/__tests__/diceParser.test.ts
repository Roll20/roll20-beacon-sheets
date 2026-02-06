import { describe, it, expect } from 'vitest';
import { createComponentsFromFormula, getDicePoolAverage } from '../diceParser';

describe('diceParser', () => {
  it('parses a simple dice formula', () => {
    const result = createComponentsFromFormula('1d6 + 2', 'Damage');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ sides: 6, count: 1 });
    expect(result[1]).toEqual({ value: 2, label: 'Damage' });
  });

  it('handles subtractions', () => {
    const result = createComponentsFromFormula('1d20 - 5', 'Check');
    expect(result[1].value).toBe(-5);
    expect(result[1].label).toBe('Check');
  });

  it('returns empty array for empty formula', () => {
    const result = createComponentsFromFormula('');
    expect(result).toEqual([]);
  });

  it('handles multiple dice types', () => {
    const result = createComponentsFromFormula('2d6 + 1d8 + 3', 'Damage');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ sides: 6, count: 2 });
    expect(result[1]).toEqual({ sides: 8, count: 1 });
    expect(result[2]).toEqual({ value: 3, label: 'Damage' });
  });

  it('filters out zero constants', () => {
    const result = createComponentsFromFormula('1d20 + 0', 'Check');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ sides: 20, count: 1 });
  });

  it('handles negative dice counts', () => {
    const result = createComponentsFromFormula('1d20 - 1d4', 'Check');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ sides: 20, count: 1 });
    expect(result[1]).toEqual({ sides: 4, count: -1 });
  });

  it('returns error component for invalid formula', () => {
    const result = createComponentsFromFormula('invalid', 'Test');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ label: 'Test (Invalid Formula)', value: 0 });
  });

  it('works without baseLabel', () => {
    const result = createComponentsFromFormula('1d6 + 2');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ sides: 6, count: 1 });
    expect(result[1]).toEqual({ value: 2, label: undefined });
  });

  it('handles complex formulas', () => {
    const result = createComponentsFromFormula('3d8 + 2d6 - 1d4 + 5', 'Attack');

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ sides: 8, count: 3 });
    expect(result[1]).toEqual({ sides: 6, count: 2 });
    expect(result[2]).toEqual({ sides: 4, count: -1 });
    expect(result[3]).toEqual({ value: 5, label: 'Attack' });
  });

 
});
 describe('getDicePoolAverage', () => {
    it('calculates average for numeric values', () => {
      const pool = [5, 10, -3];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(12);
    });

    it('calculates average for simple dice formula', () => {
      const pool = ['1d6'];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(3.5);
    });

    it('calculates average for dice formula with modifier', () => {
      const pool = ['1d6 + 2'];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(5.5);
    });

    it('calculates average for mixed pool', () => {
      const pool = [5, '1d6', 3];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(11.5);
    });

    it('handles multiple dice types', () => {
      const pool = ['2d6 + 1d8'];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(11.5);
    });

    it('handles subtraction in formulas', () => {
      const pool = ['1d20 - 1d4'];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(8);
    });

    it('handles negative numbers', () => {
      const pool = [-5, '1d6'];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(-1.5);
    });

    it('ignores invalid formulas', () => {
      const pool = [5, 'invalid', 3];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(8); // ignoring invalid
    });

    it('returns 0 for empty pool', () => {
      const pool: (number | string)[] = [];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(0);
    });

    it('handles complex mixed pool', () => {
      const pool = [10, '2d8 + 3', -2, '1d4'];
      const result = getDicePoolAverage(pool);
      expect(result).toBe(22.5); // 10 + (9+3) + (-2) + 2.5
    });
  });