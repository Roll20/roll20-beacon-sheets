import { z } from 'zod';

export const ResourceCompendiumSchema = z.object({
  name: z.string(),
  count: z.number().optional(),
  max: z.string(),
  refreshOnShortRest: z.enum(['none', 'all', 'fixed-value']).optional(),
  refreshOnLongRest: z.enum(['none', 'all', 'fixed-value']).optional(),
  refreshOnDawn: z.enum(['none', 'all', 'fixed-value']).optional(),
  refreshOnShortRestAmount: z.string().optional(),
  refreshOnLongRestAmount: z.string().optional(),
  refreshOnDawnAmount: z.string().optional(),
});

export const ResourceSchema = ResourceCompendiumSchema.extend({
  _id: z.string().optional(),
  count: z.number().optional(),
});
