import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDiceFromExpression } from '../getDiceFromExpression';
import { serialize } from 'dice-notation';

vi.mock('dice-notation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('dice-notation')>();
  return {
    ...actual,
    serialize: vi.fn(actual.serialize),
  };
});

describe('getDiceFromExpression', () => {
  describe('Error Handling', () => {
    it('catches unexpected errors during serialization', () => {
      const mockError = new Error('Unexpected serialization failure');
      vi.mocked(serialize).mockImplementationOnce(() => {
        throw mockError;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = getDiceFromExpression('1d6');

      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('Dice parsing failed for placeholder:', mockError);

      consoleSpy.mockRestore();
    });
  });

  it('returns the expression unchanged if it only contains dice', () => {
    const input = '1d6';
    const result = getDiceFromExpression(input);
    expect(result).toBe('1d6');
  });

  it('extracts a single die from a formula with a constant addition', () => {
    const input = '1d8 + 5';
    const result = getDiceFromExpression(input);
    expect(result).toBe('1d8');
  });

  it('extracts a single die from a formula with a constant subtraction', () => {
    const input = '2d6 - 2';
    const result = getDiceFromExpression(input);
    expect(result).toBe('2d6');
  });

  it('extracts multiple dice types while removing constants', () => {
    const input = '1d8 + 2d6 + 4';
    const result = getDiceFromExpression(input);
    expect(result).toBe('1d8 + 2d6');
  });

  it('handles complex mixed expressions', () => {
    const input = '10 + 1d20 + 3';
    const result = getDiceFromExpression(input);
    expect(result).toBe('1d20');
  });

  it('returns an empty string if the expression contains only constants', () => {
    expect(getDiceFromExpression('10')).toBe('');
  });

  it('returns an empty string if the expression is empty', () => {
    expect(getDiceFromExpression('')).toBe('');
  });

  it('returns an empty string if the input is not a string (defensive check)', () => {
    // @ts-ignore
    expect(getDiceFromExpression(null)).toBe('');
    // @ts-ignore
    expect(getDiceFromExpression(undefined)).toBe('');
    // @ts-ignore
    expect(getDiceFromExpression(123)).toBe('');
  });

  it('returns an empty string if the expression is invalid syntax', () => {
    expect(getDiceFromExpression('invalid formula text')).toBe('');
  });
});
