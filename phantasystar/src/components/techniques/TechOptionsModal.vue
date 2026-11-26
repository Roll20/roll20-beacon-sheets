<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { ABILITIES, formatModifier, INITIATE_TECH_ABILITIES } from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()

const abilityName = (id) => ABILITIES.find((a) => a.id === id)?.name ?? id

const abilityChoices = INITIATE_TECH_ABILITIES.map((id) => ({ id, name: abilityName(id) }))

const defaultAbilityLabel = computed(() => {
  const own = sheet.professionStats.techAbility
  return own ? `Profession (${abilityName(own)})` : 'None'
})

const opts = computed(() => sheet.techOptions)
</script>

<template>
  <SheetModal :open="open" title="Tech Feature Options" width="440px" @close="$emit('close')">
    <div class="rows">
      <label class="row">
        <span class="name">Tech Ability</span>
        <select v-model="opts.ability" class="control" :class="{ changed: opts.ability }">
          <option value="">{{ defaultAbilityLabel }}</option>
          <option v-for="a in abilityChoices" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
        <span class="result">{{ sheet.techAbility ? formatModifier(sheet.techAbilityMod) : '—' }}</span>
      </label>

      <label class="row">
        <span class="name">Tech Attack Bonus</span>
        <input v-model.number="opts.attackMisc" type="number" class="control control--num" />
        <span class="result">
          {{ sheet.techAttackPowerValue === null ? '—' : formatModifier(sheet.techAttackPowerValue) }}
        </span>
      </label>

      <label class="row">
        <span class="name">Save DC Bonus</span>
        <input v-model.number="opts.saveDCMisc" type="number" class="control control--num" />
        <span class="result">{{ sheet.techSaveDCValue ?? '—' }}</span>
      </label>
    </div>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.rows { display: flex; flex-direction: column; }

.row {
  @include ps-list-row;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px 44px;
  gap: var(--ps-gap);
  align-items: center;
}

.name { font-size: var(--ps-fs-body); color: var(--ps-text); }

.control { @include ps-control; }
.control--num { text-align: center; }

.control.changed { border-color: var(--ps-gold-dark); font-weight: 700; }

.result {
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  color: var(--ps-heading);
}
</style>
