<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <label class="span-1">
          {{ $t('titles.result') }} *
          <input v-model="result" required />
        </label>
        <label class="span-1">
          {{ $t('titles.intensity') }}
          <input v-model="intensity" />
        </label>
        <label class="modifier-group">
          {{ $t('titles.minor-insanity-modifier') }}
          <div class="columns columns-4">
            <input type="number" v-model.number="minorModifier.value" class="span-3" />
            <select v-model="minorModifier.type" class="span-1">
              <option value="permanent">{{ $t('titles.permanent') }}</option>
              <option value="while-active">{{ $t('titles.while-active') }}</option>
            </select>
          </div>
        </label>
        <label class="modifier-group">
          {{ $t('titles.major-insanity-modifier') }}
          <div class="columns columns-4">
            <input type="number" v-model.number="majorModifier.value" class="span-3" />
            <select v-model="majorModifier.type" class="span-1">
              <option value="permanent">{{ $t('titles.permanent') }}</option>
              <option value="while-active">{{ $t('titles.while-active') }}</option>
            </select>
          </div>
        </label>
        <label>
          {{ $t('titles.description') }}
          <textarea v-model="description" rows="4"></textarea>
        </label>
        <label class="effects-editor">
          {{ $t('titles.effects') }}
          <textarea v-model="effects" rows="5"></textarea>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="active" />
          {{ $t('titles.active') }}
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useInsanityStore, type Insanity } from '@/sheet/stores/insanity/insanityStore';
import { useEffectsStore, type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { useSidebar } from './useSidebar';
import { stripIds } from '@/utility/jsonTools';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  insanity: Partial<Insanity> | null;
}>();

const store = useInsanityStore();
const effectsStore = useEffectsStore();

const isNew = computed(() => !props.insanity?._id);
const _id = props.insanity?._id ?? uuidv4();
const effectId = props.insanity?.effectId ?? uuidv4();

const result = ref(props.insanity?.result ?? '');
const intensity = ref(props.insanity?.intensity ?? '');
const active = ref(props.insanity?.active ?? true);
const description = ref(props.insanity?.description ?? '');
const minorModifier = ref<Insanity['minorModifier']>(
  props.insanity?.minorModifier ?? { value: 0, type: 'while-active' },
);
const majorModifier = ref<Insanity['majorModifier']>(
  props.insanity?.majorModifier ?? { value: 0, type: 'while-active' },
);

let initialEffects = JSON.stringify(
  stripIds(effectsStore.getEmptyEffect({ _id: effectId })),
  null,
  2,
);
if (props.insanity?.effectId) {
  const existingEffects = effectsStore.effects.find((e) => e._id === props.insanity!.effectId);
  if (existingEffects) {
    initialEffects = JSON.stringify(stripIds(existingEffects), null, 2);
  }
}
const effects = ref(initialEffects);

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const insanityData: Partial<Insanity> = {
    _id,
    result: result.value,
    intensity: intensity.value,
    active: active.value,
    description: description.value,
    minorModifier: minorModifier.value,
    majorModifier: majorModifier.value,
    effectId,
  };
  store.update(insanityData);

  let parsedEffects: Partial<Effect> = {};
  try {
    parsedEffects = JSON.parse(effects.value);
  } catch {
    /* error handling maybe */
  }
  parsedEffects._id = effectId;
  effectsStore.update(parsedEffects);

  useSidebar().close();
};

const remove = () => {
  if (props.insanity?._id) {
    if (props.insanity.effectId) effectsStore.remove(props.insanity.effectId);
    store.remove(props.insanity._id);
    useSidebar().close();
  }
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped>
label:has(input[type='checkbox']) {
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 0.5rem;
  align-items: center;
}
</style>
