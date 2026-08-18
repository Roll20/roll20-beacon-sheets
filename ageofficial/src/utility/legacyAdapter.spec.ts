import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { importLegacyCharacter } from "./legacyAdapter";
import { useAbilityScoreStore } from "@/sheet/stores/abilityScores/abilityScoresStore";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";
import { useBioStore } from "@/sheet/stores/bio/bioStore";
import { useInventoryStore } from "@/sheet/stores/inventory/inventoryStore";
import { useItemStore } from "@/sheet/stores/character/characterQualitiesStore";
import { useSpellStore } from "@/sheet/stores/magic/magicStore";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { useMetaStore } from "@/sheet/stores/meta/metaStore";

// Representative flat legacy attributes (only the keys the importer reads).
const bjordson: Record<string, any> = {
  game: "fantasy-age-core",
  class: "Warrior",
  health: 49,
  level: "4",
  // xp lives on the structured character section (optional/nullable).
  character: { character: { xp: 6000 } },
  race: "Orc",
  "social-class": "Middle",
  background: "Soldier",
  specialization1: "Berserker",
  "specialization1-degree": "Novice",
  accuracy: "1",
  communication: "0",
  constitution: "4",
  dexterity: "2",
  fighting: "4",
  strength: "2",
  willpower: "2",
  perception: "1",
  gender: "Male",
  height: "6'11\"",
  weight: "285",
  eyes: "Brown",
  skin: "Ruddy Green",
  hair: "Black",
  armor: "8",
  speed_value: 9,
  "weapon-groups": "Brawling, Axes, Heavy Blades, Light Blades",
  character_notes: "When growing up...",
  "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_powername": "Dual Weapon",
  "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talentdegree": "3",
  "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_powername": "Berserker Rage",
  "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_shortpowerdescription": "+2 Damage",
  "repeating_strength-focus_-Nc5HZZoW22N-SBt9NkT_focusname": "Intimidation",
  "repeating_strength-focus_-Nc5OzuuqLCtaMfriieM_focusname": "Jumping",
  "repeating_constitution-focus_-Nc5Hnp16bZL8n5zG9Ks_focusname": "Stamina",
  "repeating_perception-focus_-NeZkrJ6bFtya9lqIqPK_focusname": "search",
  "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attack-name": "Battle Axe1",
  "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attack-damage": "2d6+2",
  "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attack-name": "Rage Battle Axe 1",
  "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attack-damage": "3d6+4",
  "repeating_equipment_-Nc5K3HQBCcLtrsxn-yU_equipment-name": "Heavy Shield",
  "repeating_equipment_-Nc5K3HQBCcLtrsxn-yU_equipment-description": "+3 Defense",
  "repeating_money_-Nc5KRQEVgBcfoVoQ8Am_moneyamount": "6",
  "repeating_money_-Nc5KRQEVgBcfoVoQ8Am_moneyname": "GP",
  "repeating_money_-Nc5KYfTaXZqaa0AyNt2_moneyname": "CP",
  "repeating_money_-Nc5KYfTaXZqaa0AyNt2_moneyamount": "50",
};

const mav: Record<string, any> = {
  game: "fantasy-age-core",
  class: "Mage",
  level: "4",
  race: "Halfling",
  "social-class": "Upper",
  background: "Scholar",
  specialization1: "Necromancer",
  accuracy: "1",
  communication: "3",
  constitution: "1",
  dexterity: "3",
  intelligence: "3",
  perception: "2",
  willpower: "4",
  health: "32",
  mana: "34",
  "base-speed": "11",
  "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-name": "Revival",
  "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-school": "Healing",
  "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-mp-cost": "6",
  "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-tn": "14",
  "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-type": "utility",
  "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-name": "Healing Aura",
  "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-mp-cost": "2-8",
  "repeating_dexterity-focus_-Nc2ltxz7MLElRfLmMzS_focusname": "Traps",
  "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_attack-name": "Crossbow",
  "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_range": "30",
  "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_reload": "major",
  "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_attack-damage": "2d6+1",
  // Reversed money row: code lives in `moneyamount`.
  "repeating_money_-NbzTg90Tgn1oSAdYlEb_moneyname": "10",
  "repeating_money_-NbzTg90Tgn1oSAdYlEb_moneyamount": "G",
};

describe("importLegacyCharacter (flat legacy format)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(console, "table").mockImplementation(() => {});
    vi.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  it("imports Bjordson (warrior)", () => {
    importLegacyCharacter(bjordson, "append", undefined, "Bjordson");
    const ability = useAbilityScoreStore();
    const char = useCharacterStore();
    const bio = useBioStore();
    const inventory = useInventoryStore();
    const qualities = useItemStore();
    const settings = useSettingsStore();

    // Renamed, and speed defaults to the AGE base (no base-speed in the data).
    expect(useMetaStore().name).toBe("Bjordson");
    expect(char.speed).toBe(10);

    expect(ability.FightingBase).toBe(4);
    expect(ability.ConstitutionBase).toBe(4);
    expect(ability.StrengthBase).toBe(2);
    expect(ability.AccuracyBase).toBe(1);

    expect(char.health).toBe(49);
    expect(char.armor).toBe(8);
    expect(char.weaponGroups).toBe(
      JSON.stringify(["Brawling", "Axes", "Heavy Blades", "Light Blades"])
    );
    expect(bio.level).toBe(4);
    expect(char.xp).toBe(6000); // from structured xp, not derived from level

    expect(bio.ancestry).toBe("Orc");
    expect(bio.profession).toBe("Warrior");
    expect(bio.background).toBe("Soldier");
    expect(bio.socialClass).toBe("Middle");
    expect(bio.sex).toBe("Male");
    expect(bio.detailsHistory).toContain("When growing up");

    expect(settings.gameSystem).toBe("fage2e");

    // Quality items: Specialization + Ancestry + Class + Talent + Power.
    const byType = (t: string) => qualities.items.filter((i) => i.type === t);
    expect(byType("Specialization").map((i) => i.name)).toContain("Berserker");
    expect(byType("Ancestry").map((i) => i.name)).toContain("Orc");
    expect(byType("Class").map((i) => i.name)).toContain("Warrior");
    expect(byType("Talent").map((i) => i.name)).toContain("Dual Weapon");
    expect(byType("Special Feature").map((i) => i.name)).toContain(
      "Berserker Rage"
    );
    expect(byType("Ability Focus").map((i) => i.name)).toEqual(
      expect.arrayContaining(["Intimidation", "Jumping", "Stamina", "search"])
    );

    // Attacks became inventory weapons.
    const weapons = inventory.items.filter((i) => i.type === "weapon");
    expect(weapons.map((w) => w.name)).toEqual(
      expect.arrayContaining(["Battle Axe1", "Rage Battle Axe 1"])
    );

    // Money (GP/CP correctly mapped).
    expect(inventory.cash.gold).toBe(6);
    expect(inventory.cash.copper).toBe(50);
  });

  it("imports Mav (mage) with spells and reversed money", () => {
    importLegacyCharacter(mav);
    const ability = useAbilityScoreStore();
    const char = useCharacterStore();
    const spells = useSpellStore();
    const inventory = useInventoryStore();

    expect(ability.WillpowerBase).toBe(4);
    expect(ability.IntelligenceBase).toBe(3);
    expect(char.health).toBe(32);
    expect(char.magic).toBe(34);

    // Mage caster → Arcana shown; base-speed drives char.speed (11 + Dex).
    expect(useSettingsStore().showArcana).toBe(true);
    expect(char.speed).toBe(11);

    const revival = spells.spells.find((s) => s.name === "Revival");
    expect(revival).toBeTruthy();
    expect(revival?.arcanaType).toBe("Healing");
    expect(revival?.mpCost).toBe(6);
    expect(revival?.targetNumber).toBe(14);

    // "2-8" mp range keeps the first number.
    const aura = spells.spells.find((s) => s.name === "Healing Aura");
    expect(aura?.mpCost).toBe(2);

    // Reversed money row: amount "G" is the code, name "10" is the number.
    expect(inventory.cash.gold).toBe(10);

    // Ranged attack → weapon with parsed range.
    const crossbow = inventory.items.find((i) => i.name === "Crossbow") as any;
    expect(crossbow?.type).toBe("weapon");
    expect(crossbow?.shortRange).toBe(30);
  });

  it("overwrite clears the previous character first", () => {
    importLegacyCharacter(bjordson);
    let inventory = useInventoryStore();
    expect(inventory.cash.gold).toBe(6);
    expect(inventory.items.some((i) => i.name === "Battle Axe1")).toBe(true);

    importLegacyCharacter(mav, "overwrite");
    inventory = useInventoryStore();
    const ability = useAbilityScoreStore();
    const char = useCharacterStore();
    // Bjordson's data is gone; Mav's is present.
    expect(inventory.items.some((i) => i.name === "Battle Axe1")).toBe(false);
    expect(inventory.items.some((i) => i.name === "Crossbow")).toBe(true);
    expect(inventory.cash.gold).toBe(10); // Mav's reversed gold, not Bjordson's 6
    expect(ability.FightingBase).toBe(0); // Mav has no Fighting
    expect(ability.WillpowerBase).toBe(4);
    // healthMax / magicMax stay at default (Roll20 omits them); the player
    // enters the real max themselves.
    expect(char.healthMax).toBe(0);
    expect(char.magicMax).toBe(0);
  });

  it("append keeps the previous character's data", () => {
    importLegacyCharacter(bjordson);
    importLegacyCharacter(mav, "append");
    const inventory = useInventoryStore();
    expect(inventory.items.some((i) => i.name === "Battle Axe1")).toBe(true);
    expect(inventory.items.some((i) => i.name === "Crossbow")).toBe(true);
  });

  it("does not clear the sheet when the blob has no legacy data", () => {
    importLegacyCharacter(bjordson); // populate the sheet
    const ability = useAbilityScoreStore();
    const inventory = useInventoryStore();
    expect(ability.FightingBase).toBe(4);
    expect(inventory.cash.gold).toBe(6);

    // Empty / non-legacy blob with overwrite must NOT wipe the sheet.
    importLegacyCharacter({}, "overwrite");
    expect(ability.FightingBase).toBe(4);
    expect(inventory.cash.gold).toBe(6);
  });

  it("imports only the selected sections", () => {
    importLegacyCharacter(bjordson, "append", ["abilities"]);
    const ability = useAbilityScoreStore();
    const bio = useBioStore();
    const inventory = useInventoryStore();
    // abilities imported...
    expect(ability.FightingBase).toBe(4);
    // ...but nothing else (bio, currency untouched)
    expect(bio.ancestry).toBe("");
    expect(inventory.cash.gold).toBe(0);
  });

  it("overwrite only clears the selected sections", () => {
    importLegacyCharacter(bjordson); // full import
    const inventory = useInventoryStore();
    expect(inventory.cash.gold).toBe(6);
    expect(inventory.items.some((i) => i.name === "Battle Axe1")).toBe(true);

    // Overwrite only currency with an empty-money character.
    importLegacyCharacter({ race: "X", level: "1" }, "overwrite", ["currency"]);
    expect(inventory.cash.gold).toBe(0); // currency cleared
    // weapons untouched (equipment section not selected)
    expect(inventory.items.some((i) => i.name === "Battle Axe1")).toBe(true);
  });

  it("parses messy money formats (combined, spelled-out, split range)", () => {
    importLegacyCharacter({
      race: "Test",
      level: "1",
      // combined code+number in one field, no name
      "repeating_money_-Aaaaaaaaaaaaaaaaaaa_moneyamount": "18g",
      // spelled out, split across fields
      "repeating_money_-Bbbbbbbbbbbbbbbbbbb_moneyname": "silver",
      "repeating_money_-Bbbbbbbbbbbbbbbbbbb_moneyamount": "28",
      // short / long range on a thrown weapon
      "repeating_attack-list_-Ccccccccccccccccccc_attack-name": "Throwing Axe",
      "repeating_attack-list_-Ccccccccccccccccccc_range": "4 / 6",
      "repeating_attack-list_-Ccccccccccccccccccc_attack-damage": "1d6+2",
    });
    const inventory = useInventoryStore();
    expect(inventory.cash.gold).toBe(18);
    expect(inventory.cash.silver).toBe(28);
    const axe = inventory.items.find((i) => i.name === "Throwing Axe") as any;
    expect(axe.shortRange).toBe(4);
    expect(axe.longRange).toBe(6);
  });
});
