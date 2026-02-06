import { z } from 'zod';
import { EffectSchema } from './effect';
import { SpellSchema } from './spell';

const FilterOperator = z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'includes', 'in']);

const FilterConditionSchema = z.object({
  op: FilterOperator,
  value: z.union([
    z.string(), 
    z.number(), 
    z.boolean(), 
    z.array(z.union([z.string(), z.number()])) 
  ])
});

export const compendiumPickers = z.object({
  label: z.string(),
  category: z.string(),
  filter: z.record(z.string(), FilterConditionSchema).optional(), 
  featureId: z.string().optional(),
  featureLabel: z.string().optional(),
});

export const FeatureCompendiumSchema = z.object({
  label: z.string(),
  group: z.enum([
    'class-features',
    'ancestry-features',
    'feats',
    'others',
    'transformation-features',
    'background-features',
    'traits'
  ]),
  description: z.string(),
  validUntilLevel: z.number().min(1).max(20).optional(),
  'data-tags': z.array(z.string()).optional(),
  'data-effects': EffectSchema.optional(),
  'data-spells': z.array(SpellSchema).optional(),
  compendiumPickers: compendiumPickers.array().optional(),
});

export const FeatureSchema = FeatureCompendiumSchema.extend({
  _id: z.string().optional(),
  effectId: z.string().optional(),
  tagId: z.string().optional(),
});