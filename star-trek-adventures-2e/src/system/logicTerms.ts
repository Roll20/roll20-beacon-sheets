export const ModifierOperations = {
  ADD: (a:number, b: number) => a+b,
  SUBTRACT: (a:number, b: number) => a-b,
  MULTIPLY: (a:number, b: number) => a*b,
  DIVIDE: (a:number, b: number) => a/b,
} as const;

export type ModifierKey = keyof typeof ModifierOperations
