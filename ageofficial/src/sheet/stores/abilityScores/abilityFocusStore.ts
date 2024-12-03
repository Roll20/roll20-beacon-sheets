import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import sendToChat from '@/utility/sendToChat';

// See "inventoryStore.ts" for an explanation of how to use list/repeating sections
interface abilityFocus {
  type: 'focus';
  _id: string;
  name: string;
  ability:string;
  description: string;
  customName?:string;
  focus?:boolean;
  doubleFocus?:boolean;
}

export type abilityFocusesHydrate = {
  abilityFocuses: {
    abilityFocuses: Record<string, abilityFocus>;
  };
};

export const useAbilityFocusesStore = defineStore('abilityFocuses', () => {
  const abilityFocuses: Ref<Array<abilityFocus>> = ref([]);
  const abilityFocusesCount: ComputedRef<number> = computed(() => abilityFocuses.value.length);
  const addAbilityFocus = () => {
    abilityFocuses.value.push({
      _id: uuidv4(),
      name: '',
      ability:'',
      description: '',
      type: 'focus',
    });
  }

  const removeAbilityFocus = (_id: string) => {
    const indexToRemove = abilityFocuses.value.findIndex((abilityFocus) => abilityFocus._id === _id);
    if (indexToRemove >= 0) abilityFocuses.value.splice(indexToRemove, 1);
  };

  const printAbilityFocus = async (_id: string) => {
    const abilityFocus = abilityFocuses.value.find((item) => item._id === _id);
    if (!abilityFocus) return;
    await sendToChat({
      title: abilityFocus.name,
      subtitle: abilityFocus.type,
    //   abilityFocuses: ['Inventory', abilityFocus.type],
      textContent: abilityFocus.description,
    });
  };

  /*
   * Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id
   * */
  const dehydrate = () => {
    return {
      abilityFocuses: {
        abilityFocuses: arrayToObject(abilityFocuses.value),
      },
    };
  };

  /*
   * Since the items array is coming is an object, we convert it back into an array before saving here.
   * */
  const hydrate = (hydrateStore: abilityFocusesHydrate) => {
    abilityFocuses.value = objectToArray(hydrateStore.abilityFocuses?.abilityFocuses) || abilityFocuses.value;
  };

  return {
    abilityFocuses,
    abilityFocusesCount,

    addAbilityFocus,
    removeAbilityFocus,
    printAbilityFocus,

    dehydrate,
    hydrate,
  };
});


export type AbilityFocusList = {
    type:string;
    focus: boolean;
    doubleFocus: boolean;
    description: string;
  }