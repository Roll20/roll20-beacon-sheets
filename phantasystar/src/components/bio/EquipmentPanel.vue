<script setup>
import { computed, reactive } from 'vue'
import { useBioStore } from '@/stores/bioStore.js'
import { SIZES } from '@/rules/index.js'
import EquipmentRow from './EquipmentRow.vue'

const store = useBioStore()

const load = computed(() => store.load)

const ui = reactive({})
const rowUI = (id) => ui[id] ?? { open: false, editing: false }
const toggleOpen = (id) => { ui[id] = { open: !rowUI(id).open, editing: false } }
const toggleEditing = (id) => {
  const editing = !rowUI(id).editing
  ui[id] = { open: editing, editing }
}

const add = () => {
  const id = store.addItem()
  ui[id] = { open: true, editing: true }
}
</script>

<template>
  <div class="equipment">
    <div class="head">
      <h2 class="ps-heading">Equipment</h2>

      <label class="size">
        <span>Size</span>
        <select v-model="store.size">
          <option v-for="s in SIZES" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </label>

      <div class="load" :class="{ over: load.overloaded }">
        <strong>{{ store.totalWeight.toLocaleString() }}</strong>
        <span class="of">/ {{ load.capacity.toLocaleString() }} lb.</span>
        <small v-if="load.overloaded" :title="`Lift, drag or push up to ${load.max} lb.`">
          Over capacity &mdash; speed {{ load.speedCap }} ft.
        </small>
      </div>

      <button type="button" class="add" @click="add">+ Add</button>
    </div>

    <div class="panel">
      <p v-if="!store.equipment.length" class="empty">No equipment yet.</p>
      <EquipmentRow
        v-for="item in store.equipment"
        :id="item._id"
        :key="item._id"
        :open="rowUI(item._id).open"
        :editing="rowUI(item._id).editing"
        @toggle-open="toggleOpen(item._id)"
        @toggle-editing="toggleEditing(item._id)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.equipment { display: flex; flex-direction: column; min-width: 0; }

.head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 3px 4px;
  flex-wrap: wrap;

  .ps-heading { @include ps-heading; color: var(--ps-title); margin: 0; }
}

.size {
  display: flex;
  align-items: center;
  gap: 4px;

  span { @include ps-caption; font-size: 9px; }
  select {
    @include ps-well;
    height: 20px;
    font-size: 11px;
    text-align: left;
    padding: 0 2px;
  }
}

.load {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-left: auto;

  strong { font-size: 15px; color: var(--ps-heading); }
  .of { font-size: 11px; color: var(--ps-text-muted); }
  small { font-size: 9.5px; color: var(--ps-text-muted); }

  &.over {
    strong { color: var(--ps-red); }
    small { color: var(--ps-red); font-weight: 700; }
  }
}

.add {
  @include ps-caption;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 10px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.panel {
  @include ps-panel;
  padding: 4px 6px;
}

.empty { margin: 0; padding: 4px; font-size: 11px; color: var(--ps-text-muted); }
</style>
