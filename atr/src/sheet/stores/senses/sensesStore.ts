import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { config } from '@/config';
import { type ModifiedValue, useEffectsStore } from '../modifiers/modifiersStore';

export type SenseKey = (typeof config.senses)[number];
export type ManualSenses = Record<SenseKey, number>;

export type SensesHydrate = {
  senses: {
    manualSenses: ManualSenses;
  };
};

export const useSensesStore = defineStore('senses', () => {
  const manualSenses = ref<ManualSenses>(
    config.senses.reduce((acc, sense) => {
      acc[sense] = 0;
      return acc;
    }, {} as ManualSenses),
  );

  const getSenseValue = (senseKey: SenseKey): ModifiedValue => {
    const effectsStore = useEffectsStore();
    return computed(() => {
      const baseValue = manualSenses.value[senseKey] || 0;
      const effectKey = `sense-${senseKey}`;
      return effectsStore.getModifiedValue(baseValue, effectKey).value;
    });
  };

  const allSenses = computed(() => {
    return config.senses.map((key) => ({
      key,
      label: `titles.sense.${key}`,
      value: getSenseValue(key),
    }));
  });

  const activeSenses = computed(() => {
    return allSenses.value.filter((sense) => sense.value.value.final > 0);
  });

  const dehydrate = (): SensesHydrate => ({
    senses: {
      manualSenses: manualSenses.value,
    },
  });

  const hydrate = (payload: SensesHydrate) => {
    if (!payload?.senses) return;
    manualSenses.value = { ...manualSenses.value, ...payload.senses.manualSenses };
  };

  return {
    manualSenses,
    activeSenses,
    getSenseValue,
    hydrate,
    dehydrate,
  };
});
