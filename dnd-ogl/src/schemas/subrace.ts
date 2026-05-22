import { z } from 'zod';
import { DataFeaturesSchema, FeatureIdSchema } from './class';

const CompatibleWithRace = z.object({
  name: z.string(),
  sourceBook: z.number().optional(),
});

export const SubraceCompendiumSchema = z.object({
  name: z.string(),
  'data-compatibility': CompatibleWithRace.array().optional(),
  'data-features': DataFeaturesSchema.optional(),
});

export const SubraceSchema = SubraceCompendiumSchema.and(z.object({
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