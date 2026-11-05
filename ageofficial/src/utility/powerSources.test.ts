import { describe, it, expect } from "vitest";
import {
  costLabel,
  fatigueTestTN,
  legacyArcanaCostModel,
  pointsLabel,
  poolHeading,
  powersTabLabel,
  sourceLabel,
  sourcePluralLabel,
  sourceTypeList,
  spellSourceId,
} from "./powerSources";
import {
  brArcana,
  fageArcana,
  fageMythosArcana,
  magePowers,
  magePsychicPowers,
} from "@/components/magic/magicTypes";

describe("spellSourceId", () => {
  it("defaults missing or unknown sources to arcana", () => {
    expect(spellSourceId({})).toBe("arcana");
    expect(spellSourceId({ sourceId: "bogus" })).toBe("arcana");
    expect(spellSourceId(undefined)).toBe("arcana");
  });

  it("keeps a valid source", () => {
    expect(spellSourceId({ sourceId: "psychic" })).toBe("psychic");
    expect(spellSourceId({ sourceId: "eldritch" })).toBe("eldritch");
  });
});

describe("legacyArcanaCostModel", () => {
  it("uses the stored value when present", () => {
    expect(
      legacyArcanaCostModel({ stored: "price", userPowerFatigue: true, gameSystem: "blue rose" })
    ).toBe("price");
  });

  it("maps legacy Power Fatigue to fatigue", () => {
    expect(legacyArcanaCostModel({ userPowerFatigue: true, gameSystem: "mage" })).toBe("fatigue");
  });

  it("defaults Blue Rose to fatigue", () => {
    expect(legacyArcanaCostModel({ gameSystem: "blue rose" })).toBe("fatigue");
  });

  it("defaults everything else to points", () => {
    expect(legacyArcanaCostModel({ gameSystem: "fage2e" })).toBe("points");
    expect(legacyArcanaCostModel({})).toBe("points");
  });
});

describe("labels", () => {
  it("labels sources per game system", () => {
    expect(sourceLabel("arcana", "fage2e")).toBe("Arcana");
    expect(sourceLabel("arcana", "mage")).toBe("Power");
    expect(sourceLabel("eldritch", "fage2e")).toBe("Eldritch Arcana");
    expect(sourceLabel("psychic", "fage2e")).toBe("Psychic Power");
  });

  it("headings pools per game system", () => {
    expect(poolHeading("arcana", "fage2e")).toBe("Magic");
    expect(poolHeading("arcana", "mage")).toBe("Power");
    expect(poolHeading("eldritch", "fage2e")).toBe("Eldritch");
    expect(poolHeading("psychic", "mage")).toBe("Psychic");
  });

  it("uses MP or PP for points", () => {
    expect(pointsLabel("arcana", "fage2e")).toBe("MP");
    expect(pointsLabel("arcana", "mage")).toBe("PP");
    expect(pointsLabel("eldritch", "fage2e")).toBe("MP");
    expect(pointsLabel("psychic", "fage2e")).toBe("PP");
  });

  it("labels the cost field per cost model", () => {
    expect(costLabel("arcana", "points", "fage2e")).toBe("MP Cost");
    expect(costLabel("psychic", "points", "fage2e")).toBe("PP Cost");
    expect(costLabel("arcana", "fatigue", "mage")).toBe("Power Cost");
    expect(costLabel("eldritch", "price", "fage2e")).toBe("");
  });

  it("uses plural labels for sections and toggles", () => {
    expect(sourcePluralLabel("arcana", "fage2e")).toBe("Arcana");
    expect(sourcePluralLabel("arcana", "mage")).toBe("Powers");
    expect(sourcePluralLabel("eldritch", "fage2e")).toBe("Eldritch Arcana");
    expect(sourcePluralLabel("psychic", "fage2e")).toBe("Psychic Powers");
  });

  it("names the tab Powers when several sources are on", () => {
    expect(powersTabLabel(["arcana", "psychic"], "fage2e")).toBe("Powers");
    expect(powersTabLabel(["eldritch"], "fage2e")).toBe("Eldritch Arcana");
    expect(powersTabLabel(["arcana"], "fage2e")).toBe("Arcana");
    expect(powersTabLabel(["arcana"], "mage")).toBe("Powers");
    expect(powersTabLabel([], "fage2e")).toBe("Arcana");
  });
});

describe("sourceTypeList", () => {
  it("returns per-system arcana lists", () => {
    expect(sourceTypeList("arcana", { gameSystem: "fage2e" })).toEqual(fageArcana);
    expect(sourceTypeList("arcana", { gameSystem: "fage1e" })).toEqual(fageArcana);
    expect(sourceTypeList("arcana", { gameSystem: "mage" })).toEqual(magePowers);
    expect(sourceTypeList("arcana", { gameSystem: "blue rose" })).toEqual(brArcana);
    expect(sourceTypeList("arcana", { gameSystem: "expanse" })).toEqual([]);
  });

  it("adds Technofantasy arcana for Fantasy AGE", () => {
    const list = sourceTypeList("arcana", { gameSystem: "fage2e", technofantasy: true });
    expect(list).toContain("Digital");
    expect(list).toContain("Machine");
    expect(list).toContain("Fire");
  });

  it("merges psychic powers into Modern AGE arcana under Threefold", () => {
    const list = sourceTypeList("arcana", { gameSystem: "mage", threefold: true });
    expect(list).toContain("Telepathy");
    expect(list).toContain("Fire");
    expect(new Set(list).size).toBe(list.length);
  });

  it("uses the same eldritch and psychic lists everywhere", () => {
    expect(sourceTypeList("eldritch", { gameSystem: "mage" })).toEqual(fageMythosArcana);
    expect(sourceTypeList("psychic", { gameSystem: "fage2e" })).toEqual(magePsychicPowers);
  });
});

describe("fatigueTestTN", () => {
  it("is 9 plus half the cost, rounded down", () => {
    expect(fatigueTestTN(0)).toBe(9);
    expect(fatigueTestTN(4)).toBe(11);
    expect(fatigueTestTN(5)).toBe(11);
  });

  it("treats non-numbers as 0", () => {
    expect(fatigueTestTN(NaN)).toBe(9);
  });
});
