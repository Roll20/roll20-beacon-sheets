import { z } from "zod";
import { flexibleNumber, flexibleString } from "@/utility/objectify";

export const AbilitySchema = flexibleNumber;

export const AbilitiesHydrateSchema = z.object({
  fighting: AbilitySchema.default(0),
  agility: AbilitySchema.default(0),
  strength: AbilitySchema.default(0),
  reason: AbilitySchema.default(0),
  intuition: AbilitySchema.default(0),
  presence: AbilitySchema.default(0),
});

export type AbilitiesHydrate = z.infer<typeof AbilitiesHydrateSchema>;
export type AbilityData = z.infer<typeof AbilitySchema>;
export type AbilityName = keyof AbilitiesHydrate;
