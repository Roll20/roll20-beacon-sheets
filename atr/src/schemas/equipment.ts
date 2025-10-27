import z from 'zod';
import { config } from '../config';
import { EffectSchema } from './effect';
import { SpellSchema } from './spell';

export const CurrencySchema = z.enum([...config.currencyTypes] as [string, ...string[]]);

export const EquipmentValueSchema = z.object({
  amount: z.number(),
  currency: CurrencySchema.optional(),
});

export const EquipmentCompendiumSchema = z.object({
  name: z.string(),
  weight: z.number().optional(),
  quantity: z.number().optional(),
  type: z.enum([...config.equipmentTypes] as [string, ...string[]]),
  description: z.string().optional(),
  value: EquipmentValueSchema.optional(),
  'data-tags': z.array(z.string()).optional(),
  'data-effects': EffectSchema.optional(),
  'data-spells': z.array(SpellSchema).optional(),
});

export const EquipmentSchema = EquipmentCompendiumSchema.extend({
  _id: z.string().optional(),
  equipped: z.boolean().optional(),
  isAttuned: z.boolean().optional(),
  effectId: z.string().optional(),
  tagId: z.string().optional(),
});
