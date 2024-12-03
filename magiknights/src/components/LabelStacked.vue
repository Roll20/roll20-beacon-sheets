<script setup>
const {button} = defineProps({
  button: Boolean
})
</script>

<template>
  <label v-if="!button" class="label-stacked">
    <slot name="number"></slot>
    <slot name="label"></slot>
  </label>
  <div v-else class="label-stacked">
    <slot name="number"></slot>
    <slot name="label"></slot>
  </div>
</template>

<style>
  .label-stacked{
    display:flex;
    flex-direction: column;
    align-items: center;
  }
</style>