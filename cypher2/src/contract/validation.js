import validate from './validate.js'

export const SUPPORTED_SCHEMA_VERSION = 2

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

// The raw Ajv errors, for the character panel's labeled messages (fieldLabels.js,
// ddd-ag26). Shallow copies: callers keep them past the next validate call, and Ajv's
// habit of allocating a fresh array per call is not a contract.
export const validateCharacterRaw = (doc) => {
  const valid = validate(doc)
  if (valid) return { valid: true, errors: [] }
  return { valid: false, errors: (validate.errors ?? []).map((e) => ({ ...e })) }
}

export const validateDocument = (doc) => {
  const valid = validate(doc)
  if (valid) return { valid: true, errors: [] }
  return { valid: false, errors: (validate.errors ?? []).map(formatError) }
}
