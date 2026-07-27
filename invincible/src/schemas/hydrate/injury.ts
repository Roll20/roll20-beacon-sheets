import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleString } from "@/utility/objectify";
import { EffectCollectionSchema } from "../common/EffectCollection";

export const InjurySchema = z.object({
  _id: z.string().optional(),
  roll: z.number().optional(),
  name: flexibleString,
  description: flexibleString.default(''),
  healingTime: flexibleString.default(''),
  effects: EffectCollectionSchema.default({ value: [] }),
  isPlaceholder: z.boolean().optional(),
});

export const InjuriesHydrateSchema = z.object({
  list: objectifiedArray(InjurySchema),
});

export type InjuryItem = z.infer<typeof InjurySchema>;
export type InjuriesHydrate = z.infer<typeof InjuriesHydrateSchema>;