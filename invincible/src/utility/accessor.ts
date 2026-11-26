import { unref } from 'vue';
import { get } from 'lodash';
import type { Character } from '@roll20-official/beacon-sdk';

export const normalizeCharacter = (character: Character) => {
  const { attributes, ...meta } = character;
  return {
    ...attributes,
    meta,
  };
};

export const getFromContext = <T = any>(path: string, context: any): T | undefined => {
  if (!context) return undefined;

  
  if (context && typeof context === 'object' && 'attributes' in context) {
    const { attributes, ...meta } = context;
    const normalized = { ...attributes, meta };
    return get(normalized, path) ?? normalized[path];
  }

  
  const value = get(context, path);
  return unref(value);
};
