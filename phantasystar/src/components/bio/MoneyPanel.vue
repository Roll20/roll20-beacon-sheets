<script setup>
import { useBioStore } from '@/stores/bioStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import { LIFESTYLES, CURRENCY } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const store = useBioStore()
</script>

<template>
  <div class="col">
    <SheetPanel title="Money">
      <label class="field">
        <span>Meseta</span>
        <input v-model.number="store.meseta" type="number" min="0" />
        <em>{{ CURRENCY }}</em>
      </label>

      <label class="field">
        <span>Lifestyle</span>
        <select v-model="store.lifestyle">
          <option value="">&mdash;</option>
          <option v-for="l in LIFESTYLES" :key="l.id" :value="l.id">
            {{ l.name }}{{ l.perDay === 0 ? ' (free)' : ` — ${l.perDay} ${CURRENCY}/day` }}
          </option>
        </select>
      </label>

      <label class="stacked">
        <span>Expenses</span>
        <textarea v-model="store.expenses" />
      </label>
    </SheetPanel>

    <SheetPanel title="Vehicles">
      <div class="vhead">
        <span>Assigned Vehicle</span>
        <span>Role / Position</span>
        <button type="button" class="add" @click="store.addVehicle()">+</button>
      </div>

      <div v-for="v in store.vehicles" :key="v._id" class="vrow">
        <input v-model="v.name" />
        <input v-model="v.role" />
        <ConfirmDelete class="del" title="Remove" @confirm="store.removeVehicle(v._id)" />
      </div>
    </SheetPanel>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.col { display: flex; flex-direction: column; gap: var(--ps-gap-lg); min-width: 0; }

.field {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;

  > span { @include ps-caption; width: 62px; flex: 0 0 auto; }
  em { font-size: 10px; color: var(--ps-text-muted); font-style: normal; }

  input, select {
    @include ps-well;
    flex: 1;
    min-width: 0;
    height: 26px;
    font-size: 13px;
    text-align: left;
    padding: 0 5px;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  input[type='number'] { text-align: right; font-weight: 700; }
}

.stacked {
  display: flex;
  flex-direction: column;

  > span { @include ps-caption; margin-bottom: 2px; }

  textarea {
    @include ps-well;
    text-align: left;
    min-height: 48px;
    padding: 5px;
    font-size: 11px;
    resize: vertical;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }
}

.vhead {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 22px;
  gap: 5px;
  @include ps-caption;
  padding-bottom: 3px;
  border-bottom: 1.5px solid var(--ps-line);
}

.vrow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 22px;
  gap: 5px;
  align-items: center;
  padding: 2px 0;

  input {
    @include ps-well;
    height: 22px;
    font-size: 11.5px;
    text-align: left;
    padding: 0 4px;
    min-width: 0;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }
}

.add, .del {
  border: none;
  background: none;
  color: var(--ps-heading);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 0;

  &:hover { color: var(--ps-blue); }
}

.del:hover { color: var(--ps-red); }
</style>
