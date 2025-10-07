<template>
  <div class="feature-item">
    <details class="accordion">
      <summary class="accordion__summary">
        <SidebarLink
          :componentName="'FeatureSidebar'"
          :props="{ feature: feature }"
          :options="{
            title: t('actions.edit-feature'),
            hasSave: true,
            hasDelete: true,
          }"
          :label="feature.label"
        />
        <div v-if="feature.source" class="source">{{ feature.source }}</div>
      </summary>
      <div class="accordion__details">
        <div v-if="feature.description" class="description" v-html="parsedDescription" @click="handleCompendiumClick"></div>

        <div v-if="pickers.length > 0" class="pickers">
          <div v-for="(picker, index) in pickers" :key="index" class="picker">
            <label>
              {{ picker.label }}
              <select :class="{'picker-unselected': !picker.value}" v-model="picker.value">
                <option :value="undefined">Choose...</option>
                <option v-for="option in picker.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="featureTags.length" class="tags">
          <span v-for="tag in featureTags" :key="tag._id" class="tag-pill">
            {{ tag.text }}
          </span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { type Feature } from '@/sheet/stores/features/faturesStore';
import { useI18n } from 'vue-i18n';
import { computed, getCurrentInstance } from 'vue';
import type { Tag } from '@/sheet/stores/tags/tagsStore';
import SidebarLink from '../shared/SidebarLink.vue';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { parseSimpleMarkdown } from '@/utility/markdownParser';
import { pick } from 'lodash';

const { appContext } = getCurrentInstance()!;

const effectsStore = useEffectsStore();

const { t } = useI18n();
const props = defineProps<{
  feature: Feature;
}>();

defineEmits<{
  (e: 'update:level', value: number): void;
  (e: 'update:ability', value: AbilityKey): void;
}>();
const parsedDescription = computed(() => parseSimpleMarkdown(props.feature.description));

const features = useFeaturesStore();
const featureTags = computed<Tag[]>(() => {
  return features.getFeatureTags(props.feature.tagId);
});

const pickers = computed(() => {
  const existing = effectsStore.effects.find((e) => e._id === props.feature.effectId);
  if (existing) {
    return existing.pickers || [];
  } else {
    return [];
  }
});

const handleCompendiumClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.dataset.compendiumLink) {
    event.preventDefault();
    appContext.config.globalProperties.$openCompendiumPopout(target.dataset.compendiumLink);
  }
}
</script>

<style lang="scss" scoped>
.pickers {
  margin-top: 1rem;
  .picker {
    select {
      width: 100%;
    }
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }
}
.feature-item:has(.picker-unselected) {
  .accordion {
    .accordion__summary {
      .sidebar-link {
        color: var(--color-negative);
        font-weight: var(--weight-bold);
      }
      &:before {
        color: var(--color-negative)
      }
    }
  }
}
.sidebar-link {
  font-weight: var(--weight-bold);
}
.source {
  color: var(--color-secondary);
}
</style>
