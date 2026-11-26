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

// The Magnus Archives Stress half of a cost the book prints as "4 Intellect points and
// 3 Stress" (schema v3: abilities[].stressCost, integer >= 0 or null). It is its OWN
// cell/field after the pool cost and is never folded into it: one term per source
// (ddd-keb3), and a combined string would make a 0-point ability with a Stress cost
// unreadable. The sheet displays and edits it — nothing SPENDS it, because there is no
// activation flow for pools either.
//
// `== null`, not a truthiness check, and that is the whole point of these two helpers:
// stressCost 0 is meaningful data (exporter.test.js treats it as version-3 content), and
// both consumers below drop falsy values on purpose — summaryCells ends in
// filter(Boolean), itemCard drops falsy fields. A `row.stressCost && ...` here would lose
// a legal 0 twice over. Both helpers therefore return null or a NON-EMPTY string, the
// same invariant costText carries.
const stressCostText = (row) => (row.stressCost == null ? null : `${row.stressCost} Stress`)
const stressCostLabel = (row) => (row.stressCost == null ? null : `Stress ${row.stressCost}`)

// activation is verbatim book text with a long-form tail ("Action to initiate;
// one hour to complete"), no enum (contract §3.1) — card and editor only, the
// summary row has no room for it. Every enabler in the catalog spells its
// activation "Enabler", which the enabler flag already prints — suppress that
// one shape or the card reads "Enabler · Enabler" (ddd-5vb audit). A
// non-enabler's "Enabler" text survives: nothing else would show it.
const activationText = (row) =>
  row.enabler && String(row.activation).trim().toLowerCase() === 'enabler' ? null : row.activation

// One pass over the cells rather than `v-if="costText(row)"` + `{{ costText(row) }}`,
// which computed the cell twice per render (ddd-0k1, finished here by ddd-psi). Same
// shape as artifacts, cyphers and equipment; filter(Boolean) is the collapse rule the
// v-if enforced. Safe here, and the reason is the trap ddd-psi flagged: costText and
// stressCostText both return null or a NON-EMPTY string, so a 0-point cost arrives as
// '0' and a 0 Stress cost as '0 Stress', and both survive.
const summaryCells = (row) =>
  [costText(row), stressCostText(row), row.enabler && 'Enabler'].filter(Boolean)

const contents = (row) => ({
  title: row.name,
  fields: [costLabel(row), stressCostLabel(row), row.enabler && 'Enabler', activationText(row)],
  source: row.source,
  prose: row.description
})
</script>

<template>
  <ItemList :contents="contents" store-key="abilities" title="Abilities" add-label="Add ability">
    <!-- spec ⑦ §4.2: name · cost · Stress cost when set · Enabler marker when set. -->
    <template #summary="{ row }">
      <span class="summary-name">{{ row.name }}</span>
      <span v-for="(cell, i) in summaryCells(row)" :key="i" class="summary-cell">{{ cell }}</span>
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
