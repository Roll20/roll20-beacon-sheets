import handlebars from 'handlebars';

import chatRollTemplate from './templates/chat.hbs?raw';
import basicRollTemplate from './templates/basicRoll.hbs?raw';

import keyValues from './partials/keyValues.hbs?raw';
import textContent from './partials/textContent.hbs?raw';
import rollComponents from './partials/rollComponents.hbs?raw';
import wrapper from './partials/wrapper.hbs?raw';
import rollTotal from './partials/rollTotal.hbs?raw';
import header from './partials/header.hbs?raw';
import heroDie from './partials/heroDie.hbs?raw';

import { isGreater } from './expressions/isGreater';
import { isEqual } from './expressions/isEqual';
import { sumComponents } from './expressions/sumComponents';
import { getDice } from './expressions/getDice';
import { isArray } from './expressions/isArray';
import { capitalize } from './expressions/capitalize';

handlebars.registerPartial('header', header);
handlebars.registerPartial('wrapper', wrapper);
handlebars.registerPartial('keyValues', keyValues);
handlebars.registerPartial('rollTotal', rollTotal);
handlebars.registerPartial('textContent', textContent);
handlebars.registerPartial('rollComponents', rollComponents);
handlebars.registerPartial('heroDie', heroDie);

handlebars.registerHelper('sumComponents', sumComponents);
handlebars.registerHelper('getDice', getDice);
handlebars.registerHelper('isGreater', isGreater);
handlebars.registerHelper('isEqual', isEqual);
handlebars.registerHelper('isArray', isArray);
handlebars.registerHelper('capitalize', capitalize);

handlebars.registerHelper('not', (v) => !v);
handlebars.registerHelper('or', (a, b) => a || b);
handlebars.registerHelper('and', (a, b) => a && b);

const rollTemplates = {
  chat: handlebars.compile(chatRollTemplate),
  roll: handlebars.compile(basicRollTemplate),
};

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
  /** Indicates whether or not to always show this component in the breakdown, even if it's 0 */
  alwaysShowInBreakdown?: boolean;
};

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
    allowHeroDie?: boolean;
  };
};

export type AnyRollTemplate = SendToChatTemplate | RollToChatTemplate;

export const createRollTemplate = ({ type, parameters }: AnyRollTemplate) => {
  const template = rollTemplates[type];
  const rollTemplate = template(parameters);
  return rollTemplate;
};
