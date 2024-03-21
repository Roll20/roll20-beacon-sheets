import {
  initRelay,
  type Character,
  type CompendiumDragDropData,
  type Dispatch,
  type Settings,
  type UpdateArgs,
} from '@roll20/beacon-sdk';
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
import { addHeroDie } from '@/sheet/stores/character/characterStore';
import { getAbilityScores, getBio, getLife, setLife } from '@/relay/handlers/computed';

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
    /*
     * Handlers for custom actions initiated by interacting with roll templates.
     * See /src/rolltemplates/partials/heroDie.hbs for an example of how an action is performed.
     * This one rolls 1d6, adds the result to a previous roll, and then prints the new result.
     * Check out Marvel Multiverse RPG Edges for a more complex example.
     * */
    addHeroDie: {
      method: async (
        props: {
          dispatch: Dispatch;
          character: Character;
          messageId?: string;
          total?: number;
        },
        ...args: string[]
      ): Promise<void> => {
        const [originalRoll, originalTitle] = args;
        return addHeroDie(props, Number(originalRoll), originalTitle);
      },
    },
  },
  /*
   * These properties are exposed by the sheet to be used in macros, inline roll and tokens.
   * */
  computed: {
    // These attributes allow dot notation in macros, and will not show up on token bar attributes
    // EX: @{CHARACTER_NAME|abilityScores.Strength.current}
    abilityScores: { tokenBarValue: false, get: getAbilityScores },
    bio: { tokenBarValue: false, get: getBio },
    // These are defined token bar attributes
    life: { tokenBarValue: true, get: getLife, set: setLife },
  },
};

export type InitValues = {
  id: string;
  character: Character;
  settings: Settings;
  compendiumDrop: CompendiumDragDropData | null;
};

// Almost everything below here is Boilerplate and you probably want to keep it intact.

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
  if (logMode) console.info('➡️ ExampleSheet: Updating Firebase');
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

// NOTE: Dev relay is used to run end to end tests
const devRelay = async () =>
  ({
    update: (...args: any[]) => console.log('devRelay update', args),
    updateCharacter: (...args: any[]) => console.log('devRelay updateCharacter', args),
    characters: {},
    updateTokensByCharacter: () => '',
  } as any as Dispatch);

export const createRelay = async ({
  devMode = false,
  primaryStore = 'examplesheetStore',
  logMode = false,
}) => {
  // @ts-ignore
  const dispatch = await (false ? devRelay() : initRelay(relayConfig));
  const relayPinia = (context: PiniaPluginContext) => {
    if (context.store.$id !== primaryStore) return;
    const store = context.store;

    dispatchRef.value = dispatch;

    // Init Store
    const { attributes, ...profile } = initValues.character;
    store.hydrateStore(attributes, profile);

    // Beacon Provides access to settings, like campaign id for example
    store.setCampaignId(initValues.settings.campaignId);
    store.setPermissions(initValues.settings.owned, initValues.settings.gm);

    // Watch for changes
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
