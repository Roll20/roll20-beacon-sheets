<script setup>
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import CircularGauge from '@/components/shared/CircularGauge.vue'
import { formatModifier } from '@/rules/index.js'
import pilotingFrame from '@/assets/img/piloting-frame.webp'
import maneuverSaveFrame from '@/assets/img/maneuver-save-frame.webp'
import maneuverSaveFrameDark from '@/assets/img/maneuver-save-frame-dark.webp'
import initBonusFrame from '@/assets/img/init-bonus-frame.webp'
import initBonusFrameDark from '@/assets/img/init-bonus-frame-dark.webp'

const ship = useStarshipStore()
const rolls = useSheetRolls()
</script>

<template>
  <div class="piloting">
    <div class="checks">
      <div class="check">
        <button
          type="button"
          class="gauge-button"
          title="Roll a piloting check"
          @click="rolls.rollManeuverCheck()"
        >
          <CircularGauge
            :value="formatModifier(ship.pilotingBonusValue)"
            :show-ratio="false"
            :frame="pilotingFrame"
            :size="85"
            label="Piloting Check"
          />
        </button>
        <div class="check__parts">Pilot&rsquo;s DEX + Save Bonus</div>
      </div>

      <div class="check">
        <CircularGauge
          :value="ship.maneuverSaveDCValue"
          :show-ratio="false"
          :frame="maneuverSaveFrame"
          :frame-dark="maneuverSaveFrameDark"
          :size="85"
          label="Maneuver Save DC"
        />
        <div class="check__parts">8 + Pilot&rsquo;s DEX + Save Bonus</div>
      </div>

      <div class="check">
        <CircularGauge
          :value="formatModifier(ship.initiativeBonus)"
          :show-ratio="false"
          :frame="initBonusFrame"
          :frame-dark="initBonusFrameDark"
          :size="77"
          :inset="4"
          label="Initiative Bonus"
        />
        <div class="check__parts">Pilot&rsquo;s Agility</div>
      </div>
    </div>

    <div class="speeds">
      <label class="well">
        <input v-model="ship.sensorRange" />
        <span>Sensor Range</span>
      </label>
      <label class="well">
        <input v-model="ship.interceptSpeed" />
        <span>Intercept Speed</span>
      </label>
      <p class="units">One unit = 50 feet</p>
    </div>

    <SheetPanel title="Special Features">
      <textarea v-model="ship.specialFeatures" rows="6" />
    </SheetPanel>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.piloting {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(130px, 0.7fr) minmax(0, 1.3fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.checks {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

.check {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 130px;

  &__parts { font-size: 9px; color: var(--ps-text-muted); line-height: 1.3; }
}

.gauge-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;

  &:hover { filter: brightness(1.06); }
  &:focus-visible { outline: 2px solid var(--ps-blue); outline-offset: 2px; }
}

.speeds {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.well {
  display: flex;
  flex-direction: column;
  align-items: center;

  input {
    @include ps-well;
    width: 100%;
    height: 34px;
    font-size: 17px;
    font-weight: 700;
    text-align: center;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  span { @include ps-caption; margin-top: 2px; }
}

.units { font-size: 9px; color: var(--ps-text-muted); text-align: center; margin: 0; }

textarea {
  @include ps-well;
  width: 100%;
  text-align: left;
  padding: 5px;
  font-size: 11.5px;
  line-height: 1.45;
  resize: vertical;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

@media (max-width: 860px) {
  .piloting { grid-template-columns: 1fr; }
}
</style>
