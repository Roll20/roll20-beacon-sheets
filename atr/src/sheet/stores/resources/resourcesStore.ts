import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import z from 'zod/v4';
import { useEffectsStore } from '../modifiers/modifiersStore';
import { EffectsCalculator } from '@/utility/effectsCalculator';
import { parseFormulaAndEvaluate } from '../formulas';
export type RefreshType = 'none' | 'all' | 'fixed-value';
export const ResourceSchema = z.object({
  _id: z.string(),
  name: z.string(),
  count: z.number(),
  max: z.string(),
  refreshOnShortRest: z.enum(['none', 'all', 'fixed-value']),
  refreshOnLongRest: z.enum(['none', 'all', 'fixed-value']),
  refreshOnDawn: z.enum(['none', 'all', 'fixed-value']),
  refreshOnShortRestAmount: z.string(),
  refreshOnLongRestAmount: z.string(),
  refreshOnDawnAmount: z.string(),
});

export type Resource = z.infer<typeof ResourceSchema>;
export type ResourcesHydrate = {
  resources: {
    resources: Record<string, Resource>;
  };
};

export const useResourcesStore = defineStore('resources', () => {
  const userResources = ref<Array<Resource>>([]);
  const effectsStore = useEffectsStore();

  const resourcesFromEffects = computed(() => {
    return EffectsCalculator.collectFromEffects<Resource>(
      effectsStore.effects,
      'resources',
      effectsStore.isEffectActive
    );
  });

  const resources = computed(() => {
    return [...userResources.value, ...resourcesFromEffects.value];
  });

  const getEmptyResource = (patch: Partial<Resource> = {}): Resource => ({
    name: '',
    count: patch.max ? parseFormulaAndEvaluate(patch.max):0,
    max: '',
    refreshOnShortRest: 'none',
    refreshOnLongRest: 'none',
    refreshOnDawn: 'none',
    refreshOnShortRestAmount: '',
    refreshOnLongRestAmount: '',
    refreshOnDawnAmount: '',
    _id: patch._id ?? uuidv4(),
    ...patch,
  });

  const add = (resource: Partial<Resource>) => {
    userResources.value.push({
      name: '',
      count: 0,
      max: '',
      refreshOnShortRest: 'none',
      refreshOnLongRest: 'none',
      refreshOnDawn: 'none',
      refreshOnShortRestAmount: '',
      refreshOnLongRestAmount: '',
      refreshOnDawnAmount: '',
      ...resource,
      _id: uuidv4(),
      ...resource,
    });
  };

  const update = (patch: Partial<Resource> & { sourceEffectId?: string }) => {
    if (patch.sourceEffectId) {
      effectsStore.updateItemWithinEffect({
        effectId: patch.sourceEffectId,
        itemKey: 'resources',
        itemPatch: patch,
      });
      return;
    }
    const resource = patch._id ? userResources.value.find(a => a._id === patch._id) : undefined;
    if (!resource) {
      add(patch);
    } else {
      Object.assign(resource, patch);
    }
  };

  const remove = (resourceToRemove: Resource & { sourceEffectId?: string }) => {
    if (resourceToRemove.sourceEffectId) {
      effectsStore.removeItemFromEffect({
        effectId: resourceToRemove.sourceEffectId,
        itemKey: 'resources',
        itemId: resourceToRemove._id,
      });
      return;
    }
    const index = userResources.value.findIndex(a => a._id === resourceToRemove._id);
    if (index >= 0) userResources.value.splice(index, 1);
  };

  const dehydrate = (): ResourcesHydrate => ({
    resources: {
      resources: arrayToObject(userResources.value),
    },
  });

  const hydrate = (hydrateStore: ResourcesHydrate) => {
    userResources.value = objectToArray(hydrateStore.resources?.resources) ?? [];
  };

  return {
    resources,
    userResources,
    add,
    update,
    remove,
    getEmptyResource,
    hydrate,
    dehydrate,
  };
});
