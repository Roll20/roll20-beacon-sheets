<template>
  <div class="editable-textarea">
    <h3 v-if="isTitled && label" class="editable-textarea__title">{{ label }}</h3>

    <!-- View Mode -->
    <div v-if="!editMode && modelValue">
      <strong v-if="!isTitled && label">{{ label }}:</strong>
      <div v-if="props.modelValue" class="description" v-html="parsedDescription"></div>
    </div>
    <!-- Edit mode -->
    <textarea
      v-else-if="editMode"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      rows="2"
      class="npc-statblock__full-width-input"
      :placeholder="label"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { parseSimpleMarkdown } from '@/utility/markdownParser';
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: String, required: true },
  editMode: { type: Boolean, required: true },
  label: { type: String },
  //If it has a title
  isTitled: { type: Boolean, default: false },
});

const parsedDescription = computed(() => parseSimpleMarkdown(props.modelValue));

defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.editable-textarea__title {
  margin: 1rem 0 0rem;
}
.npc-statblock__full-width-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.25rem;
}
</style>
