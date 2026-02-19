import z from "zod/v4";

export const RequirementSchema = z.union([
  z.enum(['equipped', 'attuned']),
  z.templateLiteral([
    z.enum(['cl', 'ol']),
    z.enum(['<', '<=', '=', '>', '>=']),
    z.number().min(1).max(20),
  ]),
  z.string().regex(/^\$picker:\d+==.+$/),
]);