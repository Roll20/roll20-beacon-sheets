import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/utility/rollToChat", () => ({ default: vi.fn() }));

import rollToChat from "@/utility/rollToChat";
import { useCharacterStore } from "./characterStore";

describe("rollPowerFatigueTest", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(rollToChat).mockReset();
  });

  it("rolls against 9 + half the cost", async () => {
    vi.mocked(rollToChat).mockResolvedValue(20);
    await useCharacterStore().rollPowerFatigueTest(5, 2);
    expect(vi.mocked(rollToChat).mock.calls[0][0]).toMatchObject({
      rollType: "powerFatigue",
      targetNumber: 11,
    });
  });

  it("adds a level of Power Fatigue on a failure", async () => {
    vi.mocked(rollToChat).mockResolvedValue(10);
    const char = useCharacterStore();
    await char.rollPowerFatigueTest(4, 0);
    expect(char.powerFatigue).toBe(1);
  });

  it("adds nothing on a success", async () => {
    vi.mocked(rollToChat).mockResolvedValue(11);
    const char = useCharacterStore();
    await char.rollPowerFatigueTest(4, 0);
    expect(char.powerFatigue).toBe(0);
  });
});

describe("characterStore power pools", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("keeps arcana on the legacy magic fields", () => {
    const char = useCharacterStore();
    char.setPoolMax("arcana", 12);
    char.setPoolCurrent("arcana", 7);
    expect(char.magicMax).toBe(12);
    expect(char.magic).toBe(7);
  });

  it("spends only the named pool and never below 0", () => {
    const char = useCharacterStore();
    char.setPoolCurrent("arcana", 10);
    char.setPoolCurrent("psychic", 3);
    char.spendPool("psychic", 5);
    expect(char.poolCurrent("psychic")).toBe(0);
    expect(char.poolCurrent("arcana")).toBe(10);
  });

  it("refills every pool to its max", () => {
    const char = useCharacterStore();
    char.setPoolMax("arcana", 10);
    char.setPoolMax("eldritch", 6);
    char.setPoolMax("psychic", 8);
    char.refillPools();
    expect(char.poolCurrent("arcana")).toBe(10);
    expect(char.poolCurrent("eldritch")).toBe(6);
    expect(char.poolCurrent("psychic")).toBe(8);
  });

  it("caps Power Fatigue at Dying (4)", () => {
    const char = useCharacterStore();
    for (let i = 0; i < 6; i++) char.addPowerFatigue();
    expect(char.powerFatigue).toBe(4);
  });

  it("round-trips the new pools and Eldritch Price through dehydrate/hydrate", () => {
    const char = useCharacterStore();
    char.setPoolCurrent("eldritch", 2);
    char.setPoolMax("eldritch", 5);
    char.setPoolCurrent("psychic", 4);
    char.setPoolMax("psychic", 9);
    char.eldritchPrice = 3;
    const saved = char.dehydrate();

    setActivePinia(createPinia());
    const fresh = useCharacterStore();
    fresh.hydrate(saved as any);
    expect(fresh.poolCurrent("eldritch")).toBe(2);
    expect(fresh.poolMax("eldritch")).toBe(5);
    expect(fresh.poolCurrent("psychic")).toBe(4);
    expect(fresh.poolMax("psychic")).toBe(9);
    expect(fresh.eldritchPrice).toBe(3);
  });

  it("resets Eldritch Price to 0", () => {
    const char = useCharacterStore();
    char.eldritchPrice = 4;
    char.resetEldritchPrice();
    expect(char.eldritchPrice).toBe(0);
  });
});
