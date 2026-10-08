import { getCharacterData } from "@/sheet/stores";
import { ruleSets } from "@/system";
import i18n from "@/i18n/i18n";
import type { CharacterData } from "@/schemas/hydrate/sheet";

const t = i18n.global?.t || ((key: string) => key);

const interpolationMatcher = /@\{([a-z]+(?:-[a-z]+)*)\}/g;

export type InterpolationResult = {
  isValid: boolean;
  keys: string[];
  error?: string;
};

export type Resolved = {
  expression: string;
  isValid: boolean;
  value: string;
  error?: string;
};

export const getInterpolationKeys = (text: string): InterpolationResult => {
  const keys = [...text.matchAll(interpolationMatcher)].map(match => match[1]);
  if (keys.length === 0) return { isValid: true, keys: [] };

  const isValid = keys.every((key) => ruleSets[key as keyof typeof ruleSets] !== undefined);

  if (!isValid) {
    return { isValid, keys, error: `${t('app.messages.errors.invalid-interpolation-key')}: ${keys.map(key => `@{${key}}`).join(', ')}` };
  }

  return { isValid, keys };
};

export const resolveInterpolations = ({
  text,
  characterData = getCharacterData(),
}: {
  text: string;
  characterData?: CharacterData;
}): Resolved => {
  const keys = getInterpolationKeys(text);
  if (!keys.isValid) {
    return { expression: text, isValid: false, value: text, error: keys.error };
  }

  const interpolated = text.replace(interpolationMatcher, (match, name) => {
    const fn = ruleSets[name as keyof typeof ruleSets];
    if (fn) {
      const result = fn(characterData);
      return (typeof result === 'object' && result !== null && 'value' in result)
        ? String(result.value)
        : String(result);
    }
    return match;
  });

  return { expression: text, isValid: true, value: interpolated };
};