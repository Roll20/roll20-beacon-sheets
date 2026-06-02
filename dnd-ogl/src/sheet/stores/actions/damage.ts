import * as z from 'zod/v4';
import { config } from '@/config';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';

export const DamageRollSchema = z.object({
  ability: z.union([z.literal('none'), z.literal('spellcasting'), z.custom<AbilityKey>()]),
  damage: z.string(),
  type: z.enum([...config.damageTypes] as [string, ...string[]]),
  critDamage: z.string(),
});

export type DamageRoll = z.infer<typeof DamageRollSchema>;
export type DamageType = (typeof config.damageTypes)[number];
