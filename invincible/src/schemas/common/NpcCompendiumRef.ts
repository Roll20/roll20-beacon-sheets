import { z } from 'zod';

export const NpcCompendiumRefSchema = z.object({
  categoryName: z.string(),
  pageName: z.string(),
  expansionId: z.string(),
  activeModifiers: z.array(z.string()).optional(),
});

export type NpcCompendiumRef = z.infer<typeof NpcCompendiumRefSchema>;
