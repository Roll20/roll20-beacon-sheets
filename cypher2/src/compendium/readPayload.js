import validateDropPayload from '@/contract/validateDropPayload.js'

// Reads a fetched page's data-CypherItem (spec ⑥ §4.2 step 5). Pure: no store, no
// dispatch. The caller maps each reason to its message.
export const CYPHER_ITEM_ATTRIBUTE = 'data-CypherItem'
export const SUPPORTED_CONTRACT_VERSION = 2

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// "Newer" tells the player the page is fine, so it demands the whole envelope shape.
// `kind` may be any string: a later contract may add a kind this sheet has never seen.
const isNewer = (envelope) =>
  isPlainObject(envelope) &&
  Number.isInteger(envelope.contractVersion) &&
  envelope.contractVersion > SUPPORTED_CONTRACT_VERSION &&
  typeof envelope.kind === 'string' &&
  isPlainObject(envelope.item)

export const readPayload = (properties) => {
  const raw = isPlainObject(properties) ? properties[CYPHER_ITEM_ATTRIBUTE] : undefined
  if (raw === undefined || raw === null) return { ok: false, reason: 'malformed' }
  let envelope = raw
  if (typeof raw === 'string') {
    try {
      envelope = JSON.parse(raw)
    } catch {
      return { ok: false, reason: 'malformed' }
    }
  }
  if (isNewer(envelope)) return { ok: false, reason: 'newer' }
  if (!validateDropPayload(envelope)) {
    return { ok: false, reason: 'unreadable', errors: validateDropPayload.errors ?? [] }
  }
  return { ok: true, envelope }
}
