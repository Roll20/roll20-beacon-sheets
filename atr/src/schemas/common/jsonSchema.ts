import { z } from 'zod';

// Only register custom schemas that accept every value without a runtime check.
export const unconstrainedJsonSchemas = z.registry();
