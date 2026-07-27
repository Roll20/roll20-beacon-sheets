import handlebars from 'handlebars';
import { getActivePinia } from 'pinia';
import { biographyStore } from '@/sheet/stores/biography/biographyStore';

import chatRollTemplate from './templates/chat.hbs?raw';

import basicRollTemplate from './templates/basicRoll.hbs?raw';

import successRollTemplate from './templates/successRoll.hbs?raw';

import actionDamageRollTemplate from './templates/actionDamageRoll.hbs?raw';

import numberOnlyTemplate from './templates/numberOnly.hbs?raw';

import keyValues from './partials/keyValues.hbs?raw';

import textContent from './partials/textContent.hbs?raw';

import rollComponents from './partials/rollComponents.hbs?raw';

import wrapper from './partials/wrapper.hbs?raw';

import rollTotal from './partials/rollTotal.hbs?raw';

import header from './partials/header.hbs?raw';

import { isGreater } from './expressions/isGreater';
import { isEqual } from './expressions/isEqual';
import { sumComponents } from './expressions/sumComponents';
import { getDice } from './expressions/getDice';
import { isArray } from './expressions/isArray';
import { capitalize } from './expressions/capitalize';
import { canPushRoll } from './expressions/canPushRoll';

handlebars.registerPartial('header', header);
handlebars.registerPartial('wrapper', wrapper);
handlebars.registerPartial('keyValues', keyValues);
handlebars.registerPartial('rollTotal', rollTotal);
handlebars.registerPartial('textContent', textContent);
handlebars.registerPartial('rollComponents', rollComponents);

handlebars.registerHelper('sumComponents', sumComponents);
handlebars.registerHelper('getDice', getDice);
handlebars.registerHelper('isGreater', isGreater);
handlebars.registerHelper('isEqual', isEqual);
handlebars.registerHelper('isArray', isArray);
handlebars.registerHelper('capitalize', capitalize);
handlebars.registerHelper('canPushRoll', canPushRoll);
handlebars.registerHelper('isNumber', (v) => typeof v === 'number');

handlebars.registerHelper('not', (v) => !v);
handlebars.registerHelper('or', (a, b) => a || b);
handlebars.registerHelper('and', (a, b) => a && b);

const rollTemplates = {
  chat: handlebars.compile(chatRollTemplate),
  roll: handlebars.compile(basicRollTemplate),
  successRoll: handlebars.compile(successRollTemplate),
  actionDamageRoll: handlebars.compile(actionDamageRollTemplate),
  numberOnly: handlebars.compile(numberOnlyTemplate),
};

export type DiceComponent = {
  
  sides?: number;
  
  count?: number;
  
  rollFormula?: string;
  
  label?: string;
  
  value?: number;
  
  alwaysShowInBreakdown?: boolean;
  
  rolledDice?: string[];
  
  rolledDiceTooltip?: string;
  
  isDamage?: boolean;
  
  rawResults?: number[];
};

export type DiceComponentGroup = DiceComponent[] | Record<string, DiceComponent[]>;

export type CommonParameters = {
  characterName?: string;
  title: string;
  subtitle?: string;
  description?: string;
  keyValues?: Record<string, string | number | boolean>;
  traits?: string[];
  textContent?: string | string[];
  visibility?: 'gm' | 'secret';
  rollTemplate?: string;
  heroColor?: string;
  heroColorSecondary?: string;
  heroColorBlood?: string;
  total?: number | string;
};

export type SendToChatTemplate = {
  type: 'chat';
  parameters: CommonParameters;
};

export type RollParameters = CommonParameters & {
  components: DiceComponentGroup;
  multiplier?: number;
  resultType?: 'crit-success' | 'crit-fail';
  totalSuccesses?: number;
  totalDamage?: number;
};

export type RollToChatTemplate = {
  type: 'roll';
  parameters: RollParameters;
};

export type AnyRollTemplate = SendToChatTemplate | RollToChatTemplate;

export const createRollTemplate = ({ type, parameters }: AnyRollTemplate) => {
  let heroColor = '249 234 45';
  let heroColorSecondary = '9 102 174';
  let heroColorBlood = '190 4 20';

  if (getActivePinia()) {
    try {
      const bio = biographyStore();
      if (bio.avatarColors) {
        heroColor = bio.avatarColors.heroColor || heroColor;
        heroColorSecondary = bio.avatarColors.heroColorSecondary || heroColorSecondary;
        heroColorBlood = bio.avatarColors.heroColorBlood || heroColorBlood;
      }
    } catch (e) {
      
    }
  }

  const templateName = parameters.rollTemplate || type;
  const template = rollTemplates[templateName as keyof typeof rollTemplates] || rollTemplates.roll;
  const rollTemplate = template({
    heroColor,
    heroColorSecondary,
    heroColorBlood,
    ...parameters,
  });
  return rollTemplate;
};
