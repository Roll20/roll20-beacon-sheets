import { z } from "zod";
import { flexibleString } from "@/utility/objectify";

export const SettingsHydrateSchema = z.object({
  mode: flexibleString.default('normal'),
  version: flexibleString.default('0.1'),
});

export type SettingsHydrate = z.infer<typeof SettingsHydrateSchema>;
