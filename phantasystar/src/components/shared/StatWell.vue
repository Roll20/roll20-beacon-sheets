<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  size: { type: String, default: 'md' },
  readonly: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  align: { type: String, default: 'center' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="ps-well"
    :class="[`size-${size}`, { readonly }]"
    :style="{ textAlign: align }"
    :value="modelValue"
    :readonly="readonly"
    :tabindex="readonly ? -1 : 0"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.ps-well {
  @include ps-well;
  width: 100%;
  min-width: 0;
  font-size: var(--ps-fs-value);
  padding: 2px 4px;

  &:focus {
    outline: 2px solid var(--ps-blue);
    outline-offset: -1px;
  }
  &.readonly {
    background: var(--ps-panel-alt);
    font-weight: 700;
    cursor: default;
  }
  &.size-sm { height: 22px; font-size: var(--ps-fs-body); }
  &.size-md { height: 30px; }
  &.size-lg { height: 38px; font-size: var(--ps-fs-big); font-weight: 700; }
}
</style>
