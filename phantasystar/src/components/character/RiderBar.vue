<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { riderFormula } from '@/rules/index.js'

const sheet = useCharacterStore()

const chips = computed(() => {
  const ctx = sheet.diceContext()
  return sheet.riderFeatures.map((f) => {
    const formula = riderFormula(f.rider, ctx)
    const type = f.rider.type === 'weapon' ? '' : f.rider.type
    const always = f.rider.mode === 'always'
    return {
      id: f._id,
      label: [f.name, formula, type].filter(Boolean).join(' '),
      on: always || f.riderOn,
      always,
      blocked: !f.riderOn && !always ? sheet.riderBlocked(f) : null,
    }
  })
})
</script>

<template>
  <div v-if="chips.length" class="riders">
    <button
      v-for="c in chips"
      :key="c.id"
      type="button"
      class="rider"
      :class="{ on: c.on, always: c.always }"
      :disabled="c.always || !!c.blocked"
      :aria-pressed="c.on"
      :title="c.blocked || undefined"
      @click="sheet.setRider(c.id, !c.on)"
    >
      {{ c.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.riders {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 0 5px;
}

.rider {
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  color: var(--ps-chip-idle, var(--ps-heading));
  background: var(--ps-field);
  border: 1px solid var(--ps-line);
  border-radius: 10px;
  padding: 2px 8px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--ps-green);
    border-color: var(--ps-green);
    color: var(--ps-on-green-fill, var(--ps-on-fill));
  }

  &.on {
    background: var(--ps-blue);
    border-color: var(--ps-blue);
    color: var(--ps-on-fill);
  }

  &.always { cursor: default; opacity: 0.85; }
  &:disabled:not(.always) { opacity: 0.4; cursor: not-allowed; }
}
</style>
