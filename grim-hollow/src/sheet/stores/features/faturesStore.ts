import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { arrayToIndexedObject, arrayToObject, indexedObjectToArray, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import { getEntryById } from '@/utility/getEntryBy';
import { useTagsStore, type Tag } from '../tags/tagsStore'; 
import { useEffectsStore } from '../modifiers/modifiersStore';

export type FeatureGroup = 'class-features' | 'transformation-features' | 'ancestry-features' | 'feats' | 'traits'| 'others'| 'background-features';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'includes' | 'in';

export type FilterCondition = {
  op: FilterOperator;
  value: string | number | boolean;
};

export type CompendiumPicker = {
  label: string;
  category: string;
  filter?: Record<string, FilterCondition>;
  featureId?: string;
  featureLabel?: string;
  default?: {
    pageName: string;
    expansionId?: string;
  };
  defaultId: string;
}
export type Feature = {
  _id: string;
  label: string;
  group: FeatureGroup;
  source: string;
  description: string;
  effectId: string;
  tagId: string;
  compendiumPickers?: CompendiumPicker[];
}

type HydratedFeature = {
  _id: string;
  label: string;
  group: FeatureGroup;
  source: string;
  description: string;
  effectId: string;
  tagId: string;
  compendiumPickers: Record<string, CompendiumPicker>;
}

export type FeaturesHydrate = {
  features: {
    features: Record<string, HydratedFeature>;
  };
};

export const useFeaturesStore = defineStore('features', () => {
  const features: Ref<Array<Feature>> = ref([]);

  const getEmptyFeature = (patch: Partial<Feature>): Feature => {
    return { ...{
      _id: uuidv4(),
      label: '',
      group: 'others',
      source: '',
      description: '',
      effectId: uuidv4(),
      tagId: uuidv4(),
      compendiumPickers: [],
    }, ...patch };
  };

    const getFeatureTags = (tagId: string): Tag[] => {
      const tagsStore = useTagsStore();
      const tagGroup = tagsStore.tagGroups.find(g => g._id === tagId);
      return tagGroup ? tagGroup.tags : [];
    };

  const update = (patch: Partial<Feature>): void => {
    const feature = patch._id
      ? getEntryById(patch._id, features.value) as Feature | undefined
      : false
    ;
    if(!feature) {
      const newFeature = getEmptyFeature(patch);
      features.value.push(newFeature);
    } else {
      Object.assign(feature, patch);
    }
  };

  const remove = (_id: string) => {
    const indexToRemove = features.value.findIndex((feature) => feature._id === _id);
    if (indexToRemove >= 0) {
      const existing = features.value[indexToRemove];
      // Remove from array FIRST to prevent infinite recursion from circular references
      features.value.splice(indexToRemove, 1);
      
      if (existing.effectId) useEffectsStore().remove(existing.effectId);
      if (existing.tagId) useTagsStore().remove(existing.tagId);
      if (existing.compendiumPickers && existing.compendiumPickers.length > 0) {
        existing.compendiumPickers.forEach(picker => {
          if (picker.featureId) remove(picker.featureId);
        });
      }
    }
  };

  const dehydrate = (): FeaturesHydrate => {
    return {
      features: {
        features: arrayToObject(features.value.map(f => {
          return {
            ...f,
            compendiumPickers: arrayToIndexedObject(f.compendiumPickers || [])
          }
        })),
      },
    };
  };

  const hydrate = (hydrateStore: FeaturesHydrate) => {
    features.value = hydrateStore.features?.features ?
      objectToArray(hydrateStore.features.features).map(f => {
        return {
          ...f,
          compendiumPickers: indexedObjectToArray(f.compendiumPickers)
        }
      })
    : features.value;
  };

  return {
    features,

    update,
    remove,
    getFeatureTags,
    getEmptyFeature,
    dehydrate,
    hydrate,
  };
});
