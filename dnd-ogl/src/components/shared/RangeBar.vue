<template>
  <div :class="{ 'range-bar': true, 'range-bar--disabled': props.disabled }" v-tooltip="tooltip">
    <div
      v-for="n in max"
      :key="n"
      :class="{'range-bar__option': true, 'range-bar__option--checked': n <= count, 'range-bar__option--has-icon': icon}"
      @click="check(n)"
    >
      <SvgIcon class="svg-icon--fit" v-if="icon && n <= count" :icon="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import type { Ref } from 'vue';
import SvgIcon from '../shared/SvgIcon.vue';

const props = defineProps<{
  model?: Ref<number>;
  count: number;
  max: number;
  icon?: string
  tooltip?: string;
  disabled?: boolean;
}>();

const uuid = uuidv4();

const emit = defineEmits<{
  (e: 'update', value: number): void;
}>();

const check = (numericValue:number) => {
  if(props.disabled) return;
  const updatedValue = (numericValue <= props.count) ? numericValue-1 : numericValue;
  if(props.model !== undefined) {
    props.model.value = updatedValue;
  } else {
    emit('update', updatedValue);
  }
};

</script>

<style lang="scss" scoped>
  .range-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--rangebar-gap, 5px);

    &__option {
      appearance: none;
      width: var(--rangebar-size, 14px);
      height: var(--rangebar-size, 14px);
      border-radius: 50%;
      border: 1px solid var(--rangebar-border-color, rgb(0 0 0 / 0.5));
      background: var(--rangebar-background, transparent);
      cursor: pointer;
      padding: 0;
      margin: 0;
      box-shadow: none;
      outline: none;
      display: grid;
      place-content: center;

      &--checked {
        border: 1px solid var(--rangebar-border-color-checked, rgb(0 0 0));
        background: var(--rangebar-background-checked, transparent);

        .svg-icon {
          width: var(--rangebar-check-size, 8px);
          height: var(--rangebar-check-size, 8px);
          :deep(svg) {
            fill: var(--rangebar-check-color, rgb(0,0,0));
            width: 100%;
            height: 100%;
          }
        }
        
        &:not(.range-bar__option--has-icon) {
          &:after {
            content: '';
            display: block;
            width: var(--rangebar-check-size, 8px);
            height: var(--rangebar-check-size, 8px);
            border-radius: 50%;
            background: var(--rangebar-check-color, rgb(0,0,0));
          }
        }
      }

      &:hover:not(.range-bar__option--checked) {
        border: 1px solid var(--rangebar-border-color-hover, rgb(0 0 0));
        background: var(--rangebar-background-hover, transparent);
        &:not(.range-bar__option--has-icon) {
          &:after {
            background: var(--rangebar-check-color-hover, rgb(0,0,0));
          }
        }
        .svg-icon {
          :deep(svg) {
            fill: var(--rangebar-check-color-hover, rgb(0,0,0));
          }
        }
      }
    }

    &--disabled {
      cursor: not-allowed;
      .range-bar__option {
        pointer-events: none;
      }
    }
  }
</style>
