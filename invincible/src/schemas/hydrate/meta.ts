import { z } from "zod";
import { flexibleString } from "@/utility/objectify";

export const MetaHydrateSchema = z.object({
  id: flexibleString,
  name: flexibleString,
  avatar: flexibleString,
  bio: flexibleString,
  gmNotes: flexibleString,
  token: z.record(z.string(), z.unknown()).default({}),
});

export type MetaHydrate = z.infer<typeof MetaHydrateSchema>;