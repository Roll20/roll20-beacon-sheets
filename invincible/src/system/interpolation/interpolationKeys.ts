import type { ruleSets } from "@/system";
import type { EffectOperation } from "../effects/operationPriority";

type InterpolationRule = Record<Exclude<keyof typeof ruleSets, 'effects' | 'health' | 'resolve'>, {
  accepts?: EffectOperation[];
  rejects?: EffectOperation[];
  allowsRolls?: boolean;
}>;

export const interpolationKeys = {
  
  fighting: {
    allowsRolls: true
  },
  agility: {
    allowsRolls: true
  },
  strength: {
    allowsRolls: true
  },
  reason: {
    allowsRolls: true
  },
  intuition: {
    allowsRolls: true
  },
  presence: {
    allowsRolls: true
  },
  
  health_max: {
    allowsRolls: false
  },
  resolve_max: {
    allowsRolls: false
  },
  slugfest_damage: {
    allowsRolls: true
  },
  armor: {
    allowsRolls: false
  },
  reputation: {
    allowsRolls: false
  },
  rank: {
    allowsRolls: false
  },
  
  resources: {
    allowsRolls: false
  },
} as const satisfies InterpolationRule;

export type InterpolationKey = keyof typeof interpolationKeys;

export type RollKey = {
  [K in InterpolationKey]: typeof interpolationKeys[K] extends { readonly allowsRolls: true } ? `${K}_roll` : never;
}[InterpolationKey];