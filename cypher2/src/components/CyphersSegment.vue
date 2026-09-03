<script setup>
import { computed } from 'vue'
import ItemList from '@/components/ItemList.vue'
import RowLevel from '@/components/RowLevel.vue'
import RowProse from '@/components/RowProse.vue'
import { levelField } from '@/components/rowFields.js'
import { CYPHER_KINDS, CYPHER_KIND_LABELS, POWER_TIERS, POWER_TIER_LABELS, enumLabel, strayOptions } from '@/components/enums.js'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const sheet = useSheetStore()
// The count-vs-limit title and the over-limit warn state are spec ⑦ §4.1's one
// explicit carry-over ("retaining the over-limit warn state"). Do not simplify.
const cypherTitle = computed(() => `Cyphers (${sheet.cyphers.length}/${sheet.cypherLimit})`)
const overLimit = computed(() => sheet.cyphers.length > sheet.cypherLimit)

// displayName is the CHOSEN name when set (contract §3.10: genre-specific
// alias, "" when the same as `name`) — the summary and the chat card show it,
// while `name` stays canonical in the store and exporter for round-trip.
const chosenName = (row) => row.displayName?.trim() || row.name

// v2 fields (ddd-5vb). cypherKind: 'cypher' is the unmarked default and prints
// nothing — only 'manifest' (worn/wielded, behavioral) earns a badge; a stray
// kind degrades to its raw self (the poolLabel rule). power: nullable tier,
// label map with honest raw fallback. activated: a state flag, so it shows on
// row AND card.
const kindText = (row) =>
  row.cypherKind && row.cypherKind !== 'cypher' ? enumLabel(CYPHER_KIND_LABELS, row.cypherKind) : null
const powerText = (row) => row.power && `${enumLabel(POWER_TIER_LABELS, row.power)} power`

const contents = (row) => ({
  title: chosenName(row),
  fields: [levelField(row), kindText(row), powerText(row), row.activated && 'Activated'],
  prose: row.description
})

// One pass over the cells rather than `v-if="levelField(row)"` + `{{ levelField(row) }}`,
// which computed the cell twice per render (ddd-0k1). Same shape as the other two
// level-carrying lists (artifacts, equipment); filter(Boolean) is the collapse rule the
// v-if enforced — level is nullable and an unset one renders no span.
const summaryCells = (row) =>
  [levelField(row), kindText(row), powerText(row), row.activated && 'Activated'].filter(Boolean)
</script>

<template>
  <div class="cyphers-segment">
    <ItemList :contents="contents" store-key="cyphers" :title="cypherTitle" add-label="Add cypher" :warn="overLimit">
      <!-- spec ⑦ §4.2: name · level. level is nullable and collapses when unset. -->
      <template #summary="{ row }">
        <span class="summary-name">{{ chosenName(row) }}</span>
        <span v-for="(cell, i) in summaryCells(row)" :key="i" class="summary-cell">{{ cell }}</span>
      </template>
      <template #row="{ row }">
        <input class="row-name field" v-model="row.name" placeholder="Cypher name" />
        <!-- displayName is the genre alias ("" = same as name); the summary and
             card show it via chosenName while `name` stays canonical. -->
        <input
          class="row-display-name field"
          v-model="row.displayName"
          placeholder="Display name (genre alias)"
          aria-label="Display name"
        />
        <RowLevel :row="row" />
        <!-- kind and power are nullable closed enums: '' sentinel for null,
             ddd-4s3 stray option for an out-of-enum stored value. -->
        <select
          class="row-cypher-kind field"
          :value="row.cypherKind ?? ''"
          aria-label="Kind"
          @change="row.cypherKind = $event.target.value === '' ? null : $event.target.value"
        >
          <option
            v-for="s in strayOptions(row.cypherKind, CYPHER_KINDS, 'kind')"
            :key="s.text"
            :value="s.value"
            disabled
          >
            {{ s.text }}
          </option>
          <option value="">— unspecified</option>
          <option v-for="k in CYPHER_KINDS" :key="k" :value="k">{{ CYPHER_KIND_LABELS[k] }}</option>
        </select>
        <select
          class="row-power field"
          :value="row.power ?? ''"
          aria-label="Power"
          @change="row.power = $event.target.value === '' ? null : $event.target.value"
        >
          <option
            v-for="s in strayOptions(row.power, POWER_TIERS, 'power tier')"
            :key="s.text"
            :value="s.value"
            disabled
          >
            {{ s.text }}
          </option>
          <option value="">— no power tier</option>
          <option v-for="p in POWER_TIERS" :key="p" :value="p">{{ POWER_TIER_LABELS[p] }}</option>
        </select>
        <label class="row-activated-label">
          <input class="row-activated" type="checkbox" v-model="row.activated" />
          Activated
        </label>
        <RowProse :row="row" />
      </template>
    </ItemList>

    <!-- ddd-2g8: the cypherLimit editor, moved here from StatusRow — the limit
         is edited where the count-vs-limit title reads it. BELOW the list per
         the owner's walkthrough call. -->
    <label class="cyphers-segment__limit">
      <span class="microlabel">Limit</span>
      <input
        class="field"
        type="number"
        min="0"
        :value="sheet.cypherLimit"
        @change="sheet.cypherLimit = syncClamped($event, clampInt($event.target.value))"
      />
    </label>
  </div>
</template>
