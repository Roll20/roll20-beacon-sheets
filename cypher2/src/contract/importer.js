import { v4 as uuidv4 } from 'uuid'
import { validateDocument, SUPPORTED_SCHEMA_VERSION } from './validation.js'
import { ARRAY_KEYS } from '@/stores/sheetStore.js'

export const FAILURE = {
  NOT_JSON: 'not-json',
  WRONG_KIND: 'wrong-kind',
  NEWER_VERSION: 'newer-version',
  SCHEMA_INVALID: 'schema-invalid'
}

const fail = (code, message, details) => ({ ok: false, failure: { code, message, details } })

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
    const found = kind === undefined ? 'it has no kind field' : `found ${JSON.stringify(kind)}`
    return fail(
      FAILURE.WRONG_KIND,
      `This file is not a Cypher character: expected kind "cypher-character", but ${found}.`
    )
  }

  const version = doc.schemaVersion
  if (typeof version === 'number' && version > SUPPORTED_SCHEMA_VERSION) {
    return fail(
      FAILURE.NEWER_VERSION,
      `This character uses schema version ${version}, but this sheet supports version ` +
        `${SUPPORTED_SCHEMA_VERSION}. The sheet needs updating — the file is fine.`
    )
  }

  const { valid, errors } = validateDocument(doc)
  if (!valid) {
    return fail(
      FAILURE.SCHEMA_INVALID,
      'This file does not match the Cypher character schema.',
      errors.slice(0, 5)
    )
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
  ARRAY_KEYS.forEach((k) => {
    sheet[k] = doc[k].map((row) => ({ _id: uuidv4(), ...plain(row) }))
  })
  sheet.background = doc.background
  sheet.notes = doc.notes
}
