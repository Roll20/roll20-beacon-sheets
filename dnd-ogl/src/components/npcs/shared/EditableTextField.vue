<template>
  <!-- View Mode-->
  <p v-if="!editMode" :class="{ 'is-italic': isItalic }">
    <em>{{ modelValue }}</em>
  </p>
  <!-- Edit Mode -->
  <textarea
    v-else
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    rows="2"
    class="npc-statblock__full-width-input"
  ></textarea>
</template>

<script setup lang="ts">
defineProps({
  modelValue: { type: String, required: true },
  editMode: { type: Boolean, required: true },
  // Optional flag to apply italic styling in view mode.
  isItalic: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.is-italic {
  font-style: italic;
}
.npc-statblock__full-width-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.25rem;
}
</style>