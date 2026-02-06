import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { createRollTemplate, type DiceComponent } from '@/rolltemplates/rolltemplates';
import { dispatchRef } from '@/relay/relay';
import getRollResult from './getRollResult';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import { initValues } from '@/relay/relay';
import { EffectsCalculator } from './effectsCalculator';
import { useEffectsStore, type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { type DamageRoll } from '@/sheet/stores/actions/damage';
import { createComponentsFromFormula } from './diceParser';
import { type AbilityData, useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { getEntryByLabel } from './getEntryBy';
import { getDiceFromExpression } from './getDiceFromExpression';
import type { NpcAction, NpcSpell } from '@/sheet/stores/npc/npcStore';
import type { Spell } from '@/sheet/stores/spells/spellsStore';
import type { Action } from '@/sheet/stores/actions/actionsStore';

export type LabeledBonus = {
  label: string;
  value: number;
};

export type D20RollArgs = {
  rollName: string;
  subtitle: string;
  bonuses: LabeledBonus[];
  rollBonusKeys?: string[];
  actionDieKeys?: string[];
  critRange?: number;
  whisper?: boolean;
  properties?: Record<string, string | number | boolean>;
  description?: string;
  sourceType?: 'action' | 'spell' | 'feature' | 'item';
  effectsSource?: Effect[];
  customDispatch?: Dispatch;
  advantage?: -2 | -1 | 0 | 1;
  characterName?: string;
  additionalComponents?: DiceComponent[];
  addToTracker?: boolean;
  tokenId?: string;
  isCompanion?: boolean;
  avatar?: string;
};

export function getD20RollBreakdown(args: D20RollArgs) {
  const { bonuses, rollBonusKeys = [], effectsSource } = args;
  const effectsStore = useEffectsStore();

  const baseComponents: LabeledBonus[] = bonuses.filter((bonus) => bonus.value !== 0);

  const allEffects = effectsSource ?? effectsStore.effects;
  const isActiveCheck = effectsSource
    ? EffectsCalculator.isNpcEffectActive
    : effectsStore.isEffectSingleActive;

  const effectRollBonuses = EffectsCalculator.calculateModifiedRollBonuses(
    allEffects,
    rollBonusKeys,
    isActiveCheck,
  );

  return { baseComponents, effectRollBonuses };
}

export const performD20Roll = async (
  args: D20RollArgs,
): Promise<'crit-success' | 'crit-fail' | undefined> => {
  const dispatch = args.customDispatch || (dispatchRef.value as Dispatch);
  const {
    rollName,
    subtitle,
    bonuses,
    rollBonusKeys = [],
    actionDieKeys = [],
    critRange = 20,
    whisper,
    properties,
    description,
    sourceType,
    effectsSource,
    advantage,
    additionalComponents = [],
    addToTracker = false,
    tokenId,
    isCompanion = false,
    avatar,
  } = args;

  const effectsStore = useEffectsStore();
  const bonusComponents = bonuses
    .filter((bonus) => bonus.value !== 0)
    .map((bonus) => ({
      label: bonus.label,
      value: bonus.value,
    }));

  let rollBonuses: DiceComponent[] = [];
  let actionDieValue = 0;

  if (advantage !== undefined) {
    actionDieValue = advantage;
    if (effectsSource) {
      rollBonuses = EffectsCalculator.calculateModifiedRollBonuses(
        effectsSource,
        rollBonusKeys,
        EffectsCalculator.isNpcEffectActive
      );
    } else {
      rollBonuses = effectsStore.getModifiedRollBonuses(rollBonusKeys).value;
    }
  } else {
    if (effectsSource) {
      rollBonuses = EffectsCalculator.calculateModifiedRollBonuses(
        effectsSource,
        rollBonusKeys,
        EffectsCalculator.isNpcEffectActive
      );
      actionDieValue = EffectsCalculator.calculateActionDie(
        EffectsCalculator.getValidEffects(effectsSource, actionDieKeys, EffectsCalculator.isNpcEffectActive),
      );
    } else {
      rollBonuses = effectsStore.getModifiedRollBonuses(rollBonusKeys).value;
      actionDieValue = effectsStore.getModifiedActionDie(actionDieKeys).value;
    }
  }

  const dieSize = 20;
  const numDice = 1 + Math.abs(actionDieValue);
  

  const dieComponents: DiceComponent[] = Array.from({ length: numDice }, () => ({
    sides: dieSize,
    count: 1,
  }));

  const { components: rolledComponents } = await getRollResult(
    [...dieComponents, ...bonusComponents, ...rollBonuses, ...additionalComponents],
    dispatch,
  );

  const dieRolls = rolledComponents.filter((c) => c.sides === dieSize);
  const bonusRolls = rolledComponents.filter((c) => c.sides !== dieSize);
  const bonusTotal = bonusRolls.reduce((sum, c) => sum + (c.value || 0), 0);
  const dieValues = dieRolls.map((d) => d.value || 0);

  let keptValue: number;
  if (actionDieValue > 0) {
    keptValue = Math.max(...dieValues);
  } else if (actionDieValue < 0) {
    keptValue = Math.min(...dieValues);
  } else {
    keptValue = dieValues[0];
  }

  let hasKeptOne = false;
  const d20sForTemplate = dieRolls.map((d) => {
    const isKept = !hasKeptOne && d.value === keptValue;
    if (isKept) hasKeptOne = true;
    return { value: d.value || 0, kept: isKept };
  });

  const total = keptValue + bonusTotal;
  const d20Result = keptValue;

  let resultType: 'crit-success' | 'crit-fail' | undefined;
  if (d20Result) {
    if (d20Result >= critRange) resultType = 'crit-success';
    if (d20Result === 1) resultType = 'crit-fail';
  }

  const cleanDescription = description ? description.replace(/\[.*?\]/g, '').trim() : undefined;

  const rollTemplate = createRollTemplate({
    type: 'd20',
    parameters: {
      characterName: useMetaStore().name,
      title: rollName,
      subtitle: subtitle,
      components: bonusRolls,
      d20s: d20sForTemplate,
      resultType,
      properties,
      total,
      description: cleanDescription,
      sourceType
    },
  });

  await dispatch.post({
    characterId: useMetaStore().id,
    content: rollTemplate,
    options: { whisper },
  });

  if (addToTracker) {
    const trackerOptions: {
      value: number;
      tokenId?: string;
      custom?: { name: string; img?: string };
    } = {
      value: total,
    };

    trackerOptions.custom = {
      name: args.characterName || rollName,
      img: avatar,
    };
    if (tokenId) {
      trackerOptions.tokenId = tokenId;
    }

    if (trackerOptions.tokenId || trackerOptions.custom) {
      await dispatch.addToTracker(trackerOptions);
    }
  }

  return resultType;
};
export type DamageRollArgs = {
  rollName: string;
  subtitle: string;
  properties?: Record<string, string | number | boolean>;
  description?: string;
  sourceType?: 'action' | 'spell' | 'feature' | 'item';
  damageRolls?: DamageRoll[];
  damageGroups?: { type: string; components: DiceComponent[] }[];
  canCrit?: boolean;
  isCrit: boolean;
  whisper?: boolean;
  customDispatch?: Dispatch;
  damageModifierKeys?: string[];
  damageRollKeys?: string[];
  effectsSource?: Effect[];
  characterName?: string;
  additionalComponents?: DiceComponent[];
  t: (key: string) => string;
};

export function getDamageRollBreakdown(args: DamageRollArgs) {
  const { damageRolls, damageModifierKeys = [], damageRollKeys = [], effectsSource, t } = args;
  const effectsStore = useEffectsStore();
  const abilitiesStore = useAbilitiesStore();

  const baseComponents: LabeledBonus[] = [];
  if (damageRolls) {
    damageRolls.forEach((roll) => {
      if (roll.damage) {
        baseComponents.push({
          label: t(`titles.dice-pool-types.${roll.type}`),
          value: roll.damage,
        });
      }
      if (roll.ability && roll.ability !== 'none') {
        const modifier = abilitiesStore.getAbilityModifier(
          getEntryByLabel(roll.ability, abilitiesStore.abilities) as AbilityData,
        ).value.final;
        if (modifier !== 0) {
          baseComponents.push({ label: t(`titles.abilities.${roll.ability}`), value: modifier });
        }
      }
    });
  }

  const allEffects = effectsSource ?? effectsStore.effects;
  const isActiveCheck = effectsSource
    ? EffectsCalculator.isNpcEffectActive
    : effectsStore.isEffectSingleActive;

  const bonusValue = EffectsCalculator.calculateModifiedValue(
    0,
    EffectsCalculator.getValidEffects(allEffects, damageModifierKeys, isActiveCheck),
  );
  const flatBonuses = bonusValue.modifiers;
  const rollBonuses = EffectsCalculator.calculateModifiedRollBonuses(
    allEffects,
    damageRollKeys,
    isActiveCheck,
  );

  return { baseComponents, flatBonuses, rollBonuses };
}

export const performDamageRoll = async (args: DamageRollArgs) => {
  const dispatch = args.customDispatch || (dispatchRef.value as Dispatch);
  const {
    rollName,
    subtitle,
    damageRolls,
    damageGroups: initialDamageGroups,
    isCrit,
    whisper,
    properties,
    description,
    sourceType,
    characterName,
    damageModifierKeys = [],
    damageRollKeys = [],
    effectsSource,
    additionalComponents = [],
    t,
  } = args;

  const effectsStore = useEffectsStore();
  const damageGroups: Record<string, { type: string; components: DiceComponent[] }> = {};

  if (damageRolls) {
    damageRolls.forEach((roll) => {
      if (!damageGroups[roll.type]) {
        damageGroups[roll.type] = {
          type: t(`titles.dice-pool-types.${roll.type}`),
          components: [],
        };
      }
      if (roll.damage) {
        damageGroups[roll.type].components.push(
          ...createComponentsFromFormula(roll.damage, t('titles.damage')),
        );
      }
      if (roll.ability && roll.ability !== 'none') {
        const modifier = useAbilitiesStore().getAbilityModifier(
          getEntryByLabel(roll.ability, useAbilitiesStore().abilities) as AbilityData,
        ).value.final;
        if (modifier !== 0) {
          damageGroups[roll.type].components.push({
            label: t(`titles.abilities.${roll.ability}`),
            value: modifier,
          });
        }
      }
      if (isCrit) {
        const critFormula = roll.critDamage || getDiceFromExpression(roll.damage);
        if (critFormula) {
          damageGroups[roll.type].components.push(
            ...createComponentsFromFormula(critFormula, t('rolls.crit-success')),
          );
        }
      }
    });
  } else if (initialDamageGroups) {
    initialDamageGroups.forEach((group) => {
      const groupKey = `${group.type}-${Math.random()}`;
      damageGroups[groupKey] = {
        type: group.type,
        components: [...group.components],
      };
    });
  }

  let flatBonus = 0;
  let rollBonuses: DiceComponent[] = [];

  if (effectsSource) {
    const bonusValue = EffectsCalculator.calculateModifiedValue(
      0,
      EffectsCalculator.getValidEffects(
        effectsSource,
        damageModifierKeys,
        EffectsCalculator.isNpcEffectActive,
      ),
    );
    flatBonus = bonusValue.final;
    rollBonuses = EffectsCalculator.calculateModifiedRollBonuses(
      effectsSource,
      damageRollKeys,
      EffectsCalculator.isNpcEffectActive,
    );
  } else {
    const bonusValue = effectsStore.getModifiedValue(0, damageModifierKeys).value;
    flatBonus = bonusValue.final;
    rollBonuses = effectsStore.getModifiedRollBonuses(damageRollKeys).value;
  }

  if (Object.keys(damageGroups).length > 0) {
    const firstGroupKey = Object.keys(damageGroups)[0];
    if (flatBonus !== 0) {
      damageGroups[firstGroupKey].components.push({ label: 'Bonus', value: flatBonus });
    }
    damageGroups[firstGroupKey].components.push(...rollBonuses);
    damageGroups[firstGroupKey].components.push(...additionalComponents);
  } else if (additionalComponents.length > 0 || rollBonuses.length > 0 || flatBonus !== 0) {
    damageGroups['bonus'] = { type: t('titles.damage'), components: [] };
    if (flatBonus !== 0) {
      damageGroups['bonus'].components.push({ label: 'Bonus', value: flatBonus });
    }
    damageGroups['bonus'].components.push(...rollBonuses);
    damageGroups['bonus'].components.push(...additionalComponents);
  }

  const finalGroups = [];
  for (const group of Object.values(damageGroups)) {
    if (group.components.length === 0) continue;
    const { total, components: rolledComponents } = await getRollResult(group.components, dispatch);
    finalGroups.push({
      type: group.type,
      total: total,
      components: rolledComponents,
    });
  }

  const grandTotal = finalGroups.reduce((sum, group) => sum + group.total, 0);

  const cleanDescription = description ? description.replace(/\[.*?\]/g, '').trim() : undefined;

  const rollTemplate = createRollTemplate({
    type: 'damage',
    parameters: {
      characterName: characterName || useMetaStore().name,
      title: rollName,
      subtitle: subtitle,
      damageGroups: finalGroups,
      isCrit,
      resultType: isCrit ? 'crit-success' : undefined,
      grandTotal,
      properties,
      description: cleanDescription,
      sourceType,
    },
  });

  await dispatch.post({
    characterId: useMetaStore().id,
    content: rollTemplate,
    options: { whisper },
  });
};

export const getRollProperties = (
  item: Action | NpcAction | Spell | NpcSpell,
  t: (key: string) => string,
  saveDC?: number,
): Record<string, string> => {
  const properties: Record<string, string> = {};

  if ('range' in item && item.range) properties[t('titles.range')] = item.range;
  if ('target' in item && item.target) properties[t('titles.target')] = item.target;

  if ('components' in item && item.components.length > 0) {
    properties[t('titles.components')] =
      item.components.map((c: any) => t(`abbreviations.spell-components.${c}`)).join(', ') +
      ('material' in item && item.material ? ` (${item.material})` : '');
  }
  if (item.saving && item.saving !== 'none') {
    const dc = saveDC ?? ('savingDc' in item ? item.savingDc : 0);
    if (dc) {
      properties[t('titles.saving-throw')] = `${t(`titles.abilities.${item.saving}`)} DC ${dc}`;
    }
  }

  return properties;
};

