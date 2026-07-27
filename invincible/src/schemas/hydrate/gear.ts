import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleString } from "@/utility/objectify";
import { EffectCollectionSchema } from "../common/EffectCollection";

export const GearSchema = z.object({
  _id: z.string().optional(),
  name: flexibleString,
  type: z.enum(['weapon', 'armor', 'other']),
  description: flexibleString.default(''),
  effects: EffectCollectionSchema.default({ value: [] }),
  _children: flexibleArray(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const GearHydrateSchema = z.object({
  resources: flexibleString,
  list: objectifiedArray(GearSchema),
});

export type GearHydrate = z.infer<typeof GearHydrateSchema>;
export type GearItem = z.infer<typeof GearSchema>;

