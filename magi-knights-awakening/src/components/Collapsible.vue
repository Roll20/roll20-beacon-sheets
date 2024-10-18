<script setup>
import { ref } from 'vue';
const props = defineProps({
  default: {
    type:Boolean,
    default: false
  },
  basis: Object
});
const emit = defineEmits(['collapse'])
const collapseState = props.basis || ref(props.default);
const collapseExpand = () => {
  collapseState.value = !collapseState.value;
  emit('collapse');
};
</script>

<template>
  <div class="collapsible">
    <button class="collapse-control material-symbols-outlined" @click="collapseExpand">unfold_more</button>
    <slot v-if="collapseState" name="collapsed"></slot>
    <slot v-if="!collapseState" name="expanded"></slot>
  </div>
</template>

<style>
  .collapsible{
    position: relative;
    min-height: 28px;
  }
  .collapsible:not(:hover,:focus-within)> .collapse-control{
    visibility: hidden;
  }
  .collapse-control{
    position: absolute;
    right: 0;
    top: 0;
    background: radial-gradient(circle at center,var(--header-blue),var(--header-blue) 40%,transparent);
    color: var(--light);
    border-radius: 100%;
    aspect-ratio: 1 / 1;
    font-size: 100%;
  }
</style>