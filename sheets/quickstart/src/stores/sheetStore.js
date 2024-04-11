import { defineStore } from 'pinia';
import { ref } from 'vue';

const sheetStore = () => {
  const faction = ref('');

  const dehydrate = () => {
    return {
      faction: faction.value
    };
  };

  const hydrate = (hydrateStore) => {
    faction.value = hydrateStore.faction ?? faction.value;
  };

  return {
    faction,
    dehydrate,
    hydrate,
  };
}

export const useSheetStore = defineStore(
  'sheet',
  sheetStore
);
