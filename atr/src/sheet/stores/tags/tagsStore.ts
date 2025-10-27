import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
export type Tag = {
  _id: string;
  text: string;
  isDefault?: boolean;
  isFromEffect?: boolean;
  sourceLabel?: string;
};

export type TagGroup = {
  _id: string;
  tags: Tag[];
  category?: string;
};

export type TagsHydrate = {
  tagGroups: Record<string, TagGroup>;
};

export const useTagsStore = defineStore('tags', () => {
  const tagGroups: Ref<Array<TagGroup>> = ref([]);

  const tagsByCategory = computed(() => {
    const categoryMap = new Map<string, Set<string>>();
    tagGroups.value.forEach((group) => {
      if (group.category) {
        if (!categoryMap.has(group.category)) {
          categoryMap.set(group.category, new Set<string>());
        }
        const tagSet = categoryMap.get(group.category)!;
        group.tags.forEach((tag) => tagSet.add(tag.text));
      }
    });
    return categoryMap;
  });

  const groupHasTag = (tagId: string, tagText: string): boolean => {
    const group = tagGroups.value.find((g) => g._id === tagId);
    if (!group) {
      return false;
    }
    return group.tags.some((tag) => tag.text.toLowerCase() === tagText.toLowerCase());
  };

  const getExistingOrCreate = (id: string, category?: string): TagGroup => {
    let group = tagGroups.value.find((g) => g._id === id);
    if (!group) {
      group = {
        _id: id,
        tags: [],
        category,
      };
      tagGroups.value.push(group);
    } else if (category && !group.category) {
      group.category = category;
    }
    return group;
  };

  const update = (patch: Partial<TagGroup> & { _id: string }) => {
    const index = tagGroups.value.findIndex((g) => g._id === patch._id);
    if (index === -1) {
      const newGroup = getExistingOrCreate(patch._id, patch.category);
      Object.assign(newGroup, patch);
    } else {
      const updatedGroup = { ...tagGroups.value[index], ...patch };
      tagGroups.value[index] = updatedGroup;
    }
  };

  const remove = (id: string) => {
    const index = tagGroups.value.findIndex((g) => g._id === id);
    if (index > -1) {
      tagGroups.value.splice(index, 1);
    }
  };

  const dehydrate = (): TagsHydrate => {
    const dehydratedGroups = tagGroups.value.map((group) => ({
      ...group,
      tags: arrayToObject(group.tags),
    }));
    return {
      tagGroups: arrayToObject(dehydratedGroups),
    };
  };

  const hydrate = (payload: TagsHydrate) => {
    const incomingGroups = payload?.tagGroups || {};
    tagGroups.value = objectToArray(incomingGroups).map((group) => ({
      ...group,
      tags: objectToArray(group.tags),
    }));
  };
  return {
    tagGroups,
    tagsByCategory,
    getExistingOrCreate,
    update,
    remove,
    dehydrate,
    hydrate,
    groupHasTag,
  };
});
