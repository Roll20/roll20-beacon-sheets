/**
 * Legacy Sheet Migration
 *
 * Maps a legacy Roll20 character (`initValues.character.attributes`) into the
 * Beacon SDK Pinia stores.
 *
 * The real legacy data lives in the FLAT attributes — top-level scalars
 * (`level`, `health`, `race`, `accuracy`…) and `repeating_*` rows (talents,
 * powers, spells, attacks, equipment, money, focuses). The nested structured
 * sections (`character.character`, `bio.bio`, `abilityScores.abilityScores`…)
 * in a legacy export are just the new sheet's empty dehydrated defaults, so
 * they are ignored when flat data is present and only used as a fallback for an
 * already-migrated character.
 *
 * `importLegacyCharacter(attributes)` is the Import button action. It snapshots
 * the sheet, imports, snapshots again, and logs a change report.
 *
 * The `loadLegacy*` functions are on-load inspectors that only log — wired in
 * `App.vue` so the raw data is visible in the console during development.
 */
import {
  useAbilityScoreStore,
  type AbilityScore,
} from "@/sheet/stores/abilityScores/abilityScoresStore";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";
import { useBioStore } from "@/sheet/stores/bio/bioStore";
import { useInventoryStore } from "@/sheet/stores/inventory/inventoryStore";
import { useItemStore } from "@/sheet/stores/character/characterQualitiesStore";
import { useSpellStore } from "@/sheet/stores/magic/magicStore";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { useMetaStore } from "@/sheet/stores/meta/metaStore";
import { useAgeSheetStore } from "@/sheet/stores";

type LegacyAttributes = Record<string, any>;
type GroupedRepeating = Record<string, Array<Record<string, any>>>;

/*
 * All diagnostic console output in this module is gated behind `logMode` so it
 * never runs in production (per the repo's dead-code policy). Flip to `true`
 * during development to see the raw legacy blob and the import change report.
 * Route every console call through these helpers rather than calling `console`
 * directly.
 */
const logMode: boolean = false;
const log = (...args: any[]) => {
  if (logMode) console.log(...args);
};
const logWarn = (...args: any[]) => {
  if (logMode) console.warn(...args);
};
const logInfo = (...args: any[]) => {
  if (logMode) console.info(...args);
};

/*
 * Roll20 stores repeating rows as flat keys shaped
 *   repeating_<section>_<rowId>_<field>
 * where <section> and <field> may contain hyphens (e.g. `attack-list`,
 * `strength-focus`, `equipment-name`) and <rowId> is a leading-dash id of 20
 * characters that may itself contain `-`/`_` (e.g. `-Nc5HZZoW22N-SBt9NkT`).
 * A lazy section match plus a fixed-width row id keeps hyphenated sections and
 * ids from being mis-split.
 */
const REPEATING_RE = /^repeating_(.+?)_(-[A-Za-z0-9_-]{19})_(.+)$/;

/* Groups all `repeating_*` keys into `{ [section]: [{ _id, ...fields }] }`. */
export function groupRepeating(attributes: LegacyAttributes): GroupedRepeating {
  const grouped: GroupedRepeating = {};
  if (!attributes) return grouped;
  Object.entries(attributes).forEach(([key, value]) => {
    const match = key.match(REPEATING_RE);
    if (!match) return;
    const [, section, id, property] = match;
    if (!grouped[section]) grouped[section] = [];
    let row = grouped[section].find((obj) => obj._id === id);
    if (!row) {
      row = { _id: id };
      grouped[section].push(row);
    }
    row[property] = value;
  });
  return grouped;
}

/* -------------------------------------------------------------------------- */
/* On-load inspectors (log only — no store writes)                            */
/* -------------------------------------------------------------------------- */

export function loadLegacyAbilityScores(attributes: LegacyAttributes) {
  if (!attributes) return;
  log({
    LegacyAbilities: {
      accuracy: attributes.accuracy,
      communication: attributes.communication,
      constitution: attributes.constitution,
      dexterity: attributes.dexterity,
      fighting: attributes.fighting,
      intelligence: attributes.intelligence,
      perception: attributes.perception,
      strength: attributes.strength,
      willpower: attributes.willpower,
    },
  });
}

export function loadLegacyCharacterDetails(attributes: LegacyAttributes) {
  if (!attributes) return;
  const legacyInfo = {
    level: attributes.level,
    class: attributes.class,
    race: attributes.race,
    background: attributes.background,
    socialClass: attributes["social-class"],
    specialization: attributes.specialization1,
    health: attributes.health,
    mana: attributes.mana,
    armor: attributes.armor,
    weaponGroups: attributes["weapon-groups"],
  };
  log({ LegacyRawAttributes: attributes, LegacyInfo: legacyInfo });
}

export function loadLegacyGroupings(attributes: LegacyAttributes) {
  if (!attributes) return;
  log({ LegacyGroupings: groupRepeating(attributes) });
}

/* -------------------------------------------------------------------------- */
/* Flat scalar importers                                                      */
/* -------------------------------------------------------------------------- */

const toInt = (value: any): number | undefined => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
};

const ABILITY_KEYS: Record<string, AbilityScore> = {
  accuracy: "Accuracy",
  communication: "Communication",
  constitution: "Constitution",
  dexterity: "Dexterity",
  fighting: "Fighting",
  intelligence: "Intelligence",
  perception: "Perception",
  strength: "Strength",
  willpower: "Willpower",
};

export function importLegacyAbilityScores(attributes: LegacyAttributes) {
  const abilityStore = useAbilityScoreStore();
  Object.entries(ABILITY_KEYS).forEach(([flatKey, ability]) => {
    const value = toInt(attributes[flatKey]);
    if (value != null) {
      (abilityStore as any)[`${ability}Base`] = value;
    }
  });
}

const GAME_SYSTEM_MAP: Record<string, string> = {
  "fantasy-age-core": "fage2e",
  "fantasy-age": "fage1e",
  "blue-rose": "blue rose",
  "modern-age": "mage",
  "the-expanse": "expanse",
};

export function importLegacySettingsFlat(attributes: LegacyAttributes) {
  const settings = useSettingsStore();
  const system = GAME_SYSTEM_MAP[attributes.game] || "fage2e";
  settings.gameSystem = system as any;
  settings.incomeMode =
    system === "fage1e" || system === "fage2e" ? "currency" : "recources";

  // Casters (Mage class, or anyone with spells) get the Arcana/Powers section shown.
  const isCaster =
    attributes.class === "Mage" ||
    Object.keys(attributes).some((key) => key.startsWith("repeating_spell_"));
  if (isCaster) settings.showArcana = true;
}

export function importLegacyCharacterFlat(attributes: LegacyAttributes) {
  const char = useCharacterStore();

  // Only the current health/magic are imported. healthMax / magicMax are
  // missing from the legacy export (a Roll20 export bug), so they are left at
  // their default — the player enters the real max themselves.
  const health = toInt(attributes.health);
  if (health != null) char.health = health;
  const mana = toInt(attributes.mana ?? attributes.magic);
  if (mana != null) char.magic = mana;

  const armor = toInt(attributes.armor);
  if (armor != null) char.armor = armor;
  // char.speed is the AGE *base* speed; the sheet adds Dexterity (and armor
  // penalty) on top. Legacy `base-speed` is that base — using `speed_value`
  // (the already-computed total) would double-count Dexterity. Default to the
  // AGE base of 10 when absent, so Speed isn't just the Dexterity value.
  const baseSpeed = toInt(attributes["base-speed"]);
  if (baseSpeed != null) {
    char.speed = baseSpeed;
  } else if (!char.speed) {
    // Only default to the AGE base of 10 when Speed is unset, so an append
    // import doesn't clobber an existing value the user already has.
    char.speed = 10;
  }

  // XP lives on the structured character section and is optional (may be null).
  // It is not derived from level — the real value is used when present.
  const xp = toInt(attributes.character?.character?.xp);
  if (xp != null) char.xp = xp;

  // Legacy stores weapon groups as a comma string (sometimes with a trailing
  // "and"); the store expects a JSON array string (e.g. '["Axes","Blades"]').
  const groups = attributes["weapon-groups"];
  if (groups) {
    const list = String(groups)
      .split(",")
      .map((g) => g.trim().replace(/^and\s+/i, "").trim())
      .filter(Boolean);
    if (list.length) char.weaponGroups = JSON.stringify(list);
  }
}

export function importLegacyBioFlat(attributes: LegacyAttributes) {
  const bio = useBioStore();
  const level = toInt(attributes.level);
  if (level) bio.level = level;
  if (attributes.race) bio.ancestry = attributes.race;
  if (attributes.class) bio.profession = attributes.class;
  if (attributes.background) bio.background = attributes.background;
  if (attributes["social-class"]) bio.socialClass = attributes["social-class"];
  if (attributes.gender) bio.sex = attributes.gender;
  if (attributes.height) bio.height = attributes.height;
  if (attributes.weight) bio.weight = attributes.weight;
  if (attributes.eyes) bio.eyes = attributes.eyes;
  if (attributes.skin) bio.skin = attributes.skin;
  if (attributes.hair) bio.hair = attributes.hair;
  if (attributes.character_notes) bio.detailsHistory = attributes.character_notes;
  if (attributes.goals) bio.goalsTies = attributes.goals;
  if (attributes.relationships) bio.relationships = attributes.relationships;
  // age is a free-text field in legacy ("A lady never tells"); only import numbers.
  const age = toInt(attributes.age);
  if (age != null) bio.age = age;
}

/* Maps the flat `specialization1`/`specialization2` slots to Specialization
 * quality items (a character can have two). */
export function importLegacySpecialization(attributes: LegacyAttributes) {
  const qualities = useItemStore();
  [1, 2].forEach((slot) => {
    const name = attributes[`specialization${slot}`];
    if (!name) return;
    const degree = String(
      attributes[`specialization${slot}-degree`] || ""
    ).toLowerCase();
    let qualityLevel = "novice";
    if (degree === "2" || degree === "expert") qualityLevel = "expert";
    if (degree === "3" || degree === "master") qualityLevel = "master";
    qualities.addItem({
      type: "Specialization",
      name,
      description: "",
      qualityLevel,
      modifiers: [],
    });
  });
}

/*
 * Ancestry (`race`) and Class become quality items. A slash/comma-delimited
 * value (e.g. "Half-Orc/Human") splits into one item per value.
 */
export function importLegacyAncestryClass(attributes: LegacyAttributes) {
  const qualities = useItemStore();
  const addQualities = (value: string, type: "Ancestry" | "Class") => {
    if (!value) return;
    String(value)
      .split(/[/,]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((name) => {
        qualities.addItem({ type, name, description: "", modifiers: [] });
      });
  };
  addQualities(attributes.race, "Ancestry");
  addQualities(attributes.class, "Class");
}

/* -------------------------------------------------------------------------- */
/* Grouped repeating-row importers                                            */
/* -------------------------------------------------------------------------- */

/*
 * Legacy money rows are wildly inconsistent: `moneyname`/`moneyamount` may hold
 * the code and number in either order ("GP"+"6", "10"+"G"), spell it out
 * ("gold"+"20"), or cram both into one field ("18g", no name). Combine both
 * fields, then pull the number and the currency letter out independently.
 */
export const legacyCurrency = (money: Array<Record<string, any>>) => {
  if (!money?.length) return;
  const inventory = useInventoryStore();
  money.forEach((m) => {
    const combined = `${m.moneyname ?? ""} ${m.moneyamount ?? ""}`;
    const numMatch = combined.match(/\d+/);
    if (!numMatch) return;
    const amount = Number(numMatch[0]);
    const letters = combined.toLowerCase().replace(/[^a-z]/g, "");
    let key: "gold" | "silver" | "copper" | null = null;
    if (letters.startsWith("g")) key = "gold";
    else if (letters.startsWith("s")) key = "silver";
    else if (letters.startsWith("c")) key = "copper";
    // Accumulate: legacy sheets often have several rows of the same
    // denomination, and append mode should add to existing cash, not replace it.
    // Overwrite mode resets denominations first via clearSection("currency").
    if (key) inventory.cash[key] = (inventory.cash[key] || 0) + amount;
  });
};

export const legacyTalents = (talents: Array<Record<string, any>>) => {
  if (!talents?.length) return;
  const qualities = useItemStore();
  talents.forEach((talent) => {
    const name = talent.powername || talent.talentdescription;
    if (!name) return;
    let qualityLevel = "novice";
    if (talent.talentdegree === "2") qualityLevel = "expert";
    if (talent.talentdegree === "3") qualityLevel = "master";
    qualities.addItem({
      type: "Talent",
      name,
      description: talent.talentdescription || "",
      qualityLevel,
      qualityNovice: talent.talent1description || "",
      qualityExpert: talent.talent2description || "",
      qualityMaster: talent.talent3description || "",
      modifiers: [],
    });
  });
};

/* `repeating_power_` holds class powers and custom stunt powers. */
export const legacyPowers = (powers: Array<Record<string, any>>) => {
  if (!powers?.length) return;
  const qualities = useItemStore();
  powers.forEach((power) => {
    const name = power.powername || power.powertype;
    if (!name) return;
    qualities.addItem({
      type: "Special Feature",
      name,
      description: power.fullpowerdescription || power.shortpowerdescription || "",
      modifiers: [],
    });
  });
};

export const legacyFocuses = (
  focuses: Array<Record<string, any>>,
  ability: string
) => {
  if (!focuses?.length) return;
  const qualities = useItemStore();
  focuses.forEach((focus) => {
    if (!focus.focusname) return;
    qualities.addItem({
      type: "Ability Focus",
      name: focus.focusname,
      description: focus.focusdescription || "",
      ability,
      focus: true,
      doubleFocus: false,
      modifiers: [],
    });
  });
};

export const legacyInventory = (inventory: Array<Record<string, any>>) => {
  if (!inventory?.length) return;
  const inventoryStore = useInventoryStore();
  inventory.forEach((item) => {
    const name = item["equipment-name"];
    if (!name && !item["equipment-description"]) return;
    inventoryStore.addItem({
      name: name || "",
      description: item["equipment-description"] || "",
      type: "item",
      quantity: toInt(item["equipment-quantity"]) || 1,
    });
  });
};

/*
 * Legacy attacks imply possession of the weapon (a "Longsword" attack means the
 * character owns a longsword), so each `attack-list` row becomes an inventory
 * weapon. A `range` marks it ranged.
 */
/* Range may be "26", "16 yards", or "4 / 6" (short / long). */
const parseRange = (raw: any): { shortRange: number | null; longRange: number | null } => {
  const nums = raw ? String(raw).match(/\d+/g) : null;
  if (!nums) return { shortRange: null, longRange: null };
  return {
    shortRange: Number(nums[0]),
    longRange: nums[1] != null ? Number(nums[1]) : null,
  };
};

export const legacyAttackWeapons = (attacks: Array<Record<string, any>>) => {
  if (!attacks?.length) return;
  const inventory = useInventoryStore();
  attacks.forEach((atk) => {
    if (!atk["attack-name"]) return;
    const { shortRange, longRange } = parseRange(atk.range);
    // Legacy rows use placeholder ranges like "0" or "-" for melee weapons;
    // both are truthy strings, so classify from the parsed short range instead.
    const ranged = shortRange != null && shortRange > 0;
    inventory.addItem({
      name: atk["attack-name"],
      description: "",
      type: "weapon",
      quantity: 1,
      damage: atk["attack-damage"] || "",
      weaponType: ranged ? "Ranged" : "Melee",
      weaponGroupAbility: "",
      shortRange,
      longRange,
      reload: atk.reload || "",
    });
  });
};

export const legacyArcana = (arcana: Array<Record<string, any>>) => {
  if (!arcana?.length) return;
  const magic = useSpellStore();
  arcana.forEach((spell) => {
    if (!spell["spell-name"]) return;
    magic.addSpell({
      name: spell["spell-name"],
      description: spell["full-spell-description"] || "",
      arcanaType: spell["spell-school"] || "",
      requirements: spell["spell-requirements"] || "Novice",
      // mp cost may be a range like "2-8"; keep the first number.
      mpCost: toInt(spell["spell-mp-cost"]) || 0,
      shortDescription: spell["short-spell-description"] || "",
      spellType: spell["spell-type"] || "",
      castingTime: spell["spell-cast-time"] || "",
      targetNumber: toInt(spell["spell-tn"]) || 0,
      spellTest: spell["spell-test"] || "",
    });
  });
};

/* Ability-focus repeating sections are named `<ability>-focus`. */
const FOCUS_SECTIONS: Record<string, string> = {
  "accuracy-focus": "Accuracy",
  "communication-focus": "Communication",
  "constitution-focus": "Constitution",
  "dexterity-focus": "Dexterity",
  "fighting-focus": "Fighting",
  "intelligence-focus": "Intelligence",
  "perception-focus": "Perception",
  "strength-focus": "Strength",
  "willpower-focus": "Willpower",
};

function applyFocuses(grouped: GroupedRepeating) {
  Object.entries(FOCUS_SECTIONS).forEach(([section, ability]) => {
    if (grouped[section]) legacyFocuses(grouped[section], ability);
  });
}

/* -------------------------------------------------------------------------- */
/* Change report                                                              */
/* -------------------------------------------------------------------------- */

type Change = { path: string; from: any; to: any };
type ImportReport = { overwritten: Change[]; added: Change[]; cleared: Change[] };

const isEmptyValue = (v: any): boolean =>
  v === undefined || v === null || v === "";

const fmtValue = (v: any): string => {
  if (v === undefined) return "(unset)";
  if (v === "") return '""';
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 80 ? `${s.slice(0, 77)}…` : s;
};

/*
 * Deep-diffs two dehydrated store snapshots, classifying each changed leaf:
 *  - overwritten: had a value before, replaced with a different value
 *  - added:       was empty before, now has a value
 *  - cleared:     had a value before, now empty
 */
function diffStates(
  before: any,
  after: any,
  path = "",
  report: ImportReport = { overwritten: [], added: [], cleared: [] }
): ImportReport {
  const bothObjects =
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object";
  if (bothObjects) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    keys.forEach((key) => {
      diffStates(
        before[key],
        after[key],
        path ? `${path}.${key}` : key,
        report
      );
    });
    return report;
  }

  const beforeEmpty = isEmptyValue(before);
  const afterEmpty = isEmptyValue(after);
  if (beforeEmpty && afterEmpty) return report;
  if (beforeEmpty) {
    report.added.push({ path, from: before, to: after });
  } else if (afterEmpty) {
    report.cleared.push({ path, from: before, to: after });
  } else if (JSON.stringify(before) !== JSON.stringify(after)) {
    report.overwritten.push({ path, from: before, to: after });
  }
  return report;
}

function logImportReport(report: ImportReport) {
  if (!logMode) return report;
  const { overwritten, added, cleared } = report;
  console.groupCollapsed(
    `📋 Legacy Import Report — ${overwritten.length} overwritten, ${added.length} added, ${cleared.length} cleared`
  );
  if (overwritten.length) {
    console.warn(
      `⚠️ Overwritten (${overwritten.length}) — existing values replaced:`
    );
    console.table(
      overwritten.map((c) => ({
        field: c.path,
        from: fmtValue(c.from),
        to: fmtValue(c.to),
      }))
    );
  } else {
    console.log("✔️ No existing data was overwritten.");
  }
  if (added.length) {
    console.log(`➕ Added (${added.length}) — empty fields filled:`);
    console.table(added.map((c) => ({ field: c.path, to: fmtValue(c.to) })));
  }
  if (cleared.length) {
    console.log(`➖ Cleared (${cleared.length}) — values removed:`);
    console.table(
      cleared.map((c) => ({ field: c.path, from: fmtValue(c.from) }))
    );
  }
  console.groupEnd();
  return report;
}

/* -------------------------------------------------------------------------- */
/* Detection + orchestration                                                  */
/* -------------------------------------------------------------------------- */

/* True when the blob carries old-format flat data (repeating rows or scalars). */
export function isLegacyData(attributes: LegacyAttributes): boolean {
  if (!attributes) return false;
  if (Object.keys(attributes).some((key) => REPEATING_RE.test(key))) return true;
  return ["race", "class", "level", "accuracy", "social-class"].some(
    (key) => !!attributes[key]
  );
}

export type ImportMode = "append" | "overwrite";

/* User-selectable sections shown as checkboxes in the Import modal. */
export const IMPORT_SECTIONS = [
  { key: "name", label: "Name" },
  { key: "abilities", label: "Abilities" },
  { key: "character", label: "Character Stats" },
  { key: "bio", label: "Biography" },
  { key: "settings", label: "Game Settings" },
  { key: "talents", label: "Talents & Powers" },
  { key: "focuses", label: "Ability Focuses" },
  { key: "spells", label: "Spells (Arcana)" },
  { key: "equipment", label: "Equipment & Weapons" },
  { key: "currency", label: "Currency" },
] as const;

export type ImportSectionKey = (typeof IMPORT_SECTIONS)[number]["key"];

/* Removes all quality items of the given types (talents, focuses, etc.). */
function removeQualitiesByType(types: string[]) {
  const store = useItemStore();
  store.items
    .filter((item) => types.includes(item.type))
    .map((item) => item._id)
    .forEach((id) => store.removeItem(id));
}

/* Clears the stores/fields a single section writes to (used by overwrite). */
function clearSection(key: ImportSectionKey) {
  switch (key) {
    case "name":
      useMetaStore().name = "";
      break;
    case "abilities": {
      const ability = useAbilityScoreStore();
      Object.values(ABILITY_KEYS).forEach((n) => {
        (ability as any)[`${n}Base`] = 0;
      });
      break;
    }
    case "character": {
      const char = useCharacterStore();
      char.health = 0;
      // healthMax / magicMax can't be imported; zero them so the sheet doesn't
      // keep a stale max from the previous character.
      char.healthMax = 0;
      char.magic = 0;
      char.magicMax = 0;
      char.armor = 0;
      char.speed = 0;
      char.xp = 0;
      char.weaponGroups = "";
      break;
    }
    case "bio": {
      const bio = useBioStore();
      bio.level = 1;
      bio.ancestry = "";
      bio.profession = "";
      bio.background = "";
      bio.socialClass = "";
      // Legacy `gender` is imported into bio.sex only (see importLegacyBioFlat),
      // so bio.gender is left alone here — clearing it would delete a user value
      // that the import never rewrites.
      bio.sex = "";
      bio.height = "";
      bio.weight = "";
      bio.eyes = "";
      bio.skin = "";
      bio.hair = "";
      bio.detailsHistory = "";
      bio.goalsTies = "";
      bio.relationships = "";
      bio.age = undefined;
      removeQualitiesByType(["Ancestry", "Class", "Specialization"]);
      break;
    }
    case "settings":
      // gameSystem and incomeMode are always re-applied by importLegacySettingsFlat,
      // but showArcana is only ever turned on there, so it must be reset here or a
      // non-caster legacy character would leave the Arcana section visible.
      useSettingsStore().showArcana = false;
      break;
    case "talents":
      removeQualitiesByType(["Talent", "Special Feature"]);
      break;
    case "focuses":
      removeQualitiesByType(["Ability Focus"]);
      break;
    case "spells":
      useSpellStore().spells = [];
      break;
    case "equipment": {
      const inv = useInventoryStore();
      inv.items = inv.items.filter(
        (i) => i.type !== "item" && i.type !== "weapon"
      );
      break;
    }
    case "currency":
      useInventoryStore().cash = { tn: 0, gold: 0, silver: 0, copper: 0 };
      break;
  }
}

/* Imports a single section's data from the legacy blob. */
function applySection(
  key: ImportSectionKey,
  attributes: LegacyAttributes,
  grouped: GroupedRepeating,
  name?: string
) {
  switch (key) {
    case "name":
      if (name) useMetaStore().name = name;
      break;
    case "abilities":
      importLegacyAbilityScores(attributes);
      break;
    case "character":
      importLegacyCharacterFlat(attributes);
      break;
    case "bio":
      importLegacyBioFlat(attributes);
      importLegacyAncestryClass(attributes);
      importLegacySpecialization(attributes);
      break;
    case "settings":
      importLegacySettingsFlat(attributes);
      break;
    case "talents":
      legacyTalents(grouped.talent);
      legacyPowers(grouped.power);
      break;
    case "focuses":
      applyFocuses(grouped);
      break;
    case "spells":
      legacyArcana(grouped.spell);
      break;
    case "equipment":
      legacyInventory(grouped.equipment);
      legacyAttackWeapons(grouped["attack-list"]);
      break;
    case "currency":
      legacyCurrency(grouped.money);
      break;
  }
}

/*
 * Full import — the action behind the Import modal. `sections` selects which
 * parts to import (defaults to all). In overwrite mode each selected section's
 * targets are cleared before importing.
 */
export function importLegacyCharacter(
  attributes: LegacyAttributes,
  mode: ImportMode = "append",
  sections?: string[],
  name?: string
) {
  // Guard: never clear/overwrite the sheet when there's no legacy data to
  // import (e.g. the character blob hasn't loaded yet).
  if (!attributes || !isLegacyData(attributes)) {
    logWarn(
      "⚠️ Legacy import skipped: no legacy character data found in the blob."
    );
    return;
  }
  const selected = (
    sections && sections.length ? sections : IMPORT_SECTIONS.map((s) => s.key)
  ) as ImportSectionKey[];

  const sheet = useAgeSheetStore();
  // The before/after snapshots and diff only feed the dev-only import report,
  // so skip that work entirely unless logging is on.
  const before = logMode ? sheet.dehydrateStore() : null;
  const grouped = groupRepeating(attributes);

  if (mode === "overwrite") selected.forEach((key) => clearSection(key));
  selected.forEach((key) => applySection(key, attributes, grouped, name));

  if (logMode) {
    const after = sheet.dehydrateStore();
    logImportReport(diffStates(before, after));
  }
  logInfo("✅ Legacy import complete");
}
