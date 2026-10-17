import { useSettingsStore } from "./settingsStore";
import { createPinia, setActivePinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";

describe("settingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("defaults encumbrance penalty to 0", () => {
    expect(useSettingsStore().dehydrate().settings.encumbrancePenalty).toBe(0);
  });

  it("updates encumbrance penalty", () => {
    const store = useSettingsStore();
    store.hydrate({ settings: { encumbrancePenalty: -1 } } as any);
    expect(store.dehydrate().settings.encumbrancePenalty).toBe(-1);
  });

  it("migrates legacy Power Fatigue to the arcana fatigue cost model", () => {
    const store = useSettingsStore();
    store.hydrate({
      settings: { gameSystem: "mage", showArcana: true, userPowerFatigue: true },
    } as any);
    expect(store.arcanaCostModel).toBe("fatigue");
    expect(store.usesPowerFatigue).toBe(true);
  });

  it("defaults Blue Rose arcana to fatigue and others to points", () => {
    const br = useSettingsStore();
    br.hydrate({ settings: { gameSystem: "blue rose" } } as any);
    expect(br.arcanaCostModel).toBe("fatigue");

    setActivePinia(createPinia());
    const fage = useSettingsStore();
    fage.hydrate({ settings: { gameSystem: "fage2e" } } as any);
    expect(fage.arcanaCostModel).toBe("points");
  });

  it("prefers a stored arcana cost model over legacy flags", () => {
    const store = useSettingsStore();
    store.hydrate({
      settings: { gameSystem: "mage", userPowerFatigue: true, arcanaCostModel: "points" },
    } as any);
    expect(store.arcanaCostModel).toBe("points");
  });

  it("lists enabled sources and summarises their cost models", () => {
    const store = useSettingsStore();
    store.hydrate({
      settings: {
        gameSystem: "fage2e",
        showArcana: true,
        arcanaCostModel: "points",
        useEldritchArcana: true,
        eldritchCostModel: "price",
        usePsychic: true,
        psychicCostModel: "points",
      },
    } as any);
    expect(store.enabledPowerSources).toEqual(["arcana", "eldritch", "psychic"]);
    expect(store.pointsPowerSources).toEqual(["arcana", "psychic"]);
    expect(store.costModelFor("eldritch")).toBe("price");
    expect(store.anyPowerSource).toBe(true);
    expect(store.usesPowerFatigue).toBe(false);
    expect(store.tracksEldritchPrice).toBe(true);
  });

  it("only tracks Eldritch Price when Eldritch Arcana uses price", () => {
    const store = useSettingsStore();
    store.hydrate({
      settings: { gameSystem: "mage", usePsychic: true, psychicCostModel: "price" },
    } as any);
    expect(store.costModelFor("psychic")).toBe("price");
    expect(store.tracksEldritchPrice).toBe(false);
  });

  it("ignores cost models of disabled sources", () => {
    const store = useSettingsStore();
    store.hydrate({
      settings: { gameSystem: "fage2e", showArcana: false, psychicCostModel: "fatigue" },
    } as any);
    expect(store.anyPowerSource).toBe(false);
    expect(store.usesPowerFatigue).toBe(false);
  });

  it("persists the new fields and no longer writes userPowerFatigue", () => {
    const store = useSettingsStore();
    store.hydrate({
      settings: { gameSystem: "fage2e", usePsychic: true },
    } as any);
    const saved = store.dehydrate().settings as Record<string, any>;
    expect(saved.usePsychic).toBe(true);
    expect(saved.arcanaCostModel).toBe("points");
    expect(saved.eldritchCostModel).toBe("price");
    expect(saved.psychicCostModel).toBe("points");
    expect("userPowerFatigue" in saved).toBe(false);
  });
});
