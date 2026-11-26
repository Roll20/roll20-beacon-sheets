<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
import CallResponse from '@/components/CallResponse.vue'

const sheet = useSheetStore()
const TRAITS = ['devil', 'dandy', 'dog']
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// The confirm lives here rather than in the store, matching RoleHeader.onSelect: it keeps
// `window` out of store actions so they stay unit-testable.
const onRoll = (trait) => {
  if (sheet.heldCount > 0) {
    const held = sheet.heldCount
    const dice = held === 1 ? '1 die' : `${held} dice`
    const ok = window.confirm(
      `You still have ${dice} held. Start a new Call & Response? The held dice will be cleared.`
    )
    if (!ok) return
  }
  sheet.rollTrait(trait)
}
</script>

<template>
  <section class="traits ddd-section">
    <h2 class="ddd-banner">Traits</h2>
    <div class="ddd-panel">
      <!-- Mode picks which rulebook table a trait roll reads — Dice Roll Results or Dice
           Results for Combat — so it belongs with the rolls, not with Drive. -->
      <div class="mode">
        <span class="label mode__label">Roll Mode</span>
        <button
          class="mode-narrative ddd-btn"
          :class="{ 'ddd-btn--on': sheet.mode === 'narrative' }"
          @click="sheet.mode = 'narrative'"
        >
          Narrative
        </button>
        <button
          class="mode-combat ddd-btn"
          :class="{ 'ddd-btn--on': sheet.mode === 'combat' }"
          @click="sheet.mode = 'combat'"
        >
          Combat
        </button>
      </div>
      <span v-if="sheet.shadowRiven" class="riven-badge">Shadow Riven</span>
      <div v-for="t in TRAITS" :key="t" class="trait-row" :data-trait="t">
        <span class="trait-row__tier">{{ sheet.tierLabel(t) }}</span>
        <span class="trait-row__name">{{ cap(t) }}</span>
        <input
          class="trait-row__count"
          type="number"
          min="0"
          max="3"
          v-model.number="sheet.traits[t]"
        />
        <button
          class="roll ddd-btn"
          :disabled="sheet.effectivePool(t) < 1"
          @click="onRoll(t)"
        >
          Roll {{ sheet.effectivePool(t) }}d6
        </button>
      </div>
      <CallResponse />
    </div>
  </section>
</template>
