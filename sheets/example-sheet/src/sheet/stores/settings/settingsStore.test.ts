import { useSettingsStore } from "./settingsStore";
import { createPinia } from "pinia";
import { describe, it, expect } from 'vitest';

describe('settingsStore', () => {
  it('defaults correct values', () => {
    const pinia = createPinia();
    const store = useSettingsStore(pinia);
    expect(store).toBeTruthy();
  })
})