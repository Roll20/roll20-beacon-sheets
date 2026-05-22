import { z } from 'zod';
import { DataFeaturesSchema, FeatureIdSchema } from './class';

export const RaceCompendiumSchema = z.object({
  name: z.string(),
  'data-features': DataFeaturesSchema.optional(),
});

export const RaceSchema = RaceCompendiumSchema.and(z.object({
  subrace: z.string().optional(),
  sourceBook: z.number().optional(),
  subraceSourceBook: z.number().optional(),
  featureIds: z.array(FeatureIdSchema).optional(),
  subraceFeatureIds: z.array(FeatureIdSchema).optional(),
  compendiumData: z.object({
    race: z.string().optional(),
    subrace: z.string().optional(),
  }).optional()
}));