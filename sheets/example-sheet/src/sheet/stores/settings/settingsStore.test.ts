import { useSettingsStore } from "./settingsStore";
import { createPinia } from "pinia";
import { describe, it, expect } from 'vitest';

describe('settingsStore', () => {
  const defaultEncumberancePenalty = -4;

  it('defaults correct values', () => {
    const pinia = createPinia();
    const store = useSettingsStore(pinia);
    expect(store).toBeTruthy();

    expect(store.dehydrate()).toEqual({
      settings: {
        encumbrancePenalty: defaultEncumberancePenalty,
      },
    })
  })
})