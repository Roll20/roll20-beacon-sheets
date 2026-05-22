import { describe, it, expect } from 'vitest';
import { getEntryById, getEntryByLabel } from '../getEntryBy';

describe('getEntryById', () => {
  it('should find entry by id in flat array', () => {
    const pool = [
      { _id: '1', label: 'First' },
      { _id: '2', label: 'Second' },
      { _id: '3', label: 'Third' },
    ];

    const result = getEntryById('2', pool);
    expect(result).toEqual({ _id: '2', label: 'Second' });
  });

  it('should find entry by id in nested array', () => {
    const pool = [
      [
        { _id: '1', label: 'First' },
        { _id: '2', label: 'Second' },
      ],
      [
        { _id: '3', label: 'Third' },
        { _id: '4', label: 'Fourth' },
      ],
    ];

    const result = getEntryById('3', pool);
    expect(result).toEqual({ _id: '3', label: 'Third' });
  });

  it('should return undefined when id not found in flat array', () => {
    const pool = [
      { _id: '1', label: 'First' },
      { _id: '2', label: 'Second' },
    ];

    const result = getEntryById('999', pool);
    expect(result).toBeUndefined();
  });

  it('should return undefined when id not found in nested array', () => {
    const pool = [[{ _id: '1', label: 'First' }], [{ _id: '2', label: 'Second' }]];

    const result = getEntryById('999', pool);
    expect(result).toBeUndefined();
  });

  it('should return first match in nested arrays', () => {
    const pool = [[{ _id: '1', label: 'First Pool' }], [{ _id: '1', label: 'Second Pool' }]];

    const result = getEntryById('1', pool);
    expect(result).toEqual({ _id: '1', label: 'First Pool' });
  });
});

describe('getEntryByLabel', () => {
  it('should find entry by label in flat array', () => {
    const pool = [
      { _id: '1', label: 'First' },
      { _id: '2', label: 'Second' },
      { _id: '3', label: 'Third' },
    ];

    const result = getEntryByLabel('Second', pool);
    expect(result).toEqual({ _id: '2', label: 'Second' });
  });

  it('should find entry by label in nested array', () => {
    const pool = [
      [
        { _id: '1', label: 'First' },
        { _id: '2', label: 'Second' },
      ],
      [
        { _id: '3', label: 'Third' },
        { _id: '4', label: 'Fourth' },
      ],
    ];

    const result = getEntryByLabel('Fourth', pool);
    expect(result).toEqual({ _id: '4', label: 'Fourth' });
  });

  it('should return undefined when label not found in flat array', () => {
    const pool = [
      { _id: '1', label: 'First' },
      { _id: '2', label: 'Second' },
    ];

    const result = getEntryByLabel('NotFound', pool);
    expect(result).toBeUndefined();
  });

  it('should return undefined when label not found in nested array', () => {
    const pool = [[{ _id: '1', label: 'First' }], [{ _id: '2', label: 'Second' }]];

    const result = getEntryByLabel('NotFound', pool);
    expect(result).toBeUndefined();
  });

  it('should return first match in nested arrays', () => {
    const pool = [[{ _id: '1', label: 'Duplicate' }], [{ _id: '2', label: 'Duplicate' }]];

    const result = getEntryByLabel('Duplicate', pool);
    expect(result).toEqual({ _id: '1', label: 'Duplicate' });
  });
});
