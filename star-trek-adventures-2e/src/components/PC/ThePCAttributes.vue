<template>
  <section 
    class="stats-section attributes-section"
    :class="`stats-section--${editMode}`"
  >
    <h2>Attributes</h2>
    <StatInterfaceBlock stat-type="Attribute" />
  </section>
</template>

<script setup lang="ts">
import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
import StatInterfaceBlock from './StatInterface/StatInterfaceBlock.vue';
import { computed } from 'vue';

const uiStore = useUIStore();
const editMode = computed(()=> uiStore.editMode ? "edit": "view")
</script>

<style lang="scss">
  .attributes-section {
    background-color: var(--secondary-background);
  }
</style>