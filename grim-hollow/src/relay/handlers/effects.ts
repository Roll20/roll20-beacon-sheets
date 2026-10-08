import type { Character } from '@roll20-official/beacon-sdk';
import type { SingleEffect, Effect, EffectsHydrate } from "@/sheet/stores/modifiers/modifiersStore";
import type { EquipmentHydrate } from '@/sheet/stores/equipment/equipmentStore';
import { indexedObjectToArray, objectToArray } from '@/utility/objectify';
import { EffectsCalculator, type RequirementContext } from '@/utility/effectsCalculator';
import { getAbilityModifier, getAbilityScore, getLevel, getProficiencyBonus } from './computed';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import type { ProgressionHydrate } from '@/sheet/stores/progression/progressionStore';
import { config } from '@/config';

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
          required: indexedObjectToArray(e.required),
          pickers: indexedObjectToArray(e.pickers),
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

  return EffectsCalculator.calculateModifiedValue(
    _baseValue, validEffects, constrainTo, {
      resolveHitDice: () => '0',
      resolveVariable: (key) => {
        const context = { character };
        if (key === 'level') return getLevel(context);
        if (key === 'pb') return getProficiencyBonus(context);
        if (config.abilities.includes(key as AbilityKey)) return getAbilityScore(context, key as AbilityKey);
        const ability = key.replace(/-modifier$/, '') as AbilityKey;
        if (key.endsWith('-modifier') && config.abilities.includes(ability)) {
          return getAbilityModifier(context, ability);
        }
        if (key.endsWith('-level')) {
          const name = key.slice(0, -6).toLowerCase();
          const progression = character.attributes?.progression as ProgressionHydrate | undefined;
          const sources = [...Object.values(progression?.classes ?? {}), progression?.transformation];
          const source = sources.find(source => source?.name?.toLowerCase().replace(/ /g, '-') === name);
          return source ? source.level || 1 : undefined;
        }
      },
    },
  ).final;
};