import { z } from 'zod';
import { DataFeaturesSchema, FeatureIdSchema } from './class';

export const TransformationCompendiumSchema = z.object({
  name: z.string(),
  'data-features': DataFeaturesSchema.optional(),
});

export const TransformationSchema = TransformationCompendiumSchema.and(z.object({
  sourceBook: z.number().optional(),
  featureIds: z.array(FeatureIdSchema).optional(),
  compendiumData: z.object({
    transformation: z.string().optional(),
  }).optional()
}));