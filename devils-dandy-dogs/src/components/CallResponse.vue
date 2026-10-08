<script setup>
import { computed } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { temptationResult } from '@/dice/rolls.js'

const sheet = useSheetStore()

// Reads the exchange's OWN mode, not the live toggle: the pool is frozen, so a mid-exchange
// mode flip must not relabel dice already in play.
const modeLabel = computed(() =>
  sheet.exchange?.mode === 'combat' ? 'Combat' : 'Narrative'
)

// The rolled Temptation result, or null while the die is unrolled. Only the FIRST result line is
// rendered: the chat card carries the full text, and this block sits in the sheet's tightest
// column.
const temptation = computed(() => {
  const t = sheet.exchange?.temptation
  return t ? { ...t, line: temptationResult(t.value).lines[0] } : null
})

const toggle = (die) => (die.spent ? sheet.unspendDie(die._id) : sheet.spendDie(die._id))

const clear = () => {
  const held = sheet.heldCount
  if (held > 0) {
    const dice = held === 1 ? '1 die is' : `${held} dice are`
    if (!window.confirm(`${dice} still held. Clear the pool?`)) return
  }
  sheet.endExchange()
}
</script>

<template>
  <div v-if="sheet.exchange" class="call-response">
    <span class="label call-response__label">Call &amp; Response</span>
    <p class="call-response__context">
      {{ sheet.exchange.trait }} &mdash; {{ sheet.exchange.tierLabel }} &middot; {{ modeLabel }}
    </p>
    <ul class="call-response__dice">
      <li v-for="die in sheet.exchange.dice" :key="die._id" class="call-response__slot">
        <button
          type="button"
          class="call-response__die"
          :class="{ 'call-response__die--spent': die.spent }"
          :aria-pressed="die.spent"
          @click="toggle(die)"
        >
          <span class="call-response__glyph" :class="`call-response__glyph--${die.face}`"></span>
          <span class="call-response__value">{{ die.value }}</span>
          <span class="call-response__face">{{ die.label }}</span>
        </button>
      </li>
    </ul>
    <p v-if="!sheet.outOfDice" class="call-response__remaining">
      {{ sheet.heldCount }} remaining
    </p>
    <!-- Wording quoted from Rules / Making Rolls; do not paraphrase. -->
    <div v-else class="call-response__empty">
      <p class="call-response__empty-lead">Out of dice. You may:</p>
      <ul class="call-response__options">
        <li>Narrate your failure</li>
        <li>
          <button
            v-if="!sheet.exchange.temptation"
            type="button"
            class="call-response__temptation ddd-btn"
            :disabled="sheet.temptationBusy"
            @click="sheet.rollTemptation()"
          >
            Roll your Temptation die
          </button>
          <div v-else class="call-response__result">
            <span class="call-response__glyph" :class="`call-response__glyph--${temptation.band}`"></span>
            <span class="call-response__value">{{ temptation.value }}</span>
            <span class="call-response__outcome">{{ temptation.line }}</span>
          </div>
        </li>
        <li>Ask a packmate for help &mdash; Throw Me a Bone! (page 54)</li>
      </ul>
    </div>
    <button type="button" class="call-response__clear ddd-btn" @click="clear">Clear pool</button>
  </div>
</template>
