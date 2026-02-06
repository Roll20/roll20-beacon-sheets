import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { defineStore } from 'pinia';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { config } from '@/config';
import type { ModifiedValue } from '../modifiers/modifiersStore';
import { v4 as uuidv4 } from 'uuid';
import { getEntryById } from '@/utility/getEntryBy';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { effectKeys } from '@/effects.config';
import { useI18n } from 'vue-i18n';

export type AbilityKey = (typeof config.abilities)[number];

export type AbilityData = {
  _id: string;
  score: number;
  label: AbilityKey;
};

export type Ability = AbilityData & {
  modified: ModifiedValue;
  bonus: ModifiedValue;
};

export type Abilities = Record<AbilityKey, Ability>;

export type AbilitiesHydrate = {
  abilities: Record<string, AbilityData>;
};

export const useAbilitiesStore = defineStore('abilities', () => {
  const { t } = useI18n();

  const abilities: Ref<Array<AbilityData>> = ref(
    config.abilities.reduce((acc, ability) => {
      acc.push({
        _id: uuidv4(),
        score: 10,
        label: ability,
      });
      return acc;
    }, [] as Array<AbilityData>),
  );

  const getModifiedAbilityScore = (ability: AbilityData) =>
    useEffectsStore().getModifiedValue(ability.score, effectKeys[ability.label]);

  const getAbilityModifier = (ability: AbilityData): ModifiedValue =>
    computed(() => {
      const bonus = Math.floor((getModifiedAbilityScore(ability).value.final - 10) / 2);
      return {
        final: bonus,
        modifiers: [],
      };
    });
  const getAbilityCheckModifier = (ability: AbilityData) =>
    useEffectsStore().getModifiedValue(getAbilityModifier(ability).value.final, [
      effectKeys[`${ability.label}-check`],
      effectKeys.check,
    ]);

  const update = (id: string, patch: Partial<AbilityData>): void => {
    const ability = getEntryById(id, abilities.value) as AbilityData;
    Object.assign(ability, patch);
  };

  const dehydrate = (): AbilitiesHydrate => {
    return {
      abilities: arrayToObject(abilities.value),
    };
  };

  const hydrate = (payload: AbilitiesHydrate) => {
    if (payload?.abilities) {
      abilities.value = objectToArray(payload.abilities) || abilities.value;
    }
  };

  return {
    abilities,

    getAbilityModifier,
    getAbilityCheckModifier,
    getModifiedAbilityScore,
    update,

    dehydrate,
    hydrate,
  };
});
