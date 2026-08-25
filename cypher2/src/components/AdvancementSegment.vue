<script setup>
import ItemList from '@/components/ItemList.vue'
import ArcSteps from '@/components/ArcSteps.vue'
import RowProse from '@/components/RowProse.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const sheet = useSheetStore()
const ADVANCEMENTS = [
  { key: 'stats', label: 'Increase capabilities (+4 stat points)' },
  { key: 'effort', label: 'Extra effort' },
  { key: 'edge', label: 'Edge' },
  { key: 'skill', label: 'Skill training' },
  { key: 'other', label: 'Other' }
]

// spec ⑦ §4.2: powerShifts = name · shift count, arcs = name · step progress.
const shiftText = (row) => `${row.shifts} shift${row.shifts === 1 ? '' : 's'}`
// An arc with no steps has no progress to report, so the cell collapses rather than
// reading "0/0".
const stepText = (row) =>
  row.steps.length ? `${row.steps.filter((s) => s.completed).length}/${row.steps.length} steps` : null

const shiftContents = (row) => ({
  title: row.name,
  fields: [shiftText(row)],
  prose: row.description
})

const arcContents = (row) => ({
  title: row.name,
  fields: [stepText(row)],
  prose: row.description
})
</script>

<template>
  <div class="advancement-segment">
    <section class="advancement panel">
      <h3 class="banner">Advancement</h3>
      <label v-for="a in ADVANCEMENTS" :key="a.key" class="advancement__row">
        <input class="advancement__box" type="checkbox" v-model="sheet.advancement[a.key]" />
        {{ a.label }}
      </label>
    </section>

    <ItemList :contents="shiftContents" store-key="powerShifts" title="Power shifts" add-label="Add power shift">
      <template #summary="{ row }">
        <span class="summary-name">{{ row.name }}</span>
        <span class="summary-cell">{{ shiftText(row) }}</span>
      </template>
      <template #row="{ row }">
        <input class="row-name field" v-model="row.name" placeholder="Power shift" />
        <label>Shifts
          <input class="row-shifts field" type="number" min="1" :value="row.shifts"
            @change="row.shifts = syncClamped($event, clampInt($event.target.value, 1))" />
        </label>
        <RowProse :row="row" />
      </template>
    </ItemList>

    <ItemList :contents="arcContents" store-key="arcs" title="Character arcs" add-label="Add arc">
      <template #summary="{ row }">
        <span class="summary-name">{{ row.name }}</span>
        <span v-if="stepText(row)" class="summary-cell">{{ stepText(row) }}</span>
      </template>
      <template #row="{ row }">
        <input class="row-name field" v-model="row.name" placeholder="Arc name" />
        <RowProse :row="row" />
        <ArcSteps :row="row" />
      </template>
    </ItemList>
  </div>
</template>
