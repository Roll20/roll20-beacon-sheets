import { useSettingsStore } from "./settingsStore";
import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";

describe("settingsStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("defaults encumbrance penalty to 0", () => {
    expect(useSettingsStore().dehydrate().settings.encumbrancePenalty).toBe(0);
  });

  it("updates encumbrance penalty", () => {
    const store = useSettingsStore();
    store.hydrate({ settings: { encumbrancePenalty: -1 } } as any);
    expect(store.dehydrate().settings.encumbrancePenalty).toBe(-1);
  });
});
