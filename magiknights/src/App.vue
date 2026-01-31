<script setup>
import { useAppStore } from '@/stores/index.js';
import { useMetaStore } from '@/stores/metaStore.js';
import { useSheetStore } from '@/stores/sheetStore.js';
import { initValues } from './relay';

import PCView from './views/PCView.vue';
import NPCView from './views/NPCView.vue';

// These stores should drive how to access the data in your sheet, and how to trigger actionable events.
const appStore = useAppStore();
// The meta store has generic character info for every sheet.
const meta = useMetaStore();
// The sheet store is where you want to be to customize what data / fields are on your sheet.
const sheet = useSheetStore();
const colorTheme = initValues.settings.colorTheme;

// Debug: Export dehydrated store as JSON for comparison
const exportSheetData = () => {
  const data = appStore.dehydrateStore();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sheet-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

</script>
<template>
  <div class="sheet-container">
    <button class="debug-export-btn" @click="exportSheetData">
      Export JSON
    </button>
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
.debug-export-btn {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 9999;
  padding: 6px 12px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}
.debug-export-btn:hover {
  background: #e55a2b;
}
</style>
