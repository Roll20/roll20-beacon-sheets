import type { SingleEffect } from '@/schemas/common/SingleEffectSchema';
import { constrain } from '../../utility/constrain';
import type { ModifierBreakdown } from '@/schemas/common/ModifierBreakdown';
import { effectCollectionPaths as generatedPaths } from './generatedEffectPaths';
import { operationPriority } from './operationPriority';
import type { InterpolationKey } from '../interpolation/interpolationKeys';
import type { CharacterData } from '@/schemas/hydrate/sheet';
import { getCharacterData } from '@/sheet/stores';
import { resolveExpression } from '../expression/resolveExpression';
import i18n from "@/i18n/i18n";
import { effects, getValueByPath } from './effects';

const t = i18n.global?.t || ((key: string) => key);

export const effectCollectionPaths: readonly string[] = generatedPaths;

export { getValueByPath };

export type ModifiedValue = {
  value: number | string;
  rawValue?: number | string;
  modifiers: ModifierBreakdown[];
  attributes?: InterpolationKey[];
  baseValue: number | string;
  error?: string;
}

export function calculateModifiedValue({
  attributes,
  baseValue,
  characterData = getCharacterData(),
  constrainTo = [],
}: {
  attributes: InterpolationKey[];
  baseValue: number | string;
  characterData?: CharacterData;
  constrainTo?: number[];
}): ModifiedValue {
  const originalBaseValue = baseValue;
  if (typeof baseValue === 'string') {
    const resolvedValue = resolveExpression(baseValue, characterData);
    if (!resolvedValue.isValid) {
      return { value: baseValue, rawValue: baseValue, modifiers: [], attributes, baseValue: originalBaseValue, error: resolvedValue.error };
    }
    if (isNaN(Number(resolvedValue.value))) {
      return { value: baseValue, rawValue: baseValue, modifiers: [], attributes, baseValue: originalBaseValue, error: t('app.messages.errors.invalid-expression-nan') };
    }
    baseValue = Number(resolvedValue.value);
  }

  let finalValue = baseValue;
  let rawFinalValue = baseValue;
  const modifiers: ModifierBreakdown[] = [];

  const allEffects = effects({ characterData });

  const validEffects: SingleEffect[] = allEffects.filter((effect) => !effect.disabled && (attributes as string[]).includes(effect.attribute));

  validEffects.sort((a, b) => operationPriority[a.operation] - operationPriority[b.operation]).forEach((effect) => {

    const valueBefore = finalValue;
    const formulaRegex = /-formula$/g;
    let value: number;

    if (formulaRegex.test(effect.operation)) {
      
      const resolvedExpression = resolveExpression(String(effect.value), characterData);
      if (!resolvedExpression.isValid) {
        
        return { value: baseValue, rawValue: baseValue, modifiers: [], attributes, baseValue: originalBaseValue, error: resolvedExpression.error };
      }
      else if (isNaN(Number(resolvedExpression.value))) {
        
        return { value: baseValue, rawValue: baseValue, modifiers: [], attributes, baseValue: originalBaseValue, error: t('app.messages.errors.invalid-expression-nan') };
      }
      value = Number(resolvedExpression.value);
    } else {
      value = Number(effect.value);
    }
    const operation = effect.operation.replace(formulaRegex, '');

    const isCustom = !!(effect._id && effect._id.includes('_custom'));

    switch (operation) {
      case 'set-base':
        finalValue = Math.max(finalValue, value);
        if (!isCustom) rawFinalValue = Math.max(rawFinalValue, value);
        break;
      case 'add':
        finalValue += value;
        if (!isCustom) rawFinalValue += value;
        break;
      case 'subtract':
        finalValue -= value;
        if (!isCustom) rawFinalValue -= value;
        break;
      case 'multiply':
        finalValue *= value;
        if (!isCustom) rawFinalValue *= value;
        break;
      case 'set':
        finalValue = Math.max(finalValue, value);
        if (!isCustom) rawFinalValue = Math.max(rawFinalValue, value);
        break;
      case 'set-final':
        finalValue = value;
        if (!isCustom) rawFinalValue = value;
        break;
      case 'set-min':
        finalValue = Math.min(value, finalValue);
        if (!isCustom) rawFinalValue = Math.min(value, rawFinalValue);
        break;
      case 'set-max':
        finalValue = Math.max(value, finalValue);
        if (!isCustom) rawFinalValue = Math.max(value, rawFinalValue);
        break;
    }

    const contribution = finalValue - valueBefore;
    if (contribution !== 0) {
      modifiers.push({
        name: effect.label ?? 'Unknown',
        value: contribution,
      });
    }
  });
  if (constrainTo.length > 0) {
    return { value: constrain(finalValue, constrainTo), rawValue: constrain(rawFinalValue, constrainTo), modifiers, attributes, baseValue: originalBaseValue };
  }
  return { value: finalValue, rawValue: rawFinalValue, modifiers, attributes, baseValue: originalBaseValue };
};
