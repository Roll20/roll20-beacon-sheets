import { defineStore } from 'pinia';
import { ref } from 'vue';
import { FeaturesHydrateSchema, type FeaturesHydrate, type FeatureItem } from '@/schemas/hydrate/features';
import { genericDehydrate, genericHydrate } from '@/utility/store';

export const featuresStore = defineStore('features', () => {
  
  const list = ref<FeatureItem[]>([]);

  const firebase = {
    list,
  };

  const dehydrate = (): FeaturesHydrate => genericDehydrate(firebase, FeaturesHydrateSchema);
  const hydrate = (snapshot: FeaturesHydrate) => genericHydrate(snapshot, firebase, FeaturesHydrateSchema);

  return {
    list,
    firebase,
    dehydrate,
    hydrate,
  };
});
