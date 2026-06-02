import { describe, it, expect } from 'vitest';
import { deepTransformFormulas, parseStatBlock, capitalize } from '../utils';

describe('dnd-transformers/utils', () => {
  describe('deepTransformFormulas', () => {
    it('transforms basic formula placeholders', () => {
      const input = '1d8 + @{strength}';
      const result = deepTransformFormulas(input);
      expect(result).toBe('1d8 + @{strength}');
    });

    it('transforms ability abbreviations to full names', () => {
      const input = '@{str} + @{dex} + @{con}';
      const result = deepTransformFormulas(input);
      expect(result).toBe('@{strength} + @{dexterity} + @{constitution}');
    });

    it('transforms _mod suffixes to -modifier', () => {
      const input = '1d20 + @{charisma_mod}';
      const result = deepTransformFormulas(input);
      expect(result).toBe('1d20 + @{charisma-modifier}');
    });

    it('transforms abbreviations with _mod suffix correctly', () => {
      const input = '1d8 + @{str_mod}';
      const result = deepTransformFormulas(input);
      expect(result).toBe('1d8 + @{strength-modifier}');
    });

    it('handles arrays recursively', () => {
      const input = ['@{wis}', '@{int_mod}'];
      const result = deepTransformFormulas(input);
      expect(result).toEqual(['@{wisdom}', '@{intelligence-modifier}']);
    });

    it('handles nested objects recursively', () => {
      const input = {
        name: 'Test',
        formula: '@{cha_mod}',
        nested: {
          save: '@{dex}',
        },
      };
      const result = deepTransformFormulas(input);
      expect(result).toEqual({
        name: 'Test',
        formula: '@{charisma-modifier}',
        nested: {
          save: '@{dexterity}',
        },
      });
    });

    it('ignores non-string, non-object inputs', () => {
      expect(deepTransformFormulas(123)).toBe(123);
      expect(deepTransformFormulas(null)).toBe(null);
      expect(deepTransformFormulas(undefined)).toBe(undefined);
    });

    it('handles mixed content case insensitively', () => {
      const input = '@{STR_MOD} + @{Wis}';
      const result = deepTransformFormulas(input);
      expect(result).toBe('@{strength-modifier} + @{wisdom}');
    });
  });

  describe('parseStatBlock', () => {
    it('parses ability abbreviations and values', () => {
      const input = 'Str +1, Dex +3';
      const result = parseStatBlock(input);
      expect(result).toEqual({
        strength: 1,
        dexterity: 3,
      });
    });

    it('parses full ability names', () => {
      const input = 'Constitution +4, Wisdom -1';
      const result = parseStatBlock(input);
      expect(result).toEqual({
        constitution: 4,
        wisdom: -1,
      });
    });

    it('parses skill names with spaces', () => {
      const input = 'Animal Handling +5, Sleight of Hand +2';
      const result = parseStatBlock(input);
      expect(result).toEqual({
        'animal-handling': 5,
        'sleight-of-hand': 2,
      });
    });

    it('handles negative values', () => {
      const input = 'Int -2, Cha -1';
      const result = parseStatBlock(input);
      expect(result).toEqual({
        intelligence: -2,
        charisma: -1,
      });
    });

    it('handles values without explicit plus sign', () => {
      const input = 'Str 10, Dex 14';
      const result = parseStatBlock(input);
      expect(result).toEqual({
        strength: 10,
        dexterity: 14,
      });
    });

    it('returns empty object for empty input', () => {
      expect(parseStatBlock('')).toEqual({});
      expect(parseStatBlock(undefined)).toEqual({});
    });

    it('handles messy whitespace', () => {
      const input = '  Str   +3 ,   Dex+2  ';
      const result = parseStatBlock(input);
      expect(result).toEqual({
        strength: 3,
        dexterity: 2,
      });
    });
  });

  describe('capitalize', () => {
    it('capitalizes the first letter of a word', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('leaves already capitalized words alone', () => {
      expect(capitalize('World')).toBe('World');
    });

    it('handles empty string gracefully', () => {
      expect(capitalize('')).toBe('');
    });

    it('does not affect subsequent characters', () => {
      expect(capitalize('tEST')).toBe('TEST');
    });
  });
});