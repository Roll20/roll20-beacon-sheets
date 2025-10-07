import handlebars from 'handlebars';

// @ts-ignore
import chatRollTemplate from './templates/chat.hbs?raw';
// @ts-ignore
import basicRollTemplate from './templates/basicRoll.hbs?raw';
// @ts-ignore
import d20RollTemplate from './templates/d20Roll.hbs?raw';
// @ts-ignore
import damageRollTemplate from './templates/damageRoll.hbs?raw';
// @ts-ignore
import cardTemplate from './partials/card.hbs?raw';
// @ts-ignore
import keyValues from './partials/keyValues.hbs?raw';
// @ts-ignore
import textContent from './partials/textContent.hbs?raw';
// @ts-ignore
import rollComponents from './partials/rollComponents.hbs?raw';
// @ts-ignore
import rollTotal from './partials/rollTotal.hbs?raw';
// @ts-ignore
import header from './partials/header.hbs?raw';
// @ts-ignore
import heroDie from './partials/heroDie.hbs?raw';

import { isGreater } from './expressions/isGreater';
import { isEqual } from './expressions/isEqual';
import { sumComponents } from './expressions/sumComponents';
import { getDice } from './expressions/getDice';
import { isArray } from './expressions/isArray';
import { capitalize } from './expressions/capitalize';

handlebars.registerPartial('header', header);
handlebars.registerPartial('keyValues', keyValues);
handlebars.registerPartial('rollTotal', rollTotal);
handlebars.registerPartial('textContent', textContent);
handlebars.registerPartial('rollComponents', rollComponents);
handlebars.registerPartial('heroDie', heroDie);
handlebars.registerPartial('card', cardTemplate);

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
  d20: handlebars.compile(d20RollTemplate),
  damage: handlebars.compile(damageRollTemplate),
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
  /** Indicates whether or not to always show this component in the breakdown, even if it's 0 */
  alwaysShowInBreakdown?: boolean;
};

// Generic params used by our 2 templates. These can be changed for your own templates.
type CommonParameters = {
  characterName?: string;
  title: string;
  subtitle?: string;
  sourceType?: 'action' | 'spell' | 'feature' | 'item';
  properties?: Record<string, string | number | boolean>;
  description?: string;
  keyValues?: Record<string, string | number | boolean>;
  textContent?: string | string[];
};

export type RollToChatTemplate = {
  type: 'roll';
  parameters: CommonParameters & {
    components: DiceComponent[];
    resultType?: 'crit-success' | 'crit-fail';
    damageRollAction?: string;
  };
};

export type D20RollTemplate = {
  type: 'd20';
  parameters: CommonParameters & {
    total: number;
    components: DiceComponent[];
    d20s: { value: number; kept: boolean }[];
    resultType?: 'crit-success' | 'crit-fail';
    isRestricted?: boolean;
  };
};
export type DamageRollTemplate = {
  type: 'damage';
  parameters: CommonParameters & {
    damageGroups: {
      type: string;
      total: number;
      components: DiceComponent[];
    }[];
    isCrit: boolean;
    resultType?: 'crit-success' | 'crit-fail';
    grandTotal: number;
  };
};

export type ChatInfoTemplate = {
  type: 'chat';
  parameters: CommonParameters;
};

export type AnyRollTemplate =
  | ChatInfoTemplate
  | RollToChatTemplate
  | D20RollTemplate
  | DamageRollTemplate;

export const createRollTemplate = ({ type, parameters }: AnyRollTemplate) => {
  const template = rollTemplates[type];
  const rollTemplate = template(parameters);
  return rollTemplate;
};
