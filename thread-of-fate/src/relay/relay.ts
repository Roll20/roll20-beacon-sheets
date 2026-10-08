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
  onDropOver,
} from './handlers/handlers';
import { reactive, ref, watch, nextTick, type Ref, type App, shallowRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
  getAbilityScores,
  getBio,
  getLife,
  setLife,
  getStamina,
  setStamina,
  getAether,
  setAether,
  getArmorClass,
} from '@/relay/handlers/computed';
import {
  getCrucibleHp,
  setCrucibleHp,
  getCrucibleStamina,
  setCrucibleStamina,
  getCrucibleAether,
  setCrucibleAether,
  getCrucibleAp,
  setCrucibleAp,
  getCrucibleAc,
} from '@/relay/handlers/crucibleComputed';
import { crucibleSheetActions } from '@/relay/handlers/crucibleActions';

/* 
This is the configuration for the relay. It defines the handlers and actions that the sheet will use.
The handlers are functions that are called by the relay when certain events occur.
The actions are custom functions that can be called by the sheet to perform specific actions.
the computed properties are exposed by the sheet to be used in macros, inline rolls and tokens.
*/
const relayConfig = {
  handlers: {
    onInit,
    onChange,
    onSettingsChange,
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver,
    onDropOver,
  },
  // Sheet actions invoked by Crucible token-action buttons (addActionsToHost).
  // They read the entity from the character's own attributes, so they work even
  // when the sheet iframe is not open.
  actions: crucibleSheetActions,
  computed: {
    // Dot-notation macro values (not shown as token bars)
    // EX: @{CHARACTER_NAME|abilityScores.Might.current} or .modifier
    abilityScores: { tokenBarValue: false, get: getAbilityScores },
    bio: { tokenBarValue: false, get: getBio },
    armorClass: { tokenBarValue: false, get: getArmorClass },
    // Token-bar attributes (current/max), editable from the token where it makes sense
    life: { tokenBarValue: true, get: getLife, set: setLife },
    stamina: { tokenBarValue: true, get: getStamina, set: setStamina },
    aether: { tokenBarValue: true, get: getAether, set: setAether },
    // The Crucible: token bars for GM entities deployed from the entity library.
    // A character is either a PC (attributes.draft) or a Crucible entity
    // (attributes.crucible); the unused set simply reads 0/0.
    crucible_hp: { tokenBarValue: true, get: getCrucibleHp, set: setCrucibleHp },
    crucible_stamina: { tokenBarValue: true, get: getCrucibleStamina, set: setCrucibleStamina },
    crucible_aether: { tokenBarValue: true, get: getCrucibleAether, set: setCrucibleAether },
    crucible_ap: { tokenBarValue: true, get: getCrucibleAp, set: setCrucibleAp },
    crucible_ac: { tokenBarValue: false, get: getCrucibleAc },
  },
};

// This is the typescript type for the initial values that the sheet will use when it starts.
export type InitValues = {
  id: string;
  character: Character;
  settings: Settings;
  compendiumDrop: CompendiumDragDropData | null;
};

// Shared Beacon relay state for The Thread of Fate.
export const initValues: InitValues = reactive({
  id: '',
  character: {
    attributes: {},
  } as Character,
  settings: {} as Settings,
  compendiumDrop: null,
});

/*
We use refs to keep track of the state of the sheet.
This is a way to keep track of the state of the sheet in a reactive way.
*/
export const beaconPulse = ref(0);
export const blockUpdate = ref(false);
export const dispatchRef = shallowRef();
export const dropUpdate: Ref<Dispatch> = ref({} as Dispatch);
export const settingsSheet = ref(false);
const sheetId = ref(uuidv4());

/*
This is the function that is called when the character data is updated.
logMode is a flag that can be used to log the updates to the console. This is useful for debugging.
*/
const doUpdate = (dispatch: Dispatch, update: Record<string, any>, logMode = false) => {
  if (logMode) console.info('[Thread of Fate] syncing character', initValues.character.id);
  if (logMode) console.dir(update);
  const character: Record<string, any> = {
    character: {
      id: initValues.character.id,
      ...update,
    },
  };
  character.character.attributes.updateId = sheetId.value;
  dispatch.updateCharacter(character as UpdateArgs);
};

// This is a debounced version of the update function that will only be called after 800ms of inactivity.
const debounceUpdate = debounce(doUpdate, 800);

/* 
Dev relay is used to run the sheet in a web browser
It will log the updates to the console instead of sending them to the VTT or Roll20/Characters
This is useful for testing the sheet without having to connect to the server.
*/
const devRelay = async () =>
  ({
    update: (...args: any[]) => console.log('devRelay update', args),
    updateCharacter: (...args: any[]) => console.log('devRelay updateCharacter', args),
    characters: {},
    updateTokensByCharacter: () => '',
    // Local dice roller + post so the Play sheet works standalone.
    // In Roll20 the real relay rolls server-side and posts to chat instead.
    roll: async ({ rolls }: { rolls: Record<string, string> }) => {
      const results: Record<string, any> = {};
      for (const [key, formula] of Object.entries(rolls)) {
        const m = /(\d+)d(\d+)/i.exec(formula);
        let result = 0;
        const rollsArr: any[] = [];
        if (m) {
          const n = Number(m[1]);
          const s = Number(m[2]);
          const arr: number[] = [];
          for (let i = 0; i < n; i++) {
            const r = Math.floor(Math.random() * s) + 1;
            arr.push(r);
            result += r;
          }
          rollsArr.push({ dice: n, sides: s, results: arr });
        }
        results[key] = { results: { result, expression: formula, rolls: rollsArr } };
      }
      return { results };
    },
    post: (payload: any) => console.log('devRelay post (would go to Roll20 chat):', payload),
  } as any as Dispatch);

/*
This function is called to create the relay.
It will return the relayPinia and relayVue objects that can be used to install the relay in the sheet.
  RelayPinia is used to hydrate the store and watch for changes.
  RelayVue is used to provide the dispatch object from the Beacon SDK to the sheet.
We use a watcher of beaconPulse value to trigger a re-render of the sheet when the value changes, see the onChange handler.
This is just one way to trigger a re-render, you can implement your own logic to trigger a re-render.
*/
export const createRelay = async ({
  devMode = false,
  primaryStore = 'threadOfFateSheet',
  logMode = false,
}) => {
  // @ts-ignore
  const dispatch = await (devMode ? devRelay() : initRelay(relayConfig));
  const relayPinia = (context: PiniaPluginContext) => {
    if (context.store.$id !== primaryStore) return;
    const store = context.store;

    dispatchRef.value = dispatch;

    // Permissions FIRST: hydrateStore gates GM-only data (the Crucible library)
    // on them, so they must be in place before the first hydrate. Outside the
    // VTT `settings.gm` is undefined, which the store treats as GM (standalone
    // users are the Storyteller of their own browser).
    store.setCampaignId(initValues.settings.campaignId);
    store.setPermissions(initValues.settings.owned, initValues.settings.gm);

    // Init Store
    const { attributes, ...profile } = initValues.character;
    store.hydrateStore(attributes, profile);

    // Watch for changes
    store.$subscribe(() => {
      if (blockUpdate.value === true) return;
      const update = store.dehydrateStore();
      debounceUpdate(dispatch, update, logMode);
    });

    // Watch for changes from the Beacon SDK, triggered everytime the Beacon Pulse value changes
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
