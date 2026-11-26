import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleNumber, flexibleString } from "@/utility/objectify";
import { EffectCollectionSchema } from "../common/EffectCollection";

export const PreviousScoreSchema = z.object({
  _id: z.string().optional(),
  score: flexibleNumber,
  label: flexibleString,
});

export const SampleHydrateSchema = z.object({
  _children: flexibleArray(z.string()).optional(),
  agility: flexibleNumber,
  endurance: flexibleNumber,
  health: flexibleString,
  score: flexibleNumber,
  label: flexibleString,
  previousScores: objectifiedArray(PreviousScoreSchema),
  effects: EffectCollectionSchema.default({ value: [] })
});

export type SampleHydrate = z.infer<typeof SampleHydrateSchema>;