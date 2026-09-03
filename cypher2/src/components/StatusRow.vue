<script setup>
import { ref } from 'vue'
import WoundsTrack from '@/components/WoundsTrack.vue'
import RecoveryBlock from '@/components/RecoveryBlock.vue'
import IconPencil from '@/components/icons/IconPencil.vue'

// ddd-2g8 variant A (owner-picked from design-explorations/status-rail-variants
// .html): the rail is ONE "Damage & Recovery" panel — wounds / shield / recovery
// as rule-divided columns — and this pencil is the single edit switch for every
// setup control in the cluster (wound maxima, shield add/remove, slot editors,
// recovery bonus). Play view is labels + pips only. TRANSIENT view state, never
// persisted (the rollerStat rule).
const editing = ref(false)
</script>

<template>
  <section class="vitals panel">
    <div class="vitals__head">
      <h3 class="banner">Damage &amp; Recovery</h3>
      <button
        class="vitals__edit btn"
        :class="{ 'vitals__edit--active': editing }"
        type="button"
        title="Edit"
        :aria-pressed="editing"
        aria-label="Edit damage and recovery"
        @click="editing = !editing"
      >
        <IconPencil />
      </button>
    </div>
    <div class="vitals__cols">
      <WoundsTrack :editing="editing" />
      <RecoveryBlock :editing="editing" />
    </div>
  </section>
</template>
