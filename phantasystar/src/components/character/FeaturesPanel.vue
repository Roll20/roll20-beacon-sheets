<script setup>
import { reactive, computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { groupFeatures } from '@/rules/index.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import FeatureRow from './FeatureRow.vue'

const sheet = useCharacterStore()

const groups = computed(() => groupFeatures(sheet.features))

const ui = reactive({})
const rowUI = (id) => ui[id] ?? { open: false, editing: false }

const toggleOpen = (id) => {
  const open = !rowUI(id).open
  ui[id] = { open, editing: false }
}
const toggleEditing = (id) => {
  const editing = !rowUI(id).editing
  ui[id] = { open: editing, editing }
}

const add = () => {
  const id = sheet.addFeature()
  ui[id] = { open: true, editing: true }
}
</script>

<template>
  <SheetPanel title="Features" grow>
    <template #actions>
      <button type="button" class="add" @click="add">+ Add</button>
    </template>

    <div class="list">
      <p v-if="!groups.length" class="empty">No features yet.</p>

      <section v-for="group in groups" :key="group.id" class="group">
        <h3 class="group__label">{{ group.name }}</h3>
        <FeatureRow
          v-for="feature in group.features"
          :id="feature._id"
          :key="feature._id"
          :open="rowUI(feature._id).open"
          :editing="rowUI(feature._id).editing"
          @toggle-open="toggleOpen(feature._id)"
          @toggle-editing="toggleEditing(feature._id)"
        />
      </section>
    </div>
  </SheetPanel>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

:deep(.ps-panel-body) {
  overflow-y: auto;
  padding: 5px 8px;
}

.list {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group__label {
  @include ps-caption;
  margin: 0 0 1px;
  padding-bottom: 1px;
  border-bottom: 1px solid var(--ps-gold);
  font-size: 10px;
}

.empty { margin: 0; font-size: 11px; color: var(--ps-text-muted); padding: 4px; }

.add {
  font-size: 10px;
  text-transform: uppercase;
  border: 1px solid var(--ps-line);
  border-radius: 3px;
  background: var(--ps-field);
  color: var(--ps-heading);
  cursor: pointer;
  padding: 2px 8px;
  &:hover { background: var(--ps-gold-light); color: var(--ps-on-gold-fill, var(--ps-heading)); }
}
</style>
