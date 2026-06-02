import * as z from 'zod';
import { SingleEffectSchema } from './effect.base';
import { ActionSchema } from '../action';
import { ResourceSchema } from '../resource';
import { RequirementSchema } from './common';
import { PickerSchema } from '../picker';

export const EffectCompendiumCoreSchema = z.object({
  label: z.string(),
  enabled: z.boolean(),
  toggleable: z.boolean(),
  removable: z.boolean(),
  effects: z.array(SingleEffectSchema),
  description: z.string().optional(),
  required: z.array(RequirementSchema).optional(),
  actions: z.array(ActionSchema).optional(),
  resources: z.array(ResourceSchema).optional(),
  pickers: z.array(PickerSchema).optional(),
});
