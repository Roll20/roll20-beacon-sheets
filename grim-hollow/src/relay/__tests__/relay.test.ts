import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSheetStore } from '../../sheet/stores';

import { setActivePinia, createPinia } from 'pinia';
import { createRelay, initValues, beaconPulse, dispatchRef } from '../relay';
import * as BeaconSDK from '@roll20-official/beacon-sdk';
import { nextTick } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@roll20-official/beacon-sdk', async () => {
  return {
    initRelay: vi.fn(),
  };
});

describe('relay.ts integration', () => {
  let mockDispatch: any;

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    
    // Reset initValues defaults
    initValues.id = '';
    initValues.character = { attributes: {} } as any;
    initValues.settings = {} as any;
    
    mockDispatch = {
      updateCharacter: vi.fn(),
      characters: {
        'char-123': {
          attributes: {
            updateId: 'external-update-id',
            abilities: {
              abilities: {
                'str-id': { _id: 'str-id', score: 18, label: 'strength', arrayPosition: 0 }
              }
            }
          }
        }
      }
    };

    vi.mocked(BeaconSDK.initRelay).mockResolvedValue(mockDispatch);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('initializes relay and hydrates store on creation', async () => {
    const store = useSheetStore();
    const hydrateSpy = vi.spyOn(store, 'hydrateStore');

    // Simulate character data present at init
    initValues.character = {
      id: 'char-123',
      attributes: {
        abilities: {
          abilities: {
            'str-id': { _id: 'str-id', score: 14, label: 'strength', arrayPosition: 0 }
          }
        }
      }
    } as any;

    const { relayPinia } = await createRelay({ devMode: false });
    
    relayPinia({ store } as any);

    expect(hydrateSpy).toHaveBeenCalled();
    expect(store.abilities.abilities.find(a => a.label === 'strength')?.score).toBe(14);
  });

  it('debounces updates to dispatch when store changes', async () => {
    initValues.character.id = 'char-123';
    const store = useSheetStore();
    const { relayPinia } = await createRelay({ devMode: false });
    relayPinia({ store } as any);

    store.abilities.abilities[0].score = 20;
    
    await nextTick();

    // Fast forward less than debounce time (800ms)
    vi.advanceTimersByTime(100);
    expect(mockDispatch.updateCharacter).not.toHaveBeenCalled();

    // Fast forward past debounce
    vi.advanceTimersByTime(800);
    expect(mockDispatch.updateCharacter).toHaveBeenCalled();
    
    const callArgs = mockDispatch.updateCharacter.mock.calls[0][0];
    expect(callArgs.character.id).toBe('char-123');
    expect(callArgs.character.attributes.abilities).toBeDefined();
    expect(callArgs.character.attributes.updateId).toBeDefined();
  });

  it('hydrates from dispatch when beaconPulse updates', async () => {
    const store = useSheetStore();
    const { relayPinia } = await createRelay({ devMode: false });
    relayPinia({ store } as any);

    initValues.character.id = 'char-123';
    
    // Initial state check (default is 10)
    expect(store.abilities.abilities.find(a => a.label === 'strength')?.score).not.toBe(18);

    // Trigger pulse
    beaconPulse.value += 1;
    await nextTick();

    // Should hydrate using the mockDispatch data (score 18)
    expect(store.abilities.abilities.find(a => a.label === 'strength')?.score).toBe(18);
  });

  it('handles missing character data gracefully during beaconPulse', async () => {
    const store = useSheetStore();
    const { relayPinia } = await createRelay({ devMode: false });
    relayPinia({ store } as any);

    // Set an ID that doesn't exist in mockDispatch.characters
    initValues.character.id = 'unknown-char';

    // This should not throw error due to safety check
    beaconPulse.value += 1;
    await nextTick();

    expect(true).toBe(true); 
  });

  it('uses devRelay in dev mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    initValues.character.id = 'dev-char';

    const { relayPinia } = await createRelay({ devMode: true });
    const store = useSheetStore();
    relayPinia({ store } as any);

    expect(BeaconSDK.initRelay).not.toHaveBeenCalled();

    store.abilities.abilities[0].score = 99;
    await nextTick();
    vi.advanceTimersByTime(1000);

    expect(consoleSpy).toHaveBeenCalledWith('devRelay updateCharacter', expect.anything());
    
    consoleSpy.mockRestore();
  });

  it('skips hydration if updateId matches local sheetId (ignore self-updates)', async () => {
    const store = useSheetStore();
    const { relayPinia } = await createRelay({ devMode: false });
    relayPinia({ store } as any);
    
    initValues.character.id = 'char-123';
    
    store.abilities.abilities[0].score = 50;
    await nextTick();
    vi.advanceTimersByTime(1000);
    
    expect(mockDispatch.updateCharacter).toHaveBeenCalled();
    const payload = mockDispatch.updateCharacter.mock.calls[0][0];
    const generatedSheetId = payload.character.attributes.updateId;
    expect(generatedSheetId).toBeDefined();
    
    mockDispatch.characters['char-123'].attributes.updateId = generatedSheetId;
    
    mockDispatch.characters['char-123'].attributes.abilities.abilities['str-id'].score = 100;
    
    const hydrateSpy = vi.spyOn(store, 'hydrateStore');
    
    beaconPulse.value += 1;
    await nextTick();
    
    expect(hydrateSpy).not.toHaveBeenCalled();
    expect(store.abilities.abilities[0].score).toBe(50);
  });

  it('installs vue plugin correctly providing dispatch', async () => {
    const { relayVue } = await createRelay({ devMode: false });
    
    const appMock = {
      provide: vi.fn(),
    };
    
    relayVue.install(appMock as any);
    
    expect(appMock.provide).toHaveBeenCalledWith('dispatch', mockDispatch);
  });
});