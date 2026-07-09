import { z } from "zod";
import { objectifiedArray, flexibleArray, flexibleString, flexibleNumber } from "@/utility/objectify";

export const ActionSchema = z.object({
  _id: z.string().optional(),
  name: flexibleString,
  type: z.enum(['quick', 'full']),
  attributeUsed: z.enum(['fighting', 'strength', 'agility', 'reason', 'intuition', 'presence', '-', 'varies']).default('-'),
  bonus: flexibleNumber.optional().default(0),
  range: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return '-';
      const str = String(val).trim();
      if (str === '' || str === 'null' || str === 'undefined') return '-';
      return str;
    },
    z.string().default('-')
  ).refine((val) => val === '-' || /^\d+\/\d+$/.test(val), {
    message: "Range must be '-' or 'N/N' where N is a number",
  }),
  damage: flexibleString.optional().default(''),
  description: flexibleString.optional().default(''),
  specialFeatures: flexibleString.optional().default(''),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
});

export const ActionsHydrateSchema = z.object({
  currentTab: z.enum(['quick', 'full']).optional().default('quick'),
  hideDefaultActions: z.boolean().optional().default(false),
  list: objectifiedArray(ActionSchema),
});

export type ActionsHydrate = z.infer<typeof ActionsHydrateSchema>;
export type ActionItem = z.infer<typeof ActionSchema>;
