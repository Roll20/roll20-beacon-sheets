<script setup>
import { computed } from 'vue'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const props = defineProps({ row: { type: Object, required: true } })
const POOL_KEYS = ['might', 'speed', 'intellect']

// The three schema-legal cost shapes (oneOf invariant): null,
// fixed {points:int, plus, variable:false}, variable {points:null, plus:false, variable:true}.
const mode = computed({
  get: () => (props.row.cost === null ? 'none' : props.row.cost.variable ? 'variable' : 'fixed'),
  set: (m) => {
    if (m === 'none') props.row.cost = null
    else if (m === 'variable') props.row.cost = { points: null, plus: false, variable: true }
    else props.row.cost = { points: 1, plus: false, variable: false }
  }
})

// PRESERVE, don't rebuild from the enum (ddd-44o): hydrate() applies no enum
// validation, so row.pools can carry an out-of-enum entry the player cannot
// see — a POOL_KEYS.filter() rebuild silently deleted it on any unrelated
// toggle, the one member of the ddd-9ir class that LOST data. Known keys keep
// canonical might/speed/intellect order for deterministic exports; strays sort
// after them, relative order intact (Array.sort is stable).
const canonicalRank = (p) => {
  const i = POOL_KEYS.indexOf(p)
  return i === -1 ? POOL_KEYS.length : i
}
const togglePool = (pool, checked) => {
  const kept = props.row.pools.filter((p) => p !== pool)
  props.row.pools = (checked ? [...kept, pool] : kept).sort((a, b) => canonicalRank(a) - canonicalRank(b))
}
</script>

<template>
  <div class="ability-cost">
    <select class="cost-mode field" v-model="mode" aria-label="Cost type">
      <option value="none">No cost</option>
      <option value="fixed">Fixed</option>
      <option value="variable">Variable</option>
    </select>
    <template v-if="mode === 'fixed'">
      <input
        class="cost-points field"
        type="number"
        min="0"
        :value="row.cost.points"
        aria-label="Cost points"
        @change="row.cost.points = syncClamped($event, clampInt($event.target.value))"
      />
      <label class="cost-plus-label">
        <input
          class="cost-plus"
          type="checkbox"
          :checked="row.cost.plus"
          @change="row.cost.plus = $event.target.checked"
        />
        + (levels)
      </label>
    </template>
    <span class="cost-pools">
      <label v-for="p in POOL_KEYS" :key="p">
        <input
          class="cost-pool"
          type="checkbox"
          :checked="row.pools.includes(p)"
          @change="togglePool(p, $event.target.checked)"
        />
        {{ p.charAt(0).toUpperCase() + p.slice(1) }}
      </label>
    </span>
  </div>
</template>
