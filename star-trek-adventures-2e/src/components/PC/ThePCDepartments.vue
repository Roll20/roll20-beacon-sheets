<template>
  <section class="stats-section departments-section">
    <h2>Departments</h2>
    <StatInterfaceBlock statType="Department" />
  </section>
</template>

<script setup lang="ts">
import StatInterfaceBlock from './StatInterfaceBlock.vue';



</script>

<style lang="scss">
  .departments-section {
    background-color: var(--tertiary-background);
  }
</style>