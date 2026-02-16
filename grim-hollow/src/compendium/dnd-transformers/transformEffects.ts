import { deepTransformFormulas } from './utils';
import { config } from '@/config';

type ActionGroup = 'actions' | 'bonus-actions' | 'reactions' | 'free-actions';

const actionTypeMap: Record<string, ActionGroup> = {
  Action: 'actions',
  'Bonus Action': 'bonus-actions',
  Reaction: 'reactions',
  'Free Action': 'free-actions',
};

const defenseMap: Record<string, string> = {
  Resistance: 'damage-resistances',
  Immunity: 'damage-immunities',
  Vulnerability: 'damage-vulnerabilities',
};

const proficiencyLevelMap: Record<string, number> = {
  Proficient: 1,
  Expertise: 2, 
};

/**
 * Builds an effect entry that is formula-aware.
 */
const buildFormulaEffect = (
  attribute: string,
  baseOperation: string,
  valueFormula: { flatValue?: number; customFormula?: string } | undefined,
): Record<string, any> => {
  const hasFormula = !!valueFormula?.customFormula;
  return {
    attribute,
    operation: hasFormula ? `${baseOperation}-formula` : baseOperation,
    ...(hasFormula
      ? { formula: valueFormula!.customFormula }
      : { value: valueFormula?.flatValue || 0 }),
  };
};

// This defines the fragment that a datarecord can be broken down into.
export interface EffectFragment {
  description?: string;
  effects?: any[];
  actions?: any[];
  resources?: any[];
  spells?: any[];
  pickers?: any[];
  spellSources?: any[];
}

/**
 * Transforms a single datarecord into an EffectFragment.
 */
export const createEffectFragment = (datarecord: any): EffectFragment | null => {
  try {
    const payload = deepTransformFormulas(JSON.parse(datarecord.payload));
    const fragment: EffectFragment = {};

    switch (payload.type) {
      case 'Features':
        fragment.description = payload.description || '';
        break;

      case 'Spell Attach': {
        const spellsToAttach = (payload.spells || []).map((spellName: string) => ({
          name: spellName,
          spellSourceId: '$source:0',
        }));
        if (spellsToAttach.length > 0) {
          fragment.spells = spellsToAttach;
          fragment.description = datarecord.description || '';
        }
        break;
      }

      case 'Action': {
        fragment.actions = [
          {
            name: payload.name,
            group: actionTypeMap[payload.actionType] || 'actions',
            description: payload.description,
            critRange: payload.critRange || 20,
            isAttack: false,
          },
        ];
        break;
      }

      case 'Attack': {
        const saveAbility = payload.save?.saveAbility?.toLowerCase();
        const attackAbility = payload.attack?.abilityBonus?.toLowerCase() || 'auto';
        const attackBonus = String(payload.attack?.bonus || '0');

        let savingDc = '0';
        if (saveAbility) {
          if (payload.save?.saveFlat) {
            savingDc = String(payload.save.saveFlat);
          } else {
            savingDc = `8 + @{pb} + @{${saveAbility}-modifier}`;
          }
        }

        fragment.actions = [
          {
            name: payload.name,
            group: actionTypeMap[payload.actionType] || 'actions',
            description: (payload.description || '').trim(),
            range: payload.range,
            isAttack: !!payload.attack,
            attackAbility: attackAbility,
            attackBonus: attackBonus,
            saving: saveAbility || 'none',
            savingDc: savingDc,
            critRange: payload.critRange || 20,
          },
        ];
        break;
      }

      case 'Proficiency': {
        const effects: any[] = [];
        const proficiencyMap: Record<string, string> = {
          'Saving Throw': `${payload.proficiency?.toLowerCase()}-saving-proficiency`,
          Armor: 'armor-proficiencies',
          Weapon: 'weapon-proficiencies',
          Skill: `${payload.proficiency?.toLowerCase().replace(/\s/g, '-')}-proficiency`,
          Tool: 'tool-proficiencies',
        };
        const attribute = proficiencyMap[payload.category];

        if (attribute) {
          const operation =
            payload.category === 'Saving Throw'
              ? 'set'
              : payload.category === 'Skill'
              ? 'set-max'
              : 'push';
          let value: string | number = 1;
          if (payload.category === 'Skill') {
            value = proficiencyLevelMap[payload.proficiencyLevel] || 1;
          } else if (payload.category !== 'Saving Throw') {
            value = payload.proficiency.toLowerCase().replace(/ /g, '-');
          }

          effects.push({ attribute, operation, value });
        }
        if (effects.length > 0) fragment.effects = effects;
        break;
      }

      case 'Resource': {
        let refreshOnLongRest: 'none' | 'all' | 'fixed-value' = 'none';
        let refreshOnLongRestAmount = '';
        let refreshOnShortRest: 'none' | 'all' | 'fixed-value' = 'none';
        let refreshOnShortRestAmount = '';
        let refreshOnDawn: 'none' | 'all' | 'fixed-value' = 'none';
        let refreshOnDawnAmount = '';

        if (typeof payload.recoveryRate === 'object' && payload.recoveryRate !== null) {
          const longRestData = payload.recoveryRate['Long Rest'];
          if (longRestData?.type === 'Full') {
            refreshOnLongRest = 'all';
          } else if (longRestData?.type === 'Calculation') {
            refreshOnLongRest = 'fixed-value';
            refreshOnLongRestAmount =
              longRestData.calculationFormula?.customFormula ||
              longRestData.rollFormula ||
              String(longRestData.calculationFormula?.flatValue || '');
          }

          const shortRestData = payload.recoveryRate['Short Rest'];
          if (shortRestData?.type === 'Full') {
            refreshOnShortRest = 'all';
          } else if (shortRestData?.type === 'Calculation') {
            refreshOnShortRest = 'fixed-value';
            refreshOnShortRestAmount =
              shortRestData.calculationFormula?.customFormula ||
              shortRestData.rollFormula ||
              String(shortRestData.calculationFormula?.flatValue || '');
          }

          const dawnData = payload.recoveryRate['Dawn'];
          if (dawnData?.type === 'Roll') {
            refreshOnDawn = 'fixed-value';
            refreshOnDawnAmount =
              dawnData.calculationFormula?.customFormula ||
              dawnData.rollFormula ||
              String(dawnData.calculationFormula?.flatValue || '');
          }
        } else if (
          typeof payload.recovery === 'string' &&
          typeof payload.recoveryRate === 'string'
        ) {
          if (payload.recovery === 'Long Rest' && payload.recoveryRate === 'Full') {
            refreshOnLongRest = 'all';
          }
          if (payload.recovery === 'Short Rest' && payload.recoveryRate === 'Full') {
            refreshOnShortRest = 'all';
          }
        }

        fragment.resources = [
          {
            name: payload.name,
            count:
              Number(payload.maxValueFormula?.customFormula) ||
              Number(payload.maxValueFormula?.flatValue || 0),
            max:
              payload.maxValueFormula?.customFormula ||
              String(payload.maxValueFormula?.flatValue || 0),
            refreshOnLongRest,
            refreshOnLongRestAmount,
            refreshOnShortRest,
            refreshOnShortRestAmount,
            refreshOnDawn,
            refreshOnDawnAmount,
          },
        ];
        break;
      }

      case 'Ability Score': {
        const operationMap: Record<string, string> = {
          Minimum: 'set-base',
          Modify: 'add',
          Add: 'add',
        };
        const operation = operationMap[payload.calculation] || 'add';
        const value = payload.valueFormula?.flatValue || payload.value || 1;

        fragment.effects = [
          {
            attribute: payload.ability.toLowerCase(),
            operation: operation,
            value: value,
          },
        ];
        
        break;
      }

      case 'Ability Score Choice': {
        fragment.pickers = [];
        fragment.effects = [];
        const numChoices = payload.choose || 1;
        const increase = payload.increase || 1;
        const options = (payload.from || config.abilities).map((ab: string) => ({
          label: ab.charAt(0).toUpperCase() + ab.slice(1),
          value: ab.toLowerCase(),
        }));

        for (let i = 0; i < numChoices; i++) {
          const pickerIndex = payload.pickerIndexOffset ? payload.pickerIndexOffset + i : i;
          fragment.pickers.push({
            label: `Ability Score Increase (+${increase})`,
            options,
            mandatory: true,
          });
          fragment.effects.push({
            attribute: `$picker:${pickerIndex}`,
            operation: 'add',
            value: increase,
          });
        }
        break;
      }

      case 'Roll Bonus': {
        if (
          !payload.bonusName ||
          !Array.isArray(payload.bonusName) ||
          payload.bonusName.length === 0
        ) {
          break;
        }

        const isAdvantage = payload.bonusDetails === 'Keep Highest';
        const isDisadvantage = payload.bonusDetails === 'Keep Lowest';

        if (isAdvantage || isDisadvantage) {
          const value = isAdvantage ? 1 : -1;

          const targetName = payload.bonusName[0].toLowerCase().replace(/\s/g, '-');
          const attribute = `${targetName}-action-die`;

          fragment.effects = [
            {
              attribute,
              operation: 'set',
              value,
            },
          ];
        }
        break;
      }

      case 'Language Choice': {
        fragment.pickers = [];
        fragment.effects = [];
        const numChoices = payload.numOfChoices || 1;
        const languageOptions = config.autocomplete.languages.map((lang: string) => ({
          label: lang.charAt(0).toUpperCase() + lang.slice(1),
          value: lang.toLowerCase(),
        }));

        for (let i = 0; i < numChoices; i++) {
          const pickerIndex = payload.pickerIndexOffset ? payload.pickerIndexOffset + i : i;
          fragment.pickers.push({
            label: `Language Choice`,
            options: languageOptions,
            mandatory: true,
          });
          fragment.effects.push({
            attribute: 'languages',
            operation: 'push',
            value: `$picker:${pickerIndex}`,
          });
        }
        break;
      }

      case 'Speed': {
        const operationMap: Record<string, string> = {
          'Set Base': 'set-base',
          'Set Value': 'set-base',
          Modify: 'add',
        };
        const baseOperation = operationMap[payload.calculation] || 'set-base';
        fragment.effects = [
          buildFormulaEffect(`${payload.speed.toLowerCase()}-speed`, baseOperation, payload.valueFormula),
        ];
        break;
      }

      case 'Sense': {
        fragment.effects = [
          buildFormulaEffect(`sense-${payload.name.toLowerCase()}`, 'set-base', payload.valueFormula),
        ];
        break;
      }

      case 'Language':
        fragment.effects = [
          {
            attribute: 'languages',
            operation: 'push',
            value: payload.name,
          },
        ];
        break;

      case 'Defense': {
        const attribute = defenseMap[payload.defense];
        if (payload.damage && attribute) {
          fragment.effects = [
            {
              attribute,
              operation: 'push',
              value: payload.damage.toLowerCase(),
            },
          ];
        }
        break;
      }

      case 'Spellcasting': {
        fragment.spellSources = [
          {
            name: payload.name || `${datarecord.name} Spellcasting`,
            type: 'ability',
            ability: payload.ability.toLowerCase(),
          },
        ];
        break;
      }

      case 'Armor Class': {
        const operationMap: Record<string, string> = {
          'Set Base': 'set-base',
          Modify: 'add',
          Override: 'set-base-final',
        };
        const calculation = payload.calculation || 'Modify';
        const baseOperation = operationMap[calculation] || 'add';
        fragment.effects = [
          buildFormulaEffect('armor-class', baseOperation, payload.valueFormula),
        ];
        break;
      }
    }

    return fragment;
  } catch (e) {
    console.warn(`Could not parse datarecord payload for "${datarecord.name}":`, e);
    return null;
  }
};
