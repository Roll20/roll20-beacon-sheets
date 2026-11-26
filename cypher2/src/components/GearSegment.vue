<script setup>
import ItemList from '@/components/ItemList.vue'
import RowLevel from '@/components/RowLevel.vue'
import RowProse from '@/components/RowProse.vue'
import { levelField } from '@/components/rowFields.js'
import { clampInt, clampNumber, syncClamped } from '@/utility/clamp.js'
import { useSheetStore } from '@/stores/sheetStore.js'

const sheet = useSheetStore()

// `notes`, not `description` — equipment and attacks name their prose field
// differently from the other six lists, and the descriptor (plus RowProse's `field`
// prop below) is where that difference stops (item-contents spec §3).
const equipmentContents = (row) => ({
  title: row.name,
  fields: [levelField(row), `×${row.quantity}`],
  prose: row.notes
})

// Equipment's summary cells. A LIST rather than `v-if="levelField(row)"` +
// `{{ levelField(row) }}`, which computed the level cell twice per render (ddd-0k1).
// filter(Boolean) is the collapse rule that v-if enforced; the quantity cell is
// unconditional (a row always carries one, default 1) and never filters out.
const equipmentCells = (row) => [levelField(row), `×${row.quantity}`].filter(Boolean)

// No prose at all, so a currency row is postable but never expandable — the rule in
// ItemList, not an exception listed here.
const currencyContents = (row) => ({ title: row.name, fields: [row.amount] })
</script>

<!-- Two lists, so this segment has a wrapper and the wrapper carries the multi-list
     grid (see main.css). The single-list segments have nothing to column and stay
     wrapper-free. -->
<template>
  <div class="gear-segment">
    <!-- ddd-2g8: the 2e sheet's free-text armor box — the field that actually
         records a character's armor (contract §3.22). The armor NUMBER input it
         replaces is gone from StatusRow; `armor` stays 0 in the contract. -->
    <label class="gear-segment__armor">
      <span class="microlabel">Armor</span>
      <input class="field" type="text" placeholder="e.g. Ballistic vest, +2 vs. physical" v-model="sheet.armorModifiers" />
    </label>

    <ItemList :contents="equipmentContents" store-key="equipment" title="Equipment" add-label="Add equipment">
      <!-- DEVIATION D1: name · level · quantity, not §4.2's "name · source" — equipment
           rows carry no `source`, and §4.2 itself rules source editor-only. -->
      <template #summary="{ row }">
        <span class="summary-name">{{ row.name }}</span>
        <span v-for="(cell, i) in equipmentCells(row)" :key="i" class="summary-cell">{{ cell }}</span>
      </template>
      <template #row="{ row }">
        <input class="row-name field" v-model="row.name" placeholder="Item name" />
        <RowLevel :row="row" />
        <label>Qty
          <input class="row-quantity field" type="number" min="0" :value="row.quantity"
            @change="row.quantity = syncClamped($event, clampInt($event.target.value))" />
        </label>
        <RowProse :row="row" field="notes" label="Notes" />
      </template>
    </ItemList>

    <ItemList :contents="currencyContents" store-key="currencies" title="Currencies" add-label="Add currency">
      <template #summary="{ row }">
        <span class="summary-name">{{ row.name }}</span>
        <span class="summary-cell">{{ row.amount }}</span>
      </template>
      <template #row="{ row }">
        <input class="row-name field" v-model="row.name" placeholder="Currency name" />
        <label>Amount
          <input class="row-amount field" type="number" min="0" step="any" :value="row.amount"
            @change="row.amount = syncClamped($event, clampNumber($event.target.value))" />
        </label>
      </template>
    </ItemList>
  </div>
</template>
