<template>
  <div class="range-bar">
    <div
      v-for="n in max"
      :key="n"
      :class="n <= count ? 'range-bar__option range-bar__option--checked' : 'range-bar__option'"
      @click="check(n)"
    >
      <SvgIcon class="svg-icon--fit" v-if="icon" :icon="icon" />
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
}>();

const uuid = uuidv4();

const emit = defineEmits<{
  (e: 'update', value: number): void;
}>();

const check = (numericValue:number) => {
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
    gap: 0.5rem;

    &__option {
      appearance: none;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background-color: var(--color-tertiary);
      cursor: pointer;
      padding: 0;
      margin: 0;
      box-shadow: none;
      outline: none;
      transition: background-color 0.1s ease;

      &--checked {
        background-color: var(--color-highlight)!important;
        .svg-icon {
          fill: var(--color-highlight-detail);
        }
      }

      &:hover {
        background-color: var(--color-highlight);
      }
    }
  }
</style>
