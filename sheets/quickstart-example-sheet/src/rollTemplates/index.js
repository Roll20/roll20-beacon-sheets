import handlebars from 'handlebars'
import template from './index.hbs?raw'

/*
 Currently this quickstart features a single type of roll template, that can take any parameters.
 If you need other types for specific rolls, or displaying certain content, you can add to your list of templates
 and map the types in this file.

 Our advanced example sheet is much more involved, featuring a large number of different roll templates with helpers
 among other advanced features.
 */

const rollTemplates = {
  base: handlebars.compile(template)
}

export const createRollTemplate = (parameters) => {
  return rollTemplates.base(parameters)
}
