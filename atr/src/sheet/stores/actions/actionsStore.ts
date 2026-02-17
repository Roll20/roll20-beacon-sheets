// stores/actionsStore.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import {
  arrayToIndexedObject,
  arrayToObject,
  indexedObjectToArray,
  objectToArray,
} from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod/v4';
import { getEntryByLabel } from '@/utility/getEntryBy';
import { type AbilityData, type AbilityKey, useAbilitiesStore } from '../abilities/abilitiesStore';
import {
  type DicePool,
  type ModifiedDicePool,
  type ModifiedValue,
  useEffectsStore,
} from '../modifiers/modifiersStore';
import { useProgressionStore } from '../progression/progressionStore';
import { useTagsStore, type Tag } from '../tags/tagsStore';
import { useI18n } from 'vue-i18n';
import { getRollProperties, performDamageRoll } from '@/utility/roll';
import { effectKeys } from '@/effects.config';
import { useMetaStore } from '../meta/metaStore';
import { dispatchRef, initValues } from '@/relay/relay';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import { DamageRollSchema, type DamageRoll, type DamageType } from './damage';
import { EffectsCalculator} from '@/utility/effectsCalculator';
import { evaluateDiceFormula, parseFormula, parseFormulaAndEvaluate } from '../formulas';
import { RequirementSchema } from '../modifiers/requirement';

export const ActionSchema = z.object({
  _id: z.string(),
  name: z.string(),

  group: z.enum(['actions', 'bonus-actions', 'reactions', 'free-actions']),

  isAttack: z.boolean(),
  attackType: z.enum(['melee', 'ranged']),
  sourceType: z.enum(['weapon', 'spell']),
  critRange: z.number(),

  attackAbility: z.union([z.literal('none'), z.custom<AbilityKey>()]),
  attackBonus: z.string(),
  attackProficiency: z.union([z.literal(0), z.literal(0.5), z.literal(1), z.literal(2)]),

  saving: z.union([z.literal('none'), z.custom<AbilityKey>()]),
  savingDc: z.string(),

  damage: z.array(DamageRollSchema),

  ammo: z.number(),
  range: z.string(),
  target: z.string(),
  tagId: z.string(),
  description: z.string(),
  'data-tags': z.array(z.string()).optional(),
  required: RequirementSchema.array().optional(),
});

export type Action = z.infer<typeof ActionSchema>;

export type ActionsHydrate = {
  actions: {
    actions: Record<string, Action>;
  };
};

export const useActionsStore = defineStore('actions', () => {
  const userActions: Ref<Action[]> = ref([]);
  const { t } = useI18n();
  const effectsStore = useEffectsStore();

  const actionsFromEffects = computed(() => {
    return EffectsCalculator.collectFromEffects<Action>(
      effectsStore.effects,
      'actions',
      effectsStore.isEffectActive,
    );
  });

  const actions = computed(() => {
    return [...userActions.value, ...actionsFromEffects.value];
  });

  const lastAttack = ref<{
    actionId: string;
    resultType: 'crit-success' | 'crit-fail' | undefined;
  } | null>(null);

  const setLastAttackResult = (
    actionId: string,
    resultType: 'crit-success' | 'crit-fail' | undefined,
  ) => {
    lastAttack.value = { actionId, resultType };
  };

  const getEmptyAction = (patch: Partial<Action>): Action => ({
    _id: patch._id ?? uuidv4(),
    name: patch.name ?? '',

    group: patch.group ?? 'actions',

    isAttack: patch.isAttack ?? false,
    attackType: patch.attackType ?? 'melee',
    sourceType: patch.sourceType ?? 'weapon',
    critRange: patch.critRange ?? 20,

    attackAbility: patch.attackAbility ?? 'none',
    attackBonus: patch.attackBonus ?? '0',
    attackProficiency: patch.attackProficiency ?? 1,

    damage: patch.damage ?? [],
    saving: patch.saving ?? 'none',
    savingDc: patch.savingDc ?? '0',

    ammo: patch.ammo ?? 0,
    range: patch.range ?? '',
    target: patch.target ?? '',
    tagId: patch._id ?? uuidv4(),
    description: patch.description ?? '',
    ...patch,
  });

  const addAction = (patch: Partial<Action>): Action => {
    const newAction = getEmptyAction(patch);
    userActions.value.push(newAction);
    return newAction;
  };

  const update = (patch: Partial<Action> & { sourceEffectId?: string }) => {
    if (patch.sourceEffectId) {
      effectsStore.updateItemWithinEffect({
        effectId: patch.sourceEffectId,
        itemPatch: patch,
        itemKey: 'actions',
      });
      return;
    }

    const action = patch._id ? userActions.value.find((a) => a._id === patch._id) : undefined;
    if (!action) {
      addAction(patch);
    } else {
      Object.assign(action, patch);
    }
  };

  const getExistingOrCreate = (patch: Partial<Action>): Action => {
    const existing = actions.value.find((a) => a._id === patch._id);
    return existing ?? addAction(patch);
  };

  const remove = (actionToRemove: Action & { sourceEffectId?: string }) => {
    if (actionToRemove.sourceEffectId) {
      effectsStore.removeItemFromEffect({
        effectId: actionToRemove.sourceEffectId,
        itemId: actionToRemove._id,
        itemKey: 'actions',
      });
      return;
    }

    const index = userActions.value.findIndex((a) => a._id === actionToRemove._id);
    if (index >= 0) {
      const action = userActions.value[index];
      if (action.tagId) {
        useTagsStore().remove(action.tagId);
      }

      userActions.value.splice(index, 1);
    }
  };

  const getActionQueries = (action: Action, sufix: string = 'attack'): string[] => {
    let queries: string[] = [];
    if (action.isAttack) {
      queries = [
        effectKeys[`${action.attackType}-attack`],
        effectKeys[`${action.sourceType}-attack`],
        effectKeys[`${action.attackType}-${action.sourceType}-attack`],
      ];
    }
    return queries;
  };

  const getCriticalQueries = (action: Action, sufix: string = 'attack'): string[] => {
    let queries: string[] = [];
    if (action.isAttack) {
      queries = [
        effectKeys['crit-range'],
        effectKeys[`${action.attackType}-crit-range`],
        effectKeys[`${action.sourceType}-crit-range`],
        effectKeys[`${action.attackType}-${action.sourceType}-crit-range`],
      ];
    }
    return queries;
  };

  const getDamageQueries = (action: Action): string[] => {
    let queries: string[] = [];
    const actionSourceType = action.isAttack
      ? action.sourceType
      : action.saving !== 'none'
      ? 'spell'
      : 'special';
    if (actionSourceType === 'special') return queries;
    queries = [
      effectKeys[`${action.attackType}-damage`],
      effectKeys[`${actionSourceType}-damage`],
      effectKeys[`${action.attackType}-${actionSourceType}-damage`],
    ];
    return queries;
  };

  const getActionBonus = (id: string): ModifiedValue => {
    const index = actions.value.findIndex((a) => a._id === id);
    if (index < 0) return useEffectsStore().getModifiedValue(0, uuidv4());

    const action = actions.value[index];

    const abilityModifierValue =
      action.attackAbility && action.attackAbility !== 'none'
        ? useAbilitiesStore().getAbilityModifier(
            getEntryByLabel(action.attackAbility, useAbilitiesStore().abilities) as AbilityData,
          ).value.final
        : 0;

    const proficiencyModifier = Math.floor(
      useProgressionStore().getProficiencyBonus * action.attackProficiency,
    );

    const baseBonus =
      abilityModifierValue + proficiencyModifier + parseFormulaAndEvaluate(action.attackBonus);

    const keysToQuery = [effectKeys.attack, ...getActionQueries(action)];

    return useEffectsStore().getModifiedValue(baseBonus, keysToQuery);
  };

  const getActionDC = (id: string): ModifiedValue => {
    const index = actions.value.findIndex((a) => a._id === id);
    if (index < 0) return useEffectsStore().getModifiedValue(0, uuidv4());

    const action = actions.value[index];
    const baseDC = parseFormulaAndEvaluate(action.savingDc);
    return useEffectsStore().getModifiedValue(baseDC, []);
  };

  const getActionDamage = (id: string): ModifiedDicePool => {
    const index = actions.value.findIndex((a) => a._id === id);
    if (index < 0) return useEffectsStore().getModifiedDicePool([], uuidv4());

    const action = actions.value[index];
    if (!action.damage || action.damage.length === 0) {
      return computed(() => ({ final: [], modifiers: [] }));
    }
    const pool: Ref<DicePool> = ref([]);
    for (const damageRoll of action.damage) {
      const abilityModifier: ModifiedValue | boolean =
        damageRoll.ability && damageRoll.ability !== 'none'
          ? useAbilitiesStore().getAbilityModifier(
              getEntryByLabel(damageRoll.ability, useAbilitiesStore().abilities) as AbilityData,
            )
          : false;

      if (damageRoll.damage) pool.value.push(evaluateDiceFormula(damageRoll.damage));

      if (abilityModifier) pool.value.push(abilityModifier.value.final);
    }

    const keysToQuery = [effectKeys.damage, ...getDamageQueries(action)];

    return useEffectsStore().getModifiedDicePool(pool.value, keysToQuery);
  };

  const getActionCritRange = (action: Action): ModifiedValue => {
    const baseValue = action.critRange;

    const keysToQuery = [...getCriticalQueries(action)];

    return useEffectsStore().getModifiedValue(baseValue, keysToQuery.filter(Boolean));
  };

  const sendActionInfoToChat = async (id: string, t: (key: string) => string) => {
    const action = actions.value.find((a) => a._id === id);
    if (!action) return;

    const saveDC = getActionDC(id).value.final;
    const properties = getRollProperties(action, t, saveDC);

    const rollTemplate = createRollTemplate({
      type: 'chat',
      parameters: {
        characterName: useMetaStore().name,
        title: action.name,
        sourceType: 'action',
        properties,
        description: action.description,
      },
    });

    const dispatch = dispatchRef.value as Dispatch;
    await dispatch.post({
      characterId: initValues.character.id,
      content: rollTemplate,
    });
  };

  const dehydrate = (): ActionsHydrate => {
    const dehydratedActions = userActions.value.map((action) => ({
      ...action,
      damage: arrayToIndexedObject(action.damage),
      required: action.required ? arrayToIndexedObject(action.required) : undefined,
    }));

    return {
      actions: {
        actions: arrayToObject(dehydratedActions),
      },
    };
  };

  const getActionTags = (tagId: string): Tag[] => {
    const tagsStore = useTagsStore();
    const tagGroup = tagsStore.tagGroups[tagId];
    return tagGroup ? tagGroup.tags : [];
  };

  const hydrate = (payload: ActionsHydrate) => {
    const actionsHydration = payload?.actions?.actions
      ? objectToArray(payload.actions.actions).map((action) => ({
          ...action,
          damage: indexedObjectToArray(action.damage as Record<string, DamageRoll>),
          required: action.required
            ? indexedObjectToArray(action.required as unknown as Record<string, string>)
            : undefined,
        }))
      : actions.value;
    userActions.value = actionsHydration;
  };

  return {
    actions,
    userActions,
    lastAttack,
    setLastAttackResult,
    addAction,
    getEmptyAction,
    update,
    getExistingOrCreate,
    getActionBonus,
    getActionDamage,
    remove,
    getActionTags,
    getActionCritRange,
    getActionDC,

    sendActionInfoToChat,

    hydrate,
    dehydrate,
  };
});
