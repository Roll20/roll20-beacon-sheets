<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from './NotchContainer.vue';

const sheet = useSheetStore();

const modes = [
  { value: 'normal', label: 'Normal' },
  { value: 'advantage', label: 'Advantage' },
  { value: 'disadvantage', label: 'Disadvantage' }
];
</script>

<template>
  <NotchContainer width="thick" :notch="20" class="roll-mode-container" :class="{ 'forced-disadvantage': sheet.forcedDisadvantage }">
    <h3>roll mode</h3>
    <select
      class="roll-mode-select"
      :class="sheet.effectiveRollMode"
      v-model="sheet.rollMode"
      :disabled="sheet.forcedDisadvantage"
    >
      <option
        v-for="mode in modes"
        :key="mode.value"
        :value="mode.value"
      >
        {{ mode.label }}
      </option>
    </select>
    <div v-if="sheet.forcedDisadvantage" class="forced-warning">
      <span class="material-symbols-outlined">warning</span>
      <span>Stress/Exhaustion at 6</span>
    </div>
  </NotchContainer>
</template>

<style lang="scss">
.roll-mode-container {
  display: grid;
  gap: var(--tiny-gap);
  align-items: center;

  &.forced-disadvantage {
    border-color: var(--error-red);
  }

  h3 {
    text-align: center;
  }
}

.roll-mode-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  background: var(--masterBack);
  color: var(--color);

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  &.normal {
    background: white;
    color: var(--color);
  }

  &.advantage {
    background: #2e7d32;
    color: white;
  }

  &.disadvantage {
    background: #c62828;
    color: white;
  }
}

.forced-warning {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--error-red);

  .material-symbols-outlined {
    font-size: 14px;
  }
}
</style>
