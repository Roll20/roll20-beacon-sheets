<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const props = defineProps({
  pool: { type: String, required: true },
  label: { type: String, required: true }
})
const sheet = useSheetStore()
// Returns the clamped value so the template can resync the box through
// syncClamped — a rejected edit otherwise survives in the DOM (ddd-9sf).
const set = (field, value) => (sheet.pools[props.pool][field] = clampInt(value))
</script>

<template>
  <section class="pool-card panel">
    <header class="pool-card__head">
      <h3 class="pool-card__name">{{ label }}</h3>
      <!-- "d20" names the die, not the action — the tooltip says what it does
           (owner walkthrough, same treatment as the edit/chat chips). -->
      <button class="pool-card__roll" type="button" title="Roll" :aria-label="`Roll ${label}`" @click="sheet.rollIntent(pool)">
        d20
      </button>
    </header>
    <div class="pool-card__fields">
      <label>
        <span class="microlabel">Pool</span>
        <input class="field" type="number" min="0" :value="sheet.pools[pool].current" @change="syncClamped($event, set('current', $event.target.value))" />
      </label>
      <label>
        <span class="microlabel">Max</span>
        <input class="field" type="number" min="0" :value="sheet.pools[pool].max" @change="syncClamped($event, set('max', $event.target.value))" />
      </label>
      <label>
        <span class="microlabel">Edge</span>
        <input class="field" type="number" min="0" :value="sheet.pools[pool].edge" @change="syncClamped($event, set('edge', $event.target.value))" />
      </label>
    </div>
  </section>
</template>
