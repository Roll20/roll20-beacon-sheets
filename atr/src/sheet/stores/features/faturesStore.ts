import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import { getEntryById } from '@/utility/getEntryBy';
import { useTagsStore, type Tag } from '../tags/tagsStore'; 
import { useEffectsStore } from '../modifiers/modifiersStore';
import { e } from 'mathjs';

export type FeatureGroup = 'class-features' | 'ancestry-features' | 'feats' | 'others'

export type Feature = {
  _id: string;
  label: string;
  group: FeatureGroup;
  source: string;
  description: string;
  effectId: string;
  tagId: string;
}

export type FeaturesHydrate = {
  features: {
    features: Record<string, Feature>;
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
    }, ...patch };
  };

    const getFeatureTags = (tagId: string): Tag[] => {
      const tagsStore = useTagsStore();
      const tagGroup = tagsStore.tagGroups[tagId];
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
      if (existing.effectId) useEffectsStore().remove(existing.effectId);
      if (existing.tagId) useTagsStore().remove(existing.tagId);
      features.value.splice(indexToRemove, 1);
    }
  };

  const dehydrate = (): FeaturesHydrate => {
    return {
      features: {
        features: arrayToObject(features.value),
      },
    };
  };

  const hydrate = (hydrateStore: FeaturesHydrate) => {
    features.value = objectToArray(hydrateStore.features?.features) || features.value;
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
