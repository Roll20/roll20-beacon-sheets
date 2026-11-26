declare module 'dice-notation' {
  type DiceTerm =
    | { sign: '+' | '-'; type: 'rollable'; rollable: { count: number; size: number; modifier: string | false } }
    | { sign: '+' | '-'; type: 'constant'; constant: { value: number } };

  export function parse(formula: string): DiceTerm[];
  export function serialize(terms: DiceTerm[]): string;
}
