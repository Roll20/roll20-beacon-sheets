import validateCreature from './validateCreature.js'
import { formatError } from './validation.js'

export const SUPPORTED_CREATURE_SCHEMA_VERSION = 1

// Same result shape and error format as validateDocument, against the creature
// schema (NPC mode spec §4). Pure: no Vue, no Pinia, no DOM.
export const validateCreatureDocument = (doc) => {
  const valid = validateCreature(doc)
  if (valid) return { valid: true, errors: [] }
  return { valid: false, errors: (validateCreature.errors ?? []).map(formatError) }
}
