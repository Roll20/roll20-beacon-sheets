import { describe, it, expect } from 'vitest';
import { transformDnDProficiency } from '../transformProficiency';

describe('dnd-transformers/transformProficiency', () => {
  it('extracts name and category from properties', () => {
    const rawPayload = { name: 'Common' };
    const properties = { Type: 'Language' };

    const result = transformDnDProficiency(rawPayload, {}, properties);

    expect(result).toEqual({
      name: 'Common',
      category: 'Language',
    });
  });

  it('extracts Tool category', () => {
    const rawPayload = { name: "Thieves' Tools" };
    const properties = { Type: 'Tool' };

    const result = transformDnDProficiency(rawPayload, {}, properties);

    expect(result).toEqual({
      name: "Thieves' Tools",
      category: 'Tool',
    });
  });

  it('handles missing Type property', () => {
    const rawPayload = { name: 'Light Armor' };
    const properties = {};

    const result = transformDnDProficiency(rawPayload, {}, properties);

    expect(result).toEqual({
      name: 'Light Armor',
      category: undefined,
    });
  });

  it('preserves original name casing', () => {
    const rawPayload = { name: 'Elvish' };
    const properties = { Type: 'Language' };

    const result = transformDnDProficiency(rawPayload, {}, properties);

    expect(result.name).toBe('Elvish');
  });
});
