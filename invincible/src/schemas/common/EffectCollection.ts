import { z } from 'zod';
import { SingleEffectSchema } from './SingleEffectSchema';
import { objectifiedArray } from '@/utility/objectify';

export const EffectCollectionSchema = z.object({
  label: z.string().optional(),
  value: z.preprocess((val: any) => {
    
    if (Array.isArray(val)) {
      return val.filter(item => item && (item.attribute || item.value !== undefined || item.operation));
    } else if (val && typeof val === 'object') {
      const cleaned: any = {};
      Object.keys(val).forEach(k => {
        const item = val[k];
        if (item && (item.attribute || item.value !== undefined || item.operation)) {
          cleaned[k] = item;
        }
      });
      return cleaned;
    }
    return val;
  }, objectifiedArray(SingleEffectSchema)),
  disabled: z.boolean().optional(),
});

export type EffectCollection = z.infer<typeof EffectCollectionSchema>;