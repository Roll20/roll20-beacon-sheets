import { z } from "zod";
import i18n from "@/i18n/i18n";
import type { EffectOperation } from "@/system/effects/operationPriority";
import { interpolationKeys, type InterpolationKey, type RollKey } from "@/system/interpolation/interpolationKeys";

const t = i18n.global?.t || ((key: string) => key);

export const validKeys = [
  ...Object.keys(interpolationKeys),
  ...Object.keys(interpolationKeys)
    .filter(k => (interpolationKeys as any)[k].allowsRolls)
    .map(k => `${k}_roll`)
] as [InterpolationKey | RollKey, ...(InterpolationKey | RollKey)[]];

const BaseSingleEffectSchema = z.object({
  _id: z.string().optional(),
  attribute: z.enum(validKeys, {
    message: t('app.messages.errors.invalid-effect-key')
  }),
  value: z.union([z.number(), z.string(), z.string().array()]),
  disabled: z.boolean().optional(),
  label: z.string().optional(),
});

export const SingleEffectSchemaValue = BaseSingleEffectSchema.extend({
  operation: z.enum([
    'add',
    'subtract',
    'multiply',
    'set',
    'set-base',
    'set-min',
    'set-max',
    'set-final',
  ] as const satisfies readonly EffectOperation[]),
  isFormula: z.literal(false).optional(),
});

export const SingleEffectSchemaFormula = BaseSingleEffectSchema.extend({
  operation: z.enum([
    'add-formula',
    'subtract-formula',
    'multiply-formula',
    'set-formula',
    'set-base-formula',
    'set-min-formula',
    'set-max-formula',
    'set-final-formula',
  ] as const satisfies readonly EffectOperation[]),
  isFormula: z.literal(true),
}).superRefine((data, ctx) => {
  
  
  const selfRef = `@{${data.attribute}}`;
  const values = Array.isArray(data.value) ? data.value : [String(data.value)];
  if (values.some(v => v.includes(selfRef))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('app.messages.errors.self-referencing-formula', { attribute: data.attribute }),
      path: ['value'],
    });
  }
});

export const BaseStringPattern = `([a-z_-]+?)\\s*(\\+=|-=|\\*=|>=|<=|===|==|=)\\s*(-?\\d+(?:\\.\\d+)?|"[^"]*"|'[^']*')\\s*(?:-?\\[([^\\]]+)\\])?`;
export const EffectStringPattern = `(${validKeys.join('|')})\\s*(\\+=|-=|\\*=|>=|<=|===|==|=)\\s*(-?\\d+(?:\\.\\d+)?|"[^"]*"|'[^']*')\\s*(?:-?\\[([^\\]]+)\\])?`;

export const EffectStringSchema = z.string()
  .regex(new RegExp(`^\\s*(?:${BaseStringPattern}\\s*;\\s*)*$`), t('app.messages.errors.invalid-effect-string'))
  .refine(
    (value) =>
      !new RegExp(`^\\s*(?:${BaseStringPattern}\\s*;\\s*)*$`).test(value)
      || new RegExp(`^\\s*(?:${EffectStringPattern}\\s*;\\s*)*$`).test(value),
    t('app.messages.errors.invalid-effect-key')
  );

export const SingleEffectSchema = z.union([SingleEffectSchemaFormula, SingleEffectSchemaValue]);

export type SingleEffect = z.infer<typeof SingleEffectSchema>;
