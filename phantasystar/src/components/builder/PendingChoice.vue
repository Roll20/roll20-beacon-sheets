<script setup>
import { computed } from 'vue'
import StepFlag from './StepFlag.vue'

const props = defineProps({
  choice: { type: Object, required: true },
  modelValue: { type: String, default: '' },
  number: { type: [Number, String], default: '' },
})
const emit = defineEmits(['update:modelValue'])

const picks = computed(() => props.modelValue.split('|').filter(Boolean))
const done = computed(() => picks.value.length >= props.choice.count)

const toggle = (value) => {
  const next = picks.value.includes(value)
    ? picks.value.filter((p) => p !== value)
    : [...picks.value, value].slice(-props.choice.count)
  emit('update:modelValue', next.join('|'))
}
</script>

<template>
  <div class="choice">
    <StepFlag :done="done" :mark="number" />
    <span class="choice__label">
      {{ choice.label }}<template v-if="choice.count > 1"> ({{ picks.length }}/{{ choice.count }})</template>
    </span>
    <select
      v-if="choice.count === 1"
      class="choice__select"
      :value="picks[0] ?? ''"
      @change="emit('update:modelValue', $event.target.value)"
    >
      <option value="">Choose…</option>
      <option v-for="o in choice.options" :key="o.value" :value="o.value">{{ o.name }}</option>
    </select>
    <div v-else class="choice__toggles">
      <button
        v-for="o in choice.options"
        :key="o.value"
        type="button"
        class="toggle"
        :class="{ 'toggle--on': picks.includes(o.value) }"
        @click="toggle(o.value)"
      >{{ o.name }}</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.choice {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);
}

.choice__label { font-weight: 700; color: var(--ps-heading); font-size: 13px; flex: 1 1 140px; }

.choice__select {
  @include ps-control(26px);
  text-align: left;
  min-width: 180px;
  cursor: pointer;
}

.choice__toggles { display: flex; flex-wrap: wrap; gap: 4px; }

.toggle {
  @include ps-chip(true);
  cursor: pointer;
  font-size: 10.5px;
  padding: 3px 8px;

  &--on { background: var(--ps-blue); color: #fff; border-color: var(--ps-blue); }
}

</style>
