import handlebars from 'handlebars';

import baseTemplate from './templates/newRoll.hbs?raw';
import complexTemplate from './templates/complex.hbs?raw';

import header from './partials/header.hbs?raw';
import keyValues from './partials/keyValues.hbs?raw';
import textContent from './partials/textContent.hbs?raw';
import rollComponents from './partials/rollComponents.hbs?raw';
import rollTotal from './partials/rollTotal.hbs?raw';
import wrapper from './partials/wrapper.hbs?raw';

import { isGreater, isEqual, sumComponents, getDice, isArray, capitalize } from './expressions';

// Partials
handlebars.registerPartial('header', header);
handlebars.registerPartial('wrapper', wrapper);
handlebars.registerPartial('keyValues', keyValues);
handlebars.registerPartial('rollTotal', rollTotal);
handlebars.registerPartial('textContent', textContent);
handlebars.registerPartial('rollComponents', rollComponents);

// Helper functions for math/transformations
handlebars.registerHelper('sumComponents', sumComponents);
handlebars.registerHelper('getDice', getDice);
handlebars.registerHelper('isGreater', isGreater);
handlebars.registerHelper('isEqual', isEqual);
handlebars.registerHelper('isArray', isArray);
handlebars.registerHelper('capitalize', capitalize);

handlebars.registerHelper('not', (v) => !v);
handlebars.registerHelper('or', (a, b) => a || b);
handlebars.registerHelper('and', (a, b) => a && b);

/*
 Currently this quickstart features a single type of roll template, that can take any parameters.
 If you need other types for specific rolls, or displaying certain content, you can add to your list of templates
 and map the types in this file.

 Our advanced example sheet is much more involved, featuring a large number of different roll templates with helpers
 among other advanced features.
 */

const rollTemplates = {
  base: handlebars.compile(baseTemplate),
  complex: handlebars.compile(complexTemplate)
}

export const createRollTemplate = ({type,parameters}) => rollTemplates[type](parameters);
