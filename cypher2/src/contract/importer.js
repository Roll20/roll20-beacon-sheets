import { v4 as uuidv4 } from 'uuid'
import { validateCharacterRaw, MAX_SUPPORTED_SCHEMA_VERSION, supportedVersionsPhrase } from './validation.js'
import { describeCharacterErrors } from './fieldLabels.js'
import { ARRAY_KEYS, rowFactories, v3Defaults } from '@/stores/sheetStore.js'
import { FAILURE } from './failure.js'

// Defined in failure.js so the Vue-free creature importer can share it (ddd-zm47.3).
// Imported AND re-exported: parseAndValidate below uses FAILURE, and a bare
// `export { FAILURE } from` would not bind it here.
export { FAILURE }

const fail = (code, message, details, more) => ({ ok: false, failure: { code, message, details, more } })

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// Cypher Tools' export dialog offers two JSON files, Foundry and Roll20, and players
// sometimes pick the wrong one (owner, ddd-ag26). A Foundry actor carries system, items
// and type together; system.pools marks it as Cypher's. prototypeToken is not required,
// and a Foundry actor from another game system falls through to the generic message.
export const looksLikeFoundryActor = (doc) =>
  isPlainObject(doc) &&
  doc.kind === undefined &&
  isPlainObject(doc.system) &&
  Array.isArray(doc.items) &&
  typeof doc.type === 'string' &&
  isPlainObject(doc.system.pools)

export const FOUNDRY_MESSAGE =
  "This is the Foundry VTT export from Cypher Tools, which this sheet can't read. " +
  'In Cypher Tools, export the character again and choose the Roll20 option.'

// Pure: parses and validates, never touches stores (beacon-mapping §5 steps 1–2).
// The caller confirms with the user, then calls applyDocument (steps 3–4).
export const parseAndValidate = (text) => {
  let doc
  try {
    doc = JSON.parse(text)
  } catch (e) {
    return fail(FAILURE.NOT_JSON, `This file is not valid JSON. ${e.message}`)
  }

  const kind = doc?.kind
  if (kind !== 'cypher-character') {
    if (looksLikeFoundryActor(doc)) return fail(FAILURE.WRONG_KIND, FOUNDRY_MESSAGE)
    const found = kind === undefined ? 'it has no kind field' : `found ${JSON.stringify(kind)}`
    return fail(
      FAILURE.WRONG_KIND,
      "This file isn't a Cypher character. Check that you downloaded the Roll20 JSON from the " +
        `Cypher Tools character builder, not another format. (Expected kind "cypher-character", but ${found}.)`
    )
  }

  // The typeof half is load-bearing: '4' > 3 is true in JavaScript, so without it a
  // string version would be reported as a file from the future rather than a malformed
  // one. Every non-number version falls through to the validator's const failure.
  const version = doc.schemaVersion
  if (typeof version === 'number' && version > MAX_SUPPORTED_SCHEMA_VERSION) {
    return fail(
      FAILURE.NEWER_VERSION,
      `This character uses schema version ${version}, but this sheet supports ` +
        `${supportedVersionsPhrase()}. The sheet needs updating — the file is fine.`
    )
  }

  const { valid, errors } = validateCharacterRaw(doc)
  if (!valid) {
    // One labeled line per real problem, the first five shown and the rest counted (ddd-ag26).
    const { details, more } = describeCharacterErrors(errors, doc, { mode: 'import' })
    return fail(FAILURE.SCHEMA_INVALID, 'This file does not match the Cypher character schema.', details, more)
  }

  return { ok: true, doc }
}

const plain = (value) => JSON.parse(JSON.stringify(value))

// Wholesale replace (beacon-mapping §5 step 4). Incoming rows never carry _id
// (the schema forbids it); every row gets a fresh one. ui is never touched (§4).
export const applyDocument = (doc, { sheet, meta }) => {
  meta.name = doc.name
  sheet.sentence = plain(doc.sentence)
  sheet.tier = doc.tier
  sheet.effort = doc.effort
  sheet.xp = doc.xp
  sheet.storyXp = doc.storyXp
  sheet.resourcePoints = doc.resourcePoints
  sheet.rank = doc.rank
  sheet.advancement = plain(doc.advancement)
  sheet.pools = plain(doc.pools)
  sheet.recovery = plain(doc.recovery)
  sheet.wounds = plain(doc.wounds)
  sheet.shield = plain(doc.shield)
  sheet.armor = doc.armor
  sheet.armorModifiers = doc.armorModifiers
  sheet.cypherLimit = doc.cypherLimit
  sheet.genre = doc.genre
  sheet.subgenre = doc.subgenre
  sheet.portraitUrl = doc.portraitUrl
  // The five schemaVersion 3 keys are written on EVERY import, not only when the document
  // carries them (ddd-xrug). A version 2 document carries none of them, and a wholesale
  // replace must reset them to their defaults rather than leave the previous character's
  // damage track and Luck Pool sitting in the store (beacon-mapping §5 step 4).
  const v3 = v3Defaults()
  sheet.rules = doc.rules === undefined ? v3.rules : plain(doc.rules)
  sheet.damageTrack = doc.damageTrack === undefined ? v3.damageTrack : plain(doc.damageTrack)
  sheet.luck = doc.luck === undefined ? v3.luck : plain(doc.luck)
  sheet.stress = doc.stress === undefined ? v3.stress : plain(doc.stress)
  sheet.wearingArmor = doc.wearingArmor === undefined ? v3.wearingArmor : doc.wearingArmor
  ARRAY_KEYS.forEach((k) => {
    // The factory sits between the id and the document so the DOCUMENT still wins every key
    // it carries. It is there to supply stressCost for a version 2 ability row, which has
    // no such key and would otherwise export as undefined.
    sheet[k] = doc[k].map((row) => ({ _id: uuidv4(), ...rowFactories[k](), ...plain(row) }))
  })
  sheet.background = doc.background
  sheet.notes = doc.notes
}
