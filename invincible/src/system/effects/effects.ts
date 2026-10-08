import type { SingleEffect } from "@/schemas/common/SingleEffectSchema";
import { getCharacterData } from "@/sheet/stores";
import { effectCollectionPaths } from "./generatedEffectPaths";
import { get } from "lodash";
import { parseEffectString } from "./parseEffectString";
import type { CharacterData } from "@/schemas/hydrate/sheet";

export function getValueByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  if (!path.includes('[*]')) {
    return get(obj, path);
  }
  const parts = path.split('[*]');
  let current: any = get(obj, parts[0]);
  for (let i = 1; i < parts.length; i++) {
    if (!Array.isArray(current)) return undefined;
    const subPath = parts[i].startsWith('.') ? parts[i].slice(1) : parts[i];
    current = current.flatMap((item: any) => {
      const val = subPath ? get(item, subPath) : item;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const parentLabel = item.title || item.name;
        if (parentLabel && !val.label) {
          return [{ ...val, label: parentLabel }];
        }
      }
      if (Array.isArray(val)) {
        return val;
      }
      return val !== undefined ? [val] : [];
    });
  }
  return current;
}

export const effects = ({
  characterData = getCharacterData(),
}: {
  characterData?: CharacterData;
} = {}): SingleEffect[] => {
    const allEffects: SingleEffect[] = [];
  
    for (const collection of effectCollectionPaths) {
      const collectionData = getValueByPath(characterData, collection);
  
      if (collectionData && typeof collectionData === 'object' && !Array.isArray(collectionData) && 'value' in collectionData) {
        if (collectionData.disabled) continue;
  
        const effectValue = collectionData.value;
        const collectionLabel = collectionData.label || 'Unknown';
  
        if (effectValue instanceof Array) {
          allEffects.push(...effectValue.map((e: any) => ({ ...e, label: e.label || collectionLabel })));
        } else if (typeof effectValue === 'string') {
          allEffects.push(...parseEffectString(effectValue, collectionLabel));
        }
      } else if (collectionData instanceof Array) {
        for (const item of collectionData) {
          if (item && typeof item === 'object' && !Array.isArray(item) && 'value' in item) {
            if (item.disabled) continue;
            const effectValue = item.value;
            const collectionLabel = item.label || 'Unknown';

            if (effectValue instanceof Array) {
              allEffects.push(...effectValue.map((e: any) => ({ ...e, label: e.label || collectionLabel })));
            } else if (typeof effectValue === 'string') {
              allEffects.push(...parseEffectString(effectValue, collectionLabel));
            }
          } else {
            allEffects.push(item);
          }
        }
      } else if (typeof collectionData === 'string') {
        allEffects.push(...parseEffectString(collectionData, 'Unknown'));
      }
    }
    return allEffects;
};
