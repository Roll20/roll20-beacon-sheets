import { z } from "zod";
import { SampleHydrateSchema } from "./sample";
import { MetaHydrateSchema } from "./meta";
import { normalizeArrays } from "@/utility/normalizeArrays";
import { EffectsHydrateSchema } from "./effects";
import { PowersHydrateSchema } from "./powers";
import { AbilitiesHydrateSchema } from "./abilities";
import { CombatHydrateSchema } from "./combat";
import { BiographyHydrateSchema } from "./biography";
import { FeaturesHydrateSchema } from "./features";
import { ActionsHydrateSchema } from "./actions";
import { GearHydrateSchema } from "./gear";
import { SettingsHydrateSchema } from "./settings";

export const AttributesHydrateSchema = z.object({
  sample: SampleHydrateSchema.optional(),
  effects: EffectsHydrateSchema.optional(),
  powers: PowersHydrateSchema.optional(),
  abilities: AbilitiesHydrateSchema.optional(),
  combat: CombatHydrateSchema.optional(),
  biography: BiographyHydrateSchema.optional(),
  features: FeaturesHydrateSchema.optional(),
  actions: ActionsHydrateSchema.optional(),
  gear: GearHydrateSchema.optional(),
  settings: SettingsHydrateSchema.optional(),
});

export type AttributesHydrate = z.infer<typeof AttributesHydrateSchema>;

export const SheetHydrateSchema = AttributesHydrateSchema.extend({
  meta: MetaHydrateSchema,
});

export type SheetHydrate = z.infer<typeof SheetHydrateSchema>;

export const CharacterDataSchema = z.preprocess((data) => {
  return normalizeArrays(data);
}, SheetHydrateSchema);

export type CharacterData = z.infer<typeof CharacterDataSchema>;