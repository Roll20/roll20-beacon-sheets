<script setup>
import ItemList from '@/components/ItemList.vue'
import RowLevel from '@/components/RowLevel.vue'
import RowProse from '@/components/RowProse.vue'
import { levelField } from '@/components/rowFields.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const DEPLETION_DICE = ['1d6', '1d10', '1d20', '1d100']
// The three schema-legal shapes (v2): null, {chance, die}, or the "automatic"
// sentinel — depletes on use, guaranteed; NOT the same as null, which means
// never depletes (contract §2.1). isRoll gates every .chance/.die access so the
// sentinel (or a stray string from a foreign file) can never read as an object.
const isRoll = (depletion) => depletion !== null && typeof depletion === 'object'
const setDepletionMode = (row, value) => {
  row.depletion = value === 'roll' ? { chance: 1, die: '1d20' } : value === 'automatic' ? 'automatic' : null
}
const depletionMode = (row) =>
  isRoll(row.depletion) ? 'roll' : row.depletion === 'automatic' ? 'automatic' : 'none'

// spec ⑦ §4.2: name · level · depletion. A chance of 1 reads as a single number
// rather than a one-value range.
const depletionText = (row) =>
  isRoll(row.depletion)
    ? `${row.depletion.chance > 1 ? `1–${row.depletion.chance}` : '1'} on ${row.depletion.die}`
    : null

// One phrase for both projections: the summary cell and the card field must not
// disagree about what "automatic" means.
const depletionPhrase = (row) => {
  if (row.depletion === 'automatic') return 'Depletes on use'
  const text = depletionText(row)
  return text && `Depletes ${text}`
}

// form (v2, ddd-5vb): populated on every one of the book's 72 artifacts and
// often the most evocative text on the row — card field, editor input; the
// summary stays name · level · depletion.
const contents = (row) => ({
  title: row.name,
  fields: [row.form, levelField(row), depletionPhrase(row)],
  prose: row.description
})

// The summary cells, in §4.2 order. A LIST rather than one `v-if="cell(row)"` +
// `{{ cell(row) }}` span per cell, which computed every cell twice per render
// (ddd-0k1). filter(Boolean) is the same collapse rule those v-ifs enforced: an unset
// cell renders no span at all, it never renders an empty one.
const summaryCells = (row) =>
  [levelField(row), row.depletion === 'automatic' ? 'Depletes on use' : depletionText(row)].filter(Boolean)
</script>

<template>
  <ItemList :contents="contents" store-key="artifacts" title="Artifacts" add-label="Add artifact">
    <template #summary="{ row }">
      <span class="summary-name">{{ row.name }}</span>
      <span v-for="(cell, i) in summaryCells(row)" :key="i" class="summary-cell">{{ cell }}</span>
    </template>
    <template #row="{ row }">
      <input class="row-name field" v-model="row.name" placeholder="Artifact name" />
      <input class="row-form field" v-model="row.form" placeholder="Form (e.g. Beaded necklace)" aria-label="Form" />
      <RowLevel :row="row" />
      <select class="row-depletion-mode field" :value="depletionMode(row)" aria-label="Depletion"
        @change="setDepletionMode(row, $event.target.value)">
        <option value="none">No depletion</option>
        <option value="roll">Depletes on a roll</option>
        <option value="automatic">Depletes on use</option>
      </select>
      <template v-if="isRoll(row.depletion)">
        <label>Chance
          <input class="row-depletion-chance field" type="number" min="1" :value="row.depletion.chance"
            @change="row.depletion.chance = syncClamped($event, clampInt($event.target.value, 1))" />
        </label>
        <select class="row-depletion-die field" v-model="row.depletion.die" aria-label="Depletion die">
          <option v-for="d in DEPLETION_DICE" :key="d" :value="d">{{ d }}</option>
        </select>
      </template>
      <RowProse :row="row" />
    </template>
  </ItemList>
</template>
