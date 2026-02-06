import { describe, it, expect } from 'vitest';
import { isIterable } from '../verifyHydate';

describe('isIterable', () => {
    it('should return true for non-empty arrays', () => {
        expect(isIterable([1])).toBe(true);
        expect(isIterable([1, 2, 3])).toBe(true);
        expect(isIterable(['a', 'b'])).toBe(true);
    });

    it('should return false for empty arrays', () => {
        expect(isIterable([])).toBe(false);
    });

    it('should return false for non-array values', () => {
        expect(isIterable(null)).toBe(false);
        expect(isIterable(undefined)).toBe(false);
        expect(isIterable({})).toBe(false);
        expect(isIterable('string')).toBe(false);
        expect(isIterable(123)).toBe(false);
        expect(isIterable(true)).toBe(false);
    });
});