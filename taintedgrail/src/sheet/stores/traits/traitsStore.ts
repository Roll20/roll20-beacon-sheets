import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import sendToChat from '@/utility/sendToChat';

// See "inventoryStore.ts" for an explanation of how to use list/repeating sections
interface Trait {
  type: 'skill' | 'power';
  _id: string;
  name: string;
  description: string;
}

export type TraitsHydrate = {
  traits: {
    traits: Record<string, Trait>;
  };
};

export const useTraitsStore = defineStore('traits', () => {
  const traits: Ref<Array<Trait>> = ref([]);
  const traitsCount: ComputedRef<number> = computed(() => traits.value.length);
  const addTrait = () =>
    traits.value.push({
      _id: uuidv4(),
      name: `New Skill ${traits.value.length + 1}`,
      description: '',
      type: 'skill',
    });

  const removeTrait = (_id: string) => {
    const indexToRemove = traits.value.findIndex((trait) => trait._id === _id);
    if (indexToRemove >= 0) traits.value.splice(indexToRemove, 1);
  };

  /*
   * Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id
   * */
  const dehydrate = () => {
    return {
      traits: {
        traits: arrayToObject(traits.value),
      },
    };
  };

  /*
   * Since the items array is coming is an object, we convert it back into an array before saving here.
   * */
  const hydrate = (hydrateStore: TraitsHydrate) => {
    traits.value = objectToArray(hydrateStore.traits?.traits) || traits.value;
  };

  return {
    traits,
    traitsCount,

    addTrait,
    removeTrait,

    dehydrate,
    hydrate,
  };
});
