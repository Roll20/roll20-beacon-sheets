<script setup>
import { useAppStore } from '@/stores/index.js';
import { useSheetStore } from '@/stores/sheetStore.js';
import { initValues } from './relay';

import PCView from './views/PCView.vue';
import NPCView from './views/NPCView.vue';

// Initialize the app store to trigger relay plugin and set permissions
useAppStore();
// The sheet store is where you want to be to customize what data / fields are on your sheet.
const sheet = useSheetStore();
const colorTheme = initValues.settings.colorTheme;
</script>
<template>
  <div class="sheet-container">
    <PCView v-if="sheet.sheet_mode !== 'npc'" />
    <NPCView v-else />
  </div>
</template>

<style lang="scss">
#app{
  padding: var(--half-gap);
}
.sheet-container{
  display: grid;
  gap: var(--half-gap);
  container-type: inline-size;
  max-width: 863px;    /* Set a fixed max width */
  min-width: 863px;    /* Set a fixed minimum width */
  width: 100%;         /* Ensure it takes full width up to the limit */
  margin: 0 auto;      /* Center the container */
  overflow-x: hidden;  /* Prevent horizontal scrolling */
}
.sheet-nav{
  ul{
    list-style-type: none;
    margin: 0;
    display: flex;
    gap:var(--half-gap);
  }
}
body{
  padding-block: var(--half-gap);
}
</style>
