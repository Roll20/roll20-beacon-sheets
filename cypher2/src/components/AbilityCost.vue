<script setup>
import { computed } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const props = defineProps({ row: { type: Object, required: true } })
const POOL_KEYS = ['might', 'speed', 'intellect']
const sheet = useSheetStore()

// The Magnus Archives Stress half of an ability's cost (schema v3: integer >= 0 or null).
//
// The gate's SECOND clause is load-bearing and not a convenience: a Magnus character
// imported into a game whose Stress rule is off would otherwise have its ability costs
// silently uneditable while the export carried them anyway. `!= null` rather than a
// truthiness check, because a carried 0 is a value, not an absence.
//
// A CONSEQUENCE, not a bug: with the rule off, clearing the box to null makes the second
// clause false and unmounts this control in the same tick. That is deliberate — the gate
// is a live read of the row, not a latch taken at mount — and it is recoverable, because
// the Stress rule toggle in the vitals panel (StatusRow.vue) brings the box straight back.
// Since ddd-houn that recovery carries a destructive confirm. Over a live non-empty
// `stress` object the first tick only ARMS: the box snaps back unchecked and a warning
// label appears. A second click turns the rule on and reseeds `stress` to zeros, which is
// the loss the warning names. The path is still real, it just costs two clicks and the
// character's stored Stress points and supernatural levels.
// A latch would also keep the box in front of a player who has just said they do not want
// it, so the simpler rule wins until someone reports otherwise.
const stressEditable = computed(() => sheet.rules.stress === true || props.row.stressCost != null)

// The '' -> null arm is ours, in code, exactly as RowLevel's is: clampInt('') is 0, so
// without it a cleared box would store a meaningful 0 — and the row's empty state is
// null. It must not store '' either: that is the Firebase readback shape normalizeRow's
// targeted heal exists to REPAIR, and the editor has no business creating it.
const toStressCost = (v) => (v === '' ? null : clampInt(v))

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
    <!-- Visible label, not an aria-label: a bare number box beside the pool checkboxes
         would be inscrutable. `?? ''` renders the empty value="" attribute as well as the
         empty property (ddd-bti, RowLevel's note). -->
    <label v-if="stressEditable" class="cost-stress-label">
      <span>Stress</span>
      <input
        class="cost-stress field"
        type="number"
        min="0"
        :value="row.stressCost ?? ''"
        @change="row.stressCost = syncClamped($event, toStressCost($event.target.value))"
      />
    </label>
  </div>
</template>
