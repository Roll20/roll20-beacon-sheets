import { ARRAY_KEYS } from '@/stores/sheetStore.js'
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

// store -> schema document. Store array order IS the exported order; do not
// sort by arrayPosition (beacon-mapping §3.3).
export const exportDocument = ({ sheet, meta }) => ({
  schemaVersion: 2,
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
  portraitUrl: sheet.portraitUrl
})

export const downloadDocument = (doc) => {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.name || 'cypher-character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
