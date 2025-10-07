import * as z from 'zod';
import { allRequirements, allEffectKeysWithPickers } from './common';

export const SingleEffectBase = z.object({
  attribute: z.enum(allEffectKeysWithPickers),
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
  required: z.array(z.enum(allRequirements)).optional(),
});

const SingleEffectWithValue = SingleEffectBase.extend({
  value: z.union([z.number(), z.string()]),
  formula: z.undefined(),
});

const SingleEffectWithFormula = SingleEffectBase.extend({
  value: z.undefined(),
  formula: z.string(),
});

export const SingleEffectSchema = z.union([
  SingleEffectWithValue,
  SingleEffectWithFormula,
]);
