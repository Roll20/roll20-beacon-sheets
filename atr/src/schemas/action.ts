import { z } from 'zod';
import { config } from '@/config';
import { DamageSchema } from './damage';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { RequirementSchema } from './common/common';

export const ActionCompendiumSchema = z.object({
  name: z.string(),

  group: z.enum(['actions', 'bonus-actions', 'reactions', 'free-actions']),

  isAttack: z.boolean(),
  attackType: z.enum(['melee', 'ranged']).optional(),
  sourceType: z.enum(['weapon', 'spell']).optional(),
  critRange: z.number().min(1).max(20).default(20),

  attackAbility: z
    .union([z.literal('none'), z.enum([...config.abilities] as [string, ...string[]])])
    .optional(),
  attackBonus: z.string().optional(),
  attackProficiency: z.union([z.literal(0), z.literal(0.5), z.literal(1), z.literal(2)]).optional(),

  saving: z
    .union([z.literal('none'), z.enum([...config.abilities] as [string, ...string[]])])
    .optional(),
  savingDc: z.string().optional(),

  damage: z.array(DamageSchema).optional(),

  ammo: z.number().optional(),
  range: z.string().optional(),
  target: z.string().optional(),
  description: z.string().optional(),
  'data-tags': z.array(z.string()).optional(),
  required: z.array(RequirementSchema).optional(),
});

export const ActionSchema = ActionCompendiumSchema.extend({
  _id: z.string().optional(),
  tagId: z.string().optional(),
});
