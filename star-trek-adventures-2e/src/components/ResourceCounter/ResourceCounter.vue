<template>
  <div class="resource-counter">
    <label class="resource-counter__label" :for="id ?? label"> {{ label }}</label>
    <button class="resource-counter__button resource-counter__button--subtract">
      <span class="sr-only">
        subtract
      </span>
    </button>
    <input 
    :id="id ?? label"
    class="resource-counter__input"
    type="number"
    v-model="model"
    >
    <button class="resource-counter__button resource-counter__button--add">
      <span class="sr-only">
        add
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type ResourceCounterProps = {
  id: string;
  label: string;
  modelValue: {
    value: number;
  }
}
const props = defineProps<ResourceCounterProps>();

const emit = defineEmits(["update:modelValue"])

const model = computed({
  get() {
    console.log(props.modelValue.value)
    return props.modelValue.value
  },
  set(newValue) {
    console.log("setting", newValue)
    emit("update:modelValue", {key: "value", value: newValue})
  }
})

</script>

<style scoped lang="scss">
  @use "@/common/scss/common.scss";
  .resource-counter {
    display: grid;
    align-items: center;
    grid-template-columns: 1rem 5rem 1rem;
    gap: 2px;
    &__button {
      height: 1rem;
      width: 1rem;
      padding: 0;
      background-position: 50% 50%;

      &--subtract {
        background-image: url(../../common/assets/remove.svg);
      }
      &--add {
        background-image: url(../../common/assets/add.svg);
      }
    }
    &__input {
      width: 5rem;
      box-sizing: border-box;
      &::-webkit-outer-spin-button
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      -moz-appearance: textfield;
    }
    &__label {
      grid-column: span 3;
      justify-self: center;
    }
  }
</style>