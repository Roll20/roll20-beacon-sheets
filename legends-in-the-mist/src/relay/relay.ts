import {
  initRelay,
  type Character,
  type CompendiumDragDropData,
  type Dispatch,
  type Settings,
  type UpdateArgs,
} from '@roll20-official/beacon-sdk';
import { debounce } from 'lodash';
import type { PiniaPluginContext } from 'pinia';

import {
  onInit,
  onChange,
  onSettingsChange,
  onSharedSettingsChange,
  onTranslationsRequest,
  onDragOver,
} from './handlers/handlers';
import { reactive, ref, watch, nextTick, type Ref, type App, shallowRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const relayConfig = {
  handlers: {
    onInit,
    onChange,
    onSettingsChange,
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver,
  },
  actions: {
  },
  computed: {
  },
};

export type InitValues = {
  id: string;
  character: Character;
  settings: Settings;
  compendiumDrop: CompendiumDragDropData | null;
};

export const initValues: InitValues = reactive({
  id: '',
  character: {
    attributes: {},
  } as Character,
  settings: {} as Settings,
  compendiumDrop: null,
});

export const beaconPulse = ref(0);
export const blockUpdate = ref(false);
export const dispatchRef = shallowRef();
export const dropUpdate: Ref<Dispatch> = ref({} as Dispatch);
export const settingsSheet = ref(false);
const sheetId = ref(uuidv4());

const doUpdate = (dispatch: Dispatch, update: Record<string, any>, logMode = false) => {
  if (logMode) console.info('➡️ sheet: Updating Firebase');
  if (logMode) console.dir(`Firebase Update: ${initValues.character.id}`, update);
  const character: Record<string, any> = {
    character: {
      id: initValues.character.id,
      ...update,
    },
  };
  character.character.attributes.updateId = sheetId.value;
  dispatch.updateCharacter(character as UpdateArgs);
};

const debounceUpdate = debounce(doUpdate, 800);

const devRelay = async () =>
  ({
    update: (...args: any[]) => console.log('devRelay update', args),
    updateCharacter: (...args: any[]) => console.log('devRelay updateCharacter', args),
    characters: {},
    updateTokensByCharacter: () => '',
  } as any as Dispatch);

export const createRelay = async ({
  devMode = false,
  primaryStore = 'sheet',
  logMode = false,
}) => {
  // @ts-ignore
  const dispatch = await (devMode ? devRelay() : initRelay(relayConfig));
  const relayPinia = (context: PiniaPluginContext) => {
    if (context.store.$id !== primaryStore) return;
    const store = context.store;

    dispatchRef.value = dispatch;

    const { attributes, ...profile } = initValues.character;
    store.hydrateStore(attributes, profile);

    store.setCampaignId(initValues.settings.campaignId);
    store.setPermissions(initValues.settings.owned, initValues.settings.gm);

    store.$subscribe(() => {
      if (blockUpdate.value === true) return;
      const update = store.dehydrateStore();
      debounceUpdate(dispatch, update, logMode);
    });

    watch(beaconPulse, async (newValue, oldValue) => {
      if (logMode) console.log('❤️ Beacon Pulse', { newValue, oldValue });
      const characterId = initValues.character.id;
      blockUpdate.value = true;
      if (logMode) console.log('🔒🔴 locking changes');
      const { attributes, ...profile } = dispatch.characters[characterId];
      if (attributes.updateId === sheetId.value) {
        blockUpdate.value = false;
        return;
      }
      store.hydrateStore(attributes, profile);
      await nextTick();
      if (logMode) console.log('🔓🟢 unlocking changes');
      blockUpdate.value = false;
    });

    return {
      ...dispatch,
    };
  };

  const relayVue = {
    install(app: App) {
      app.provide('dispatch', dispatch);
    },
  };

  return {
    relayPinia,
    relayVue,
  };
};
