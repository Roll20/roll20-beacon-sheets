import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleString } from "@/utility/objectify";
import { EffectCollectionSchema } from "../common/EffectCollection";

export const ModifierSchema = z.object({
  _id: z.string().optional(),
  name: flexibleString,
  type: z.enum(['boost', 'limit']),
  description: flexibleString.default(''),
  effects: EffectCollectionSchema.default({ value: [] }),
  _children: flexibleArray(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const PowerSchema = z.object({
  _id: z.string().optional(),
  name: flexibleString,
  description: flexibleString.default(''),
  effects: EffectCollectionSchema.default({ value: [] }),
  modifiers: flexibleArray(ModifierSchema).default([]),
  _children: flexibleArray(z.string()).optional(),
});

export const PowersHydrateSchema = z.object({
  powerSourceDescription: flexibleString,
  list: objectifiedArray(PowerSchema),
});

export type ModifierItem = z.infer<typeof ModifierSchema>;
export type PowerItem = z.infer<typeof PowerSchema>;
export type PowersHydrate = z.infer<typeof PowersHydrateSchema>;
