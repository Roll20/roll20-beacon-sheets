import { effectKeys } from '../../effects.config';

export const parts1 = ['cl', 'ow'] as const;
export const parts2 = ['<', '<=', '=', '=>', '>'] as const;
export const parts3 = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20
] as const;

export const levelRequirements = Array.from(parts1).flatMap(p1 =>
  Array.from(parts2).flatMap(p2 =>
    Array.from(parts3).map(p3 => `${p1}${p2}${p3}` as const)
  )
);

export const allEffectKeys = Object.values(effectKeys) as [string, ...string[]];
export const allRequirements = ['attuned', 'equipped', ...levelRequirements] as const;
const pickerKeys = ['$picker:0', '$picker:1', '$picker:2', '$picker:3', '$picker:4', '$picker:5', '$picker:6', '$picker:7', '$picker:8', '$picker:9'] as const;
export const allEffectKeysWithPickers = [...allEffectKeys, ...pickerKeys] as [string, ...string[]];
