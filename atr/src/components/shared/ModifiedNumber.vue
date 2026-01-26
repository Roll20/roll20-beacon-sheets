<template>
  <div class="modified-number" @click="enterEditMode">
    <span v-if="!isEditing">{{ modifiedValue.value.final }}</span>
    <input
      v-else
      type="number"
      v-model.number="tempValue"
      @blur="exitEditMode"
      @keydown.enter.prevent="exitEditMode"
      ref="inputRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { type ModifiedValue, useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';

const props = defineProps<{
  modelValue: number;
  modifiedValue: ModifiedValue;
}>();

const emit = defineEmits(['update:modelValue']);

const isEditing = ref(false);
const tempValue = ref(props.modelValue);
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  (newVal) => {
    if (!isEditing.value) {
      tempValue.value = newVal;
    }
  }
);

function enterEditMode() {
  isEditing.value = true;
  tempValue.value = props.modelValue;
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function exitEditMode() {
  isEditing.value = false;
  if (tempValue.value !== props.modelValue) {
    emit('update:modelValue', tempValue.value);
  }
}
</script>