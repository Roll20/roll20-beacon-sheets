import { evaluate } from 'mathjs';
import type {
  Effect,
  SingleEffect,
  ExtendedSingleEffect,
  DicePool,
  EffectsDescriptionList,
  ModifierBreakdown,
  Picker,
} from '@/sheet/stores/modifiers/modifiersStore';
import { createComponentsFromFormula, getDicePoolAverage } from '@/utility/diceParser';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';
import { config } from '@/config';
import { parseFormula, parseFormulaAndEvaluate } from '@/sheet/stores/formulas';
import { type Spell, type SpellSource, useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { type Action, useActionsStore } from '@/sheet/stores/actions/actionsStore';
import { type Resource, useResourcesStore } from '@/sheet/stores/resources/resourcesStore';
import { type TagGroup, useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { v4 as uuidv4 } from 'uuid';

const operationPriority: Record<SingleEffect['operation'], number> = {
  'set-base': 1,
  'set-base-formula': 1,
  'set-base-final': 1,
  'set-base-final-formula': 1,
  add: 2,
  'add-formula': 2,
  subtract: 3,
  'subtract-formula': 3,
  set: 4,
  'set-formula': 4,
  'set-final': 4,
  'set-final-formula': 4,
  'set-min': 5,
  'set-min-formula': 5,
  'set-max': 6,
  'set-max-formula': 6,

  push: 7,
};

function getPicker<T extends string | string[]>(value: T, pickers?: Picker[]): T {
  const regex = /^\$picker:[0-9]+/;
  const values = Array.isArray(value) ? [...value] : [value];
  
  let broken = false;
  
  values.forEach((val, i) => {
    if (!regex.test(val)) return;
    const index = parseInt(val.split(':')[1]);
    if (Array.isArray(pickers) && pickers[index]) {
      const picker = pickers[index];
      if(picker.value) {
        values[i] = String(picker.value);
      } else {
        broken = true;
      }
    }
  });

  if(broken) return Array.isArray(value) ? ([] as unknown as T) : ('' as T);
  return Array.isArray(value) ? (values as T) : (values[0] as T);
}


const defaultGetters = {
  actions: (patch: Partial<Action>) => useActionsStore().getEmptyAction(patch),
  resources: (patch: Partial<Resource>) => useResourcesStore().getEmptyResource(patch),
  spells: (patch: Partial<Spell>) => useSpellsStore().getEmptySpell(patch),
  spellSources: (patch: Partial<SpellSource>) => useSpellsStore().getEmptySource(patch),
};

function getValidEffects(
  allEffects: Effect[],
  attribute: string | string[],
  isActiveCheck: (effect: Effect, singleEffect: SingleEffect) => boolean,
): ExtendedSingleEffect[] {
  const attributesToCheck = Array.isArray(attribute) ? attribute : [attribute];
  const validEffects: ExtendedSingleEffect[] = [];

  allEffects.forEach((effect) => {
    (effect.effects || []).forEach((single) => {
      let attribute = single.attribute;

      attribute = getPicker(attribute, effect.pickers);

      if (isActiveCheck(effect, single) && attributesToCheck.includes(attribute)) {
        validEffects.push({
          label: effect.label,
          description: effect.description,
          pickers: effect.pickers,
          ...single,
        });
      }
    });
  });

  validEffects.sort((a, b) => operationPriority[a.operation] - operationPriority[b.operation]);
  return validEffects;
}

function constrain(value: number, constrainTo: number[]) {
  const candidates = constrainTo.filter((v) => v <= value);
  if (candidates.length === 0) return Math.min(...constrainTo);
  return Math.max(...candidates);
}

function collectFromEffects<T extends { _id: string }>(
  allEffects: Effect[],
  key: 'actions' | 'resources' | 'spellSources' | 'spells',
  isActiveCheck: (effect: Effect) => boolean,
): (T & { isFromEffect: true; sourceEffectId: string; sourceEffectLabel: string })[] {
  const collectedItems: (T & {
    isFromEffect: true;
    sourceEffectId: string;
    sourceEffectLabel: string;
  })[] = [];

  const getDefault = defaultGetters[key as keyof typeof defaultGetters];

  allEffects.forEach((effect) => {
    if (isActiveCheck(effect) && effect[key]) {
      const items = (effect[key] as unknown as T[]) || [];
      items.forEach((item) => {
        const completeItem = { ...getDefault(item as Partial<T>), ...item };

        collectedItems.push({
          ...completeItem,
          isFromEffect: true,
          sourceEffectId: effect._id,
          sourceEffectLabel: effect.label,
        } as T & { isFromEffect: true; sourceEffectId: string; sourceEffectLabel: string });
      });
    }
  });

  return collectedItems;
}

export const processItemTags = (
  items: (Record<string, any> & { 'data-tags'?: string[] })[] | undefined,
  category: 'action' | 'spell' | 'equipment' | 'feature',
) => {
  if (!items) return;

  const tagsStore = useTagsStore();
  items.forEach((item) => {
    if (item['data-tags'] && Array.isArray(item['data-tags'])) {
      const newTagId = uuidv4();
      item.tagId = newTagId;

      const newTagGroup: TagGroup = {
        _id: newTagId,
        category: category,
        tags: item['data-tags'].map((tagText: string) => ({
          _id: uuidv4(),
          text: tagText,
        })),
      };
      tagsStore.update(newTagGroup);
      delete item['data-tags'];
    }
  });
};

function calculateModifiedTags(
  allEffects: Effect[],
  attribute: string,
  isActiveCheck: (effect: Effect, singleEffect: SingleEffect) => boolean,
): { text: string; isDefault: boolean; isFromEffect: boolean; sourceLabel: string }[] {
  const validEffects = getValidEffects(allEffects, attribute, isActiveCheck).filter(
    (eff) =>
      eff.operation === 'push' && (typeof eff.value === 'string' || Array.isArray(eff.value)),
  );

  const pushedTags: {
    text: string;
    isDefault: boolean;
    isFromEffect: boolean;
    sourceLabel: string;
  }[] = [];
  for (const effect of validEffects) {
    const tagList = Array.isArray(effect.value) ? effect.value : [effect.value];

    const isDefenseAttribute =
      effect.attribute === 'damage-resistances' ||
      effect.attribute === 'damage-immunities' ||
      effect.attribute === 'damage-vulnerabilities' ||
      effect.attribute === 'condition-immunities';

    if (isDefenseAttribute) {
      for (const tag of tagList) {
        const isValidDamageType = config.damageTypes.includes(tag as any);
        const isValidCondition = config.autocomplete.conditions.includes(tag as any);
        if (isValidDamageType || isValidCondition) {
          pushedTags.push({
            text: tag as string,
            isDefault: true,
            isFromEffect: true,
            sourceLabel: effect.label,
          });
        }
      }
    } else {
      for (const tag of tagList) {
        const isArmorProficiency = config.autocomplete.armorProficiencies.includes(tag as any);
        const isWeaponProficiency = config.autocomplete.weaponProficiencies.includes(tag as any);
        const isLanguage = config.autocomplete.languages.includes(tag as any);
        const isDefaultTag = isArmorProficiency || isWeaponProficiency || isLanguage;
        pushedTags.push({
          text: tag as string,
          isDefault: isDefaultTag,
          isFromEffect: true,
          sourceLabel: effect.label,
        });
      }
    }
  }

  return pushedTags;
}

function calculateModifiedValue(
  baseValue: number,
  validEffects: ExtendedSingleEffect[],
  constrainTo: number[] = [],
): { final: number; modifiers: ModifierBreakdown[] } {
  let finalValue = baseValue;
  const modifiers: ModifierBreakdown[] = [];

  validEffects.forEach((effect) => {
    const valueBefore = finalValue;

    const formulaRegex = /-formula$/g;
    const value = Number(
      formulaRegex.test(effect.operation)
        ? parseFormulaAndEvaluate(getPicker(effect.formula as string, effect.pickers) as string)
        : effect.value,
    );
    const operation = effect.operation.replace(formulaRegex, '');

    switch (operation) {
      case 'set-base':
        finalValue = Math.max(finalValue, value);
        break;
      case 'add':
        finalValue += value;
        break;
      case 'subtract':
        finalValue -= value;
        break;
      case 'set':
        finalValue = Math.max(finalValue, value);
        break;
      case 'set-base-final':
      case 'set-final':
        finalValue = value;
        break;
      case 'set-min':
        finalValue = Math.min(value, finalValue);
        break;
      case 'set-max':
        finalValue = Math.max(value, finalValue);
        break;
    }

    const contribution = finalValue - valueBefore;
    if (contribution !== 0) {
      modifiers.push({
        name: effect.label,
        value: contribution,
      });
    }
  });
  if (constrainTo.length > 0) {
    return { final: constrain(finalValue, constrainTo), modifiers };
  }
  return { final: finalValue, modifiers };
}

function calculateModifiedDicePool(
  basePool: DicePool,
  validEffects: ExtendedSingleEffect[],
): { final: DicePool; modifiers: ModifierBreakdown[] } {
  let finalPool: DicePool = [...basePool];
  const modifiers: ModifierBreakdown[] = [];

  validEffects.forEach((effect) => {
    const formulaRegex = /-formula$/g;
    const value = formulaRegex.test(effect.operation)
      ? evaluate(parseFormula(getPicker(effect.formula || '0', effect.pickers) as string), {})
      : effect.value;
    const operation = effect.operation.replace(formulaRegex, '');

    let contribution = 0;

    switch (operation) {
      case 'set-base': {
        const currentAvg = getDicePoolAverage(finalPool);
        const effectAvg = getDicePoolAverage([value]);
        if (effectAvg > currentAvg) {
          finalPool = [value];
        }
        break;
      }
      case 'set-base-final': {
        finalPool = [value];
        break;
      }
      case 'add':
        finalPool.push(value);
        contribution = value;
        break;
      case 'subtract':
        finalPool.push(`-${value}`);
        contribution = -value;
        break;
      case 'set': {
        const currentAvg = getDicePoolAverage(finalPool);
        const effectAvg = getDicePoolAverage([value]);

        if (effectAvg > currentAvg) {
          finalPool = [value];
        }
        break;
      }
      case 'set-final': {
        finalPool = [value];
        break;
      }
    }
    if (contribution !== 0) {
      modifiers.push({
        name: effect.label,
        value: contribution,
      });
    }
  });

  return { final: finalPool, modifiers };
}

function calculateModifiedRollBonuses(
  allEffects: Effect[],
  attribute: string | string[],
  isActiveCheck: (effect: Effect, singleEffect: SingleEffect) => boolean,
): DiceComponent[] {
  const validEffects = getValidEffects(allEffects, attribute, isActiveCheck);
  const rollBonuses: DiceComponent[] = [];

  for (const effect of validEffects) {
    const formula = parseFormula(getPicker(effect.formula || String(effect.value), effect.pickers) as string);
    const componentsFromEffect = createComponentsFromFormula(formula);
    const isSubtraction = effect.operation.startsWith('subtract');

    for (const component of componentsFromEffect) {
      if (isSubtraction) {
        if (component.sides) {
          component.count = -(component.count || 1);
        } else {
          component.value = -(component.value || 0);
        }
      }
      let expressionPart = '';
      if (component.sides) {
        expressionPart = `${Math.abs(component.count || 1)}d${component.sides}`;
      } else {
        expressionPart = `${component.value! >= 0 ? '+' : ''}${component.value}`;
      }

      component.label = `${effect.label} [${expressionPart}]`;
      rollBonuses.push(component);
    }
  }

  return rollBonuses;
}

function calculateActionDie(validEffects: ExtendedSingleEffect[]): number {
  const values = validEffects.map((effect) => {
    const formulaRegex = /-formula$/g;
    return formulaRegex.test(effect.operation) ? evaluate(parseFormula(getPicker(effect.formula || '0', effect.pickers) as string), {}) : effect.value;
  });

  const hasAdvantage = values.some((v) => v > 0);
  const hasDisadvantage = values.some((v) => v < 0);

  if (hasAdvantage && hasDisadvantage) {
    return 0;
  }

  if (hasAdvantage) {
    return Math.max(...values.filter((v) => v > 0));
  }

  if (hasDisadvantage) {
    return Math.min(...values.filter((v) => v < 0));
  }

  return 0;
}

export const EffectsCalculator = {
  getValidEffects,
  calculateModifiedValue,
  calculateModifiedDicePool,
  calculateModifiedRollBonuses,
  calculateActionDie,
  calculateModifiedTags,
  collectFromEffects,
};
