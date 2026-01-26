import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export type SettingsHydrate = {
  settings: {
    actorType: string | null;
  };
};

export const useSettingsStore = defineStore('settings', () => {
  const actorType: Ref<string | null> = ref(null);

  const setActorType = (type: string) => {
    actorType.value = type;
  };

  /*
   * Firebase is not able to store Arrays, so the items array must be stored as an object indexed by the _id
   * */
  const dehydrate = () => {
    return {
      settings: {
        actorType: actorType.value,
      },
    };
  };

  /*
   * Since the items array is coming is an object, we convert it back into an array before saving here.
   * */
  const hydrate = (hydrateStore: SettingsHydrate) => {
    actorType.value = hydrateStore.settings?.actorType ?? actorType.value;
  };

  return {
    actorType,

    setActorType,

    dehydrate,
    hydrate,
  };
});
