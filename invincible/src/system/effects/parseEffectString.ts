import { type SingleEffect, EffectStringPattern } from "@/schemas/common/SingleEffectSchema";

export function parseEffectString(effectString: string, collectionLabel: string = 'Unknown'): SingleEffect[] {
  const parsedEffects: any[] = [];
  const regex = new RegExp(EffectStringPattern, 'g');
  let match;

  while ((match = regex.exec(effectString)) !== null) {
    const [, attribute, operatorStr, valueStr, labelStr] = match;
    let operation = 'set-base';
    if (operatorStr === '+=') operation = 'add';
    else if (operatorStr === '-=') operation = 'subtract';
    else if (operatorStr === '*=') operation = 'multiply';
    else if (operatorStr === '>=') operation = 'set-min';
    else if (operatorStr === '<=') operation = 'set-max';
    else if (operatorStr === '=') operation = 'set-base';
    else if (operatorStr === '==') operation = 'set';
    else if (operatorStr === '===') operation = 'set-final';

    let value: number | string = valueStr;
    let isFormula = false;
    if (!isNaN(Number(valueStr))) {
      value = Number(valueStr);
    } else if (valueStr.startsWith('"') || valueStr.startsWith("'")) {
      value = valueStr.slice(1, -1);
      operation += '-formula';
      isFormula = true;
    }

    const label = labelStr ? labelStr.trim() : (collectionLabel && collectionLabel !== 'Unknown' ? collectionLabel : undefined);

    const effect: any = {
      attribute,
      operation,
      value,
    };

    if (label) effect.label = label;

    if (isFormula) {
      effect.isFormula = true;
    }

    parsedEffects.push(effect);
  }

  return parsedEffects;
}
