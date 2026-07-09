import type { ZodType } from 'zod';

export type CompendiumEntry = {
  category: string;
  schema: ZodType;
  target?: () => any;
  onApply?: (data: any) => void | Promise<void>;
};

type CheckUniqueCategories<
  T extends readonly any[],
  Seen extends string = never
> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends { category: infer Cat }
  ? Cat extends string
  ? Cat extends Seen
  ? [Omit<Head, 'category'> & { category: never }, ...CheckUniqueCategories<Tail, Seen>]
  : [Head, ...CheckUniqueCategories<Tail, Seen | Cat>]
  : [Head, ...CheckUniqueCategories<Tail, Seen>]
  : [Head, ...CheckUniqueCategories<Tail, Seen>]
  : [];

export const defineCompendium = <const T extends readonly CompendiumEntry[]>(
  entries: T & CheckUniqueCategories<T>
): { readonly [K in keyof T]: T[K] & CompendiumEntry } => {
  
  const categories = new Set<string>();
  for (const entry of entries) {
    if (categories.has(entry.category)) {
      throw new Error(`Duplicate compendium category detected: "${entry.category}"`);
    }
    categories.add(entry.category);
  }
  return entries as any;
};