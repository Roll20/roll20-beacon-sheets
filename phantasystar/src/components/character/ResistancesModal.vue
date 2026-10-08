<script setup>
import { useCharacterStore } from '@/stores/characterStore.js'
import { DAMAGE_TYPES } from '@/rules/index.js'
import SheetModal from '@/components/shared/SheetModal.vue'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['close'])

const sheet = useCharacterStore()
</script>

<template>
  <SheetModal :open="open" title="Resistances" width="420px" @close="$emit('close')">
    <div class="types">
      <button
        v-for="t in DAMAGE_TYPES"
        :key="t.id"
        type="button"
        class="type"
        :aria-pressed="sheet.resistances[t.id] ? 'true' : 'false'"
        @click="sheet.toggleResistance(t.id)"
      >
        {{ t.name }}
      </button>
    </div>

    <label class="other">
      <span>Other</span>
      <input v-model="sheet.resistances.other" />
    </label>
  </SheetModal>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 6px;
}

.type {
  @include ps-chip(true);
  justify-content: center;
  padding: 5px 8px;
  font-size: 10.5px;
}

.other {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 12px;

  > span { @include ps-caption; font-size: 9px; }

  input {
    @include ps-control(26px);
    text-align: left;
    padding: 0 6px;
  }
}
</style>
