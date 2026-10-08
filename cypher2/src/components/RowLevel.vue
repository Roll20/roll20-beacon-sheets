<script setup>
import { syncClamped, toNullableLevel } from '@/utility/clamp.js'

// The nullable-level editor, shared by the three lists whose schema carries
// `level: integer >= 1 | null` (cyphers, artifacts, equipment). This component OWNS
// that input contract: the >= 1 floor, and the '' <-> null mapping that lets a player
// CLEAR a level instead of being stuck at 1 (toNullableLevel, utility/clamp.js).
// Changing either — a max, a different empty-string policy — happens here, once.
//
// The two halves of that mapping are NOT enforced by the same thing (ddd-bti):
//   '' -> null  is ours, in code: toNullableLevel on @change. Nothing else does it —
//               clampInt('', 1) is 1, so without the explicit '' arm a cleared box
//               would silently become level 1. This half is load-bearing.
//   null -> ''  is Vue's, not ours. patchDOMProp special-cases the `value` prop
//               (@vue/runtime-dom 3.5.40, src/modules/props.ts): `value == null` is
//               assigned to the element as '' (issue #11647), so el.value is '' on
//               both the mount and the update path whether or not we coalesce here.
// The `?? ''` below is therefore NOT what makes the box look empty — but it is not a
// no-op either. patchProp mirrors `value` to the ATTRIBUTE as well as the property, so
// `?? ''` renders `value=""` while a bare `row.level` removes the attribute entirely.
// Kept deliberately, so the binding states the contract instead of leaning on a Vue
// special case a future reader would have to re-derive. rowScaffolding.test.js pins
// both halves of the null rendering; dropping the `??` turns the attribute half red.
//
// The matching read-side wording lives in levelField() (rowFields.js); the two are a
// pair and a change to one is usually a change to both.
defineProps({ row: { type: Object, required: true } })
</script>

<template>
  <label>Level
    <input class="row-level field" type="number" min="1" :value="row.level ?? ''"
      @change="row.level = syncClamped($event, toNullableLevel($event.target.value))" />
  </label>
</template>
