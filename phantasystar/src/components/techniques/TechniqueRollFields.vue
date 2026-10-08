<script setup>
import { computed } from 'vue'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { formatModifier } from '@/rules/index.js'

const props = defineProps({ id: { type: String, required: true } })

const store = useTechniqueStore()
const sheet = useCharacterStore()

const entry = computed(() => store.known.find((e) => e._id === props.id) ?? null)
const technique = computed(() => store.techniques.find((t) => t._id === props.id) ?? null)

const canCrit = computed(() => !!technique.value?.attack)

const boostLabel = computed(() => (technique.value?.rank === 0 ? 'Prime Upgrade' : 'Rank Boosting'))
</script>

<template>
  <div v-if="entry && technique" class="rolls">
    <label class="f f--narrow">
      <span>Damage</span>
      <input v-model="entry.damage" />
    </label>
    <label class="f">
      <span>Type</span>
      <input v-model="entry.damageType" />
    </label>
    <label v-if="canCrit" class="f f--narrow">
      <span>Crit extra</span>
      <input v-model="entry.critExtra" />
    </label>
    <label class="f f--narrow">
      <span>{{ boostLabel }}</span>
      <input v-model="entry.boostDamage" />
    </label>

    <label class="f f--narrow f--break">
      <span>Damage 2</span>
      <input v-model="entry.damage2" />
    </label>
    <label class="f">
      <span>Type</span>
      <input v-model="entry.damage2Type" :disabled="!entry.damage2" />
    </label>
    <label v-if="canCrit" class="f f--narrow">
      <span>Crit extra</span>
      <input v-model="entry.crit2Extra" :disabled="!entry.damage2" />
    </label>
    <label class="f f--narrow">
      <span>{{ boostLabel }}</span>
      <input v-model="entry.boostDamage2" />
    </label>

    <label class="f f--narrow f--break">
      <span>Healing</span>
      <input v-model="entry.healing" />
    </label>
    <label class="f f--narrow">
      <span>{{ boostLabel }}</span>
      <input v-model="entry.boostHealing" />
    </label>
    <label class="f f--check">
      <input v-model="entry.addAbilityMod" type="checkbox" />
      <span>Add tech ability ({{ formatModifier(sheet.techAbilityMod ?? 0) }})</span>
    </label>

    <label v-if="technique.saveAbility" class="f f--full">
      <span>Save effect</span>
      <input v-model="entry.saveEffect" />
    </label>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.rolls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 5px 8px;
}

.f {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; }

  input:not([type='checkbox']) { @include ps-control(22px); }
  input[type='checkbox'] { @include ps-pip-check; }
  input:disabled { opacity: 0.45; }

  &--full { grid-column: 1 / -1; }
  &--break { grid-column-start: 1; }
  &--narrow input { text-align: center; }

  &--check {
    grid-column: span 2;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    align-self: end;
    padding-bottom: 3px;

    > span { font-size: 9px; }
  }
}
</style>
