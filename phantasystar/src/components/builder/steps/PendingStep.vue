<script setup>
defineProps({ step: { type: Object, required: true } })
</script>

<template>
  <p class="pending">The {{ step.label }} step is still being built.</p>
</template>

<style scoped lang="scss">
.pending {
  margin: 0;
  padding: 24px 12px;
  border: 1.5px dashed var(--ps-line);
  border-radius: var(--ps-radius);
  text-align: center;
  color: var(--ps-text-muted);
}
</style>
