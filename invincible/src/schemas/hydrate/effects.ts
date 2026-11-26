import { z } from "zod";
import { EffectCollectionSchema } from "../common/EffectCollection";

export const EffectsHydrateSchema = z.object({
  effects: EffectCollectionSchema.default({ value: [] })
});

export type EffectsHydrate = z.infer<typeof EffectsHydrateSchema>;