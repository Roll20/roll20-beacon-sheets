<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { professionRow } from '@/rules/index.js'

const props = defineProps({
  stat: { type: String, required: true },
  label: { type: String, default: '' },
})

const sheet = useCharacterStore()

const typed = computed(() => sheet.professionStats.current?.[props.stat] ?? null)

const fromTable = computed(() => {
  const levels = sheet.professionStats.levels
  if (!levels) return null
  return professionRow({ levels }, sheet.effectiveLevel)[props.stat]
})

const set = (value) => {
  const current = { ...(sheet.professionStats.current || {}) }
  current[props.stat] = value === '' ? null : Number(value)
  sheet.professionStats = { ...sheet.professionStats, current }
}
</script>

<template>
  <input
    type="number"
    class="profession-stat"
    :class="{ changed: typed !== null && fromTable !== null }"
    :aria-label="label"
    :value="typed ?? ''"
    :placeholder="fromTable ?? ''"
    @input="set($event.target.value)"
  />
</template>
