import { z } from 'zod';
import { config } from '../config';
import { DamageSchema } from './damage';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { EffectCompendiumCoreSchema } from './common/effect.core';
import { ta } from 'zod/v4/locales';
import { RequirementSchema } from './common/common';

const SpellLevelSchema = z
  .number()
  .int()
  .min(0)
  .max(config.spellLevels.length - 1);
const SpellSchoolSchema = z.enum([...config.spellSchools] as [string, ...string[]]);
const SpellComponentSchema = z.enum([...config.spellComponents] as [string, ...string[]]);

export const CasterTypeSchema = z.enum(Object.keys(config.casterTypes) as [string, ...string[]]);
export const SpellCastingProgressionSchema = z.union([z.literal('none'), CasterTypeSchema]);

const BaseSpellSourceSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  isPrepared: z.boolean().optional(),
  cantripsKnown: z.array(z.number()).optional(),
  spellsKnown: z.array(z.number()).optional(),
  required: z.array(RequirementSchema).optional(),
});

export const BaseSpellSourceCompendiumSchema = BaseSpellSourceSchema.omit({ _id: true });

export const StandardSpellSourceSchema = BaseSpellSourceSchema.extend({
  type: z.literal('ability'),
  ability: z.custom<AbilityKey>(),
});

export const FlatSpellSourceSchema = BaseSpellSourceSchema.extend({
  type: z.literal('flat'),
  flat: z.number().or(z.string()),
});

export const SpellSourceSchema = z.discriminatedUnion('type', [
  StandardSpellSourceSchema,
  FlatSpellSourceSchema,
]);

export const UpcastModifierSchema = z.object({
  level: SpellLevelSchema,
  castingTime: z.string().optional(),
  range: z.string().optional(),
  duration: z.string().optional(),
  target: z.string().optional(),
  description: z.string().optional(),
  concentration: z.boolean().optional(),
  damage: z.array(DamageSchema).optional(),
});

export const SpellCompatibilitySchema = z.object({
  name: z.enum(['Monster Hunter', 'Cleric', 'Druid', 'Bard', 'Barbarian', 'Fighter', 'Monk', 'Paladin', 'Rogue', 'Wizard', 'Warlock', 'Ranger', 'Sorcerer']),
  sourceBook: z.number().optional(),
});

export const SpellCompendiumSchema = z.object({
  name: z.string(),
  level: SpellLevelSchema.optional(),
  school: SpellSchoolSchema.optional(),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  target: z.string().optional(),
  components: z.array(SpellComponentSchema).optional(),
  material: z.string().optional(),
  duration: z.string().optional(),
  concentration: z.boolean().optional(),
  ritual: z.boolean().optional(),
  description: z.object({
    default: z.string(),
    upcast: z.string().optional(),
  }).optional(),
  isAttack: z.boolean().optional(),
  attackType: z.enum(['melee', 'ranged']).optional(),
  attackAbility: z
    .union([z.literal('none'), z.literal('spellcasting'), z.enum([...config.abilities] as [string, ...string[]])])
    .optional(),
  critRange: z.number().optional(),
  damage: z.array(DamageSchema).optional(),
  saving: z
    .union([z.literal('none'), z.enum([...config.abilities] as [string, ...string[]])])
    .optional(),
  upcast: z.array(UpcastModifierSchema).optional(),
  effectId: z.string().optional(),
  tagId: z.string().optional(),

  'data-effects': EffectCompendiumCoreSchema.optional(),
  'data-tags': z.array(z.string()).optional(),
  'data-compatibility': z.array(SpellCompatibilitySchema).optional(),
  required: z.array(RequirementSchema).optional(),
  prepared: z.boolean().optional(),
});

export const SpellSchema = SpellCompendiumSchema.extend({
  _id: z.string().optional(),
  innateUsage: z.string().optional(),
  spellSourceId: z.string().optional(),
});
