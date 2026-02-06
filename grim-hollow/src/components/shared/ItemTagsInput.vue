<template>
  <div class="tags-input-container">
    <label class="item-tags-input__label">{{ $t(label) }}</label>
    <vue-tags-input
      v-model="currentTag"
      :tags="tagsForDisplay"
      :autocomplete-items="filteredAutoComplete"
      :allow-edit-tags="true"
      :placeholder="$t('actions.add-tags') + '...'"
      @tags-changed="handleTagsChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useTagsStore, type Tag } from '@/sheet/stores/tags/tagsStore';
import { config, equipmentTags } from '@/config';
import { v4 as uuidv4 } from 'uuid';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
  tagId: string;
  label?: string;
  tagSource?: string;
}>();

const emit = defineEmits(['update']);

const tagsStore = useTagsStore();
const localTags = ref<Tag[]>([]);

const sortTags = (tags: Tag[]) => {
  return tags.sort((a, b) => a.text.localeCompare(b.text));
};

const currentTag = ref('');

const initializeTags = (id: string) => {
  const tagGroup = tagsStore.getExistingOrCreate(id, props.tagSource);
  localTags.value = sortTags(JSON.parse(JSON.stringify(tagGroup.tags)));
};

initializeTags(props.tagId);
watch(
  () => props.tagId,
  (newId) => {
    initializeTags(newId);
  },
);

const getPrefix = (source?: string) => {
  if (source === 'equipment') return 'titles.tag.equipment.';
  return '';
};

const tagsForDisplay = computed(() => {
  const prefix = getPrefix(props.tagSource);
  return localTags.value.map((tag) => ({
    ...tag,
    text: tag.isDefault ? t(prefix + tag.text) : tag.text,
    originalKey: tag.isDefault ? tag.text : undefined,
  }));
});

const autoCompleteItems = computed(() => {
  const prefix = getPrefix(props.tagSource);
  const tagMap = new Map<string, { text: string; originalKey?: string; isDefault: boolean }>();

  if (props.tagSource === 'equipment') {
    config.autocomplete.equipmentTags.forEach((tagConfig) => {
      tagMap.set(tagConfig.text, {
        text: t(prefix + tagConfig.text),
        originalKey: tagConfig.text,
        isDefault: true,
      });
    });
  }

  if (props.tagSource) {
    for (const group of Object.values(tagsStore.tagGroups)) {
      if (group.category === props.tagSource) {
        group.tags.forEach((tag) => {
          if (!tag.isDefault && !tagMap.has(tag.text)) {
            tagMap.set(tag.text, {
              text: tag.text,
              isDefault: false,
            });
          }
        });
      }
    }
  }

  return Array.from(tagMap.values());
});

const filteredAutoComplete = computed(() => {
  if (!currentTag.value) return [];
  const currentText = currentTag.value.toLowerCase();
  return autoCompleteItems.value.filter((item) => item.text.toLowerCase().includes(currentText));
});

const handleTagsChanged = (newTags: any[]) => {
  const processedTags = newTags.map((tag) => ({
    _id: tag._id || uuidv4(),
    text: tag.originalKey || tag.text,
    isDefault: !!tag.originalKey,
  }));
  localTags.value = sortTags(processedTags);
  emit('update', processedTags);
};
</script>
