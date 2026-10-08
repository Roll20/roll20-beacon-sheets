import validate from './validate.js'
import validateV3 from './validateV3.js'

// The one place a schema version is named. A version is accepted because it has a
// validator here, so the version list and the routing cannot part company: adding a
// version without its validator is not expressible (spec §4). Old Gods of Appalachia and
// The Magnus Archives run on schemaVersion 3.
//
// A Map, not an object literal, because object keys are strings: `{3: validateV3}[
// doc.schemaVersion]` would route the STRING "3" to the v3 validator. A Map keyed by
// number misses on "3", which then falls to the v2 validator and gets the const failure
// on schemaVersion, which is the right answer for a malformed document.
const VALIDATORS = new Map([
  [2, validate],
  [3, validateV3]
])

export const SUPPORTED_SCHEMA_VERSIONS = Object.freeze([...VALIDATORS.keys()])
export const MAX_SUPPORTED_SCHEMA_VERSION = Math.max(...SUPPORTED_SCHEMA_VERSIONS)

// One phrase, read by the importer's refusal message and the import panel's hint, so
// neither spells the version list itself.
export const supportedVersionsPhrase = () => {
  const head = SUPPORTED_SCHEMA_VERSIONS.slice(0, -1).join(', ')
  const last = SUPPORTED_SCHEMA_VERSIONS[SUPPORTED_SCHEMA_VERSIONS.length - 1]
  return `versions ${head ? `${head} and ${last}` : last}`
}

// A document names the schema it was written against, so it names its own validator.
// Anything with no validator of its own falls to the v2 one, which refuses it.
const validatorFor = (doc) => VALIDATORS.get(doc?.schemaVersion) ?? validate

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
