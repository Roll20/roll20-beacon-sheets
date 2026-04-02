import { describe, it, expect } from 'vitest';
import { createDiceExpression, simplifyDiceExpression } from '../simplifyDiceExpression';
import { parse } from 'dice-notation';

describe('simplifyDiceExpression', () => {
  it('should simplify a simple dice expression', () => {
    const result = createDiceExpression(['1d6']);
    expect(result).toBe('d6');
  });

  it('should combine multiple dice of the same type', () => {
    const result = createDiceExpression(['1d6', '2d6']);
    expect(result).toBe('3d6');
  });

  it('should handle different dice types', () => {
    const result = createDiceExpression(['1d6', '1d8']);
    expect(result).toBe('d6+d8');
  });

  it('should handle constants', () => {
    const result = createDiceExpression(['1d6', '5']);
    expect(result).toBe('d6+5');
  });

  it('should handle negative modifiers', () => {
    const result = createDiceExpression(['1d6', '-2']);
    expect(result).toBe('d6-2');
  });

  it('should simplify complex expressions', () => {
    const result = createDiceExpression(['1d6', '2d6', '-1d6', '3']);
    expect(result).toBe('2d6+3');
  });

  it('should handle expressions with spaces', () => {
    const result = createDiceExpression(['1d 6', '2d 8']);
    expect(result).toBe('d6+2d8');
  });

  it('should omit dice with zero count', () => {
    const result = createDiceExpression(['1d6', '-1d6', '5']);
    expect(result).toBe('5');
  });

  it('should handle numeric values in pool', () => {
    const result = createDiceExpression([5, '1d6']);
    expect(result).toBe('d6+5');
  });

  it('should handle operators already present', () => {
    const result = createDiceExpression(['1d6', '2d8', '-3']);
    expect(result).toBe('d6+2d8-3');
  });

  it('should combine constants correctly', () => {
    const result = createDiceExpression(['5', '3', '-2']);
    expect(result).toBe('6');
  });

  it('should handle a pre-parsed object directly', () => {
    const ast = parse('1d6+5');
    const result = simplifyDiceExpression(ast);
    expect(result).toBe('d6+5');
  });

  it('should handle negative dice at the start of expression', () => {
    const result = createDiceExpression(['-1d6']);
    expect(result).toBe('-d6');
  });

  it('should handle negative dice in the middle of expression', () => {
    const result = createDiceExpression(['1d8', '-1d6']);
    expect(result).toBe('d8-d6');
  });

  it('should handle negative constants at the start', () => {
    const result = createDiceExpression(['-5']);
    expect(result).toBe('-5');
  });
});
