import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'

// NPC mode's creature logic (NPC spec §5.6). Plain functions on plain objects: no Vue,
// no Pinia, no DOM. The health bar's computed get/set run headless on Roll20, where no
// store has ever hydrated (§6), and a future worker.js build can hand these to Mod
// scripts without a rewrite.

export const CREATURE_SCHEMA_VERSION = 1
export const CREATURE_KIND = 'cypher-creature'

export const TEXT_FIELDS = ['description', 'motive', 'environment', 'damageInflicted', 'armorNote',
  'movement', 'modifications', 'combat', 'interaction', 'use', 'loot', 'adventureSeed', 'other']
export const NUMBER_FIELDS = ['level', 'health', 'armor']

// The read-view order (NPC spec §7.2), minus the title line. Health leads by owner ruling
// 2026-09-14, since it changes during combat, and Armor renders inside the Health row
// rather than as its own entry. The four combat fields follow Health by a later ruling
// that day, so the mechanical values sit together. Adventure seed and Other come last;
// the rest keep the GM's Guide order.
export const READ_ORDER = ['health', 'damageInflicted', 'movement', 'modifications', 'combat',
  'description', 'motive', 'environment', 'interaction', 'use', 'loot', 'gmIntrusions', 'adventureSeed', 'other']

// Blank after trimming. Display and export use this; storage never trims (§7.2).
export const isBlank = (value) => typeof value !== 'string' || value.trim() === ''

// A combat action with nothing in it (spec §7.2, §8.2). Export drops it, the card hides
// it, and it has no chat button. A title alone or a description alone still counts.
export const isBlankAction = (row) => isBlank(row.title) && isBlank(row.description)

export const targetNumber = (level) => level * 3

// Anything but exactly 'npc' is a Character, so every live sheet stays one (§5.1).
export const resolveSheetType = (raw) => (raw === 'npc' ? 'npc' : 'character')

// NPC spec §5.3. A factory, not a shared constant: the store mutates branches in place.
export const defaultBranch = () => ({
  creature: {
    level: 1,
    description: '',
    motive: '',
    environment: '',
    health: 3,
    damageInflicted: '',
    armor: 0,
    armorNote: '',
    movement: '',
    modifications: '',
    combat: '',
    combatActions: [],
    interaction: '',
    use: '',
    loot: '',
    gmIntrusions: [],
    adventureSeed: '',
    other: ''
  },
  health: 3
})

// Every creature field, in schema order. Key ORDER is load-bearing: the relay's
// byte-identical gate compares JSON strings (ddd-hy2), so a branch rebuilt in a
// different order would read as an edit and echo a write.
const CREATURE_KEYS = ['level', 'description', 'motive', 'environment', 'health', 'damageInflicted',
  'armor', 'armorNote', 'movement', 'modifications', 'combat', 'combatActions', 'interaction', 'use',
  'loot', 'gmIntrusions', 'adventureSeed', 'other']

// A creature object in schema key order, one value per key. The list keys sit between
// scalar keys, so a spread of scalars followed by the lists would put them out of order.
const inKeyOrder = (valueOf) => Object.fromEntries(CREATURE_KEYS.map((k) => [k, valueOf(k)]))

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
// Type-checked, never `??`: Roll20 hands a dropped value back as '' (ddd-wbc), and ''
// sails straight through a nullish default.
const isCount = (v) => Number.isInteger(v) && v >= 0
const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v)

// Floor, then clamp into 0..max. Not clampInt: this module imports only uuid and
// objectify (plan constraint), and clampInt has no ceiling.
const clampCurrent = (value, max) => Math.min(Math.max(0, Math.floor(Number(value) || 0)), max)

// One saved row reduced to its own fields, or null to drop it. Rebuilding from these
// fields is also what keeps a stray key from ever reaching the store.
const intrusionFields = (row) => (isPlainObject(row) && typeof row.text === 'string' ? { text: row.text } : null)
// A combat action survives with at least one string field; the other becomes ''
// (spec §5.4). A row with nothing usable in it is dropped.
const actionFields = (row) => {
  if (!isPlainObject(row)) return null
  const title = typeof row.title === 'string' ? row.title : null
  const description = typeof row.description === 'string' ? row.description : null
  if (title === null && description === null) return null
  return { title: title ?? '', description: description ?? '' }
}

// An _id arrayToObject can store as its own key. `__proto__` is a legal JSON key, but
// assigning it sets the new object's prototype instead of adding a row, so that row
// would vanish on the next save. The PC lists share this weakness, noted on ddd-4u8n.
const isStorableId = (id) => typeof id === 'string' && id !== '' && id !== '__proto__'

// Numeric positions first, ascending; everything else after, in its original order.
// Array.prototype.sort is stable, so ties keep Object.entries order.
const byPosition = (a, b) => {
  const aNumeric = isFiniteNumber(a.position)
  const bNumeric = isFiniteNumber(b.position)
  if (aNumeric && bNumeric) return a.position - b.position
  if (aNumeric !== bNumeric) return aNumeric ? -1 : 1
  return 0
}

// NPC spec §5.4, for both lists. objectToArray trusts arrayPosition: a duplicate
// position silently drops a row and a huge one allocates a giant sparse array (the PC
// lists share this, ddd-4u8n). So rows are checked first, sorted, and renumbered densely
// from 0 BEFORE objectToArray runs, and it only ever sees positions it cannot mishandle.
const healRows = (raw, fieldsOf) => {
  if (Array.isArray(raw)) {
    // Store shape: the array's own order is the order. arrayToObject needs a unique,
    // storable _id on every row, so a missing, repeated or unstorable one is minted fresh.
    const seen = new Set()
    return raw.flatMap((row) => {
      const fields = fieldsOf(row)
      if (fields === null) return []
      const _id = isStorableId(row._id) && !seen.has(row._id) ? row._id : uuidv4()
      seen.add(_id)
      return [{ _id, ...fields }]
    })
  }
  if (!isPlainObject(raw)) return []
  const renumbered = Object.fromEntries(
    Object.entries(raw)
      .map(([key, row]) => ({ _id: isStorableId(key) ? key : uuidv4(), fields: fieldsOf(row), position: row?.arrayPosition }))
      .filter(({ fields }) => fields !== null)
      .sort(byPosition)
      .map(({ _id, fields }, index) => [_id, { ...fields, arrayPosition: index }])
  )
  // Rebuilt rows, not objectToArray's own: those carry an explicit
  // `arrayPosition: undefined` key (beacon-mapping §3.2).
  return objectToArray(renumbered).map((row) => ({ _id: row._id, ...fieldsOf(row) }))
}

// NPC spec §5.4: never throws, never aliases its input. Accepts the attributes shape,
// the store shape or garbage, and always returns a complete store-shape branch.
export const healBranch = (raw) => {
  const npc = isPlainObject(raw) ? raw : {}
  const source = isPlainObject(npc.creature) ? npc.creature : {}
  const { creature } = defaultBranch()
  for (const field of NUMBER_FIELDS) if (isCount(source[field])) creature[field] = source[field]
  for (const field of TEXT_FIELDS) if (typeof source[field] === 'string') creature[field] = source[field]
  creature.combatActions = healRows(source.combatActions, actionFields)
  creature.gmIntrusions = healRows(source.gmIntrusions, intrusionFields)
  // A current health that is not a number at all reads as unhurt, not as 3 of 15.
  const health = isFiniteNumber(npc.health) ? clampCurrent(npc.health, creature.health) : creature.health
  return { creature, health }
}

// store branch -> attributes.npc (§5.1). List rows are rebuilt from their own fields
// first, so a stray key on a store row can never reach storage.
export const branchToAttributes = (branch) => ({
  creature: inKeyOrder((k) => {
    if (k === 'combatActions') {
      return arrayToObject(branch.creature.combatActions.map(({ _id, title, description }) => ({ _id, title, description })))
    }
    if (k === 'gmIntrusions') return arrayToObject(branch.creature.gmIntrusions.map(({ _id, text }) => ({ _id, text })))
    return branch.creature[k]
  }),
  health: branch.health
})

// NPC spec §5.2 and §5.4. Load REPLACES: an absent npc means no branch, whatever the
// store held before. The one exception is the invariant: NPC mode always has a branch.
export const hydrateNpcState = (attributes) => {
  const sheetType = resolveSheetType(attributes?.sheetType)
  const raw = attributes?.npc
  if (isPlainObject(raw)) return { sheetType, branch: healBranch(raw) }
  return { sheetType, branch: sheetType === 'npc' ? defaultBranch() : null }
}

// NPC spec §7.3. An unhurt creature follows its new max; a hurt one is clamped to it.
// newMax arrives already clamped by the input.
export const withMaxHealth = (branch, newMax) => ({
  creature: { ...branch.creature, health: newMax },
  health: branch.health === branch.creature.health ? newMax : Math.min(branch.health, newMax)
})

export const withCurrentHealth = (branch, value) => ({
  creature: branch.creature,
  health: clampCurrent(value, branch.creature.health)
})

// Import (§8.1): fresh _ids on both lists, and current health resets to the imported max.
export const creatureDocToBranch = (doc) => ({
  creature: inKeyOrder((k) => {
    if (k === 'combatActions') return doc.combatActions.map(({ title, description }) => ({ _id: uuidv4(), title, description }))
    if (k === 'gmIntrusions') return doc.gmIntrusions.map((text) => ({ _id: uuidv4(), text }))
    return doc[k]
  }),
  health: doc.health
})

// Export (§8.2), in schema key order. The name is used as given: the caller owns the
// DEFAULT_CHARACTER_NAME fallback. Blank intrusions and fully blank combat actions are
// dropped because the schema rejects them; every other value is verbatim. Current
// health never leaves.
export const branchToCreatureDoc = (branch, name) => ({
  schemaVersion: CREATURE_SCHEMA_VERSION,
  kind: CREATURE_KIND,
  name,
  ...inKeyOrder((k) => {
    if (k === 'combatActions') {
      return branch.creature.combatActions
        .filter((row) => !isBlankAction(row))
        .map(({ title, description }) => ({ title, description }))
    }
    if (k === 'gmIntrusions') return branch.creature.gmIntrusions.filter((row) => !isBlank(row.text)).map((row) => row.text)
    return branch.creature[k]
  })
})

// Health token bar (§6). Reads raw attributes only. '' in Character mode, so a PC
// token linked to `health` shows nothing (§13 risk, walkthrough item 7).
export const healthBarGet = (attributes) => {
  if (resolveSheetType(attributes?.sheetType) !== 'npc') return ''
  const { creature, health } = healBranch(attributes.npc)
  return { current: health, max: creature.health }
}

// null means ignore: not NPC mode, or a cleared or garbled bubble, which must not
// silently zero a creature mid-combat (the pool setters' rule). Otherwise the WHOLE
// attributes tree: updateCharacter deletes every omitted key (ddd-6qe), and a missing
// or malformed branch is written back complete. The caller stamps updateId.
export const healthBarWrite = (attributes, rawValue) => {
  if (resolveSheetType(attributes?.sheetType) !== 'npc') return null
  const trimmed = String(rawValue ?? '').trim()
  const parsed = Number(trimmed)
  if (trimmed === '' || !Number.isFinite(parsed)) return null
  return { ...attributes, npc: branchToAttributes(withCurrentHealth(healBranch(attributes.npc), parsed)) }
}
