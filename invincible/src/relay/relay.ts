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
  setHealth,
  setResolve,
} from './handlers/handlers';
import { reactive, ref, watch, nextTick, type Ref, type App, shallowRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utility/logger';
import { total } from '@/system/sample/total';
import { ruleSets } from '@/system';

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
  actions: {
    push_roll: {
      description: 'Push Roll',
      method: async (props, charIdArg) => {
        if (props.messageId && charIdArg) {
          const { handlePushRoll } = await import('@/system/rolls/pushRoll');
          handlePushRoll(props.messageId, charIdArg, props.dispatch, storeRef.value);
        }
      }
    }
  },
  computed: {
    
    
    
    fighting: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.fighting(character).value;
      }
    },
    agility: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.agility(character).value;
      }
    },
    strength: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.strength(character).value;
      }
    },
    reason: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.reason(character).value;
      }
    },
    intuition: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.intuition(character).value;
      }
    },
    presence: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.presence(character).value;
      }
    },
    slugfest: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.slugfest_damage(character).value;
      }
    },
    armor: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.armor(character).value;
      }
    },
    reputation: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.reputation(character).value;
      }
    },
    rank: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.rank(character).value;
      }
    },
    resources: {
      tokenBarValue: true, get: (character: Character) => {
        return ruleSets.resources(character).value;
      }
    },
    health: {
      tokenBarValue: true,
      get: (character: Character) => {
        return {
          current: String(ruleSets.health(character)),
          max: ruleSets.health_max(character).value,
        };
      },
      set: setHealth,
    },
    resolve: {
      tokenBarValue: true,
      get: (character: Character) => {
        return {
          current: String(ruleSets.resolve(character)),
          max: ruleSets.resolve_max(character).value,
        };
      },
      set: setResolve,
    },
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
export const sharedSettings = ref<Record<string, any>>({});
export const latestLocalUpdateId = ref(uuidv4());
const isPendingUpdate = ref(false);
let safetyTimeoutId: any = null;

const doUpdate = (dispatch: Dispatch, update: Record<string, any>) => {
  logger.info('➡️ Sheet: Updating Firebase');
  logger.log(`Firebase Update: ${initValues.character.id}`, update);
  const character: Record<string, any> = {
    character: {
      id: initValues.character.id,
      ...update,
    },
  };
  character.character.attributes.updateId = latestLocalUpdateId.value;
  dispatch.updateCharacter(character as UpdateArgs);

  if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
  safetyTimeoutId = setTimeout(() => {
    logger.log('⏰ Safety timeout expired, releasing pending update block.');
    isPendingUpdate.value = false;
  }, 5000);
};

const debounceUpdate = debounce(doUpdate, 800);

const devRelay = async () =>
({
  update: (...args: any[]) => logger.log('devRelay update', args),
  updateCharacter: (...args: any[]) => logger.log('devRelay updateCharacter', args),
  characters: {},
  updateTokensByCharacter: () => '',
} as any as Dispatch);

export const isHeadlessRef = ref(false);
export const storeRef = shallowRef<any>(null);

export const createRelay = async ({
  devMode = false,
  primaryStore = 'character',
  logMode = false,
  isWorker = false,
}) => {
  logger.setVerbose(logMode);
  
  const dispatch = await (devMode ? devRelay() : initRelay(relayConfig));
  const relayPinia = (context: PiniaPluginContext) => {
    if (context.store.$id !== primaryStore) return;
    const store = context.store;

    dispatchRef.value = dispatch;
    isHeadlessRef.value = isWorker;
    storeRef.value = store;

    
    const { attributes, id, name, avatar, bio, gmNotes, token } = initValues.character;
    store.hydrateStore({ ...attributes, meta: { id, name, avatar, bio, gmNotes, token } });

    
    store.setCampaignId(initValues.settings.campaignId);
    store.setPermissions(initValues.settings.owned, initValues.settings.gm);

    
    if (initValues.compendiumDrop && (initValues.compendiumDrop.categoryName === 'NPCs' || initValues.compendiumDrop.categoryName === 'Dramatis Personae')) {
      import('@/relay/handlers/drop').then(({ drag }) => {
        drag({ coordinates: { left: 0, top: 0 }, dropData: initValues.compendiumDrop! }, dispatch, true, initValues.character);
      });
    }

    
    store.$subscribe(() => {
      if (blockUpdate.value === true) return;
      latestLocalUpdateId.value = uuidv4();
      isPendingUpdate.value = true;
      const update = store.dehydrateStore();
      debounceUpdate(dispatch, update);
    });

    
    watch(() => store.meta?.token, (newToken) => {
      if (blockUpdate.value === true) return;
      
      const characterId = initValues.character.id;
      if (!characterId || !newToken) return;

      dispatch.updateTokensByCharacter({
        characterId,
        token: newToken
      } as any);
    }, { deep: true });

    
    watch(beaconPulse, async (newValue, oldValue) => {
      logger.log('❤️ Beacon Pulse', { newValue, oldValue });
      const characterId = initValues.character.id;
      const { attributes, id, name, avatar, bio, gmNotes, token } = dispatch.characters[characterId];
      
      
      if (attributes.updateId === latestLocalUpdateId.value) {
        if (safetyTimeoutId) {
          clearTimeout(safetyTimeoutId);
          safetyTimeoutId = null;
        }
        isPendingUpdate.value = false;
        blockUpdate.value = false;
        return;
      }
      
      if (isPendingUpdate.value) {
        logger.log('⏳ Pending local update exists, skipping incoming pulse to avoid overwriting newer local state.');
        return;
      }
      
      blockUpdate.value = true;
      logger.log('🔒🔴 locking changes');
      try {
        store.hydrateStore({ ...attributes, meta: { id, name, avatar, bio, gmNotes, token } });
        await nextTick();
      } finally {
        logger.log('🔓🟢 unlocking changes');
        blockUpdate.value = false;
      }
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
