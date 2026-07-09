import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AbilitiesHydrateSchema, type AbilitiesHydrate } from '@/schemas/hydrate/abilities';
import { genericDehydrate, genericHydrate } from '@/utility/store';

export const abilitiesStore = defineStore('abilities', () => {
  const fighting = ref(1);
  const agility = ref(1);
  const strength = ref(1);
  const reason = ref(1);
  const intuition = ref(1);
  const presence = ref(1);

  const firebase = {
    fighting,
    agility,
    strength,
    reason,
    intuition,
    presence,
  };

  const dehydrate = (): AbilitiesHydrate => genericDehydrate(firebase, AbilitiesHydrateSchema);
  const hydrate = (snapshot: AbilitiesHydrate) => genericHydrate(snapshot, firebase, AbilitiesHydrateSchema);

  return {
    fighting,
    agility,
    strength,
    reason,
    intuition,
    presence,
    firebase,
    dehydrate,
    hydrate,
  };
});
