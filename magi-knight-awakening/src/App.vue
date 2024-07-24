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
</script>
<template>
  <div class="sheet-container">
    <!-- <header>
      <nav class="sheet-nav">
        <ul>
          <li>
            <RouterLink to="/sheet">Base Stats</RouterLink>
          </li>
          <li>
            <RouterLink to="/student">Student</RouterLink>
          </li>
          <li>
            <RouterLink to="/knight">Magi-Knight</RouterLink>
          </li>
        </ul>
      </nav>
    </header> -->
    <PCView v-if="sheet.sheet_mode === 'pc'" />
    <NPCView v-if="sheet.sheet_mode === 'npc'" />
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
