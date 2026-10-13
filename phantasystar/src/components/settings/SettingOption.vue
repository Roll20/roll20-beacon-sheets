<script setup>
defineProps({
  option: { type: Object, required: true },
  value: { type: [Boolean, String], default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['change'])
</script>

<template>
  <label class="option">
    <select
      v-if="option.choices"
      class="option__select"
      :value="value"
      :disabled="disabled"
      @change="emit('change', $event.target.value)"
    >
      <option v-for="c in option.choices" :key="c.id" :value="c.id">{{ c.name }}</option>
    </select>
    <input
      v-else
      type="checkbox"
      :checked="value"
      :disabled="disabled"
      @change="emit('change', $event.target.checked)"
    />
    <span class="option__body">
      <strong>{{ option.name }}</strong>
      <small>{{ option.hint }}</small>
    </span>
  </label>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.option {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 5px 2px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);
  cursor: pointer;

  &:last-child { border-bottom: none; }

  input { margin-top: 2px; }
  input[type='checkbox'] { @include ps-pip-check(12px); }

  &__select {
    @include ps-control(22px);
    order: 1;
    margin-left: auto;
    min-width: 80px;
    cursor: pointer;
  }

  &__body { display: flex; flex-direction: column; min-width: 0; }

  strong { font-size: 12px; color: var(--ps-heading); }
  small { font-size: 10px; color: var(--ps-text-muted); line-height: 1.45; }
}
</style>
