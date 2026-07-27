import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleString } from "@/utility/objectify";
import { EffectCollectionSchema } from "../common/EffectCollection";

export const FeatureSchema = z.object({
  _id: z.string().optional(),
  name: flexibleString,
  type: z.enum(['talent', 'drawback']),
  description: flexibleString.default(''),
  effects: EffectCollectionSchema.default({ value: [] }),
  _children: flexibleArray(z.string()).optional(),
});

export const FeaturesHydrateSchema = z.object({
  list: objectifiedArray(FeatureSchema),
});

export type FeaturesHydrate = z.infer<typeof FeaturesHydrateSchema>;
export type FeatureItem = z.infer<typeof FeatureSchema>;

