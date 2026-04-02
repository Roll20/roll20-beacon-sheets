<template>
  <div class="tags-input-container">
    <label>{{ label }}</label>
    <vue-tags-input
      v-model="newTag"
      :tags="tagsForDisplay"
      :autocomplete-items="filteredAutoComplete"
      :allow-edit-tags="false"
      :placeholder="placeholder"
      @tags-changed="handleTagsChanged"
      :add-only-from-autocomplete="addOnlyFromAutocomplete"
    >
      <template #tag-center="{ tag, index, performDelete }">
        <div
          class="custom-tag"
          :class="{ 'custom-tag--from-effect': tag.isFromEffect }"
          :title="tag.title"
        >
          <span class="custom-tag__text">{{ tag.text }}</span>
          <SvgIcon v-if="tag.isFromEffect" icon="lock" class="custom-tag__lock-icon" />
          <i v-else class="ti-icon-close" @click.stop="performDelete(index)"></i>
        </div>
      </template>
    </vue-tags-input>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { Tag } from '@/sheet/stores/tags/tagsStore';
import { useI18n } from 'vue-i18n';
import SvgIcon from './SvgIcon.vue';

const props = defineProps<{
  label: string;
  store: any;
  storeKey: string;
  placeholder?: string;
  autocompleteSource?: string[];
  addOnlyFromAutocomplete?: boolean;
}>();

const { t } = useI18n();
const newTag = ref('');

const translationPrefixMap: Record<string, string> = {
  languages: 'titles.language.',
  armor: 'titles.proficiency-type.armor-proficiencies.',
  weapons: 'titles.proficiency-type.weapon-proficiencies.',
  conditionImmunities: 'titles.condition.',
  damageResistances: 'titles.damage-types.',
  damageImmunities: 'titles.damage-types.',
  damageVulnerabilities: 'titles.damage-types.',
};

const tagsFromStore = computed<Tag[]>(() => {
  return props.store[props.storeKey] ?? [];
});

const tagsForDisplay = computed(() => {
  const prefix = translationPrefixMap[props.storeKey] || '';
  return tagsFromStore.value.map((tag) => ({
    ...tag,
    text: tag.isDefault ? t(prefix + tag.text) : tag.text,
    originalKey: tag.isDefault ? tag.text : undefined,
    classes: tag.isFromEffect ? 'tag--from-effect' : '',
  }));
});

const sortTags = (tags: Tag[]) => {
  return [...tags].sort((a, b) => a.text.localeCompare(b.text));
};

const handleTagsChanged = (newTags: any[]) => {
  const userManagedTags = newTags
    .filter((tag) => !tag.isFromEffect)
    .map((tag) => ({
      _id: tag._id || uuidv4(),
      text: tag.originalKey || tag.text,
      isDefault: !!tag.isDefault,
    }));

  const currentEffectTags = props.store[props.storeKey].filter((tag: Tag) => tag.isFromEffect);

  props.store[props.storeKey] = sortTags([...userManagedTags, ...currentEffectTags]);
};

const autoCompleteItems = computed(() => {
  const prefix = translationPrefixMap[props.storeKey] || '';
  return (props.autocompleteSource || []).map((key) => ({
    text: t(prefix + key),
    originalKey: key,
    isDefault: true,
  }));
});

const filteredAutoComplete = computed(() => {
  if (!newTag.value || !props.autocompleteSource) return [];
  const currentText = newTag.value.toLowerCase();
  return autoCompleteItems.value.filter((item) => item.text.toLowerCase().includes(currentText));
});
</script>

<style scoped lang="scss">
.tags-input-container {
  display: flex;
  flex-direction: column;
  label {
    font-weight: var(--font-weight-bold);
  }
}

:deep(.vue-tags-input) {
  //Main library styling
  .ti-tag {
    padding: 2px 5px;
    &.tag--from-effect {
      background-color: var(--color-highlight);
      color: var(--color-highlight-detail);
      .ti-icon-close {
        display: none;
      }
    }
  }

  // Custom tag wrapper
  .custom-tag {
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &.custom-tag--from-effect {
      cursor: help;
    }

    &__lock-icon {
      width: 12px;
      height: 12px;
      fill: var(--color-on-highlight-secondary);
    }
  }
}
</style>
