import { z } from 'zod';
import { flexibleString } from '@/utility/objectify';

export const NpcPayloadSchema = z.object({
  name: flexibleString.optional(),
  about: flexibleString.optional(),
  civilianName: flexibleString.optional(),
  role: flexibleString.optional(),
  special: flexibleString.optional(),
  drawbacks: flexibleString.optional(),
  reputation: flexibleString.optional(),
  resources: flexibleString.optional(),
  rank: flexibleString.optional(),
  appearance: flexibleString.optional(),
  avatar: flexibleString.optional(),
  token: flexibleString.optional(),
  abilities: z.record(z.string(), z.any()).optional(),
  combat: z.record(z.string(), z.any()).optional(),
}).passthrough();
