<script setup>
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import CircularGauge from '@/components/shared/CircularGauge.vue'
import DeathSaves from '@/components/shared/DeathSaves.vue'

const sheet = useCharacterStore()
const rolls = useSheetRolls()
</script>

<template>
  <div class="vitals">
    <SheetPanel title="Hit Points">
      <div class="hp-grid">
        <CircularGauge
          v-model:value="sheet.hp.max"
          :max="sheet.hp.max"
          :fill="sheet.hp.current"
          plain
          color="var(--ps-green)"
          :size="74"
          label="Max HP"
          editable
        />

        <div class="current">
          <label class="big-field">
            <span>Remaining HP</span>
            <input v-model.number="sheet.hp.current" type="number" />
          </label>
          <label class="temp">
            <span>Temp HP</span>
            <input v-model.number="sheet.hp.temp" type="number" />
          </label>
        </div>

        <DeathSaves
          :survive="sheet.deathSaves.survive"
          :perish="sheet.deathSaves.perish"
          @set="sheet.setDeathSave"
          @clear="sheet.clearDeathSaves"
          @roll="rolls.rollDeathSave()"
        />
      </div>

      <div v-if="sheet.suggestedMaxHp !== null && !sheet.hp.max" class="hint">
        Suggested level 1 max HP: {{ sheet.suggestedMaxHp }}
      </div>
    </SheetPanel>

    <SheetPanel title="Technique Points">
      <div v-if="!sheet.techAbility && !sheet.maxTP" class="no-tech">No tech ability</div>

      <div v-else class="tp-grid">
        <CircularGauge
          :value="sheet.maxTP"
          :max="sheet.maxTP"
          :fill="sheet.tp.current"
          plain
          color="var(--ps-blue)"
          :size="74"
          label="Max TP"
        />

        <label class="big-field">
          <span>Remaining TP</span>
          <input v-model.number="sheet.tp.current" type="number" />
        </label>

        <div class="tech-stats">
          <div class="tech-stat">
            <div class="tech-label">
              Tech Attack
              <small>(Ability + Tech Bonus)</small>
            </div>
            <div class="tech-value">{{ sheet.techAttackPowerValue }}</div>
          </div>
          <div class="tech-stat">
            <div class="tech-label">
              Tech Save DC
              <small>(8 + Ability + Save Bonus)</small>
            </div>
            <div class="tech-value">{{ sheet.techSaveDCValue }}</div>
          </div>
        </div>
      </div>

    </SheetPanel>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.vitals { display: flex; flex-direction: column; gap: var(--ps-gap-lg); }

.hp-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.tp-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(120px, auto);
  gap: 10px;
  align-items: center;
}

.current { display: flex; gap: 6px; align-items: stretch; min-width: 0; }

.big-field {
  @include ps-well;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 3px 5px;
  text-align: left;

  > span { @include ps-caption; font-weight: 400; text-transform: none; font-size: 10px; }
  input {
    border: none;
    background: transparent;
    font-size: 24px;
    font-weight: 700;
    color: var(--ps-entry, var(--ps-heading));
    text-align: center;
    width: 100%;
    font-family: var(--ps-font);
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    &:focus { outline: none; }
  }
}

.temp {
  @extend .big-field;
  flex: 0 0 62px;
  input { font-size: 16px; }
}

.tech-stats { display: flex; flex-direction: column; gap: 6px; }

.tech-stat { display: flex; align-items: center; gap: 6px; }

.tech-label {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--ps-text);
  line-height: 1.15;
  small { display: block; font-size: 9px; font-weight: 400; color: var(--ps-text-muted); }
}

.tech-value {
  @include ps-well;
  width: 40px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ps-fs-value);
  font-weight: 700;
  background: var(--ps-panel-alt);
  color: var(--ps-derived, var(--ps-text));
}

.no-tech { font-size: 12px; color: var(--ps-text-muted); padding: 6px 2px; }

.hint {
  font-size: 10px;
  color: var(--ps-text-muted);
  text-align: right;
  padding-top: 4px;
}

@media (max-width: 700px) {
  .hp-grid, .tp-grid { grid-template-columns: 1fr; justify-items: center; }
  .current { width: 100%; }
}
</style>
