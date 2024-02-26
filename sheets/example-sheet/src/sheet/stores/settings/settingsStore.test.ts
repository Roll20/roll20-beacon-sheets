import { useSettingsStore } from "./settingsStore";
import { createPinia } from "pinia";
import { describe, it, expect } from 'vitest';

describe('settingsStore', () => {
  const defaultEncumbrancePenalty = -4;
  const pinia = createPinia();
  const store = useSettingsStore(pinia);

  it('defaults correct values', () => {
    expect(store).toBeTruthy();

    expect(store.dehydrate()).toEqual({
      settings: {
        encumbrancePenalty: defaultEncumbrancePenalty,
      },
    })
  })

  it('updates encumbrance penalty', () => {
    const newEncumbrancePenalty = -1;

    expect(store.hydrate({
      settings: {
        encumbrancePenalty: newEncumbrancePenalty
      }
    }))

    expect(store.dehydrate()).toEqual({
      settings: {
        encumbrancePenalty: newEncumbrancePenalty,
      },
    })
  })
})