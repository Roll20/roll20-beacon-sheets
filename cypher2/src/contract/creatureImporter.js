import { FAILURE } from './failure.js'
import { validateCreatureDocument, SUPPORTED_CREATURE_SCHEMA_VERSION } from './creatureValidation.js'
import { CREATURE_KIND } from '@/creature/creature.js'

const fail = (code, message, details) => ({ ok: false, failure: { code, message, details } })

// Pure: parses and validates, never touches stores (spec §8.1 steps 1–2).
// The caller confirms with the user, then applies (steps 3–4). The four failure
// codes are the character importer's, so both panels speak the same language.
export const parseAndValidateCreature = (text) => {
  let doc
  try {
    doc = JSON.parse(text)
  } catch (e) {
    return fail(FAILURE.NOT_JSON, `This file is not valid JSON. ${e.message}`)
  }

  const kind = doc?.kind
  // A character export is the likeliest wrong file in a GM's downloads, so it is
  // named for what it is rather than reported as a bare kind mismatch.
  if (kind === 'cypher-character') {
    return fail(
      FAILURE.WRONG_KIND,
      `This is a Cypher character file, not a creature: expected kind "${CREATURE_KIND}". ` +
        'Import characters from a sheet in Character mode.'
    )
  }
  if (kind !== CREATURE_KIND) {
    const found = kind === undefined ? 'it has no kind field' : `found ${JSON.stringify(kind)}`
    return fail(
      FAILURE.WRONG_KIND,
      `This file is not a Cypher creature: expected kind "${CREATURE_KIND}", but ${found}.`
    )
  }

  const version = doc.schemaVersion
  if (typeof version === 'number' && version > SUPPORTED_CREATURE_SCHEMA_VERSION) {
    return fail(
      FAILURE.NEWER_VERSION,
      `This creature uses schema version ${version}, but this sheet supports version ` +
        `${SUPPORTED_CREATURE_SCHEMA_VERSION}. The sheet needs updating — the file is fine.`
    )
  }

  const { valid, errors } = validateCreatureDocument(doc)
  if (!valid) {
    return fail(
      FAILURE.SCHEMA_INVALID,
      'This file does not match the Cypher creature schema.',
      errors.slice(0, 5)
    )
  }

  return { ok: true, doc }
}
