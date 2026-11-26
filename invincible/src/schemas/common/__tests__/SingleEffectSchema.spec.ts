import { describe, it, expect } from 'vitest';
import { EffectStringSchema } from '../SingleEffectSchema';

describe('EffectStringSchema', () => {
  it('successfully parses valid effect strings with underscores', () => {
    const result = EffectStringSchema.safeParse('slugfest_damage += 4;');
    expect(result.success).toBe(true);
  });

  it('fails to parse invalid effect keys', () => {
    const result = EffectStringSchema.safeParse('invalid_key += 4;');
    expect(result.success).toBe(false);
  });
});
