import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SampleHydrateSchema, type SampleHydrate } from '@/schemas/hydrate/sample';
import { genericDehydrate, genericHydrate } from '@/utility/store';
import type { EffectCollection } from '@/schemas/common/EffectCollection';

export const sampleStore = defineStore('sample', () => {
  
  
  const agility = ref(0);
  const endurance = ref(0);
  const health = ref('0');

  const score = ref(0);
  const label = ref('');
  const effects = ref<EffectCollection>({ value: [] });
  const _children = ref<string[]>([]);

  
  const previousScores = ref<Array<{ _id: string, score: number, label: string }>>([]);

  const firebase = {
    agility,
    endurance,
    health,
    score,
    label,
    previousScores,
    effects,
    _children
  }

  
  
  
  const data = computed({
    get: () => ({ score: score.value, label: label.value }),
    set: (incoming: SampleHydrate) => {
      score.value = incoming.score ?? score.value;
      label.value = incoming.label ?? label.value;
    },
  });

  
  
  const dehydrate = (): SampleHydrate => genericDehydrate(firebase, SampleHydrateSchema);

  
  
  const hydrate = (snapshot: SampleHydrate) => genericHydrate(snapshot, firebase, SampleHydrateSchema);

  return {
    agility,
    endurance,
    health,
    score,
    label,
    previousScores,
    effects,
    _children,
    firebase,
    data,
    dehydrate,
    hydrate,
  };
});
