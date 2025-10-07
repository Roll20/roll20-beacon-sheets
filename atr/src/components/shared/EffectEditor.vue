<template>
  <div class="json-viewer-editor">
    <button @click="toggleMode" class="toggle-button">
      {{ isEditing ? $t('actions.view') : $t('actions.edit') }}
    </button>

    <div v-if="!isEditing" class="json-view">
      <pre>{{ jsonText }}</pre>
    </div>

    <div v-else class="json-editor">
      <textarea v-model="editText" rows="10" />
      <button @click="save" class="save-button">{{ $t('actions.save') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
  effectId: string;
}>();

const effect = computed(() => {
  return useEffectsStore().getExistingOrCreate({_id: props.effectId});
});

const jsonText = computed(() => JSON.stringify(effect.value, null, 2));

const isEditing = ref(false);
const editText = ref('');

const toggleMode = () => {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    // Entering edit mode: copy current JSON to editText
    editText.value = jsonText.value;
  }
};

const save = () => {
  try {
    const parsed = JSON.parse(editText.value);
    useEffectsStore().update(parsed);
    isEditing.value = false;
  } catch (error) {
     alert(t('titles.invalid-json'));
  }
};
</script>

<style lang="scss" scoped>
.json-viewer-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.toggle-button,
.save-button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}
.json-editor textarea {
  width: 100%;
  font-family: monospace;
  font-size: 0.9rem;
  padding: 0.5rem;
}
.json-view pre {
  background: #f3f3f3;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow: auto;
}
</style>
