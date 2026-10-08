<script setup>
import { computed } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
const sheet = useSheetStore()

// Wording quoted from Rules / Drive and Temptation; the book is explicit that the die cannot be
// held over, which is the reason the button is dead rather than a UI limitation.
const temptationTitle = computed(() => {
  if (sheet.temptationBusy) return 'Rolling…'
  return sheet.exchange?.temptation
    ? 'Already used this exchange — you can’t save it for a later action'
    : 'Roll your Temptation die'
})
</script>

<template>
  <section class="drive ddd-section">
    <h2 class="ddd-banner">Drive</h2>
    <div class="ddd-panel">
      <label class="label" for="drive">Drive</label>
      <input id="drive" class="drive__value" v-model="sheet.drive" />

      <!-- The roll-mode toggle lives in TraitsBlock: mode only affects trait rolls, and
           rollTemptation ignores it entirely. -->
      <!-- Gated on the ACTIVE EXCHANGE's die, not on this panel's own state (ddd-19n): Call &
           Response is where the die is spent, and an always-live button here contradicted the
           "already used" state two panels away. `?.` matters — with no exchange there is no die
           to have spent, and the book still lets you roll one, which an existing store test
           covers. `title` carries the reason, since a disabled button gives none. -->
      <button
        class="temptation ddd-btn"
        :disabled="!!sheet.exchange?.temptation || sheet.temptationBusy"
        :title="temptationTitle"
        @click="sheet.rollTemptation()"
      >
        Roll Temptation Die
      </button>

      <h3 class="sub">Storytelling Style</h3>
      <div class="storytelling" v-html="sheet.storytellingStyle"></div>
    </div>
  </section>
</template>
