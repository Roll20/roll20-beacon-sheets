import { z } from 'zod';
import { EffectSchema } from './effect';
import { SpellSchema } from './spell';

export const FeatureCompendiumSchema = z.object({
  label: z.string(),
  group: z.enum([
    'class-features',
    'core-personality-traits',
    'ancestry-features',
    'feats',
    'others',
  ]),
  description: z.string(),
  validUntilLevel: z.number().min(1).max(20).optional(),
  'data-tags': z.array(z.string()).optional(),
  'data-effects': EffectSchema.optional(),
  'data-spells': z.array(SpellSchema).optional(),
});

export const FeatureSchema = FeatureCompendiumSchema.extend({
  _id: z.string().optional(),
  effectId: z.string().optional(),
  tagId: z.string().optional(),
});