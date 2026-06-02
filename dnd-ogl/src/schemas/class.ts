import { z } from 'zod';
import { config } from '@/config';
import { SpellCastingProgressionSchema, StandardSpellSourceSchema } from './spell';
import { FeatureSchema } from './feature';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { type CasterType } from '@/sheet/stores/spells/spellsStore';
import { ca } from 'zod/v4/locales';

export const LevelSchema = z.number().min(1).max(20);

export const FeatureIdSchema = z.object({
  level: LevelSchema,
  id: z.string(),
});

export const DataFeaturesSchema = z.record(
  z.enum([
    'level-1',
    'level-2',
    'level-3',
    'level-4',
    'level-5',
    'level-6',
    'level-7',
    'level-8',
    'level-9',
    'level-10',
    'level-11',
    'level-12',
    'level-13',
    'level-14',
    'level-15',
    'level-16',
    'level-17',
    'level-18',
    'level-19',
    'level-20',
  ]),
  FeatureSchema.array(),
);

const ClassSpellCasting = z.object({
  type: z.literal('ability'),
  ability: z.custom<AbilityKey>(),
});

const BaseClassCompendiumSchema = z.object({
  name: z.string(),
  hitDie: z.enum([...config.hitDieSize]),
  subclassUnlockLevel: LevelSchema.optional(),
  'data-features': DataFeaturesSchema.optional(),
});

const WithSpellcasting = BaseClassCompendiumSchema.extend({
  spellcasting: SpellCastingProgressionSchema,
  'data-spellSource': StandardSpellSourceSchema
});

const WithoutSpellcasting = BaseClassCompendiumSchema.extend({
  spellcasting: z.undefined().optional(),
  cantripsKnown: z.undefined().optional(),
  spellsKnown: z.undefined().optional(),
  preparedCaster: z.undefined().optional(),
  'data-spellSource': z.undefined().optional(),
});

export const ClassCompendiumSchema = z.union([WithSpellcasting, WithoutSpellcasting]);

export const ClassSchema = ClassCompendiumSchema.and(
  z.object({
    _id: z.string().optional(),
    sourceBook: z.number().optional(),
    hitPoints: z.array(z.number()).optional(),
    level: LevelSchema.optional(),
    subclass: z.string().optional(),
    subclassSourceBook: z.number().optional(),
    spellSourceId: z.string().optional(),
    featureIds: z.array(FeatureIdSchema).optional(),
    subclassFeatureIds: z.array(FeatureIdSchema).optional(),
  }),
);
