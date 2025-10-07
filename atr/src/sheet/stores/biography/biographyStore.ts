import { defineStore } from 'pinia';
import { config } from '@/config';
import { type Ref, ref } from 'vue';

const biographyKeys = [
  'colony',
  'corePersonality',
  'positiveReaction',
  'negativeReaction',
  'size',
  'gender',
  'frequencyAndVibration'
] as const;

export type BioHydrate = {
  biography: {
    [K in typeof biographyKeys[number]]: string;
  };
};

export const useBiographyStore = defineStore('biography', () => {
  const refs: Record<typeof biographyKeys[number], Ref<string>> = {
    colony: ref(''),
    corePersonality: ref(''),
    positiveReaction: ref(''),
    negativeReaction: ref(''),
    size: ref(config.sizes[2]),
    gender: ref(''),
    frequencyAndVibration: ref(''),
  };

  const dehydrate = () => {
    const biography = {} as Record<typeof biographyKeys[number], string>;
    biographyKeys.forEach(key => {
      biography[key] = refs[key].value;
    });
    return { biography };
  };

  const hydrate = (hydrateStore: BioHydrate) => {
    biographyKeys.forEach(key => {
      refs[key].value = hydrateStore.biography[key] || refs[key].value;
    });
  };

  return {
    ...refs,

    dehydrate,
    hydrate,
  };
});
