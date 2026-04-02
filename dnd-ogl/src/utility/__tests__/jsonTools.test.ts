import { describe, it, expect } from 'vitest';
import { stripIds, jsonClone } from '../jsonTools';

describe('stripIds', () => {
  it('should return primitive values unchanged', () => {
    expect(stripIds('string')).toBe('string');
    expect(stripIds(42)).toBe(42);
    expect(stripIds(true)).toBe(true);
    expect(stripIds(null)).toBe(null);
    expect(stripIds(undefined)).toBe(undefined);
  });

  it('should remove _id from a simple object', () => {
    const input = { _id: '123', name: 'Test' };
    const result = stripIds(input);
    expect(result).toEqual({ name: 'Test' });
    expect(result).not.toHaveProperty('_id');
  });

  it('should preserve objects without _id', () => {
    const input = { name: 'Test', value: 42 };
    const result = stripIds(input);
    expect(result).toEqual({ name: 'Test', value: 42 });
  });

  it('should remove _id from nested objects', () => {
    const input = {
      _id: '1',
      user: {
        _id: '2',
        name: 'John',
        profile: {
          _id: '3',
          age: 30,
        },
      },
    };
    const result = stripIds(input);
    expect(result).toEqual({
      user: {
        name: 'John',
        profile: {
          age: 30,
        },
      },
    });
  });

  it('should remove _id from array of objects', () => {
    const input = [
      { _id: '1', name: 'First' },
      { _id: '2', name: 'Second' },
    ];
    const result = stripIds(input);
    expect(result).toEqual([{ name: 'First' }, { name: 'Second' }]);
  });

  it('should handle nested arrays and objects', () => {
    const input = {
      _id: '1',
      items: [
        { _id: '2', value: 'a' },
        { _id: '3', value: 'b' },
      ],
      nested: {
        _id: '4',
        array: [{ _id: '5', data: 'test' }],
      },
    };
    const result = stripIds(input);
    expect(result).toEqual({
      items: [{ value: 'a' }, { value: 'b' }],
      nested: {
        array: [{ data: 'test' }],
      },
    });
  });

  it('should handle empty objects and arrays', () => {
    expect(stripIds({})).toEqual({});
    expect(stripIds([])).toEqual([]);
    expect(stripIds({ _id: '123' })).toEqual({});
  });
});

describe('jsonClone', () => {
  it('should clone primitive values', () => {
    expect(jsonClone('string')).toBe('string');
    expect(jsonClone(42)).toBe(42);
    expect(jsonClone(true)).toBe(true);
    expect(jsonClone(null)).toBe(null);
  });

  it('should clone simple objects', () => {
    const input = { name: 'Test', value: 42 };
    const result = jsonClone(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });

  it('should clone arrays', () => {
    const input = [1, 2, 3];
    const result = jsonClone(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });

  it('should clone nested objects', () => {
    const input = { user: { name: 'John', age: 30 } };
    const result = jsonClone(input);
    expect(result).toEqual(input);
    expect(result.user).not.toBe(input.user);
  });

  it('should return original value when cloning fails with circular reference', () => {
    const circular: any = { name: 'Test' };
    circular.self = circular;
    const result = jsonClone(circular);
    expect(result).toBe(circular);
  });

  it('should lose functions during cloning', () => {
    const input = { name: 'Test', fn: () => {} };
    const result = jsonClone(input);
    expect(result).toEqual({ name: 'Test' });
    expect(result).not.toHaveProperty('fn');
  });
});
