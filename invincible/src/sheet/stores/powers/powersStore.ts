import { defineStore } from 'pinia';
import { ref } from 'vue';
import { PowersHydrateSchema, type PowersHydrate, type PowerItem } from '@/schemas/hydrate/powers';
import { genericDehydrate, genericHydrate } from '@/utility/store';

export const powersStore = defineStore('powers', () => {
  const powerSourceDescription = ref('');
  
  
  const list = ref<PowerItem[]>([]);

  const firebase = {
    powerSourceDescription,
    list,
  };

  const dehydrate = (): PowersHydrate => genericDehydrate(firebase, PowersHydrateSchema);
  const hydrate = (snapshot: PowersHydrate) => genericHydrate(snapshot, firebase, PowersHydrateSchema);

  return {
    powerSourceDescription,
    list,
    firebase,
    dehydrate,
    hydrate,
  };
});
