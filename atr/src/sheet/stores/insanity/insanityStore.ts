import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';

export type InsanityModifier = {
  value: number;
  type: 'permanent' | 'while-active';
};

export type Insanity = {
  _id: string;
  result: string;
  intensity: string;
  active: boolean;
  description: string;
  minorModifier: InsanityModifier;
  majorModifier: InsanityModifier;
  effectId: string;
  isNegativeReaction: boolean;
  isTrigger: boolean;
  isPhysicalManifestation: boolean;
};

export type InsanityHydrate = {
  insanity: {
    insanities: Record<string, Insanity>;
    globalMinorModifier: number;
    globalMajorModifier: number;
  };
};

export const useInsanityStore = defineStore('insanity', () => {
  const insanities: Ref<Array<Insanity>> = ref([]);
  const globalMinorModifier = ref(0);
  const globalMajorModifier = ref(0);

  const getEmptyInsanity = (patch: Partial<Insanity> = {}): Insanity => ({
    _id: uuidv4(),
    result: '',
    intensity: '',
    active: true,
    description: '',
    minorModifier: { value: 0, type: 'while-active' },
    majorModifier: { value: 0, type: 'while-active' },
    effectId: uuidv4(),
    isNegativeReaction: false,
    isTrigger: false,
    isPhysicalManifestation: false,
    ...patch,
  });

  const totalMinorInsanityModifier = computed(() => {
    return insanities.value.reduce((total, item) => {
      if (item.minorModifier.type === 'permanent' || (item.minorModifier.type === 'while-active' && item.active)) {
        return total + item.minorModifier.value;
      }
      return total;
    }, globalMinorModifier.value);
  });

  const totalMajorInsanityModifier = computed(() => {
    return insanities.value.reduce((total, item) => {
      if (item.majorModifier.type === 'permanent' || (item.majorModifier.type === 'while-active' && item.active)) {
        return total + item.majorModifier.value;
      }
      return total;
    }, globalMajorModifier.value);
  });

  const update = (patch: Partial<Insanity>) => {
    const index = patch._id ? insanities.value.findIndex(i => i._id === patch._id) : -1;
    if (index === -1) {
      insanities.value.push(getEmptyInsanity(patch));
    } else {
      const updatedItem = { ...insanities.value[index], ...patch };
      insanities.value[index] = updatedItem;
    }
  };

  const remove = (id: string) => {
    const index = insanities.value.findIndex(i => i._id === id);
    if (index >= 0) {
      insanities.value.splice(index, 1);
    }
  };

   const dehydrate = (): InsanityHydrate => {
    const itemsToSave = JSON.parse(JSON.stringify(insanities.value));
    
    itemsToSave.forEach((item: any) => {
      if (item.minorModifier) {
        item.minorModifier = JSON.stringify(item.minorModifier);
      }
      if (item.majorModifier) {
        item.majorModifier = JSON.stringify(item.majorModifier);
      }
    });

    return {
      insanity: {
        insanities: arrayToObject(itemsToSave),
        globalMinorModifier: globalMinorModifier.value,
        globalMajorModifier: globalMajorModifier.value,
      },
    };
  };

  const hydrate = (payload: InsanityHydrate) => {
    const data = payload.insanity;
    if (data) {
      const loadedItems = objectToArray(data.insanities) ?? [];

      loadedItems.forEach((item: any) => {
        if (typeof item.minorModifier === 'string') {
          try {
            item.minorModifier = JSON.parse(item.minorModifier);
          } catch {
            item.minorModifier = { value: 0, type: 'while-active' };
          }
        }
        if (typeof item.majorModifier === 'string') {
          try {
            item.majorModifier = JSON.parse(item.majorModifier);
          } catch {
            item.majorModifier = { value: 0, type: 'while-active' };
          }
        }
      });
      
      insanities.value = loadedItems;
      globalMinorModifier.value = data.globalMinorModifier ?? 0;
      globalMajorModifier.value = data.globalMajorModifier ?? 0;
    }
  };

  return {
    insanities,
    globalMinorModifier,
    globalMajorModifier,
    totalMinorInsanityModifier,
    totalMajorInsanityModifier,
    update,
    remove,
    dehydrate,
    hydrate,
  };
});