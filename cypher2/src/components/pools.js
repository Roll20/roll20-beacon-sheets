// The ordered <option> list for the pool enum (ddd-yzx). Order is the book's
// Might/Speed/Intellect, which is also PoolsRow's order — a UX decision of this
// sheet's, pinned literally by __tests__/contract-enums.test.js so a reorder of the
// schema's incidental enum array can never reshuffle the dropdown. See enums.js for
// why these lists are hand-written rather than read out of the schema at runtime.
export const POOL_NAMES = ['might', 'speed', 'intellect']

// The three pool display labels. Shared because the item-contents descriptors in
// SkillsSegment and AttacksSegment both need them (item-contents spec §3.1) and a
// second copy of the map is a second thing to keep in step. The row <select>s read
// their option text through poolLabel() too, so an option and its summary cell cannot
// disagree; PoolsRow still spells its labels inline (it is not this change's file).
export const POOL_LABELS = { might: 'Might', speed: 'Speed', intellect: 'Intellect' }

// EVERY read of a STORED pool value goes through here — never POOL_LABELS[value]
// directly (ddd-9ir item 1). hydrate() applies no enum validation, so a Beacon
// snapshot or a drag-drop payload can put any string in row.pool, and a bare lookup
// renders the miss as an EMPTY cell: the row silently loses information instead of
// degrading visibly. Falling back to the RAW VALUE rather than collapsing the cell,
// because a collapsed cell is indistinguishable from "not tied to a Pool" — a real
// and different state — and the raw value tells a player WHAT their file got wrong.
// Object.hasOwn, not `?? pool`: POOL_LABELS.constructor is a truthy Function that a
// nullish coalesce would print (the same trap themes.js avoids with a Set).
export const poolLabel = (pool) => (Object.hasOwn(POOL_LABELS, pool) ? POOL_LABELS[pool] : pool)
