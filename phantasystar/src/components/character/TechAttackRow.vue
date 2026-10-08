<script setup>
import { ref, computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { ABILITIES, formatModifier, rankLabel } from '@/rules/index.js'
import TechniqueRollFields from '@/components/techniques/TechniqueRollFields.vue'

const props = defineProps({ id: { type: String, required: true } })

const sheet = useCharacterStore()
const store = useTechniqueStore()
const rolls = useSheetRolls()

const technique = computed(() => store.techniques.find((t) => t._id === props.id) ?? null)

const editing = ref(false)

const plan = computed(() => (technique.value ? store.castPlan(technique.value) : null))
const canCast = computed(() => !!plan.value?.allowed && !!plan.value?.affordable)

const blocked = computed(() => {
  const p = plan.value
  if (!p || canCast.value) return undefined
  if (!p.allowed && p.rankSpent) {
    return `Already cast at ${rankLabel(technique.value.rank)} since your last long rest`
  }
  if (!p.allowed) return 'Beyond your max tech rank'
  return `Needs ${p.cost} TP`
})

const costLabel = computed(() => (plan.value?.free ? 'Free' : `${plan.value?.cost ?? '-'} TP`))

const power = computed(() => formatModifier(sheet.techAttackPowerValue ?? 0))

const saveLabel = computed(() => {
  const id = technique.value?.saveAbility
  if (!id) return null
  const abbr = ABILITIES.find((a) => a.id === id)?.abbr ?? id
  return `${abbr} DC ${sheet.techSaveDCValue ?? '-'}`
})

const rolled = computed(() => (technique.value ? rolls.techniqueRolls(technique.value) : {}))
const hasDamage = computed(() => !!(rolled.value.damage || rolled.value.damage2))
const damageLine = computed(() => rolls.damageSummary(rolled.value))
</script>

<template>
  <div v-if="technique" class="entry" :class="{ open: editing }">
    <div class="line">
      <button
        type="button"
        class="name"
        :title="editing ? 'Close' : 'Edit'"
        @click="editing = !editing"
      >
        <span class="caret" :class="{ turned: editing }">&#9656;</span>
        {{ technique.name || 'Untitled technique' }}
        <span class="tag">Tech</span>
      </button>

      <span class="roll-group">
        <button
          type="button"
          class="roll"
          :disabled="!canCast"
          :title="blocked"
          @click="rolls.castTechAttack(technique)"
        >
          {{ technique.attack ? 'Attack' : 'Cast' }}
        </button>
        <button
          type="button"
          class="roll"
          :disabled="!hasDamage"
          @click="rolls.rollTechniqueDamage(technique)"
        >
          Damage
        </button>
        <button
          v-if="technique.attack"
          type="button"
          class="roll roll--crit"
          :disabled="!hasDamage"
          @click="rolls.rollTechniqueDamage(technique, { crit: true })"
        >
          Crit
        </button>
      </span>

      <span class="del del--space" aria-hidden="true">&times;</span>
    </div>

    <div class="stats">
      <span class="stat"><b>Rank</b>{{ technique.rank === 0 ? 'Prime' : technique.rank }}</span>
      <span v-if="technique.range" class="stat"><b>Range</b>{{ technique.range }}</span>
      <span v-if="technique.attack" class="stat"><b>Atk Pwr</b>{{ power }}</span>
      <span class="stat"><b>Cost</b>{{ costLabel }}</span>
      <span v-if="saveLabel" class="stat"><b>Save</b>{{ saveLabel }}</span>
      <span v-if="damageLine" class="stat stat--damage"><b>Damage</b>{{ damageLine }}</span>
      <span v-if="rolled.healing" class="stat"><b>Healing</b>{{ rolled.healing }}</span>
    </div>

    <div v-if="editing" class="editor">
      <TechniqueRollFields :id="technique._id" class="f--full" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;
@use './attackRow.scss' as *;

@include attack-row;

.tag {
  @include ps-caption;
  display: inline-block;
  margin-left: 4px;
  padding: 0 4px;
  font-size: 8px;
  line-height: 12px;
  vertical-align: 1px;
  color: var(--ps-blue);
  border: 1px solid var(--ps-blue);
  border-radius: 3px;
}

</style>
