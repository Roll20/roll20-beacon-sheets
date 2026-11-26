/// <reference types="vite/client" />

// Tells TypeScript that every *.vue import is a valid Vue component.
// Without this, TS has no idea what type a .vue module exports and falls back to 'any'.
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module 'dice-notation' {
  export type RollableModifier = 'kH' | 'kL' | 'kB' | 'kW' | 'a' | 'd';

  export interface ConstantComponent {
    sign: '+' | '-';
    type: 'constant';
    constant: {
      value: number;
    };
  }

  export interface RollableComponent {
    sign: '+' | '-';
    type: 'rollable';
    rollable: {
      count: number;
      size: number;
      modifier: RollableModifier | false;
    };
  }

  export type Component = ConstantComponent | RollableComponent;

  export function parse(expression: string): Component[];
  export function serialize(components: Component[]): string;
}
