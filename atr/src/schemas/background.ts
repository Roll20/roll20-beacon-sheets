import { z } from 'zod';
import { DataFeaturesSchema, FeatureIdSchema } from './class';

export const BackgroundCompendiumSchema = z.object({
  name: z.string(),
  'data-features': DataFeaturesSchema.optional(),
});

export const BackgroundSchema = BackgroundCompendiumSchema.and(z.object({
  sourceBook: z.number().optional(),
  featureIds: z.array(FeatureIdSchema).optional(),
  compendiumData: z.string().optional(),
}));