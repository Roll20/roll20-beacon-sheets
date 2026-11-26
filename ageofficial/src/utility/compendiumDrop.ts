import { v4 as uuidv4 } from 'uuid';
import getRollResult from '@/utility/getRollResult';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useSpellStore } from '@/sheet/stores/magic/magicStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useCompendiumDropStore } from '@/sheet/stores/compendiumDropStore';

type CompendiumPage = {
  name: string;
  content: string;
  properties: Record<string, any>;
  category: { name: string; cardBody: string; cardHeader: string; cardAttributes: any[] };
  book: { name: string };
};

// Accepts either the raw dispatch response ({ data: { ruleSystem: ... } })
// or the unwrapped form ({ ruleSystem: ... }) — both appear in the wild.
type CompendiumResponse =
  | { data: { ruleSystem: { pages: CompendiumPage[] } } }
  | { ruleSystem: { pages: CompendiumPage[] } };

export type DropResult =
  | { store: 'inventory'; itemType: 'armor' | 'weapon' | 'shield' | 'item' | 'consumable' }
  | { store: 'abilityFocuses' }
  | { store: 'spells' }
  | { store: 'qualities'; qualityType: string }
  | { store: 'class' }
  | { store: 'background' }
  | { store: null; reason: string };

function extractPage(response: CompendiumResponse): CompendiumPage | null {
  const pages =
    'data' in response
      ? response.data?.ruleSystem?.pages
      : response.ruleSystem?.pages;
  return pages?.[0] ?? null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Some compendium categories (notably Spells) never populate mechanical fields like
// MP Cost/Target Number/Spell Type/Casting Time/Test as structured `properties` — they
// only exist as label/value rows in the rendered HTML stat table inside `content`.
// Parses those rows into a { label: value } map so callers can fall back to it.
function parseStatBlockRows(html: string): Record<string, string> {
  const rows: Record<string, string> = {};
  const decode = (s: string) =>
    s.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').trim();
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = trRegex.exec(html))) {
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(trMatch[1]))) {
      cells.push(decode(stripHtml(cellMatch[1])));
    }
    if (cells.length >= 2 && cells[0]) {
      const label = cells[0].replace(/:\s*$/, '').trim();
      if (label && cells[1]) rows[label] = cells[1];
    }
  }
  return rows;
}

// Safely coerces any compendium property value to a number, returning fallback on NaN.
function toNum(val: unknown, fallback = 0): number {
  const n = parseFloat(String(val ?? fallback).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? fallback : n;
}

// Parses a penalty value that may use an em dash (–5) or a real minus sign (-5),
// always returning a negative number. Used for Armor Penalty and similar fields.
function toPenalty(val: unknown, fallback = 0): number {
  const normalized = String(val ?? fallback).replace(/[–—]/g, '-');
  const n = parseFloat(normalized.replace(/[^\d.-]/g, ''));
  if (isNaN(n)) return fallback;
  return n <= 0 ? n : -n;
}

// Normalizes weapon type to a capitalized string matching store convention ("Melee"/"Ranged").
function toWeaponType(hasRange: boolean): string {
  return hasRange ? 'Ranged' : 'Melee';
}

// Normalizes a compendium Reload value (e.g. "Major Action", "Minor Action") to the
// store convention of just "Major"/"Minor". The reload <select> options and the attack
// display (which appends " Action") both expect the bare action word — storing the raw
// "Major Action" string matches no <option> and shows blank in the reload dropdown.
function toReload(val: unknown): string {
  const s = String(val ?? '').toLowerCase();
  if (s.includes('major')) return 'Major';
  if (s.includes('minor')) return 'Minor';
  return '';
}

// Converts Min. Str. values to a number — em dash or blank means no requirement (0).
function toMinStr(val: unknown): number {
  const s = String(val ?? '').trim();
  if (!s || /^[–—-]+$/.test(s)) return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function resolveCategory(page: CompendiumPage): string {
  return (
    (page.properties?.Category as string | undefined) ??
    page.category?.name ??
    ''
  ).toLowerCase();
}

function mapArmorDrop(page: CompendiumPage): DropResult {
  const inventoryStore = useInventoryStore();
  inventoryStore.addItem({
    type: 'armor',
    name: page.name,
    description: stripHtml(page.content),
    cost: String(page.properties?.Cost ?? ''),
    defenseMod: toNum(page.properties?.['Armor Rating']),
    armorPenalty: toPenalty(page.properties?.['Armor Penalty']),
    strain: toNum(page.properties?.Strain),
    slots: toNum(page.properties?.Slots, 1),
    quantity: 1,
    equipped: false,
  });
  return { store: 'inventory', itemType: 'armor' };
}

// Splits a "<text> (<parenthetical>)" string, optionally requiring a keyword before the
// parens (e.g. "Group"). Shared by weapon-group and focus-string parsing below.
// "Lances Group (Fighting)" w/ keyword "Group" → { primary: "Lances", secondary: "Fighting" }
// "Communication (Deception)" w/ no keyword → { primary: "Communication", secondary: "Deception" }
export function parseParenthetical(raw: string, keyword?: string): { primary: string; secondary: string } {
  const pattern = keyword
    ? new RegExp(`^(.*?)\\s*${keyword}\\s*\\(([^)]+)\\)\\s*$`, 'i')
    : /^(.*?)\s*\(([^)]+)\)\s*$/;
  const match = raw.match(pattern);
  if (match) return { primary: match[1].trim(), secondary: match[2].trim() };
  return { primary: raw.trim(), secondary: '' };
}

// "Lances Group (Fighting)" → { group: "Lances", ability: "Fighting" }
function parseWeaponGroup(raw: string): { group: string; ability: string } {
  const withGroup = parseParenthetical(raw, 'Group');
  if (withGroup.secondary) return { group: withGroup.primary, ability: withGroup.secondary };
  // Fallback: no "Group" keyword, just strip parenthetical if present
  const fallback = parseParenthetical(raw);
  return { group: fallback.primary, ability: fallback.secondary };
}

function mapWeaponDrop(page: CompendiumPage): DropResult {
  const inventoryStore = useInventoryStore();
  const rawGroup = String(page.properties?.['Weapon Group'] ?? '');
  const { group: weaponGroup, ability: weaponGroupAbility } = parseWeaponGroup(rawGroup);
  const hasRange = page.properties?.['Short Range'] != null || page.properties?.['Long Range'] != null;
  inventoryStore.addItem({
    type: 'weapon',
    name: page.name,
    description: stripHtml(page.content),
    cost: String(page.properties?.Cost ?? ''),
    damage: String(page.properties?.Damage ?? ''),
    weaponType: toWeaponType(hasRange),
    weaponGroup,
    weaponGroupAbility,
    shortRange: page.properties?.['Short Range'] ?? null,
    longRange: page.properties?.['Long Range'] ?? null,
    reload: toReload(page.properties?.Reload),
    minStr: toMinStr(page.properties?.['Min. Str.']),
    slots: toNum(page.properties?.Slots, 1),
    quantity: 1,
    equipped: false,
    configurable: true,
  });
  return { store: 'inventory', itemType: 'weapon' };
}

function mapShieldDrop(page: CompendiumPage): DropResult {
  const inventoryStore = useInventoryStore();
  inventoryStore.addItem({
    type: 'shield',
    name: page.name,
    description: stripHtml(page.content),
    cost: String(page.properties?.Cost ?? ''),
    defenseMod: toNum(page.properties?.['Shield Bonus'] ?? page.properties?.['Defense Bonus'] ?? page.properties?.['Defense Mod']),
    slots: toNum(page.properties?.Slots, 1),
    quantity: 1,
    equipped: false,
  });
  return { store: 'inventory', itemType: 'shield' };
}

function mapItemDrop(page: CompendiumPage, itemType: 'item' | 'consumable' = 'item'): DropResult {
  const inventoryStore = useInventoryStore();
  inventoryStore.addItem({
    type: itemType,
    name: page.name,
    description: stripHtml(page.content),
    cost: String(page.properties?.Cost ?? ''),
    slots: toNum(page.properties?.Slots, 1),
    quantity: 1,
  });
  return { store: 'inventory', itemType };
}

function mapFocusDrop(page: CompendiumPage): DropResult {
  const itemStore = useItemStore();
  itemStore.addItem({
    type: 'Ability Focus',
    name: page.name,
    ability: String(page.properties?.Ability ?? page.properties?.['Ability Score'] ?? ''),
    description: String(page.properties?.Description ?? stripHtml(page.content)),
    focus: true,
    doubleFocus: false,
    modifiers: [],
  });
  return { store: 'qualities', qualityType: 'Ability Focus' };
}

function mapSpellDrop(page: CompendiumPage): DropResult {
  const spellStore = useSpellStore();
  // Real spell compendium entries never populate Spell Type/MP Cost/Casting Time/
  // Target Number/Test as `properties` — those only exist as rows in the content
  // stat table, so properties is tried first and the parsed table is the fallback.
  const stats = parseStatBlockRows(page.content);
  spellStore.addSpell({
    name: page.name,
    arcanaType: String(page.properties?.['Arcana Type'] ?? page.properties?.Arcana ?? ''),
    requirements: String(stats['Requirements'] ?? page.properties?.Requirements ?? ''),
    shortDescription: String(page.properties?.['Short Description'] ?? ''),
    description: stripHtml(page.content),
    ability: String(page.properties?.Ability ?? ''),
    abilityFocus: String(page.properties?.Focus ?? page.properties?.['Ability Focus'] ?? ''),
    spellType: String(page.properties?.['Spell Type'] ?? page.properties?.Type ?? stats['Spell Type'] ?? ''),
    spellTypeBonus: Number(page.properties?.['Spell Type Bonus'] ?? 0),
    mpCost: toNum(page.properties?.['MP Cost'] ?? page.properties?.['Magic Points'] ?? stats['MP Cost']),
    castingTime: String(page.properties?.['Casting Time'] ?? stats['Casting Time'] ?? ''),
    targetNumber: toNum(page.properties?.['Target Number'] ?? page.properties?.TN ?? stats['Target Number']),
    spellTest: String(page.properties?.['Spell Test'] ?? ''),
    extendable: Boolean(page.properties?.Extendable ?? false),
    damageHit: String(page.properties?.['Damage (Hit)'] ?? page.properties?.Damage ?? ''),
    damageMiss: String(page.properties?.['Damage (Miss)'] ?? ''),
    fatigue: page.properties?.Fatigue !== undefined ? Number(page.properties.Fatigue) : undefined,
    // Store field is `spellResistance`, not `resistance` — addSpell() silently drops
    // unknown keys, so this previously never reached the spell object at all.
    spellResistance: String(
      page.properties?.Resistance ?? stats['Resistance Test'] ?? stats['Test'] ?? '',
    ),
  });
  return { store: 'spells' };
}

function mapAncestryDrop(page: CompendiumPage): DropResult {
  const bioStore = useBioStore();
  const characterStore = useCharacterStore();
  const itemStore = useItemStore();

  bioStore.ancestry = page.name;

  const benefit = (() => {
    try { return JSON.parse(String(page.properties?.['Ancestory Benefit'] ?? '{}')); }
    catch { return {}; }
  })();

  if (benefit.Speed != null) characterStore.speed = Number(benefit.Speed);

  const benefitLines: string[] = [];
  if (benefit.Speed != null) benefitLines.push(`Speed: ${benefit.Speed} + Dexterity`);
  if (benefit.Darksight != null) benefitLines.push(`Dark Sight: ${benefit.Darksight} yards`);
  if (benefit.Languages) benefitLines.push(`Languages: ${benefit.Languages}`);

  itemStore.addItem({
    type: 'Ancestry',
    name: page.name,
    description: benefitLines.join('\n'),
    modifiers: [],
  });

  return { store: 'qualities', qualityType: 'Ancestry' };
}

function mapClassDrop(page: CompendiumPage): DropResult {
  const bioStore = useBioStore();
  const dropStore = useCompendiumDropStore();
  const settings = useSettingsStore();

  const starting = (() => {
    try { return JSON.parse(String(page.properties?.Starting ?? '{}')); }
    catch { return {}; }
  })();

  const weaponGroupChoices = (() => {
    try {
      const parsed = JSON.parse(String(page.properties?.['Weapon Groups'] ?? '{}'));
      return Array.isArray(parsed.Choice) ? parsed.Choice : [];
    } catch { return []; }
  })();

  // Derive arcane-caster status from the class's own starting Magic value rather than
  // a hardcoded class-name match, so any (including renamed/homebrew) caster class
  // enables the Arcana UI. Only turns it on — never clobbers a manual override for a
  // non-caster class.
  if (starting.Magic != null) settings.showArcana = true;

  dropStore.setPendingClass({
    name: page.name,
    healthBase: Number(starting.Health ?? 0),
    magicBase: starting.Magic != null ? Number(starting.Magic) : null,
    weaponGroupChoices,
    requiresConfirm: !!bioStore.profession,
  });

  return { store: 'class' };
}

function mapTalentOrSpecDrop(page: CompendiumPage, qualityType: 'Talent' | 'Specialization'): DropResult {
  const itemStore = useItemStore();
  const settings = useSettingsStore();

  // Always index against the full tier list so an existing tier is never lost if
  // showAfterMastery is toggled off after the item reached grandmaster/apex — only
  // the advancement ceiling (maxIndex) is affected by the setting, not the lookup.
  const allLevels = ['novice', 'expert', 'master', 'grandmaster', 'apex'];
  const maxIndex = settings.showAfterMastery ? allLevels.length - 1 : allLevels.indexOf('master');

  const existing = itemStore.items.find(
    (i) => i.type === qualityType && i.name === page.name,
  );

  if (existing) {
    const currentIndex = allLevels.indexOf(existing.qualityLevel ?? 'novice');
    const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = Math.min(safeCurrentIndex + 1, maxIndex);
    existing.qualityLevel = allLevels[Math.max(nextIndex, safeCurrentIndex)];
    return { store: 'qualities', qualityType };
  }

  itemStore.items.push({
    _id: uuidv4(),
    type: qualityType,
    name: page.name,
    description: stripHtml(page.content),
    ability: String(page.properties?.Ability ?? page.properties?.Requirements ?? ''),
    qualityLevel: 'novice',
    qualityNovice: String(page.properties?.Novice ?? page.properties?.['Novice Benefit'] ?? ''),
    qualityExpert: String(page.properties?.Expert ?? page.properties?.Journeyman ?? page.properties?.['Expert Benefit'] ?? ''),
    qualityMaster: String(page.properties?.Master ?? page.properties?.['Master Benefit'] ?? ''),
  } as any);

  return { store: 'qualities', qualityType };
}

function mapSpecializationDrop(page: CompendiumPage): DropResult {
  return mapTalentOrSpecDrop(page, 'Specialization');
}

function mapQualityDrop(page: CompendiumPage, qualityType: string): DropResult {
  const itemStore = useItemStore();
  itemStore.addItem({
    type: qualityType,
    name: page.name,
    description: stripHtml(page.content),
    ability: String(page.properties?.Ability ?? page.properties?.['Ability Score'] ?? ''),
    qualityLevel: String(page.properties?.Level ?? ''),
    qualityNovice: String(
      page.properties?.Novice ?? page.properties?.['Novice Benefit'] ?? '',
    ),
    qualityExpert: String(
      page.properties?.Expert ??
        page.properties?.Journeyman ??
        page.properties?.['Expert Benefit'] ??
        '',
    ),
    qualityMaster: String(
      page.properties?.Master ?? page.properties?.['Master Benefit'] ?? '',
    ),
    modifiers: [],
  });
  return { store: 'qualities', qualityType };
}

// Parses "15 + 3d6" and rolls via Beacon, returns the total.
async function rollDiceFormula(formula: string): Promise<number> {
  const parts = formula.replace(/\s/g, '').split('+');
  let flat = 0;
  const diceComponents: Array<{ sides: number; count: number }> = [];

  for (const part of parts) {
    const diceMatch = part.match(/^(\d*)d(\d+)$/i);
    if (diceMatch) {
      diceComponents.push({
        count: diceMatch[1] ? parseInt(diceMatch[1]) : 1,
        sides: parseInt(diceMatch[2]),
      });
    } else {
      flat += parseInt(part) || 0;
    }
  }

  if (!diceComponents.length) return flat;
  const result = await getRollResult(diceComponents as any);
  return result.total + flat;
}

async function mapBackgroundDrop(page: CompendiumPage): Promise<DropResult> {
  const bioStore = useBioStore();
  const inventoryStore = useInventoryStore();
  const dropStore = useCompendiumDropStore();

  bioStore.background = page.name;

  if (page.properties?.['Social Class']) {
    bioStore.socialClass = String(page.properties['Social Class']);
  }

  const silverFormula = String(page.properties?.['Silver Pieces'] ?? '');
  if (silverFormula) {
    const silver = await rollDiceFormula(silverFormula);
    inventoryStore.cash.silver = (inventoryStore.cash.silver ?? 0) + silver;
  }

  const focusChoices = (() => {
    try {
      const parsed = JSON.parse(String(page.properties?.Focus ?? '{}'));
      return Array.isArray(parsed.Choice) ? parsed.Choice : [];
    } catch { return []; }
  })();

  if (focusChoices.length) {
    dropStore.setPendingBackground({ name: page.name, focusChoices });
  }

  return { store: 'background' };
}

// Normalizes every known category spelling/pluralization/typo variant to one canonical
// name, so adding a new alias means adding one map entry instead of another `||` clause.
const CATEGORY_ALIASES: Record<string, string> = {
  armor: 'armor',
  weapon: 'weapon', weapons: 'weapon',
  shield: 'shield', shields: 'shield',
  consumable: 'consumable',
  equipment: 'item', gear: 'item', item: 'item',
  focus: 'focus', 'ability focus': 'focus', focuses: 'focus',
  arcana: 'spell', spell: 'spell', spells: 'spell', power: 'spell', powers: 'spell',
  class: 'class', classes: 'class',
  ancestry: 'ancestry', ancestries: 'ancestry', ancestory: 'ancestry', ancestories: 'ancestry',
  background: 'background', backgrounds: 'background',
  specialization: 'specialization', specializations: 'specialization',
  talent: 'talent', talents: 'talent',
  'special feature': 'special feature',
  'favored stunt': 'favored stunt', stunt: 'favored stunt',
};

/**
 * Routes a compendium drop response to the correct store and adds the entry.
 * Accepts either the raw dispatch response ({ data: { ruleSystem } })
 * or the unwrapped form ({ ruleSystem }).
 */
export async function applyCompendiumDrop(response: CompendiumResponse): Promise<DropResult> {
  const page = extractPage(response);
  if (!page) return { store: null, reason: 'No page data found in compendium response' };

  const rawCategory = resolveCategory(page);
  const category = CATEGORY_ALIASES[rawCategory];

  switch (category) {
    case 'armor': return mapArmorDrop(page);
    case 'weapon': return mapWeaponDrop(page);
    case 'shield': return mapShieldDrop(page);
    case 'consumable': return mapItemDrop(page, 'consumable');
    case 'item': return mapItemDrop(page);
    case 'focus': return mapFocusDrop(page);
    case 'spell': return mapSpellDrop(page);
    case 'class': return mapClassDrop(page);
    case 'ancestry': return mapAncestryDrop(page);
    case 'background': return mapBackgroundDrop(page);
    case 'specialization': return mapSpecializationDrop(page);
    case 'talent': return mapTalentOrSpecDrop(page, 'Talent');
    case 'special feature': return mapQualityDrop(page, 'Special Feature');
    case 'favored stunt': return mapQualityDrop(page, 'Favored Stunt');
    default: return { store: null, reason: `Unrecognized compendium category: "${rawCategory}"` };
  }
}
