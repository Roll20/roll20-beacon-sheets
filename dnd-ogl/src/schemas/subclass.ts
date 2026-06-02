import { z } from 'zod';
import { SpellCastingProgressionSchema, StandardSpellSourceSchema } from './spell';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { DataFeaturesSchema, FeatureIdSchema } from './class';
import { config } from '@/config';

const CompatibleWithClass = z.object({
  name: z.string(),
  sourceBook: z.number().optional(),
});

const BaseSubclassCompendiumSchema = z.object({
  name: z.string(),
  'data-compatibility': CompatibleWithClass.array().optional(),
  'data-features': DataFeaturesSchema.optional(),
});

const WithSpellcasting = BaseSubclassCompendiumSchema.extend({
  spellcasting: SpellCastingProgressionSchema,
  'data-spellSource': StandardSpellSourceSchema
});

const WithoutSpellcasting = BaseSubclassCompendiumSchema.extend({
  spellcasting: z.undefined().optional(),
  'data-spellSource': z.undefined().optional(),
});

export const SubclassCompendiumSchema = z.union([
  WithSpellcasting,
  WithoutSpellcasting,
]);

export const SubclassSchema = SubclassCompendiumSchema.and(z.object({
  _id: z.string().optional(),
  subclass: z.string().optional(),
  subclassSourceBook: z.number().optional(),
  subclassFeatureIds: z.array(FeatureIdSchema).optional(),
  spellSourceId: z.string().optional(),
}));