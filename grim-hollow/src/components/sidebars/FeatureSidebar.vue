<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <label class="span-2">
          {{ $t('titles.name') }} *
          <input v-model="name" required />
        </label>
        <label class="span-1">
          {{ $t('titles.group') }} *
          <select v-model="group" required>
            <option value="class-features">{{ $t('titles.feature-groups.class-features') }}</option>
            <option value="ancestry-features">
              {{ $t('titles.feature-groups.ancestry-features') }}
            </option>
            <option value="feats">{{ $t('titles.feature-groups.feats') }}</option>
            <option value="background-features">
              {{ $t('titles.feature-groups.background-features') }}
            </option>
            <option value="others">{{ $t('titles.feature-groups.others') }}</option>
            <option value="others">{{ $t('titles.feature-groups.traits') }}</option>
            <option value="transformation-features">
              {{ $t('titles.feature-groups.transformation-features') }}
            </option>
          </select>
        </label>
        <label class="span-1">
          {{ $t('titles.source') }}
          <input v-model="source" />
        </label>
        <label>
          {{ $t('titles.description') }}
          <textarea v-model="description" rows="4" />
        </label>
        <TagsInput :tagId="tagId" @update="updateTags" label="titles.tags" tagSource="feature" />
        <label class="effects-editor">
          {{ $t('titles.effects') }}
          <textarea v-model="effects" />
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import {
  type Feature,
  type FeatureGroup,
  useFeaturesStore,
} from '@/sheet/stores/features/faturesStore';
import { useEffectsStore, type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { v4 as uuidv4 } from 'uuid';
import { useTagsStore, type Tag } from '@/sheet/stores/tags/tagsStore';
import TagsInput from '../shared/ItemTagsInput.vue';
import { stripIds } from '@/utility/jsonTools';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  feature: Partial<Feature> | null;
}>();

const name = ref(props.feature?.label ?? '');
const group = ref(props.feature?.group ?? '');
const source = ref(props.feature?.source ?? '');
const description = ref(props.feature?.description ?? '');
const _id = props.feature?._id ?? uuidv4();
const effectId = props.feature?.effectId ?? uuidv4();

const tagsStore = useTagsStore();
const tagId = props.feature?.tagId ?? uuidv4();
const initialTagGroup = tagsStore.getExistingOrCreate(tagId, 'feature');
const currentTags = ref<Tag[]>(JSON.parse(JSON.stringify(initialTagGroup.tags)));

const updateTags = (tags: Tag[]) => {
  currentTags.value = tags;
};

let initialEffects = JSON.stringify(
  stripIds(useEffectsStore().getEmptyEffect({ _id: effectId })),
  null,
  2,
);
const effectsStore = useEffectsStore();
if (props.feature?.effectId) {
  const existing = effectsStore.effects.find(
    (e) => props.feature && e._id === props.feature.effectId,
  );
  if (existing) {
    try {
      initialEffects = JSON.stringify(stripIds(existing), null, 2);
    } catch {
      initialEffects = JSON.stringify(
        stripIds(useEffectsStore().getEmptyEffect({ _id: effectId })),
        null,
        2,
      );
    }
  }
}
const effects = ref(initialEffects);

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const featureData = {
    _id,
    label: name.value.trim(),
    group: group.value as FeatureGroup,
    source: source.value.trim(),
    description: description.value?.trim(),
    effectId,
    tagId,
  };
  handleSave(featureData);
  useSidebar().close();
};

const handleSave = (featureData: Partial<Feature>) => {
  const featuresStore = useFeaturesStore();
  const effectsStore = useEffectsStore();
  featuresStore.update(featureData);
  let parsedEffects: Partial<Effect> = {};
  try {
    parsedEffects = JSON.parse(effects.value);
    parsedEffects._id = featureData.effectId;
  } catch {
    const id = featureData.effectId;
    parsedEffects = { _id: id };
  }
  effectsStore.update(parsedEffects);
  tagsStore.update({ _id: tagId, tags: currentTags.value });
};

const canEditName = computed(() => !props.feature?.group);

const remove = () => {
  if (props.feature?._id) {
    useFeaturesStore().remove(props.feature._id);
    useSidebar().close();
  }
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped></style>
