<script setup>
import { useCharacterStore } from '@/stores/characterStore.js'
import { formatModifier } from '@/rules/index.js'
import CircularGauge from '@/components/shared/CircularGauge.vue'
import saveBonusFrame from '@/assets/img/save-bonus-frame.webp'
import saveBonusFrameDark from '@/assets/img/save-bonus-frame-dark.webp'
import perceptionFrame from '@/assets/img/perception-frame.webp'
import { fatePoolContribution } from '@/rules/index.js'
import { sharedSettings } from '@/relay/sheetSettings.js'

const sheet = useCharacterStore()
</script>

<template>
  <div class="core">
    <div class="gauges">
      <CircularGauge
        :value="formatModifier(sheet.saveBonusValue)"
        :show-ratio="false"
        :frame="saveBonusFrame"
        :frame-dark="saveBonusFrameDark"
        :size="70"
        label="Save Bonus"
      />
      <CircularGauge
        :value="sheet.passivePerceptionValue"
        :show-ratio="false"
        :frame="perceptionFrame"
        :size="70"
        label="Passive Perception"
      />
    </div>

    <div class="fate">
      <div class="fate-title">Fate Points</div>
      <div class="fate-row">
        <div class="die">{{ sheet.fate.die }}</div>
        <div class="cell">
          <div class="box readonly">{{ sheet.fate.max }}</div>
          <span>Max</span>
        </div>
        <div class="cell">
          <div class="box readonly">{{ sheet.fate.remaining }}</div>
          <span>Remaining</span>
        </div>
        <div v-if="sharedSettings.fatePool" class="cell">
          <div class="box readonly">{{ fatePoolContribution(sheet.effectiveLevel) }}</div>
          <span>To pool</span>
        </div>
        <div class="spend">
          <button type="button" :disabled="sheet.fate.remaining <= 0" @click="sheet.fateSpent += 1">
            Spend
          </button>
          <button type="button" :disabled="sheet.fateSpent <= 0" @click="sheet.fateSpent -= 1">
            Restore
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.core { display: flex; flex-direction: column; gap: 10px; align-items: center; }

.gauges { display: flex; gap: 12px; justify-content: center; }

.fate {
  @include ps-panel;
  padding: 5px 8px 6px;
  width: 100%;
}

.fate-title {
  @include ps-heading(14px);
  text-align: center;
  margin-bottom: 3px;
}

.fate-row { display: flex; align-items: flex-end; gap: 6px; justify-content: center; }

@media (max-width: 1000px) {
  .core { flex-direction: row; align-items: center; justify-content: center; gap: 16px; }
  .fate { width: auto; flex: 0 1 300px; }
}

.die {
  font-size: 19px;
  font-weight: 700;
  color: var(--ps-derived, var(--ps-heading));
  padding-bottom: 12px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  .box {
    @include ps-well;
    min-width: 34px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ps-fs-value);
    font-weight: 700;
    &.readonly { background: var(--ps-panel-alt); color: var(--ps-derived, var(--ps-text)); }
  }
  > span { @include ps-caption; font-size: 9px; }
}

.spend {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  button {
    font-size: 9px;
    text-transform: uppercase;
    border: 1px solid var(--ps-line-soft);
    border-radius: 3px;
    background: var(--ps-field);
    color: var(--ps-heading);
    cursor: pointer;
    padding: 1px 5px;
    &:hover:not(:disabled) { background: var(--ps-gold-light); color: var(--ps-on-gold-fill, var(--ps-heading)); }
    &:disabled { opacity: 0.4; cursor: default; }
  }
}
</style>
