import { defineStore } from 'pinia';
import { computed, type Ref, ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import type { Tag } from '../tags/tagsStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { proficiencyKeys } from '@/effects.config';
import { EffectsCalculator } from '@/utility/effectsCalculator';

export type UnrankedProficienciesHydrate = {
  unrankedProficiencies: {
    languages: Record<string, Tag>;
    armor: Record<string, Tag>;
    weapons: Record<string, Tag>;
  };
};

export const useUnrankedProficienciesStore = defineStore('unrankedProficiencies', () => {
  const effectsStore = useEffectsStore();
  const languages = ref<Array<Tag>>([]);
  const armor = ref<Array<Tag>>([]);
  const weapons = ref<Array<Tag>>([]);

  const createCombinedProficiencyGetter = (
    userTagsRef: Ref<Array<Tag>>,
    attributeKey: keyof typeof proficiencyKeys,
  ) => {
    return computed(() => {
      const userTags = userTagsRef.value;
      const effectTags = EffectsCalculator.calculateModifiedTags(
        effectsStore.effects,
        attributeKey,
        effectsStore.isEffectSingleActive,
      ).map((tag) => ({ ...tag, _id: `effect-${attributeKey}-${tag.text}` }));

      const combined = [...userTags];
      effectTags.forEach((effectTag) => {
        if (!userTags.some((userTag) => userTag.text.toLowerCase() === effectTag.text.toLowerCase())) {
          combined.push(effectTag);
        }
      });
      return combined;
    });
  };

  const combinedLanguages = createCombinedProficiencyGetter(languages, 'languages');
  const combinedArmorProficiencies = createCombinedProficiencyGetter(armor, 'armor-proficiencies');
  const combinedWeaponProficiencies = createCombinedProficiencyGetter(
    weapons,
    'weapon-proficiencies',
  );

  const setProficiencies = (payload: { languages: Tag[]; armor: Tag[]; weapons: Tag[] }) => {
    languages.value = payload.languages;
    armor.value = payload.armor;
    weapons.value = payload.weapons;
  };

  const dehydrate = (): UnrankedProficienciesHydrate => ({
    unrankedProficiencies: {
      languages: arrayToObject(languages.value),
      armor: arrayToObject(armor.value),
      weapons: arrayToObject(weapons.value),
    },
  });

  const hydrate = (payload: UnrankedProficienciesHydrate) => {
    if (!payload?.unrankedProficiencies) return;
    languages.value = objectToArray(payload.unrankedProficiencies.languages);
    armor.value = objectToArray(payload.unrankedProficiencies.armor);
    weapons.value = objectToArray(payload.unrankedProficiencies.weapons);
  };

  return {
    languages,
    armor,
    weapons,
    combinedLanguages,
    combinedArmorProficiencies,
    combinedWeaponProficiencies,
    setProficiencies,
    dehydrate,
    hydrate,
  };
});
