import z from 'zod';
import { allEffectKeys } from './common/common';
import { damageTypes } from '@/config';

export const PickerOptionSchema = z.object({
  label: z.string(),
  value: z.enum(allEffectKeys).or(z.enum(damageTypes)).or(z.string()),
});

export const PickerCompendiumSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  options: PickerOptionSchema.array(),
  mandatory: z.boolean().optional(),
});

export const PickerSchema = PickerCompendiumSchema.extend({});
