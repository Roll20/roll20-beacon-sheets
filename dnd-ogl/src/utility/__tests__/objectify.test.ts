import { describe, it, expect } from 'vitest';
import {
  arrayToObject,
  objectToArray,
  arrayToIndexedObject,
  indexedObjectToArray,
} from '../objectify';

describe('arrayToObject', () => {
  it('should convert array to object with _id as keys', () => {
    const input = [
      { _id: '1', name: 'Item 1' },
      { _id: '2', name: 'Item 2' },
    ];
    const result = arrayToObject(input);
    expect(result).toEqual({
      '1': { name: 'Item 1', arrayPosition: 0 },
      '2': { name: 'Item 2', arrayPosition: 1 },
    });
  });

  it('should add arrayPosition to each item', () => {
    const input = [{ _id: 'a', value: 10 }];
    const result = arrayToObject(input);
    expect(result['a'].arrayPosition).toBe(0);
  });

  it('should throw error when item missing _id', () => {
    const input = [{ name: 'No ID' }] as any;
    expect(() => arrayToObject(input)).toThrow(
      'Tried to objectify an array, but not every item had ids',
    );
  });

  it('should handle empty array', () => {
    const result = arrayToObject([]);
    expect(result).toEqual({});
  });
});

describe('objectToArray', () => {
  it('should convert object back to array', () => {
    const input = {
      '1': { name: 'Item 1', arrayPosition: 0 },
      '2': { name: 'Item 2', arrayPosition: 1 },
    };
    const result = objectToArray(input);
    expect(result).toEqual([
      { _id: '1', name: 'Item 1', arrayPosition: undefined },
      { _id: '2', name: 'Item 2', arrayPosition: undefined },
    ]);
  });

  it('should return empty array when object is null or undefined', () => {
    expect(objectToArray(null as any)).toEqual([]);
    expect(objectToArray(undefined as any)).toEqual([]);
  });

  it('should filter out undefined values', () => {
    const input = {
      '1': { name: 'Item 1', arrayPosition: 0 },
      '2': null,
    };
    const result = objectToArray(input);
    expect(result.length).toBe(1);
    expect(result[0]._id).toBe('1');
  });

  it('should preserve original array positions', () => {
    const input = {
      b: { value: 2, arrayPosition: 1 },
      a: { value: 1, arrayPosition: 0 },
    };
    const result = objectToArray(input);
    expect(result[0]._id).toBe('a');
    expect(result[1]._id).toBe('b');
  });
});

describe('arrayToIndexedObject', () => {
  it('should convert array to indexed object', () => {
    const input = ['a', 'b', 'c'];
    const result = arrayToIndexedObject(input);
    expect(result).toEqual({ '0': 'a', '1': 'b', '2': 'c' });
  });

  it('should handle empty array', () => {
    const result = arrayToIndexedObject([]);
    expect(result).toEqual({});
  });

  it('should work with objects', () => {
    const input = [{ id: 1 }, { id: 2 }];
    const result = arrayToIndexedObject(input);
    expect(result).toEqual({ '0': { id: 1 }, '1': { id: 2 } });
  });
});

describe('indexedObjectToArray', () => {
  it('should convert indexed object to array', () => {
    const input = { '0': 'a', '1': 'b', '2': 'c' };
    const result = indexedObjectToArray(input);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should return empty array when object is null or undefined', () => {
    expect(indexedObjectToArray(null as any)).toEqual([]);
    expect(indexedObjectToArray(undefined as any)).toEqual([]);
  });

  it('should sort by numeric keys', () => {
    const input = { '2': 'c', '0': 'a', '1': 'b' };
    const result = indexedObjectToArray(input);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle non-sequential indices', () => {
    const input = { '0': 'first', '5': 'second', '10': 'third' };
    const result = indexedObjectToArray(input);
    expect(result).toEqual(['first', 'second', 'third']);
  });
});
