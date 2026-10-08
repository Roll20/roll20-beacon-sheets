import handlebars from 'handlebars/runtime'

import rollTemplate from './templates/roll.hbs'
import chatTemplate from './templates/chat.hbs'
import techniqueTemplate from './templates/technique.hbs'

import header from './partials/header.hbs'
import components from './partials/components.hbs'
import keyValues from './partials/keyValues.hbs'
import textContent from './partials/textContent.hbs'

const compiled = (spec) => handlebars.template(spec)

handlebars.registerPartial('header', compiled(header))
handlebars.registerPartial('components', compiled(components))
handlebars.registerPartial('keyValues', compiled(keyValues))
handlebars.registerPartial('textContent', compiled(textContent))

handlebars.registerHelper('isEqual', (a, b) => a === b)
handlebars.registerHelper('isGreaterOrEqual', (a, b) => Number(a) >= Number(b))
handlebars.registerHelper('isArray', (v) => Array.isArray(v))

const rollTemplates = {
  roll: compiled(rollTemplate),
  chat: compiled(chatTemplate),
  technique: compiled(techniqueTemplate),
}

export const TEMPLATE_TYPES = Object.keys(rollTemplates)

export const createRollTemplate = ({ type = 'roll', parameters = {} } = {}) => {
  const template = rollTemplates[type]
  if (!template) throw new Error(`Unknown roll template type: ${type}`)
  return template(parameters)
}
