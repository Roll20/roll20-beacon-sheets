import { z } from 'zod';

export const ReactionCompendiumSchema = z.object({
  label: z.string(),
});
