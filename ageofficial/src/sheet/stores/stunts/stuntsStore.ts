import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import sendToChat from '@/utility/sendToChat';

// See "inventoryStore.ts" for an explanation of how to use list/repeating sections
interface stunt {
  type: 'combat' | 'class';
  _id: string;
  name: string;
  description: string;
}

export type stuntsHydrate = {
  stunts: {
    stunts: Record<string, stunt>;
  };
};

export const usestuntsStore = defineStore('stunts', () => {
  const stunts: Ref<Array<stunt>> = ref([]);
  const stuntsCount: ComputedRef<number> = computed(() => stunts.value.length);
  const addstunt = () => {
    stunts.value.push({
      _id: uuidv4(),
      name: `New Favorite Stunt ${stunts.value.length + 1}`,
      description: '',
      type: 'combat',
    });
  }

  const removestunt = (_id: string) => {
    const indexToRemove = stunts.value.findIndex((stunt) => stunt._id === _id);
    if (indexToRemove >= 0) stunts.value.splice(indexToRemove, 1);
  };

  const printstunt = async (_id: string) => {
    const stunt = stunts.value.find((item) => item._id === _id);
    if (!stunt) return;
    await sendToChat({
      title: stunt.name,
      subtitle: stunt.type,
      // stunts: ['Inventory', stunt.type],
      textContent: stunt.description,
    });
  };

  /*
   * Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id
   * */
  const dehydrate = () => {
    return {
      stunts: {
        stunts: arrayToObject(stunts.value),
      },
    };
  };

  /*
   * Since the items array is coming is an object, we convert it back into an array before saving here.
   * */
  const hydrate = (hydrateStore: stuntsHydrate) => {
    stunts.value = objectToArray(hydrateStore.stunts?.stunts) || stunts.value;
  };

  return {
    stunts,
    stuntsCount,

    addstunt,
    removestunt,
    printstunt,

    dehydrate,
    hydrate,
  };
});
