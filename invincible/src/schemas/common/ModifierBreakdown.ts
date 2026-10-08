import { z } from "zod";

export const ModifierBreakdownSchema = z.object({
  name: z.string(),
  value: z.number(),
});

export type ModifierBreakdown = z.infer<typeof ModifierBreakdownSchema>; 