import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import type { Tag } from '../tags/tagsStore';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { EffectsCalculator } from '@/utility/effectsCalculator';
import { defenseKeys } from '@/effects.config';



export type DefensesHydrate = {
  defenses: {
    conditionImmunities: Record<string, Tag>;
    damageResistances: Record<string, Tag>;
    damageImmunities: Record<string, Tag>;
    damageVulnerabilities: Record<string, Tag>;
  };
};

export const useDefenseStore = defineStore('defenses', () => {
  const effectsStore = useEffectsStore();

  const conditionImmunities = ref<Array<Tag>>([]);
  const damageResistances = ref<Array<Tag>>([]);
  const damageImmunities = ref<Array<Tag>>([]);
  const damageVulnerabilities = ref<Array<Tag>>([]);

  const getCombinedDefense = (
    userTagsRef: Ref<Array<Tag>>,
    attributeKey: keyof typeof defenseKeys,
  ) => {
    return computed(() => {
      const userTags = userTagsRef.value;
      const effectTags = EffectsCalculator.calculateModifiedTags(
        effectsStore.effects,
        attributeKey,
        effectsStore.isEffectSingleActive,
      ).map(tag => ({ ...tag, _id: `effect-${attributeKey}-${tag.text}` }));

      const combined = [...userTags];
      effectTags.forEach(effectTag => {
        if (!userTags.some(userTag => userTag.text === effectTag.text)) {
          combined.push(effectTag);
        }
      });
      return combined;
    });
  };

  const combinedConditionImmunities = getCombinedDefense(conditionImmunities, 'condition-immunities');
  const combinedDamageResistances = getCombinedDefense(damageResistances, 'damage-resistances');
  const combinedDamageImmunities = getCombinedDefense(damageImmunities, 'damage-immunities');
  const combinedDamageVulnerabilities = getCombinedDefense(damageVulnerabilities, 'damage-vulnerabilities');

  const displayDamageImmunities = computed(() => combinedDamageImmunities.value);

    const displayDamageResistances = computed(() => {
    const immunityTypes = new Set(combinedDamageImmunities.value.map((tag) => tag.text));
    const vulnerabilityTypes = new Set(combinedDamageVulnerabilities.value.map((tag) => tag.text));

    // Remove any that are also an immunity or a vulnerability.
    return combinedDamageResistances.value.filter(
      (resistance) =>
        !immunityTypes.has(resistance.text) && !vulnerabilityTypes.has(resistance.text),
    );
  });

  const displayDamageVulnerabilities = computed(() => {
    const immunityTypes = new Set(combinedDamageImmunities.value.map((tag) => tag.text));
    const resistanceTypes = new Set(combinedDamageResistances.value.map((tag) => tag.text));

    // Remove any that are also an immunity or a resistance.
    return combinedDamageVulnerabilities.value.filter(
      (vulnerability) =>
        !immunityTypes.has(vulnerability.text) && !resistanceTypes.has(vulnerability.text),
    );
  });

  const setDefenses = (payload: {
    conditionImmunities: Tag[],
    damageResistances: Tag[],
    damageImmunities: Tag[],
    damageVulnerabilities: Tag[]
  }) => {
    conditionImmunities.value = payload.conditionImmunities;
    damageResistances.value = payload.damageResistances;
    damageImmunities.value = payload.damageImmunities;
    damageVulnerabilities.value = payload.damageVulnerabilities;
  };

  const dehydrate = (): DefensesHydrate => ({
    defenses: {
      conditionImmunities: arrayToObject(conditionImmunities.value),
      damageResistances: arrayToObject(damageResistances.value),
      damageImmunities: arrayToObject(damageImmunities.value),
      damageVulnerabilities: arrayToObject(damageVulnerabilities.value),
    },
  });

  const hydrate = (payload: DefensesHydrate) => {
    if (!payload?.defenses) return;
    conditionImmunities.value = objectToArray(payload.defenses.conditionImmunities);
    damageResistances.value = objectToArray(payload.defenses.damageResistances);
    damageImmunities.value = objectToArray(payload.defenses.damageImmunities);
    damageVulnerabilities.value = objectToArray(payload.defenses.damageVulnerabilities);
  };

  return {
    conditionImmunities,
    damageResistances,
    damageImmunities,
    damageVulnerabilities,
    combinedConditionImmunities,
    combinedDamageResistances,
    combinedDamageImmunities,
    combinedDamageVulnerabilities,
    displayDamageImmunities,
    displayDamageResistances,
    displayDamageVulnerabilities,
    dehydrate,
    setDefenses,
    hydrate,
  };
});