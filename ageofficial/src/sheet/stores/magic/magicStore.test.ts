import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/utility/rollToChat", () => ({ default: vi.fn() }));

import rollToChat from "@/utility/rollToChat";
import { useSpellStore } from "./magicStore";
import { useSettingsStore } from "../settings/settingsStore";
import { useCharacterStore } from "../character/characterStore";

const addTestSpell = (overrides: Record<string, any> = {}) => {
  const store = useSpellStore();
  store.addSpell({ name: "Bolt", ability: "Intelligence", mpCost: 4, targetNumber: 13, ...overrides });
  return store.spells[store.spells.length - 1];
};

describe("printSpell by cost model", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(rollToChat).mockReset();
    vi.mocked(rollToChat).mockResolvedValue(15);
  });

  it("points: spends from the spell's own pool only", async () => {
    const settings = useSettingsStore();
    settings.showArcana = true;
    settings.usePsychic = true;
    const char = useCharacterStore();
    char.setPoolCurrent("arcana", 10);
    char.setPoolCurrent("psychic", 10);

    const spell = addTestSpell({ sourceId: "psychic" });
    await useSpellStore().printSpell(spell._id, 2);

    expect(char.poolCurrent("psychic")).toBe(6);
    expect(char.poolCurrent("arcana")).toBe(10);
    expect(rollToChat).toHaveBeenCalledTimes(1);
  });

  it("fatigue: spends nothing and rolls the fatigue test with the power focus", async () => {
    const settings = useSettingsStore();
    settings.showArcana = true;
    settings.arcanaCostModel = "fatigue";
    const char = useCharacterStore();
    char.setPoolCurrent("arcana", 10);
    vi.mocked(rollToChat).mockResolvedValueOnce(15).mockResolvedValueOnce(5);

    const spell = addTestSpell();
    await useSpellStore().printSpell(spell._id, 4, 0, 2);

    expect(char.poolCurrent("arcana")).toBe(10);
    expect(rollToChat).toHaveBeenCalledTimes(2);
    const test = vi.mocked(rollToChat).mock.calls[1][0];
    expect(test).toMatchObject({ rollType: "powerFatigue", targetNumber: 11 });
    expect(test.components).toContainEqual({ label: "Focus", value: 2 });
    expect(char.powerFatigue).toBe(1);
  });

  it("price: spends nothing and rolls a Willpower Price Test against the spell's Price Test TN", async () => {
    const settings = useSettingsStore();
    settings.useEldritchArcana = true;
    const char = useCharacterStore();
    char.setPoolCurrent("eldritch", 10);

    const spell = addTestSpell({ sourceId: "eldritch", targetNumber: 13, priceTN: 15 });
    await useSpellStore().printSpell(spell._id, 3);

    expect(char.poolCurrent("eldritch")).toBe(10);
    expect(rollToChat).toHaveBeenCalledTimes(2);
    const test = vi.mocked(rollToChat).mock.calls[1][0];
    expect(test).toMatchObject({
      rollType: "priceTest",
      subtitle: "Price Test",
      targetNumber: 15,
    });
    expect(test.components.map((c: any) => c.label)).toEqual(["Base Roll", "Willpower"]);
  });

  it("price: rolls without a TN when the spell has no Price Test TN", async () => {
    useSettingsStore().useEldritchArcana = true;

    const spell = addTestSpell({ sourceId: "eldritch" });
    await useSpellStore().printSpell(spell._id, 3);

    expect(vi.mocked(rollToChat).mock.calls[1][0].targetNumber).toBeUndefined();
  });
});
