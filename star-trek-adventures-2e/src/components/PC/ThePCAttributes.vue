<template>
  <section class="stats-section attributes-section">
    <h2>Attributes</h2>
    <StatInterfaceBlock stat-type="Attribute" />
  </section>
</template>

<script setup lang="ts">
import StatInterfaceBlock from './StatInterfaceBlock.vue';


</script>

<style lang="scss">
  .attributes-section {
    background-color: var(--secondary-background);
  }
</style>