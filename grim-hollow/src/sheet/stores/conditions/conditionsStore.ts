import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { arrayToIndexedObject, indexedObjectToArray } from '@/utility/objectify';

export type ConditionsHydrate = {
  conditions: {
    activeConditions: Record<string, string>;
  };
};

export const useConditionsStore = defineStore('conditions', () => {
  const activeConditions = ref<string[]>([]);

  const isConditionActive = (conditionKey: string): boolean => {
    return activeConditions.value.includes(conditionKey);
  };

  const toggleCondition = (conditionKey: string) => {
    if (isConditionActive(conditionKey)) {
      activeConditions.value = activeConditions.value.filter((c) => c !== conditionKey);
    } else {
      activeConditions.value.push(conditionKey);
    }
  };

  const setActiveConditions = (newConditions: string[]) => {
    activeConditions.value = Array.from(new Set(newConditions));
  };

  const dehydrate = (): ConditionsHydrate => ({
    conditions: {
      activeConditions: arrayToIndexedObject(activeConditions.value),
    },
  });

  const hydrate = (payload: ConditionsHydrate) => {
    if (!payload?.conditions) return;
    activeConditions.value = indexedObjectToArray(payload.conditions.activeConditions) ?? [];
  };

  return {
    activeConditions,
    isConditionActive,
    toggleCondition,
    setActiveConditions,
    hydrate,
    dehydrate,
  };
});