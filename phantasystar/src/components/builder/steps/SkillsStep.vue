<script setup>
import { computed, watch, watchEffect } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useCatalog, loadCategory } from '@/composables/useCatalog.js'
import { useBuilderPages } from '@/composables/useBuilderPages.js'
import { skillAllotments, skillRows, proficiencyChoices, optionGrants, keyCurrent } from '@/builder/skills.js'
import SkillRanks from '../SkillRanks.vue'

const builder = useBuilderStore()
const { lists } = useCatalog()

const CATEGORIES = ['Species', 'Backgrounds', 'Professions', 'Paths', 'Feats']
for (const category of CATEGORIES) loadCategory(category)

const loading = computed(() => CATEGORIES.some((c) => !lists[c] || lists[c].status === 'loading'))

const { pages } = useBuilderPages()

const level = computed(() => builder.draft.level)
const skills = computed(() => builder.draft.skills)

const allotments = computed(() => skillAllotments(pages.value, level.value, skills.value))
const rows = computed(() => skillRows(pages.value, skills.value, level.value, allotments.value))
const choices = computed(() => proficiencyChoices(pages.value, level.value, skills.value.picks))
const missing = computed(() => ['species', 'background', 'profession'].filter((k) => !builder.draft[k]))

watchEffect(() => {
  if (loading.value) return
  const grants = optionGrants(pages.value, skills.value.picks)
  const next = Object.fromEntries(Object.entries(skills.value.picks).filter(([k]) => !k.endsWith(':fixed')))
  Object.assign(next, grants)
  if (JSON.stringify(next) !== JSON.stringify(skills.value.picks)) skills.value.picks = next
})

watch([allotments, loading], () => {
  if (loading.value) return
  const totals = Object.fromEntries(allotments.value.map((a) => [a.key, a.total]))
  const ranks = Object.fromEntries(Object.entries(skills.value.ranks)
    .filter(([key, held]) => keyCurrent(builder.draft, key) && key in totals
      && Object.values(held).reduce((x, y) => x + y, 0) <= totals[key]))
  if (JSON.stringify(ranks) !== JSON.stringify(skills.value.ranks)) skills.value.ranks = ranks
  const picks = Object.fromEntries(Object.entries(skills.value.picks).filter(([key]) => keyCurrent(builder.draft, key)))
  if (JSON.stringify(picks) !== JSON.stringify(skills.value.picks)) skills.value.picks = picks
}, { immediate: true })
</script>

<template>
  <p v-if="loading" class="status">Loading…</p>

  <div v-else class="skills">
    <p v-if="missing.length" class="missing">
      Choose your {{ missing.join(', ') }} first; their ranks and proficiencies appear here.
    </p>
    <SkillRanks :allotments="allotments" :rows="rows" :choices="choices" :model="skills" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.status { margin: 0; padding: 24px 12px; text-align: center; color: var(--ps-text-muted); }
.missing { margin: 0 0 10px; font-size: 12px; color: var(--ps-gold-dark); }
</style>
