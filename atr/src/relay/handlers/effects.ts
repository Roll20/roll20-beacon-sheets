import type { Character } from '@roll20-official/beacon-sdk';
import type { SingleEffect, Effect, EffectsHydrate } from "@/sheet/stores/modifiers/modifiersStore";
import type { EquipmentHydrate } from '@/sheet/stores/equipment/equipmentStore';
import { indexedObjectToArray, objectToArray } from '@/utility/objectify';
import { EffectsCalculator } from '@/utility/effectsCalculator';

const isEffectActive = (effect: Effect, character: Character): boolean => {
  if (!effect.enabled) {
    return false;
  }

  if (!effect.required || effect.required.length === 0) {
    return true;
  }

  const equipment = 
    !character.attributes?.equipment || 
    !character.attributes.equipment.hasOwnProperty('equipment') 
      ? {}
      : (character.attributes.equipment as EquipmentHydrate).equipment;

  const owner = Object.values(equipment).find((item) => item.effectId === effect._id);

  if (!owner) {
    return true;
  }

  const currentStates: string[] = [];
  if (owner.equipped) currentStates.push('equipped');
  if (owner.isAttuned) currentStates.push('attuned');

  return effect.required.every((req) => currentStates.includes(req));
};

const isEffectSingleActive = (effect: Effect, singleEffect: SingleEffect, character: Character): boolean => {
  if (!isEffectActive(effect, character)) {
    return false;
  }

  if (!singleEffect.required || singleEffect.required.length === 0) {
    return true;
  }

  const equipment = 
  !character.attributes?.equipment || 
  !character.attributes.equipment.hasOwnProperty('equipment') 
    ? {}
    : (character.attributes.equipment as EquipmentHydrate).equipment;

  const owner = Object.values(equipment).find((item) => item.effectId === effect._id);

  if (!owner) {
    return true;
  }

  const currentStates: string[] = [];
  if (owner.equipped) currentStates.push('equipped');
  if (owner.isAttuned) currentStates.push('attuned');

  return singleEffect.required.every((req) => currentStates.includes(req));
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
    const efectList = effects.slice().map((e) => {
      const singleEffects = objectToArray(e.effects).map(entry => {
        return {
          ...entry,
          required: indexedObjectToArray(entry.required)
        }
      });
      return { ...e, effects: singleEffects };
    });
    const validEffects = EffectsCalculator.getValidEffects(
      efectList,
      _attribute,
      (effect: Effect, singleEffect: SingleEffect) => isEffectSingleActive(effect, singleEffect, character),
    );

    return EffectsCalculator.calculateModifiedValue(_baseValue, validEffects, constrainTo).final;
};