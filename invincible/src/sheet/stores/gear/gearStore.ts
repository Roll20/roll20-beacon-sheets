import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { genericDehydrate, genericHydrate } from '@/utility/store';
import { GearHydrateSchema, type GearHydrate, type GearItem } from '@/schemas/hydrate/gear';

export const gearStore = defineStore('gear', () => {
  
  const resources = ref('');
  const list = ref<GearItem[]>([]);

  
  watch(
    list,
    (newList) => {
      if (newList) {
        newList.forEach((item) => {
          if (item.effects) {
            item.effects.disabled = !item.isActive;
          }
        });
      }
    },
    { deep: true, immediate: true }
  );

  const firebase = {
    list,
  };

  const dehydrate = (): GearHydrate => genericDehydrate(firebase, GearHydrateSchema);
  const hydrate = (snapshot: GearHydrate) => genericHydrate(snapshot, firebase, GearHydrateSchema);

  return {
    list,
    firebase,
    dehydrate,
    hydrate,
  };
});
