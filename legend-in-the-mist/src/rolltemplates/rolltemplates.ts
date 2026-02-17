import handlebars from 'handlebars';

// @ts-ignore
import chatRollTemplate from './templates/chat.hbs?raw';
// @ts-ignore
import basicRollTemplate from './templates/basicRoll.hbs?raw';
// @ts-ignore
import rollComponents from './partials/rollComponents.hbs?raw';
// @ts-ignore
import wrapper from './partials/wrapper.hbs?raw';
// @ts-ignore
import rollTotal from './partials/rollTotal.hbs?raw';
// @ts-ignore
import header from './partials/header.hbs?raw';

import { isGreater } from './expressions/isGreater';
import { isEqual } from './expressions/isEqual';
import { sumComponents } from './expressions/sumComponents';
import { getDice } from './expressions/getDice';
import { isArray } from './expressions/isArray';
import { capitalize } from './expressions/capitalize';
import { getRollResultType } from './expressions/getRollResultType';
import { getRollPower } from './expressions/getRollPower';

handlebars.registerPartial('header', header);
handlebars.registerPartial('wrapper', wrapper);
handlebars.registerPartial('rollTotal', rollTotal);
handlebars.registerPartial('rollComponents', rollComponents);

handlebars.registerHelper('sumComponents', sumComponents);
handlebars.registerHelper('getDice', getDice);
handlebars.registerHelper('isGreater', isGreater);
handlebars.registerHelper('isEqual', isEqual);
handlebars.registerHelper('isArray', isArray);
handlebars.registerHelper('capitalize', capitalize);
handlebars.registerHelper('getRollResultType', getRollResultType);
handlebars.registerHelper('getRollPower', getRollPower);

handlebars.registerHelper('not', (v) => !v);
handlebars.registerHelper('or', (a, b) => a || b);
handlebars.registerHelper('and', (a, b) => a && b);

const rollTemplates = {
  chat: handlebars.compile(chatRollTemplate),
  roll: handlebars.compile(basicRollTemplate),
};

export type DiceComponent = {
  sides?: number;
  count?: number;
  rollFormula?: string;
  label?: string;
  value?: number;
  alwaysShowInBreakdown?: boolean;
};

export type CommonParameters = {
  characterName?: string;
  title: string;
};

export type SendToChatTemplate = {
  type: 'chat';
  parameters: CommonParameters;
};

export type RollToChatTemplate = {
  type: 'roll';
  parameters: CommonParameters & {
    components: DiceComponent[];
  };
};

export type AnyRollTemplate = SendToChatTemplate | RollToChatTemplate;

export const createRollTemplate = ({ type, parameters }: AnyRollTemplate) => {
  const template = rollTemplates[type];
  const rollTemplate = template(parameters);
  return rollTemplate;
};
