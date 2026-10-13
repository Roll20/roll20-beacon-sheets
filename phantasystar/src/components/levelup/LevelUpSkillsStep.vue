<script setup>
import { computed } from 'vue'
import { useLevelUp } from '@/composables/useLevelUp.js'
import { levelUpAllotments, levelUpSkillRows, levelUpProficiencies } from '@/builder/levelUp.js'
import SkillRanks from '@/components/builder/SkillRanks.vue'

const { store, ctx, paths } = useLevelUp()
const lu = computed(() => store.lu)

const allotments = computed(() => levelUpAllotments(ctx.value, lu.value, paths.value))
const rows = computed(() => levelUpSkillRows(ctx.value, lu.value, allotments.value)
  .map((r) => ({ ...r, fixed: r.before })))
const choices = computed(() => levelUpProficiencies(ctx.value, lu.value, paths.value))
</script>

<template>
  <SkillRanks :allotments="allotments" :rows="rows" :choices="choices" :model="lu.skills" fixed-label="already" />
</template>
