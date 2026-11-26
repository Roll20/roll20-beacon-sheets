<script setup>
import { SWITCHER_BASE, SWITCHER_ACTIVE, SWITCHER_INACTIVE } from '@/components/switcherClasses.js'

defineProps({
  segments: { type: Array, required: true },
  // ALREADY RESOLVED by the caller (see SegmentCluster.vue). This component does not
  // read the store and does not resolve — that is what keeps the highlight and the
  // panel host from disagreeing.
  active: { type: String, required: true },
  label: { type: String, required: true }
})
defineEmits(['select'])
</script>

<!-- Styling lives in the shared switcher utility strings bead 1 extracted for exactly
     this component (spec §4.4 item 4 — the weight/spacing/contrast work is done once
     and inherited, not spent twice). segmented-control / __segment / __segment--active
     are test/JS hooks ONLY. Do NOT add matching rules to main.css: an un-layered BEM
     rule out-ranks everything Tailwind emits and would silently kill these utilities
     (the ddd-tmp prove-out).

     ⚠️ Never put two utilities for the same property in BOTH the static list and a
     :class branch. Tailwind's OUTPUT order decides the winner, not the class string,
     so a bg-* in the static list would beat the active branch's bg-accent in every
     skin. switcherClasses.js keeps every colour in exactly one branch. -->
<template>
  <nav
    class="segmented-control min-w-0 flex flex-wrap gap-[0.2rem] border-b-[length:var(--cy-geo-rule)] border-solid border-border"
    role="tablist"
    :aria-label="label"
  >
    <button
      v-for="s in segments"
      :key="s.key"
      type="button"
      role="tab"
      class="segmented-control__segment"
      :class="[
        SWITCHER_BASE,
        active === s.key ? `segmented-control__segment--active ${SWITCHER_ACTIVE}` : SWITCHER_INACTIVE
      ]"
      :aria-selected="active === s.key"
      @click="$emit('select', s.key)"
    >
      {{ s.label }}
    </button>
  </nav>
</template>
