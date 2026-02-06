import type { Character } from '@roll20-official/beacon-sdk';
import type { SingleEffect, Effect, EffectsHydrate } from "@/sheet/stores/modifiers/modifiersStore";
import type { EquipmentHydrate } from '@/sheet/stores/equipment/equipmentStore';
import { indexedObjectToArray, objectToArray } from '@/utility/objectify';
import { EffectsCalculator, type RequirementContext } from '@/utility/effectsCalculator';
import { getLevel } from './computed';

const buildRequirementContext = (effect: Effect, character: Character): RequirementContext => {
  const equipment =
    !character.attributes?.equipment ||
    !character.attributes.equipment.hasOwnProperty('equipment')
      ? {}
      : (character.attributes.equipment as EquipmentHydrate).equipment;

  const owner = Object.values(equipment).find((item) => item.effectId === effect._id);

  return {
    pickers: effect.pickers,
    isEquipped: owner ? owner.equipped : false,
    isAttuned: owner ? owner.isAttuned : false,
    level: getLevel({ character }),
  };
};

const isEffectActive = (effect: Effect, character: Character): boolean => {
  if (!effect.enabled) {
    return false;
  }

  const context = buildRequirementContext(effect, character);
  return EffectsCalculator.checkRequirements(effect.required, context);
};

const isEffectSingleActive = (effect: Effect, singleEffect: SingleEffect, character: Character): boolean => {
  if (!isEffectActive(effect, character)) {
    return false;
  }

  const context = buildRequirementContext(effect, character);
  return EffectsCalculator.checkRequirements(singleEffect.required, context);
};

export const getModifiedValue = (
  _baseValue: number,
  _attribute: string | string[],
  constrainTo: number[] = [],
  character: Character,
): number => {
  const effects =
    !character.attributes?.modifiers ||
    !character.attributes.modifiers.hasOwnProperty('effects')
      ? []
      : objectToArray((character.attributes.modifiers as EffectsHydrate).effects).map(e => {
        return {
          ...e,
          required: indexedObjectToArray(e.required)
        }
      });

  const effectList = effects.slice().map((e) => {
    const singleEffects = objectToArray(e.effects).map(entry => {
      return {
        ...entry,
        required: indexedObjectToArray(entry.required)
      }
    });
    return { ...e, effects: singleEffects };
  });

  const validEffects = EffectsCalculator.getValidEffects(
    effectList,
    _attribute,
    (effect: Effect, singleEffect: SingleEffect) => isEffectSingleActive(effect, singleEffect, character),
  );

  return EffectsCalculator.calculateModifiedValue(_baseValue, validEffects, constrainTo).final;
};