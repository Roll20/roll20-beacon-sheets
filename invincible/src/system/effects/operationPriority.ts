export const operationPriority = {
  'set-base': 1,
  'set-base-formula': 1,
  'add': 2,
  'add-formula': 2,
  'subtract': 3,
  'subtract-formula': 3,
  'multiply': 4,
  'multiply-formula': 4,
  'set': 5,
  'set-formula': 5,
  'set-final': 5,
  'set-final-formula': 5,
  'set-min': 6,
  'set-min-formula': 6,
  'set-max': 7,
  'set-max-formula': 7,
} as const;

export type EffectOperation = keyof typeof operationPriority;