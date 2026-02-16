<template>
  <div class="toggle-switch">
    <input
      class="toggle-switch__input"
      type="checkbox"
      :disabled="disabled"
      :checked="modelValue === checkedValue"
      @change="onToggle"
    />
    <div class="toggle-switch__slider"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

type CustomeValue = boolean | string | number;

const props = withDefaults(
  defineProps<{
    modelValue: CustomeValue;
    disabled: boolean;
    checkedValue?: CustomeValue;
    uncheckedValue?: CustomeValue;
  }>(),
  {
    disabled: false,
    checkedValue: true,
    uncheckedValue: false,
  }
);

const emit = defineEmits<{
  (e: 'change', value: CustomeValue): void;
  (e: 'update:modelValue', value: CustomeValue): void;
}>();

const onToggle = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  const value = checked ? props.checkedValue : props.uncheckedValue;
  emit('change', value);
  emit('update:modelValue', value);
};
</script>

<style lang="scss" scoped>
.toggle-switch {
  --width: 50px;
  --margin: 3px;
  position: relative;
  display: inline-block;
  width: var(--width);
  height: calc(var(--width) / 2);

  &__input {
    opacity: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    box-sizing: border-box;
    position: absolute;
    z-index: 2;
  }

  &__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-tertiary);
    transition: 0.3s;
    border-radius: calc(var(--width) / 2);
    z-index: 1;

    &:before {
      position: absolute;
      content: '';
      height: calc(calc(var(--width) / 2) - 2 * var(--margin));
      width: calc(calc(var(--width) / 2) - 2 * var(--margin));
      left: var(--margin);
      bottom: var(--margin);
      background-color: white;
      transition: 0.3s;
      border-radius: calc(var(--width) / 2);
    }
  }

  &__input:checked + &__slider {
    background-color: var(--color-highlight);
  }

  &__input:checked + &__slider:before {
    left: calc(100% - calc(var(--width) / 2) + var(--margin));
  }

  &__input:disabled + &__slider {
    cursor: not-allowed;
    background-color: var(--color-disabled);
  }
  &--small {
    --width: 30px;
    --margin: 2px;
  }
  &--x-small {
    --width: 20px;
    --margin: 0px;
  }
}
</style>