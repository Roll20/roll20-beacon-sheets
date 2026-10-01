<script setup>
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { CREATURE_SIZES, formatModifier } from '@/rules/index.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import CircularGauge from '@/components/shared/CircularGauge.vue'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'
import WeaponsPanel from './WeaponsPanel.vue'
import pilotingFrame from '@/assets/img/piloting-frame.webp'

const ship = useStarshipStore()
const meta = useMetaStore()
const rolls = useSheetRolls()
</script>

<template>
  <div class="vehicle">
    <div class="top">
      <SheetPanel title="Vehicle Statistics">
        <div class="fields">
          <label class="line wide">
            <input v-model="meta.name" />
            <span>Vehicle Name</span>
          </label>
          <label class="line wide">
            <input v-model="ship.owner" />
            <span>Owner</span>
          </label>
          <label class="line">
            <select v-model="ship.size">
              <option value="">&mdash;</option>
              <option v-for="s in CREATURE_SIZES" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <span>Size</span>
          </label>
          <label class="line">
            <input v-model="ship.crewCapacity" />
            <span>Seating</span>
          </label>
          <label class="line wide">
            <input v-model="ship.actionStations" placeholder="Operator 1, Weapon 3" />
            <span>Stations</span>
          </label>
        </div>

        <div class="roster">
          <div class="roster__head">
            <span>Crewmember</span>
            <span class="num">DEX</span>
            <span class="num">Save Bonus</span>
            <span class="num">Attack Bonus</span>
            <span class="num">Proficient</span>
            <button type="button" class="add" title="Add a crewmember" @click="ship.addCrewmember()">+</button>
          </div>
          <div v-for="c in ship.roster" :key="c._id" class="roster__row">
            <input v-model="c.name" placeholder="Name" />
            <input v-model.number="c.dexterity" type="number" class="num" aria-label="DEX" />
            <input v-model.number="c.saveBonus" type="number" class="num" aria-label="Save Bonus" />
            <input v-model.number="c.attackBonus" type="number" class="num" aria-label="Attack Bonus" />
            <input v-model="c.proficient" type="checkbox" class="pip" aria-label="Proficient" />
            <ConfirmDelete class="del" title="Remove" @confirm="ship.removeCrewmember(c._id)" />
          </div>
        </div>
      </SheetPanel>

      <SheetPanel title="Operator" inset>
        <select v-model="ship.stations.pilot" class="who" aria-label="Operator">
          <option value="">&mdash;</option>
          <option v-for="c in ship.roster" :key="c._id" :value="c._id">{{ c.name || 'Unnamed' }}</option>
        </select>
        <button type="button" class="gauge-button" title="Roll a control check" @click="rolls.rollVehicleControl()">
          <CircularGauge
            :value="formatModifier(ship.controlBonusValue)"
            :show-ratio="false"
            :frame="pilotingFrame"
            :size="85"
            label="Control"
          />
        </button>
        <div class="speeds">
          <label class="well"><input v-model="ship.controlSpeed" placeholder="60 ft." /><span>Control Speed</span></label>
          <label class="well"><input v-model="ship.interceptSpeed" placeholder="400 ft." /><span>Speed</span></label>
        </div>
      </SheetPanel>
    </div>

    <hr class="rule" />

    <div class="stats">
      <SheetPanel title="Defense" inset>
        <div class="total">{{ ship.defenseValue }}</div>
        <div class="parts">
          <label><input v-model.number="ship.baseDefense" type="number" /><span>Base</span></label>
          <em>+</em>
          <label><input :value="ship.pilot.dexterity" type="number" readonly /><span>Operator DEX</span></label>
          <em>+</em>
          <label><input v-model.number="ship.defenseMisc" type="number" /><span>Misc</span></label>
        </div>
      </SheetPanel>

      <SheetPanel title="Hit Points" inset>
        <div class="vitals">
          <CircularGauge
            :value="ship.maxHull"
            :max="ship.maxHull"
            :fill="ship.hullCurrent"
            plain
            color="var(--ps-green)"
            :size="74"
            label="Max HP"
          />
          <div class="vitals__side">
            <label class="big"><input v-model.number="ship.hullCurrent" type="number" /><span>Remaining HP</span></label>
            <label class="small"><input v-model.number="ship.baseHullPoints" type="number" /><span>Max HP</span></label>
          </div>
        </div>
      </SheetPanel>

      <SheetPanel title="Saving Throws" inset>
        <div class="saves">
          <div class="save">
            <button type="button" class="save__roll" title="Strength saving throw" @click="rolls.rollVehicleSave('strength')">
              {{ formatModifier(ship.strSave) }}
            </button>
            <input v-model.number="ship.strSave" type="number" aria-label="Strength save" />
            <span>STR</span>
          </div>
          <div class="save">
            <button type="button" class="save__roll" title="Constitution saving throw" @click="rolls.rollVehicleSave('constitution')">
              {{ formatModifier(ship.conSave) }}
            </button>
            <input v-model.number="ship.conSave" type="number" aria-label="Constitution save" />
            <span>CON</span>
          </div>
        </div>
        <label class="immune">
          <span>Immunities</span>
          <textarea v-model="ship.immunities" rows="3" />
        </label>
      </SheetPanel>
    </div>

    <WeaponsPanel />

    <div class="prose">
      <SheetPanel title="Utility Station">
        <textarea v-model="ship.defenseSystems" rows="4" />
      </SheetPanel>
      <SheetPanel title="Special Features">
        <textarea v-model="ship.specialFeatures" rows="4" />
      </SheetPanel>
      <SheetPanel title="Description">
        <textarea v-model="ship.description" rows="4" />
      </SheetPanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.vehicle { display: flex; flex-direction: column; gap: var(--ps-gap-lg); }

.top {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(200px, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-bottom: 8px;
}

.line {
  display: flex;
  flex-direction: column;
  min-width: 0;

  &.wide { grid-column: span 2; }
  > span { @include ps-caption; margin-top: 1px; }

  input, select {
    border: none;
    border-bottom: 1.5px solid var(--ps-line);
    background: transparent;
    font-size: 13px;
    padding: 1px 2px;
    min-width: 0;
    &:focus { outline: none; border-bottom-color: var(--ps-blue); background: var(--ps-field); }
  }
}

.roster { border-top: 2px solid var(--ps-gold); padding-top: 6px; }

$roster-cols: minmax(0, 1fr) repeat(3, 44px) 58px 22px;

.roster__head {
  display: grid;
  grid-template-columns: $roster-cols;
  gap: 6px;
  align-items: end;
  @include ps-caption;
  padding-bottom: 3px;
  border-bottom: 1.5px solid var(--ps-line);
  .num { text-align: center; font-size: 9px; line-height: 1.15; }
}

.roster__row {
  display: grid;
  grid-template-columns: $roster-cols;
  gap: 6px;
  align-items: center;
  padding: 2px 0;

  input:not([type='checkbox']) {
    @include ps-well;
    height: 22px;
    font-size: 11.5px;
    text-align: left;
    padding: 0 4px;
    min-width: 0;
    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }
  input.num { text-align: center; font-weight: 700; }
  .pip { @include ps-pip-check(13px); justify-self: center; }
}

.add, .del {
  border: 1px solid var(--ps-line);
  border-radius: 3px;
  background: var(--ps-field);
  color: var(--ps-heading);
  cursor: pointer;
}

.who {
  @include ps-well;
  width: 100%;
  height: 22px;
  font-size: 11.5px;
  text-align: left;
  padding: 0 4px;
  margin-bottom: 6px;
}

.gauge-button {
  display: block;
  margin: 0 auto 6px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

.speeds { display: flex; gap: 6px; }

.well {
  @include ps-well;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2px 4px;
  min-width: 0;
  input { border: none; background: transparent; font-size: 13px; font-weight: 700; text-align: center; min-width: 0; }
  span { @include ps-caption; font-size: 9px; text-align: center; }
}

.rule { border: none; border-top: 2px solid var(--ps-gold); margin: 2px 0; }

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ps-gap-lg);
  align-items: start;
}

.total { @include ps-heading(26px); text-align: center; }

.parts {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;

  label { display: flex; flex-direction: column; align-items: center; }
  input { @include ps-well; width: 40px; height: 24px; font-size: 12px; font-weight: 700; text-align: center; }
  span { @include ps-caption; font-size: 8.5px; }
  em { font-style: normal; color: var(--ps-text-muted); padding-bottom: 14px; }
}

.vitals { display: flex; align-items: center; gap: 10px; }
.vitals__side { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }

.big, .small {
  @include ps-well;
  display: flex;
  flex-direction: column;
  padding: 2px 5px;
  input { border: none; background: transparent; font-weight: 700; text-align: center; width: 100%; }
  span { @include ps-caption; font-size: 9px; }
}
.big input { font-size: 22px; }
.small input { font-size: 13px; }

.saves { display: flex; gap: 10px; justify-content: center; margin-bottom: 6px; }

.save {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  input { @include ps-well; width: 40px; height: 20px; font-size: 11px; text-align: center; }
  span { @include ps-caption; font-size: 9px; }
}

.save__roll {
  @include ps-heading(18px);
  background: var(--ps-panel);
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  padding: 2px 10px;
  cursor: pointer;
  &:hover { background: var(--ps-blue); color: var(--ps-on-fill); }
}

.immune {
  display: flex;
  flex-direction: column;
  span { @include ps-caption; font-size: 9px; }
}

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

.prose {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ps-gap-lg);
  align-items: start;
}

@media (max-width: 700px) {
  .top, .stats, .prose { grid-template-columns: 1fr; }
}
</style>
