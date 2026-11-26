<script setup>
import { useCharacterStore } from '@/stores/characterStore.js'
import { ABILITIES, formatModifier } from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()

const toNum = (value) => (value === '' ? 0 : Number(value) || 0)
</script>

<template>
  <SheetModal :open="open" title="Save Options" width="420px" @close="$emit('close')">
    <div class="head">
      <span>Saving Throw</span>
      <span>Other Bonus</span>
      <span>Total</span>
    </div>

    <div class="rows">
      <label v-for="a in ABILITIES" :key="a.id" class="row">
        <span class="name">{{ a.name }}</span>
        <input
          type="number"
          class="control"
          :class="{ changed: sheet.saveOptions.bonus[a.id] }"
          :value="sheet.saveOptions.bonus[a.id]"
          @input="sheet.saveOptions.bonus[a.id] = toNum($event.target.value)"
        />
        <span class="result">{{ formatModifier(sheet.saves[a.id]) }}</span>
      </label>

      <label class="row">
        <span class="name">Death Saves</span>
        <input
          type="number"
          class="control"
          :class="{ changed: sheet.saveOptions.deathSave }"
          :value="sheet.saveOptions.deathSave"
          @input="sheet.saveOptions.deathSave = toNum($event.target.value)"
        />
        <span class="result">{{ formatModifier(sheet.deathSaveBonus) }}</span>
      </label>

      <label class="row">
        <span class="name">Passive Perception</span>
        <input
          type="number"
          class="control"
          :class="{ changed: sheet.saveOptions.passivePerception }"
          :value="sheet.saveOptions.passivePerception"
          @input="sheet.saveOptions.passivePerception = toNum($event.target.value)"
        />
        <span class="result">{{ sheet.passivePerceptionValue }}</span>
      </label>
    </div>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.head,
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 70px 44px;
  gap: var(--ps-gap);
  align-items: center;
}

.head { @include ps-list-head; }

.rows { display: flex; flex-direction: column; }

.row { @include ps-list-row; }

.name { font-size: var(--ps-fs-body); color: var(--ps-text); }

.control { @include ps-control; text-align: center; }

.control.changed { border-color: var(--ps-gold-dark); font-weight: 700; }

.result {
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  color: var(--ps-heading);
}
</style>
