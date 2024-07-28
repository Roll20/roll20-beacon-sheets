<template>
  <header class="pc-header">
    <div class="pc-header__resource-display">Momentum: {{ gmStore.resources.momentum }}</div>
    <div class="pc-header__resource-display">Threat: {{ gmStore.resources.threat }}</div>
  </header>
  <hr>
  <main>
    This will be the sheet body
  </main>
</template>

<script setup lang="ts">
import { useGMStore } from "@/sheet/stores/gmStore/gmStore";
const gmStore = useGMStore();

</script>

<style scoped lang="scss">
  .pc-header {
    display: flex;
    gap: 8px;
  }
</style>