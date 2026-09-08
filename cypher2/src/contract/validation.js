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

const formatError = (e) => {
  const path = formatPath(e.instancePath)
  if (e.keyword === 'required') return `${path}: '${e.params.missingProperty}' is a required property`
  if (e.keyword === 'enum')
    return `${path}: ${JSON.stringify(e.data)} is not one of ${JSON.stringify(e.params.allowedValues)}`
  if (e.keyword === 'additionalProperties')
    return `${path}: Additional properties are not allowed ('${e.params.additionalProperty}' was unexpected)`
  return `${path}: ${e.message}`
}

export const validateDocument = (doc) => {
  const valid = validate(doc)
  if (valid) return { valid: true, errors: [] }
  return { valid: false, errors: (validate.errors ?? []).map(formatError) }
}
