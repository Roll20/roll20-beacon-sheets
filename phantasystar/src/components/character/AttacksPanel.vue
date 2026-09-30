<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useBioStore } from '@/stores/bioStore.js'
import { hiddenAttackIds } from '@/rules/index.js'
import AttackRow from './AttackRow.vue'
import TechAttackRow from './TechAttackRow.vue'

const sheet = useCharacterStore()
const techniques = useTechniqueStore()
const bio = useBioStore()

const shown = computed(() => {
  const hidden = hiddenAttackIds(bio.equipment)
  return sheet.attacks.filter((a) => !hidden.has(a._id))
})
</script>

<template>
  <div class="attacks">
    <div class="head">
      <h2 class="ps-heading">Attacks</h2>
      <label class="per-action">
        # of Attacks per Action
        <input v-model.number="sheet.attacksPerAction" type="number" min="1" />
      </label>
      <button type="button" class="add" @click="sheet.addAttack()">+ Add</button>
    </div>

    <div class="panel">
      <div v-if="!shown.length && !techniques.techAttacks.length" class="empty">
        No attacks yet.
      </div>

      <AttackRow
        v-for="(atk, i) in shown"
        :id="atk._id"
        :key="atk._id"
        :class="{ odd: i % 2 === 1 }"
      />

      <TechAttackRow
        v-for="(tech, i) in techniques.techAttacks"
        :id="tech._id"
        :key="tech._id"
        :class="{ odd: (shown.length + i) % 2 === 1 }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.attacks {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ps-heading { @include ps-heading; color: var(--ps-title); margin: 0; }

.head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 3px 4px;
}

.per-action {
  @include ps-caption;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  input {
    @include ps-well;
    width: 38px;
    height: 20px;
    font-size: var(--ps-fs-body);
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  }
}

.add {
  font-size: 10px;
  text-transform: uppercase;
  border: 1px solid var(--ps-line);
  border-radius: 3px;
  background: var(--ps-field);
  color: var(--ps-heading);
  cursor: pointer;
  padding: 2px 8px;
  &:hover { background: var(--ps-gold-light); color: var(--ps-on-gold-fill, var(--ps-heading)); }
}

.panel {
  @include ps-panel;
  padding: 6px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.empty { font-size: 11px; color: var(--ps-text-muted); padding: 8px 4px; line-height: 1.5; }
</style>
