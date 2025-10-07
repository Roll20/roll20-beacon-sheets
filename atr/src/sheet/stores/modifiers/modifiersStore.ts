import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import {
  arrayToIndexedObject,
  arrayToObject,
  indexedObjectToArray,
  objectToArray,
} from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import {
  type ProficiencyLevelBase,
  type ProficiencyLevel,
  proficiencyLevelsValues,
} from '../proficiencies/proficienciesStore';
import { getEntryById } from '@/utility/getEntryBy';
import * as z from 'zod/v4';
import { useEquipmentStore } from '../equipment/equipmentStore';
import { EffectsCalculator } from '@/utility/effectsCalculator';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';
import { ActionSchema, type Action } from '@/sheet/stores/actions/actionsStore';
import { ResourceSchema, type Resource } from '@/sheet/stores/resources/resourcesStore';
import {
  SpellSchema,
  type SpellSource,
  SpellSourceSchema,
  type Spell,
} from '@/sheet/stores/spells/spellsStore';
import { type EffectValue } from '@/effects.config';
import { useTagsStore } from '../tags/tagsStore';
export type ModifierBreakdown = {
  name: string;
  value: number;
};

export const RequirementSchema = z.union([
  z.enum(['equipped', 'attuned']),
  z.templateLiteral([
    z.enum(['cl', 'ol']),
    z.enum(['<', '<=', '=', '>', '>=']),
    z.number().min(1).max(20),
  ]),
]);

export const SingleEffectSchema = z.object({
  _id: z.string(),
  attribute: z.string(),
  operation: z.enum([
    'add',
    'subtract',
    'set',
    'set-base',
    'set-min',
    'set-max',
    'add-formula',
    'subtract-formula',
    'set-formula',
    'set-base-formula',
    'set-min-formula',
    'set-max-formula',
    'set-base-final',
    'set-base-final-formula',
    'set-final',
    'set-final-formula',
    'push',
  ]),
  value: z.union([z.number(), z.string(), z.string().array()]),
  formula: z.string(),
  required: RequirementSchema.array().optional(),
});

export const PickerOptionSchema = z.object({
  label: z.string(),
  value: z.custom<EffectValue>(),
});

export const PickerSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  options: PickerOptionSchema.array(),
  mandatory: z.boolean().optional(),
});

export const EffectSchema = z.object({
  _id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  toggleable: z.boolean().optional(),
  removable: z.boolean().optional(),
  required: RequirementSchema.array().optional(),
  effects: z.array(SingleEffectSchema),
  description: z.string(),
  actions: z.array(ActionSchema).optional(),
  resources: z.array(ResourceSchema).optional(),
  spells: z.array(SpellSchema).optional(),
  spellSources: z.array(SpellSourceSchema).optional(),
  pickers: z.array(PickerSchema).optional(),
});

export type Picker = z.infer<typeof PickerSchema>;

export type SingleEffect = z.infer<typeof SingleEffectSchema>;
export type Effect = z.infer<typeof EffectSchema>;

export type ExtendedSingleEffect = SingleEffect & {
  label: string;
  description: string;
  pickers?: Picker[];
};

export type ModifiedValue = ComputedRef<{ final: number; modifiers: ModifierBreakdown[] }>;
export type DicePool = Array<string | number>;
export type ModifiedDicePool = ComputedRef<{ final: DicePool; modifiers: ModifierBreakdown[] }>;
export type ModifiedProficiency = ComputedRef<{
  final: ProficiencyLevel;
  modifiers: ModifierBreakdown[];
}>;

export type EffectsDescriptionList = Array<{
  name: string;
  description: string;
}>;

export type EffectsHydrate = {
  effects: Record<string, Effect>;
};

type ItemKey = 'actions' | 'resources' | 'spellSources' | 'spells';
type ItemType = Action | Resource | SpellSource | Spell;

export const useEffectsStore = defineStore('effects', () => {
  const effects: Ref<Array<Effect>> = ref([]);

  const update = (patch: Partial<Effect>): void => {
    if (patch.actions) {
      patch.actions.forEach((action) => (action._id = action._id ?? uuidv4()));
    }
    if (patch.resources) {
      patch.resources.forEach((resource) => (resource._id = resource._id ?? uuidv4()));
    }
    if (patch.spellSources) {
      patch.spellSources.forEach((source) => (source._id = source._id ?? uuidv4()));
    }
    if (patch.spells) {
      patch.spells.forEach((spell) => (spell._id = spell._id ?? uuidv4()));
    }
    if (patch.effects) patch.effects.forEach((effect) => (effect._id = effect._id ?? uuidv4()));
    const effect = patch._id
      ? (getEntryById(patch._id, effects.value) as Effect | undefined)
      : false;
    if (!effect) {
      const newEffect = addEffect(patch);
    } else {
      Object.assign(effect, patch);
    }
  };

  const updateItemWithinEffect = (payload: {
    effectId: string;
    itemKey: ItemKey;
    itemPatch: Partial<ItemType>;
  }) => {
    const effect = effects.value.find((e) => e._id === payload.effectId);
    if (effect && effect[payload.itemKey]) {
      const item = (effect[payload.itemKey] as ItemType[]).find(
        (i) => i._id === payload.itemPatch._id,
      );
      if (item) {
        Object.assign(item, payload.itemPatch);
      }
    }
  };

  const removeItemFromEffect = (payload: {
    effectId: string;
    itemKey: ItemKey;
    itemId: string;
  }) => {
    const effect = effects.value.find((e) => e._id === payload.effectId);
    if (effect && effect[payload.itemKey]) {
      const items = effect[payload.itemKey] as ItemType[];
      const index = items.findIndex((i) => i._id === payload.itemId);
      if (index > -1) {
        items.splice(index, 1);
      }
    }
  };

  const getExistingOrCreate = (patch: Partial<Effect>): Effect => {
    const existingId = effects.value.findIndex((effect) => effect._id === patch._id);
    if (existingId >= 0) return effects.value[existingId];
    return addEffect(patch);
  };

  const getEmptyEffect = (patch: Partial<Effect>): Effect => {
    const emptyEffect: Effect = {
      _id: patch._id ?? uuidv4(),
      label: patch.label ?? '',
      description: patch.description ?? '',
      required: patch.required ?? [],
      effects: patch.effects ?? [],
      enabled: patch.enabled ?? true,
      toggleable: patch.toggleable ?? false,
      removable: patch.removable ?? false,
      actions: patch.actions ?? [],
      resources: patch.resources ?? [],
      spellSources: patch.spellSources ?? [],
      spells: patch.spells ?? [],
      pickers: patch.pickers ?? [],
      ...patch,
    };
    return emptyEffect;
  };

  const getActiveEffectLabels = (attribute: string | string[]): string[] => {
    const validEffects = EffectsCalculator.getValidEffects(
      effects.value,
      attribute,
      isEffectSingleActive,
    );
    const labels = new Set(validEffects.map((effect) => effect.label));
    return Array.from(labels);
  };

  const visibleEffects = computed(() => {
    return effects.value.filter((effect) => effect.toggleable);
  });

  const addEffect = (patch: Partial<Effect>): Effect => {
    const newEffect: Effect = getEmptyEffect(patch);
    effects.value.push(newEffect);
    return newEffect;
  };

  const isEffectActive = (effect: Effect): boolean => {
    if (!effect.enabled) {
      return false;
    }

    if (!effect.required || effect.required.length === 0) {
      return true;
    }

    const equipmentStore = useEquipmentStore();
    const owner = equipmentStore.equipment.find((item) => item.effectId === effect._id);

    if (!owner) {
      return true;
    }

    const currentStates: string[] = [];
    if (owner.equipped) currentStates.push('equipped');
    if (owner.isAttuned) currentStates.push('attuned');

    return effect.required.every((req) => currentStates.includes(req));
  };

  const isEffectSingleActive = (effect: Effect, singleEffect: SingleEffect): boolean => {
    if (!isEffectActive(effect)) {
      return false;
    }

    if (!singleEffect.required || singleEffect.required.length === 0) {
      return true;
    }

    const equipmentStore = useEquipmentStore();
    const owner = equipmentStore.equipment.find((item) => item.effectId === effect._id);

    if (!owner) {
      return true;
    }

    const currentStates: string[] = [];
    if (owner.equipped) currentStates.push('equipped');
    if (owner.isAttuned) currentStates.push('attuned');

    return singleEffect.required.every((req) => currentStates.includes(req));
  };

  const getModifiedRollBonuses = (attribute: string | string[]): ComputedRef<DiceComponent[]> => {
    return computed(() => {
      return EffectsCalculator.calculateModifiedRollBonuses(
        effects.value,
        attribute,
        isEffectSingleActive,
      );
    });
  };

  const getModifiedProficiency = (
    attribute: string | string[],
    base: ProficiencyLevelBase,
  ): ModifiedProficiency =>
    computed(() => {
      if (base === -1) {
        const modifiedValue = getModifiedValue(0, attribute, proficiencyLevelsValues).value;
        return {
          final: modifiedValue.final as ProficiencyLevel,
          modifiers: modifiedValue.modifiers,
        };
      }
      return {
        final: base as ProficiencyLevel,
        modifiers: [],
      };
    });

  const getModifiedValue = (
    _baseValue: number,
    _attribute: string | string[],
    constrainTo: number[] = [],
  ): ModifiedValue => {
    return computed(() => {
      const validEffects = EffectsCalculator.getValidEffects(
        effects.value,
        _attribute,
        isEffectSingleActive,
      );

      return EffectsCalculator.calculateModifiedValue(_baseValue, validEffects, constrainTo);
    });
  };

  const getModifiedDicePool = (pool: DicePool, attribute: string | string[]): ModifiedDicePool => {
    return computed(() => {
      const validEffects = EffectsCalculator.getValidEffects(
        effects.value,
        attribute,
        isEffectSingleActive,
      );
      return EffectsCalculator.calculateModifiedDicePool(pool, validEffects);
    });
  };

  const getModifiedActionDie = (attribute: string | string[]): ComputedRef<number> => {
    return computed(() => {
      const validEffects = EffectsCalculator.getValidEffects(
        effects.value,
        attribute,
        isEffectSingleActive,
      );
      return EffectsCalculator.calculateActionDie(validEffects);
    });
  };

  const remove = (_id: string) => {
    const indexToRemove = effects.value.findIndex((modifier) => modifier._id === _id);
    if (indexToRemove >= 0) {
      const effectToRemove = effects.value[indexToRemove];
      const tagsStore = useTagsStore();
      if (effectToRemove.actions) {
        effectToRemove.actions.forEach(action => {
          if (action.tagId) {
            tagsStore.remove(action.tagId);
          }
        });
      }

      if (effectToRemove.spells) {
        effectToRemove.spells.forEach(spell => {
          if (spell.tagId) {
            tagsStore.remove(spell.tagId);
          }
        });
      }
      effects.value.splice(indexToRemove, 1);
    }
  };

  const dehydrate = (): EffectsHydrate => {
    return {
      effects: arrayToObject(
        effects.value.map((effect) => ({
          ...effect,
          required: effect.required ? arrayToIndexedObject(effect.required) : undefined,
          effects: arrayToObject(
            effect.effects.map((singleEffect) => ({
              ...singleEffect,
              required: singleEffect.required
                ? arrayToIndexedObject(singleEffect.required)
                : undefined,
              value: Array.isArray(singleEffect.value)
                ? arrayToIndexedObject(singleEffect.value)
                : singleEffect.value,
            })),
          ),
          actions:
            effect.actions && effect.actions.length > 0
              ? arrayToObject(
                  effect.actions.map((action) => ({
                    ...action,
                    damage: action.damage ? arrayToIndexedObject(action.damage) : undefined,
                  })),
                )
              : undefined,
          resources: effect.resources ? arrayToObject(effect.resources) : undefined,
          spellSources:
            effect.spellSources && effect.spellSources.length > 0
              ? arrayToObject(effect.spellSources)
              : undefined,
          spells:
            effect.spells && effect.spells.length > 0
              ? arrayToObject(
                  effect.spells.map((spell) => ({
                    ...spell,
                    components: spell.components
                      ? arrayToIndexedObject(spell.components)
                      : undefined,
                    damage: spell.damage ? arrayToIndexedObject(spell.damage) : undefined,
                  })),
                )
              : undefined,
          pickers:
            effect.pickers && effect.pickers.length > 0
              ? arrayToIndexedObject(
                  effect.pickers.map((singlePicker) => ({
                    ...singlePicker,
                    options: arrayToIndexedObject(singlePicker.options),
                  })),
                )
              : undefined,
        })),
      ),
    };
  };

  const hydrate = (hydrateStore: EffectsHydrate) => {
    effects.value =
      objectToArray(hydrateStore.effects)?.map((effect) => ({
        ...effect,
        required: effect.required ? indexedObjectToArray(effect.required) : [],
        effects:
          objectToArray(effect.effects)?.map((singleEffect) => ({
            ...singleEffect,
            required: singleEffect.required
              ? indexedObjectToArray(singleEffect.required)
              : undefined,
            value: typeof singleEffect.value === 'object' ? indexedObjectToArray(singleEffect.value) : singleEffect.value,
          })) || [],
        actions: effect.actions
          ? objectToArray(effect.actions).map((action) => ({
              ...action,
              damage: action.damage ? indexedObjectToArray(action.damage) : [],
            }))
          : [],
        resources: objectToArray(effect.resources) || [],
        spellSources: objectToArray(effect.spellSources) || [],
        spells: effect.spells
          ? objectToArray(effect.spells).map((spell) => ({
              ...spell,
              components: spell.components ? indexedObjectToArray(spell.components) : [],
              damage: spell.damage ? indexedObjectToArray(spell.damage) : [],
            }))
          : [],
        pickers: effect.pickers || [],
      })) || effects.value;
  };

  return {
    effects,

    addEffect,
    getModifiedValue,
    getModifiedProficiency,
    getModifiedDicePool,
    remove,
    getExistingOrCreate,
    getEmptyEffect,
    updateItemWithinEffect,
    removeItemFromEffect,
    update,
    isEffectActive,
    isEffectSingleActive,
    getModifiedRollBonuses,
    getModifiedActionDie,
    visibleEffects,
    getActiveEffectLabels,
    dehydrate,
    hydrate,
  };
});
