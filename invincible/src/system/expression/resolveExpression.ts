import { evaluate } from "mathjs";
import { resolveInterpolations, type Resolved } from "../interpolation/resolveInterpolations";
import { getCharacterData } from "@/sheet/stores";
import { simplifyDiceExpression } from "./simplifyDiceExpression";
import type { CharacterData } from "@/schemas/hydrate/sheet";
import i18n from "@/i18n/i18n";

const t = i18n.global?.t || ((key: string) => key);

const diceExpressionRegex = /(?<![a-zA-Z0-9])\d*d\d+/i;
const mathExpressionRegex = /^(?:\d+|\s+|[+\-*/().]|ceil|floor)+$/

export const resolveMathExpression = (
  text: string,
  characterData: CharacterData = getCharacterData(),
): Resolved => {
  const interpolatedText = resolveInterpolations({
    text,
    characterData,
  });

  if (!interpolatedText.isValid) {
    return interpolatedText;
  }

  const value = interpolatedText.value.trim();

  if (!mathExpressionRegex.test(value)) {
    return { expression: text, isValid: true, value };
  }

  try {
    const result = evaluate(value);

    return typeof result === 'number' && Number.isFinite(result)
      ? { expression: text, isValid: true, value: String(result) }
      : { expression: text, isValid: false, value, error: t('app.messages.errors.invalid-math-expression') };
  } catch {
    return { expression: text, isValid: false, value, error: t('app.messages.errors.invalid-math-expression') };
  }
};

export const resolveDiceExpression = (
  text: string,
  characterData: CharacterData = getCharacterData(),
): Resolved => {
  const interpolatedText = resolveInterpolations({
    text,
    characterData,
  });

  if (!interpolatedText.isValid) {
    return interpolatedText;
  }

  const value = interpolatedText.value.trim();

  if (!diceExpressionRegex.test(value)) {
    return { expression: text, isValid: true, value };
  }

  try {
    const result = simplifyDiceExpression(value);
    return { expression: text, isValid: true, value: result };
  } catch {
    return { expression: text, isValid: false, value, error: t('app.messages.errors.invalid-dice-expression') };
  }
};

export const resolveExpression = (
  text: string,
  characterData: CharacterData = getCharacterData(),
): Resolved => {

  const interpolatedText = resolveInterpolations({
    text,
    characterData,
  });

  if (!interpolatedText.isValid) {
    return interpolatedText;
  }

  if (diceExpressionRegex.test(interpolatedText.value)) {
    return resolveDiceExpression(interpolatedText.value, characterData);
  }
  else if (mathExpressionRegex.test(interpolatedText.value)) {
    return resolveMathExpression(interpolatedText.value, characterData);
  }

  return interpolatedText;
};