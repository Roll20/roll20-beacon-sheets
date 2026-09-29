<script setup>
import d20Markup from '@/assets/img/d20.svg?raw'
</script>

<template>
  <span class="d20-icon" aria-hidden="true" v-html="d20Markup" />
</template>

<style scoped lang="scss">
.d20-icon {
  display: inline-flex;
  width: 1em;
  height: 1.08em;
  flex: none;

  :deep(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
}
</style>
