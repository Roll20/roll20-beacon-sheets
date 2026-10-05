import { ARRAY_KEYS, v3Defaults } from '@/stores/sheetStore.js'
import { DEFAULT_CHARACTER_NAME } from '@/stores/index.js'

// Plain deep copy of reactive values. JSON round-trip is safe here: values are
// JSON-shaped by construction, and _id/arrayPosition are already removed by
// explicit destructuring (never rely on serialization to hide them —
// beacon-mapping §3.2).
const plain = (value) => JSON.parse(JSON.stringify(value))

const stripRow = (row) => {
  const { _id, arrayPosition, ...rest } = row
  return plain(rest)
}

// The root keys a version 2 document does not carry. Read off the store's own defaults
// rather than listed again here, so the two cannot name different sets.
const V3_ROOT_KEYS = Object.keys(v3Defaults())

// ddd-xrug, spec §6. The export version is decided by CONTENT, never by the version a
// document was imported as. Remembering the imported version would lose a damage track the
// GM switched on mid-campaign; always emitting 3 would hand every current-edition player a
// file they have no use for and break the round-trip law on the whole v2 corpus.
//
// Takes the BUILT v3-shaped document rather than the store, so a test can address it with a
// literal and needs no Pinia instance.
export const schemaVersionFor = (doc) =>
  doc.rules.damageTrack === false &&
  doc.rules.stress === false &&
  doc.damageTrack === null &&
  doc.luck === null &&
  doc.stress === null &&
  doc.wearingArmor === false &&
  doc.abilities.every((row) => row.stressCost === null)
    ? 2
    : 3

// store -> schema document, always in the v3 shape. Store array order IS the exported
// order; do not sort by arrayPosition (beacon-mapping §3.3).
//
// Key order is insignificant under deep equality, so the five v3 keys sit after
// portraitUrl to match the schema's own order and nothing depends on it.
const buildV3Document = ({ sheet, meta }) => ({
  schemaVersion: 3,
  kind: 'cypher-character',
  name: meta.name || DEFAULT_CHARACTER_NAME,
  sentence: plain(sheet.sentence),
  tier: sheet.tier,
  effort: sheet.effort,
  xp: sheet.xp,
  storyXp: sheet.storyXp,
  resourcePoints: sheet.resourcePoints,
  rank: sheet.rank,
  advancement: plain(sheet.advancement),
  pools: plain(sheet.pools),
  recovery: plain(sheet.recovery),
  wounds: plain(sheet.wounds),
  shield: plain(sheet.shield),
  armor: sheet.armor,
  armorModifiers: sheet.armorModifiers,
  cypherLimit: sheet.cypherLimit,
  genre: sheet.genre,
  subgenre: sheet.subgenre,
  ...Object.fromEntries(ARRAY_KEYS.map((k) => [k, sheet[k].map(stripRow)])),
  background: sheet.background,
  notes: sheet.notes,
  portraitUrl: sheet.portraitUrl,
  rules: plain(sheet.rules),
  damageTrack: plain(sheet.damageTrack),
  luck: plain(sheet.luck),
  stress: plain(sheet.stress),
  wearingArmor: sheet.wearingArmor
})

export const exportDocument = ({ sheet, meta }) => {
  const doc = buildV3Document({ sheet, meta })
  doc.schemaVersion = schemaVersionFor(doc)
  if (doc.schemaVersion === 2) {
    // DELETED, not set to undefined. toStrictEqual tells the two apart, and Roll20's
    // updateCharacter reads an undefined-valued key as a deletion (the arrayPosition
    // lesson, beacon-mapping §3.2).
    for (const key of V3_ROOT_KEYS) delete doc[key]
    for (const row of doc.abilities) delete row.stressCost
  }
  return doc
}

export const downloadDocument = (doc) => {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.name || 'cypher-character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
