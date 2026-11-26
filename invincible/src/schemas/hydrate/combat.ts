import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleNumber, flexibleString } from "@/utility/objectify";
import { InjurySchema } from "./injury";

export const BloodSplatSchema = z.object({
  _id: z.string().optional(),
  x: flexibleNumber,
  y: flexibleNumber,
  size: flexibleNumber,
  threshold: flexibleNumber,
  seed: flexibleNumber,
});

export const InitEntry = z.object({
  _id: z.string().optional(),
  initiative: flexibleNumber,
});

export const CombatHydrateSchema = z.object({
  health: flexibleNumber,
  healthMax: flexibleString,
  resolve: flexibleNumber,
  resolveMax: flexibleString,
  slugfestDamage: flexibleString,
  armor: flexibleNumber,
  initiative: flexibleArray(InitEntry),
  criticalInjuries: objectifiedArray(InjurySchema).optional().default([]),
  bloodSplats: objectifiedArray(BloodSplatSchema).optional().default([]),
});

export type CombatHydrate = z.infer<typeof CombatHydrateSchema>;
export type BloodSplatItem = z.infer<typeof BloodSplatSchema>;
export type InitEntryItem = z.infer<typeof InitEntry>;
