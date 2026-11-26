import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { objectifiedArray, flexibleArray } from '../objectify';

describe('objectifiedArray', () => {
  const schema = objectifiedArray(z.object({
    _id: z.string(),
    name: z.string()
  }));

  it('handles standard array input', () => {
    const input = [
      { _id: '1', name: 'Talent A' },
      { _id: '2', name: 'Talent B' }
    ];
    const result = schema.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  it('filters out null and undefined array items', () => {
    const input = [
      { _id: '1', name: 'Talent A' },
      null,
      undefined,
      { _id: '2', name: 'Talent B' }
    ];
    const result = schema.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { _id: '1', name: 'Talent A' },
      { _id: '2', name: 'Talent B' }
    ]);
  });

  it('handles objectified array (record) input', () => {
    const input = {
      'id-1': { name: 'Talent A', arrayPosition: 0 },
      'id-2': { name: 'Talent B', arrayPosition: 1 }
    };
    const result = schema.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { _id: 'id-1', name: 'Talent A' },
      { _id: 'id-2', name: 'Talent B' }
    ]);
  });

  it('handles empty and whitespace string input by defaulting to empty array', () => {
    expect(schema.safeParse('').data).toEqual([]);
    expect(schema.safeParse('   ').data).toEqual([]);
  });

  it('handles stringified JSON arrays', () => {
    const jsonStr = JSON.stringify([
      { _id: '1', name: 'Talent A' },
      { _id: '2', name: 'Talent B' }
    ]);
    const result = schema.safeParse(jsonStr);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { _id: '1', name: 'Talent A' },
      { _id: '2', name: 'Talent B' }
    ]);
  });

  it('handles stringified JSON objects (objectified array)', () => {
    const jsonStr = JSON.stringify({
      'id-1': { name: 'Talent A', arrayPosition: 0 }
    });
    const result = schema.safeParse(jsonStr);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { _id: 'id-1', name: 'Talent A' }
    ]);
  });

  it('gracefully falls back to empty array on corrupt/invalid string input', () => {
    const result = schema.safeParse('corrupt-string-data');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('handles Firebase index-based map input', () => {
    const input = {
      '0': { _id: '1', name: 'Talent A' },
      '1': { _id: '2', name: 'Talent B' }
    };
    const result = schema.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { _id: '1', name: 'Talent A' },
      { _id: '2', name: 'Talent B' }
    ]);
  });

  it('handles standard array of primitive strings stored as index-based maps', () => {
    const stringSchema = flexibleArray(z.string());
    const input = {
      '0': 'child-1',
      '1': 'child-2'
    };
    const result = stringSchema.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(['child-1', 'child-2']);
  });

  it('handles objectified array (record) input where keys are numeric string IDs', () => {
    const input = {
      '1': { name: 'Talent A', arrayPosition: 0 },
      '2': { name: 'Talent B', arrayPosition: 1 }
    };
    const result = schema.safeParse(input);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { _id: '1', name: 'Talent A' },
      { _id: '2', name: 'Talent B' }
    ]);
  });
});
