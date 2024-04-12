import handlebars from 'handlebars'
import template from './index.hbs?raw'

const rollTemplates = {
  base: handlebars.compile(template)
};

export const createRollTemplate = (parameters) => {
  return rollTemplates.base(parameters);
};
