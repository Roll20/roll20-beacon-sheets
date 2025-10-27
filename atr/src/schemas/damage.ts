import { z } from 'zod';
import { config } from '../config';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';

export const DamageCompendiumSchema = z.object({
  ability: z.union([z.literal('none'), z.enum([...config.abilities] as [string, ...string[]])]),
  damage: z.string(),
  type: z.enum([...config.dicePoolTypes] as [string, ...string[]]),
  critDamage: z.string().optional(),
});

export const DamageSchema = DamageCompendiumSchema.extend({
});