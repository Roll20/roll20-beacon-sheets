// Every player-facing drop message (spec ⑥ §6.3, owner-approved 2026-09-16). No other
// file holds drop wording. <page> is the decoded page name, <category> the category
// name, both from the drop.

export const NPC_MODE = 'Items can only be added to a sheet in Character mode.'

export const NEWER =
  'This compendium page is newer than this sheet. The sheet needs updating, and the page is fine.'

const TYPE_HINT = "A type can't be added to a sheet. Drag its abilities from the Abilities category instead."
const SPECIES_HINT = "A species can't be added to a sheet. Enter its bonuses on the sheet by hand."

// Hard-coded to spec ⑤'s reference category names (decision 13). A renamed category
// falls back to the generic message, so drift degrades wording, never behavior.
// Descriptors and species grant plain bonuses, not named abilities, so they get the
// by-hand hint rather than a pointer at pages that do not exist (§6.3 correction).
export const CATEGORY_HINTS = new Map([
  ['Foci', "A focus can't be added to a sheet. Drag its abilities from the Abilities category instead."],
  ['Fantasy Types', TYPE_HINT],
  ['Science Fiction Types', TYPE_HINT],
  ['Superhero Types', TYPE_HINT],
  ['Descriptors', "A descriptor can't be added to a sheet. Enter its bonuses on the sheet by hand."],
  ['Fantasy Species', SPECIES_HINT],
  ['Science Fiction Species', SPECIES_HINT],
  // ddd-mndr. Not a reference category but the literal name Roll20 supplies for a page its
  // in-game index has not filed. Without an entry the generic fallback below reads "No
  // Category pages can't be added to a sheet.", which assumes the category name is a noun
  // phrase that pluralises — true of "Equipment" and "Arcs", broken English for this one.
  // It names the category list rather than calling the page unsupported, because the web
  // compendium had the same pages filed correctly (ddd-sjaz probe, two of eleven).
  ['No Category',
    "This compendium page isn't filed under a category, so the sheet can't tell what it " +
    'is. Find it under a category in the compendium and drag it from there.']
])

export const notAnItem = (category) => CATEGORY_HINTS.get(category) ?? `${category} pages can't be added to a sheet.`

export const malformed = (page) => `The compendium page "${page}" is malformed, so nothing was added.`

export const unreadable = (page) =>
  `The compendium page "${page}" has data this sheet can't read, so nothing was added.`

export const couldNotLoad = (page) =>
  `Couldn't load "${page}" from the compendium, so nothing was added. Try the drop again.`

export const couldNotAdd = (page) => `Couldn't add "${page}" right now, so nothing was added. Try the drop again.`

// The visually hidden success status (§6.1). Names the item, not the page title.
export const added = (itemName, category) => `Added ${itemName} to ${category}.`
