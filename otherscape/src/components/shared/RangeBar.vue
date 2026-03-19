<template>
  <div class="range-bar">
    <div
      v-for="n in max"
      :key="n"
      :class="n <= modelValue ? 'range-bar__option range-bar__option--checked' : 'range-bar__option'"
      @click="check(n)"
    >
      <SvgIcon class="svg-icon--fit" v-if="icon" :icon="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import SvgIcon from './SvgIcon.vue';

const props = defineProps<{
  modelValue: number;
  max: number;
  icon?: string
}>();

const modelValue = toRef(props, 'modelValue');

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const check = (numericValue:number) => {
  const updatedValue = (numericValue <= props.modelValue) ? numericValue-1 : numericValue;
  emit('update:modelValue', updatedValue);
};

</script>

<style lang="scss" scoped>
  .range-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;

    &__option {
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      
      cursor: pointer;
      padding: 0;
      margin: 0;
      box-shadow: none;
      outline: none;
      box-sizing: border-box;
      border: 1px solid rgb(var(--color-palette-foreground) / var(--color-palette-disabled));

      &--checked {
        display: grid;
        place-items: center;
        border: 1px solid rgb(var(--color-palette-default));
        &:after {
          width: calc(100% - 6px);
          height: calc(100% - 6px);
          content: '';
          display: block;
          border-radius: 50%;
          background-color: rgb(var(--color-palette-highlight));
        }
      }

      &:focus-within:not(.range-bar__option--checked) {
        border-color: rgb(var(--color-palette-default));
      }

      &:hover:not(.range-bar__option--checked) {
        border-color: rgb(var(--color-palette-foreground) / 0.5);
      }
    }
  }
</style>
