import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ActionsHydrateSchema, type ActionsHydrate, type ActionItem } from '@/schemas/hydrate/actions';
import { genericDehydrate, genericHydrate } from '@/utility/store';
import { DEFAULT_ACTIONS } from '@/system/actions/defaultActions';

export const actionsStore = defineStore('actions', () => {
  const list = ref<ActionItem[]>(JSON.parse(JSON.stringify(DEFAULT_ACTIONS)));
  const hideDefaultActions = ref(false);
  const currentTab = ref<'quick' | 'full'>('quick');

  const firebase = {
    list,
    hideDefaultActions,
    currentTab,
  };

  const dehydrate = (): ActionsHydrate => genericDehydrate(firebase, ActionsHydrateSchema);
  const hydrate = (snapshot: ActionsHydrate) => genericHydrate(snapshot, firebase, ActionsHydrateSchema);

  return {
    list,
    hideDefaultActions,
    currentTab,
    firebase,
    dehydrate,
    hydrate,
  };
});
