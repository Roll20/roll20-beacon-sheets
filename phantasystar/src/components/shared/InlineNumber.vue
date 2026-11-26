<script setup>
import { computed } from 'vue'

const model = defineModel({ type: [Number, String], default: 0 })

const width = computed(() => `${Math.max(2, String(model.value ?? '').length) + 1}ch`)
</script>

<template>
  <input v-model.number="model" type="number" class="inline-number" :style="{ width }" />
</template>

<style scoped lang="scss">
.inline-number {
  font: inherit;
  font-weight: 700;
  color: var(--ps-entry, var(--ps-heading));
  text-align: center;
  background: none;
  border: none;
  border-bottom: 1px dotted var(--ps-blue);
  border-radius: 0;
  padding: 0 1px;
  margin: 0;
  -moz-appearance: textfield;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

  &:hover { background: var(--ps-field); }

  &:focus {
    outline: 2px solid var(--ps-blue);
    outline-offset: 1px;
    background: var(--ps-field);
  }
}
</style>
