import handlebars from 'handlebars';

// @ts-ignore
import chatRollTemplate from './templates/chat.hbs?raw';
// @ts-ignore
import basicRollTemplate from './templates/basicRoll.hbs?raw';
// @ts-ignore
import keyValues from './partials/keyValues.hbs?raw';
// @ts-ignore
import textContent from './partials/textContent.hbs?raw';
// @ts-ignore
import rollComponents from './partials/rollComponents.hbs?raw';
// @ts-ignore
import wrapper from './partials/wrapper.hbs?raw';
// @ts-ignore
import rollTotal from './partials/rollTotal.hbs?raw';
// @ts-ignore
import header from './partials/header.hbs?raw';
// @ts-ignore
import critRoll from './partials/critRoll.hbs?raw';

import { isGreater } from './expressions/isGreater';
import { isEqual } from './expressions/isEqual';
import { sumComponents } from './expressions/sumComponents';
import { getDice } from './expressions/getDice';
import { isArray } from './expressions/isArray';
import { capitalize } from './expressions/capitalize';

/* All custom chat templates (called "roll templates" are created at run-time through handlebars based on this config */

// Re-usable handlebars HTML partials.
handlebars.registerPartial('header', header);
handlebars.registerPartial('wrapper', wrapper);
handlebars.registerPartial('keyValues', keyValues);
handlebars.registerPartial('rollTotal', rollTotal);
handlebars.registerPartial('textContent', textContent);
handlebars.registerPartial('rollComponents', rollComponents);
handlebars.registerPartial('critRoll', critRoll);

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

// We have 2 base templates. One for when dice are rolled and one for just rendering information.
const rollTemplates = {
  chat: handlebars.compile(chatRollTemplate),
  roll: handlebars.compile(basicRollTemplate),
};

// This corresponds to the data returned by Beacon when you ask it to roll dice for you.
// You may want to re-use this to simplify crafting your own templates.
export type DiceComponent = {
  /** The number of sides the die has */
  sides?: number;
  /** The number of dice with the amount of sides */
  count?: number;
  /** A string-based formula to roll, used instead of sides and count */
  rollFormula?: string;
  /** The label to show where this came from, primarily used for static bonuses */
  label?: string;
  /** The numerical value that is the number rolled on the dice, or the value of the bonus */
  value?: number;
  /** Indicates whether or not this value is negative (and should be shown in breakdown as -value) */
  negative?: boolean;
  /** Indicates whether or not to always show this component in the breakdown, even if it's 0 */
  alwaysShowInBreakdown?: boolean;
};

// Generic params used by our 2 templates. These can be changed for your own templates.
type CommonParameters = {
  characterName?: string;
  title: string;
  subtitle?: string;
  keyValues?: Record<string, string | number | boolean>;
  traits?: string[];
  textContent?: string | string[];
};

export type SendToChatTemplate = {
  type: 'chat';
  parameters: CommonParameters;
};

export type RollToChatTemplate = {
  type: 'roll';
  parameters: CommonParameters & {
    components: DiceComponent[];
    multiplier?: number;
    resultType?: 'crit-success' | 'crit-fail';
    allowCrit?: boolean;
    naturalRoll?: number;
    confirmationRoll?: number;
  };
};

export type AnyRollTemplate = SendToChatTemplate | RollToChatTemplate;

// Returns the final HTML for a given template using all the required data.
export const createRollTemplate = ({ type, parameters }: AnyRollTemplate) => {
  const template = rollTemplates[type];
  const rollTemplate = template(parameters);
  return rollTemplate;
};
