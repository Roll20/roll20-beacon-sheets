import validate from './validate.js'
import validateV3 from './validateV3.js'

// The one place a schema version is named. A version is accepted because it has a
// validator here, so the version list and the routing cannot part company: adding a
// version without its validator is not expressible (spec §4). Old Gods of Appalachia and
// The Magnus Archives run on schemaVersion 3.
//
// A list of [version, validator] pairs, not an object literal, because object keys are
// strings: `{3: validateV3}[doc.schemaVersion]` would route the STRING "3" to the v3
// validator. selectValidator below compares with ===, so "3" misses, falls to the v2
// validator and gets the const failure on schemaVersion, which is the right answer for a
// malformed document.
//
// Frozen, and not a Map, because a Map cannot be made read-only. Object.freeze leaves
// set, delete and clear working, since the entries live in an internal slot rather than
// in own properties, and replacing those three mutators still lets
// `Map.prototype.set.call(table, 4, fn)` through. Measured both ways. A frozen array
// refuses every write route, the prototype call included, so a later edit of this table
// throws at the line that made it instead of routing a version that
// SUPPORTED_SCHEMA_VERSIONS below, a list built from this one, never advertised. A new
// version goes in this literal, where the list sees it too. Each pair is frozen as well,
// or the validator behind a version could be swapped in place. The freeze holds in both
// JavaScript modes; only the noise differs. Module code is always strict, so a write
// throws. A write from sloppy-mode code, a devtools console or a page.evaluate body, is
// rejected silently instead, so the table is intact either way.
//
// Exported only so that freeze has a test which can fail. Nothing in the sheet reads the
// table directly: routing goes through selectValidator and the version list through the
// two exports below. Frozen PLACES in fieldLabels.js is exported for the same reason.
export const VALIDATOR_ENTRIES = Object.freeze([
  Object.freeze([2, validate]),
  Object.freeze([3, validateV3])
])

// Ascending, so the maximum below and the 'and' member of the phrase are the same number
// however the table was written. Takes its entries, so a test can prove that on a table
// this module does not ship. Numerically, not as text: a default sort would put 10
// before 9.
//
// A version listed twice is the one ambiguity a list has and a Map did not. The list would
// advertise the version twice, reading 'versions 2 and 2', while selectValidator routed to
// whichever pair came first. A Map collapsed a repeated key to the last validator instead,
// which parts the routing from the advertised list in the other direction. Both are
// states this module must not boot in, and a repeated version can arrive from a hand edit
// or a bad merge, so the list refuses to build (2026-10-30 audit round 2).
export const supportedVersionsOf = (entries) => {
  const versions = entries.map(([version]) => version)
  if (new Set(versions).size !== versions.length) {
    throw new TypeError(`the schema-version table lists a version twice: ${versions.join(', ')}`)
  }
  return Object.freeze(versions.sort((a, b) => a - b))
}

export const SUPPORTED_SCHEMA_VERSIONS = supportedVersionsOf(VALIDATOR_ENTRIES)
export const MAX_SUPPORTED_SCHEMA_VERSION = Math.max(...SUPPORTED_SCHEMA_VERSIONS)

// One phrase, read by the importer's refusal message and the import panel's hint, so
// neither spells the version list itself. Takes its list for the same reason as above.
// Singular when one version is left: dropping v2 support would otherwise leave the sheet
// saying 'versions 3'. An empty list means the sheet has no validator for anything, so it
// says so loudly rather than printing 'versions undefined' at a player.
export const versionsPhrase = (versions) => {
  if (versions.length === 0) throw new TypeError('no supported schema versions')
  const label = versions.length === 1 ? 'version' : 'versions'
  const head = versions.slice(0, -1).join(', ')
  const last = versions[versions.length - 1]
  return `${label} ${head ? `${head} and ${last}` : last}`
}

export const supportedVersionsPhrase = () => versionsPhrase(SUPPORTED_SCHEMA_VERSIONS)

// A document names the schema it was written against, so it names its own validator.
// A version with no pair at all falls to the v2 validator, which refuses it; that is how
// schemaVersion 1 and a missing schemaVersion are caught. A version that HAS a pair gets
// that pair's validator even when the validator is nullish: `??` would have sent
// [4, undefined] to the v2 validator while the version list advertised 4 as supported, so
// the refusal would have named the wrong field. Handing back the nullish entry makes the
// next line a TypeError.
export const selectValidator = (entries, version) => {
  const pair = entries.find(([candidate]) => candidate === version)
  return pair === undefined ? validate : pair[1]
}

const validatorFor = (doc) => selectValidator(VALIDATOR_ENTRIES, doc?.schemaVersion)

// '/skills/0/rating' -> '$.skills[0].rating' (the contract manifest's path convention)
export const formatPath = (instancePath) => {
  if (!instancePath) return '$'
  return (
    '$' +
    instancePath
      .split('/')
      .slice(1)
      .map((seg) => (/^\d+$/.test(seg) ? `[${seg}]` : `.${seg}`))
      .join('')
  )
}

export const formatError = (e) => {
  const path = formatPath(e.instancePath)
  if (e.keyword === 'required') return `${path}: '${e.params.missingProperty}' is a required property`
  if (e.keyword === 'enum')
    return `${path}: ${JSON.stringify(e.data)} is not one of ${JSON.stringify(e.params.allowedValues)}`
  if (e.keyword === 'additionalProperties')
    return `${path}: Additional properties are not allowed ('${e.params.additionalProperty}' was unexpected)`
  // The creature schema's blank-action rule is the only `not` at a combat action item.
  // Ajv's own "must NOT be valid" names no field for the GM to fix (ddd-4r4a).
  if (e.keyword === 'not' && /^\/combatActions\/\d+$/.test(e.instancePath))
    return `${path}: a combat action needs a title or a description`
  return `${path}: ${e.message}`
}

// Ajv hangs .errors on the function object, so both readers below take them from the
// validator they actually ran. Reading them from the module-level `validate` instead
// reports the previous call's errors, or none at all.

// The raw Ajv errors, for the character panel's labeled messages (fieldLabels.js,
// ddd-ag26). Shallow copies: callers keep them past the next validate call, and Ajv's
// habit of allocating a fresh array per call is not a contract.
export const validateCharacterRaw = (doc) => {
  const validator = validatorFor(doc)
  const valid = validator(doc)
  if (valid) return { valid: true, errors: [] }
  return { valid: false, errors: (validator.errors ?? []).map((e) => ({ ...e })) }
}

export const validateDocument = (doc) => {
  const validator = validatorFor(doc)
  const valid = validator(doc)
  if (valid) return { valid: true, errors: [] }
  return { valid: false, errors: (validator.errors ?? []).map(formatError) }
}
