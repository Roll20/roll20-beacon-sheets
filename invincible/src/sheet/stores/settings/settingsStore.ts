import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SettingsHydrateSchema, type SettingsHydrate } from '@/schemas/hydrate/settings';
import { genericDehydrate, genericHydrate } from '@/utility/store';

export const settingsStore = defineStore('settings', () => {
  const mode = ref('unknown');
  const version = ref('0.1');

  const firebase = { mode, version };

  const dehydrate = (): SettingsHydrate => genericDehydrate(firebase, SettingsHydrateSchema);
  const hydrate = (snapshot: SettingsHydrate) => genericHydrate(snapshot, firebase, SettingsHydrateSchema);

  return { mode, version, firebase, dehydrate, hydrate };
});
