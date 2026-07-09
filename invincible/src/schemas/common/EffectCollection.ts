import { z } from 'zod';
import { SingleEffectSchema } from './SingleEffectSchema';
import { objectifiedArray } from '@/utility/objectify';

export const EffectCollectionSchema = z.object({
  label: z.string().optional(),
  value: objectifiedArray(SingleEffectSchema),
  disabled: z.boolean().optional(),
});

export type EffectCollection = z.infer<typeof EffectCollectionSchema>;