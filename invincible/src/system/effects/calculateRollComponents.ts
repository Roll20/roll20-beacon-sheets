import type { DiceComponent } from "@/rolltemplates/rolltemplates";
import { getCharacterData } from "@/sheet/stores";
import type { CharacterData } from "@/schemas/hydrate/sheet";
import { resolveExpression } from "../expression/resolveExpression";
import type { RollKey } from "../interpolation/interpolationKeys";
import { effects } from "./effects";

export const calculateRollComponents = ({
  attributes,
  baseComponents = [],
  characterData = getCharacterData(),
}: {
  attributes: RollKey[];
  baseComponents?: DiceComponent[];
  characterData?: CharacterData;
}): DiceComponent[] => {
  const components = [...baseComponents];
  const allEffects = effects({ characterData });

  const searchAttributes = (attributes as string[]).flatMap(attr => {
    if (attr.endsWith('_roll')) {
      const baseAttr = attr.replace(/_roll$/, '');
      return [attr, baseAttr];
    }
    return [attr];
  });

  const validEffects = allEffects.filter((effect) => !effect.disabled && searchAttributes.includes(effect.attribute) && !effect._id?.endsWith('_custom'));

  validEffects.forEach((effect) => {
    const formulaRegex = /-formula$/g;
    const isFormula = formulaRegex.test(effect.operation);
    const operation = effect.operation.replace(formulaRegex, '');

    let resolvedValue: string | number = Array.isArray(effect.value) ? effect.value.join('+') : effect.value;
    if (isFormula) {
      const resolved = resolveExpression(String(effect.value), characterData);
      if (resolved.isValid) {
        resolvedValue = resolved.value;
      }
    }

    if (operation === 'add' || operation === 'subtract') {
      const isNegative = operation === 'subtract';
      const component: DiceComponent = {
        label: effect.label || 'Unknown Modifier',
      };

      const numValue = Number(resolvedValue);
      if (!isNaN(numValue)) {
        component.value = isNegative ? -numValue : numValue;
      } else {
        const formula = String(resolvedValue);
        component.rollFormula = isNegative ? `-(${formula})` : formula;
      }

      components.push(component);
    }
  });

  return components;
};