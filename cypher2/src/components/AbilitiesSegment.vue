<script setup>
import ItemList from '@/components/ItemList.vue'
import AbilityCost from '@/components/AbilityCost.vue'
import RowProse from '@/components/RowProse.vue'

// The three schema-legal cost shapes (the oneOf invariant AbilityCost enforces):
// null, fixed {points, plus, variable:false}, variable {points:null, variable:true}.
// null returns null so the cell collapses rather than reading "0".
const costText = (row) => {
  if (!row.cost) return null
  if (row.cost.variable) return 'Variable'
  return `${row.cost.points}${row.cost.plus ? '+' : ''}`
}

// 'Cost Variable' reads badly, so the three cost shapes get three labels rather than
// one prefix (item-contents spec §3.1). One helper beside costText, not a second cost
// formatter somewhere else.
const costLabel = (row) => {
  const c = costText(row)
  if (!c) return null
  return c === 'Variable' ? 'Variable cost' : `Cost ${c}`
}

// activation is verbatim book text with a long-form tail ("Action to initiate;
// one hour to complete"), no enum (contract §3.1) — card and editor only, the
// summary row has no room for it. Every enabler in the catalog spells its
// activation "Enabler", which the enabler flag already prints — suppress that
// one shape or the card reads "Enabler · Enabler" (ddd-5vb audit). A
// non-enabler's "Enabler" text survives: nothing else would show it.
const activationText = (row) =>
  row.enabler && String(row.activation).trim().toLowerCase() === 'enabler' ? null : row.activation

const contents = (row) => ({
  title: row.name,
  fields: [costLabel(row), row.enabler && 'Enabler', activationText(row)],
  source: row.source,
  prose: row.description
})
</script>

<template>
  <ItemList :contents="contents" store-key="abilities" title="Abilities" add-label="Add ability">
    <!-- spec ⑦ §4.2: name · cost · Enabler marker when set. -->
    <template #summary="{ row }">
      <span class="summary-name">{{ row.name }}</span>
      <span v-if="costText(row)" class="summary-cell">{{ costText(row) }}</span>
      <span v-if="row.enabler" class="summary-cell">Enabler</span>
    </template>
    <template #row="{ row }">
      <input class="row-name field" v-model="row.name" placeholder="Ability name" />
      <label class="row-enabler">
        <input class="row-enabler" type="checkbox" v-model="row.enabler" />
        Enabler
      </label>
      <AbilityCost :row="row" />
      <input
        class="row-activation field"
        v-model="row.activation"
        placeholder="Activation (e.g. Action)"
        aria-label="Activation"
      />
      <input class="row-source field" v-model="row.source" placeholder="Source" />
      <!-- Three rows, not two: an ability's rules text is the longest prose on the
           sheet. -->
      <RowProse :row="row" :rows="3" />
    </template>
  </ItemList>
</template>
