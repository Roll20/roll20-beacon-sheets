import * as z from 'zod';
import { effectKeys } from '../../effects.config';
import { RequirementSchema } from './common';

export const parts1 = ['cl', 'ow'] as const;
export const parts2 = ['<', '<=', '=', '=>', '>'] as const; // keep exactly as given
export const parts3 = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

export const levelRequirements = Array.from(parts1).flatMap((p1) =>
  Array.from(parts2).flatMap((p2) => Array.from(parts3).map((p3) => `${p1}${p2}${p3}` as const)),
);

export const allEffectKeys = Object.values(effectKeys) as [string, ...string[]];

export const allRequirements = ['attuned', 'equipped', ...levelRequirements] as const;

export const SingleEffectBase = z.object({
  attribute: z.enum(allEffectKeys),
  operation: z.enum([
    'add',
    'subtract',
    'set',
    'set-base',
    'set-min',
    'set-max',
    'add-formula',
    'subtract-formula',
    'set-formula',
    'set-base-formula',
    'set-min-formula',
    'set-max-formula',
    'set-base-final',
    'set-base-final-formula',
    'set-final',
    'set-final-formula',
    'push',
  ]),
  required: z.array(RequirementSchema).optional(),
});

const SingleEffectWithValue = SingleEffectBase.extend({
  value: z.union([z.number(), z.string()]),
  formula: z.undefined(),
});

const SingleEffectWithFormula = SingleEffectBase.extend({
  value: z.undefined(),
  formula: z.string(),
});

export const SingleEffectSchema = z.union([SingleEffectWithValue, SingleEffectWithFormula]);
