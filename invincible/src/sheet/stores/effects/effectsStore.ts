import { defineStore } from 'pinia';
import { ref } from 'vue';
import { genericDehydrate, genericHydrate } from '@/utility/store';
import type { EffectCollection } from '@/schemas/common/EffectCollection';
import { EffectsHydrateSchema, type EffectsHydrate } from '@/schemas/hydrate/effects';
import type { SingleEffect } from '@/schemas/common/SingleEffectSchema';
import { v4 as uuidv4 } from 'uuid';

export const effectsStore = defineStore('effects', () => {
  const effects = ref<EffectCollection>({ value: [] });

  const firebase = {
    effects,
  };
  
  const update = (effect: SingleEffect) => {
    let existingIndex = -1;
    if (effect._id) {
      existingIndex = effects.value.value.findIndex(e => e._id === effect._id);
    }
    if (existingIndex !== -1) {
      effects.value.value[existingIndex] = { ...effects.value.value[existingIndex], ...effect } as SingleEffect;
    } else {
      effects.value.value.push({ ...effect, _id: effect._id || uuidv4() } as SingleEffect);
    }
  };

  const remove = (effectId: string) => {
    effects.value.value = effects.value.value.filter(e => e._id !== effectId);
  };

  const dehydrate = (): EffectsHydrate => genericDehydrate(firebase, EffectsHydrateSchema);
  const hydrate = (snapshot: EffectsHydrate) => genericHydrate(snapshot, firebase, EffectsHydrateSchema);

  return {
    effects,
    firebase,
    update,
    updateEffect: update,
    remove,
    dehydrate,
    hydrate,
  };
});