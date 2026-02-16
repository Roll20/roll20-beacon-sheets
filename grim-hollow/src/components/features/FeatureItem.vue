<template>
  <div :class="{ 'feature-item': true, 'feature-item--loading': !loaded && compendiumPickers.length > 0 }">
    <div v-if="!loaded && compendiumPickers.length > 0" class="loader">
      <span class="loader__spinner"></span>
    </div>
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
        <div
          v-if="feature.description"
          class="description"
          v-html="parsedDescription"
          @click="handleCompendiumClick"
        ></div>

        <div v-if="compendiumPickers.length > 0" class="pickers">
          <div v-for="(picker, index) in compendiumPickers" :key="index" class="picker">
            <label>
              {{ picker.label }}
              <div v-if="!pickerData[picker.category]">Loading...</div>
              <select
                v-else
                v-model="picker.featureId"
                @focus="cachePreviousPicker(index, picker.featureId)"
                @change="setCompendiumPicker(feature, picker, index, $event)"
              >
                <option v-if="!picker.featureId" :value="undefined">Choose...</option>
                <option
                  v-for="option in pickerData[picker.category]"
                  :key="`${feature._id}__${index}__${option.id}`"
                  :value="`${feature._id}__${index}__${option.id}`"
                  :data-featureid="feature._id"
                  :data-index="index"
                >
                <!-- {{ `${feature._id}__${index}__${option.id}` }}   -->
                {{ picker.defaultId && picker.defaultId === `${feature._id}__${index}__${option.id}` ? `${option.pageName} (default)`: option.pageName }}
                </option>
              </select>
              <!-- <p>{{ getDescriptionById(picker.featureId, picker.category) }}</p> -->
            </label>
          </div>
        </div>

        <div v-if="pickers.length > 0" class="pickers">
          <div v-for="(picker, index) in pickers" :key="index" class="picker">
            <label>
              {{ picker.label }}
              <select :class="{ 'picker-unselected': !picker.value }" v-model="picker.value">
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
import { type Feature, type CompendiumPicker } from '@/sheet/stores/features/faturesStore';
import { useI18n } from 'vue-i18n';
import { computed, getCurrentInstance, type Ref, ref } from 'vue';
import type { Tag } from '@/sheet/stores/tags/tagsStore';
import SidebarLink from '../shared/SidebarLink.vue';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { parseSimpleMarkdown } from '@/utility/markdownParser';
import { CompendiumResults, createPageRequest } from '@/compendium/drop';
import { dispatchRef } from '@/relay/relay';
import { drag } from '@/compendium/drop';
import { id } from 'zod/v4/locales';
import { e, pi } from 'mathjs';

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

const pickerData: Ref<Record<string, any>> = ref({});

const pickers = computed(() => {
  const existing = effectsStore.effects.find((e) => e._id === props.feature.effectId);
  if (existing) {
    return existing.pickers || [];
  } else {
    return [];
  }
});

const getDescriptionById = (id: string = '', category: string): string => {
  if (!pickerData.value[category]) return '';
  const existing = pickerData.value[category].find(
    (option: Record<string, any>) => option._id === id,
  );
  if (!existing) return '';

  const payload = JSON.parse(existing.payload || '{}');
  return payload.description || '';
};

const compendiumPickers = computed(() => {
  return props.feature.compendiumPickers || [];
});

const loaded = ref(false);
const previousPickerValues = ref<Record<number, string | undefined>>({});

const cachePreviousPicker = (index: number, value: string | undefined) => {
  previousPickerValues.value[index] = value;
};

const compareValues = (
  itemValue: any, 
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'includes' | 'in', 
  targetValue: any
): boolean => {
  let a = itemValue;
  let b = targetValue;

  const isNumberComparison = ['gt', 'gte', 'lt', 'lte'].includes(op);
  if (isNumberComparison) {
    if (!isNaN(Number(a)) && !isNaN(Number(b))) {
      a = Number(a);
      b = Number(b);
    }
  }

  switch (op) {
    case 'eq':
      return a == b;
    case 'neq':
      return a != b;
    case 'gt':
      return a > b;
    case 'gte':
      return a >= b;
    case 'lt':
      return a < b;
    case 'lte':
      return a <= b;
    case 'includes':
      if (Array.isArray(a)) return a.includes(b);
      if (typeof a === 'string') return a.toLowerCase().includes(String(b).toLowerCase());
      return false;
    case 'in': 
      if (Array.isArray(b)) {
        return b.includes(a);
      }
      return false;

    default: return false;
  }
};

const loadPickers = async (callback: () => void) => {
  loaded.value = false;
  for (const picker of compendiumPickers.value) {
    const category = picker.category;
    const request = createPageRequest(category);
    
    const response:CompendiumResults = await dispatchRef.value.compendiumRequest({ query: request });
    if (response.errors)
      throw new Error("Expected a compendium request, but instead got an error.");
    if (!response?.data?.ruleSystem?.category?.pages)
      throw new Error("Could not find a page, you probably need to relog.");

    const data = response.data.ruleSystem.category.pages;
    pickerData.value[category] = data.filter(page => {
      if(picker.filter) {
        try {
          const filters = picker.filter;

          for (const [propKey, condition] of Object.entries(filters)) {
            const pageValue = page.properties[propKey];

            if (!condition || typeof condition !== 'object') continue;

            const { op, value } = condition as { op: any; value: any };

            if (pageValue === undefined && op !== 'neq') return false;

            if (!compareValues(pageValue, op, value)) {
              return false;
            }
          }
        } catch (e) {
          console.error('Filter error', e);
          return true;
        }
        return true;
      }
      return true;
    })
    .map((page: any) => ({
      pageName: page.name,
      categoryName: category,
      expansionId: page.book.itemId,
      id: page.id,
    }));
  }
  if(callback) callback();
};

loadPickers(() => {
  compendiumPickers.value.forEach(async (picker, index) => {
    if (pickerData.value[picker.category] && !picker.featureId && picker.default) {
      let option;
      if(picker.default.expansionId) { 
        // If expansionId is provided, match on both pageName and expansionId to ensure uniqueness
        option = pickerData.value[picker.category].find((page:any) => 
        picker.default && page.pageName === picker.default.pageName
        && page.expansionId == picker.default.expansionId);
      } else { 
        // Gets first matching pageName, which could lead to issues if there are multiple pages with the same name across
        // different expansions, but at least it will find something if the default is specified without an expansionId
        option = pickerData.value[picker.category].find((page:any) => picker.default && page.pageName === picker.default.pageName);
      }
      if(option) {
        picker.featureId = `${props.feature._id}__${index}__${option.id}`;
        picker.defaultId = picker.featureId;
        await setCompendiumPicker(props.feature, picker, index, new Event('change') as Event);
      } else {
        console.warn(`Default value "${picker.default}" not found for picker in category "${picker.category}".`);
        picker.featureId = undefined;
      }
    }
  });
  loaded.value = true;
});

const setCompendiumPicker = async (
  parent: Feature,
  picker: CompendiumPicker,
  index: number,
  event: Event,
) => {
  const previousFeatureId = previousPickerValues.value[index];
  if (previousFeatureId) features.remove(previousFeatureId);

  const target = event.target as HTMLSelectElement | null;
  const nextFeatureId = target?.value || picker.featureId;
  if (!nextFeatureId) return;

  picker.featureId = nextFeatureId;
  const compendiumId = nextFeatureId.split('__')[2];
  if (!compendiumId) return;

  const page = pickerData.value[picker.category]?.find(
    (option: Record<string, any>) => option.id === compendiumId,
  );
  if (!page) return;

  await drag({ coordinates: { left: 0, top: 0 }, dropData: page });

  const addedFeature = features.features[features.features.length - 1];
  addedFeature._id = nextFeatureId;
  addedFeature.source = parent.source;

  previousPickerValues.value[index] = nextFeatureId;
};

const handleCompendiumClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.dataset.compendiumLink) {
    event.preventDefault();
    appContext.config.globalProperties.$openCompendiumPopout(target.dataset.compendiumLink);
  }
};
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
        color: var(--color-negative);
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
.loader {
  position: absolute;
  display: grid;
  align-items: center;
  justify-items: start;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
  z-index: 9999;
  &__spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
    position: relative;
    background: linear-gradient(0deg, rgba(255, 61, 0, 0.2) 33%, #ff3d00 100%);
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    mix-blend-mode: screen;
    &:after {
      content: '';  
      box-sizing: border-box;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #0e0404;
    }
  }
}
@keyframes rotation {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg)}
}
.feature-item--loading {
  position: relative;
  .accordion {
    pointer-events: none;
    opacity: 0.35;
    padding-left: 10px;
    &__summary {
      &:before {
        content: '';
      }
    }
  }
}
</style>
