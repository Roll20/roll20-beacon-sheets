<script setup>
import { useBioStore } from '@/stores/bioStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import EquipmentPanel from './EquipmentPanel.vue'
import MoneyPanel from './MoneyPanel.vue'

const store = useBioStore()

const panels = [
  { key: 'appearance', title: 'Appearance', rows: 4 },
  { key: 'history', title: 'History and Goals', rows: 12 },
  { key: 'storyBonds', title: 'Story Bonds', rows: 2 },
  { key: 'languages', title: 'Languages', rows: 2 },
]
</script>

<template>
  <div class="page">
    <div class="gear">
      <EquipmentPanel />
      <MoneyPanel />
    </div>

    <div class="prose">
      <SheetPanel v-for="panel in panels" :key="panel.key" :title="panel.title">
        <textarea v-model="store[panel.key]" :rows="panel.rows" />
      </SheetPanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.page {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;
  padding: 12px;
  max-width: 1180px;
  margin: 0 auto;
}

.gear,
.prose { display: flex; flex-direction: column; gap: var(--ps-gap-lg); min-width: 0; }

textarea {
  @include ps-well;
  width: 100%;
  text-align: left;
  padding: 5px;
  font-size: 11.5px;
  line-height: 1.45;
  resize: vertical;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

@media (max-width: 860px) {
  .page { grid-template-columns: 1fr; }
}
</style>
