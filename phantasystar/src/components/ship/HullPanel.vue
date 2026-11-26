<script setup>
import { ref, watch } from 'vue'
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import CircularGauge from '@/components/shared/CircularGauge.vue'

const ship = useStarshipStore()
const rolls = useSheetRolls()

const siToSpend = ref(0)
watch(
  () => ship.siCurrent,
  (left) => {
    if (siToSpend.value > left) siToSpend.value = Math.max(0, left)
  },
)
</script>

<template>
  <div class="hull">
    <SheetPanel title="Defense" inset>
      <div class="total">{{ ship.defenseValue }}</div>
      <div class="parts">
        <label><input v-model.number="ship.baseDefense" type="number" /><span>Base</span></label>
        <em>+</em>
        <label><input v-model.number="ship.maneuverability" type="number" /><span>Maneuver</span></label>
        <em>+</em>
        <label><input :value="ship.pilot.dexterity" type="number" readonly /><span>Pilot DEX</span></label>
        <em>+</em>
        <label><input v-model.number="ship.defenseMisc" type="number" /><span>Misc</span></label>
      </div>
    </SheetPanel>

    <SheetPanel title="Maneuver Defense" inset>
      <div class="total">{{ ship.maneuverDefenseValue }}</div>
      <div class="parts">
        <label><input value="8" readonly /><span>Base</span></label>
        <em>+</em>
        <label>
          <input :value="ship.pilot.proficient ? ship.pilot.saveBonus : 0" readonly />
          <span>Save</span>
        </label>
        <em>+</em>
        <label>
          <input :value="ship.maneuverDefenseMember.wisdom" readonly />
          <span>{{ ship.copilot.memberId ? 'Co-Pilot WIS' : 'Pilot WIS' }}</span>
        </label>
        <em>+</em>
        <label><input v-model.number="ship.maneuverDefenseMisc" type="number" /><span>Misc</span></label>
      </div>
    </SheetPanel>

    <SheetPanel title="Hull Points" inset>
      <div class="vitals">
        <CircularGauge
          :value="ship.maxHull"
          :max="ship.maxHull"
          :fill="ship.hullCurrent"
          plain
          color="var(--ps-green)"
          :size="74"
          label="Max HLP"
        />
        <div class="vitals__side">
          <label class="big">
            <input v-model.number="ship.hullCurrent" type="number" />
            <span>Remaining HLP</span>
          </label>
          <div class="basis">
            <label><input v-model.number="ship.baseHullPoints" type="number" /><span>Base HLP</span></label>
            <label><input v-model.number="ship.defenseModifier" type="number" /><span>Def. Mod</span></label>
            <label><input :value="ship.technician.intelligence" readonly /><span>Tech INT</span></label>
          </div>
          <p class="formula">
            Max {{ ship.maxHull }} = base + (Defense modifier &times; technician&rsquo;s INT)
          </p>
          <p v-if="ship.siThreshold > 0" class="warn">
            One hit of {{ ship.siThreshold }}+ costs a point of SI.
          </p>
          <p v-if="ship.isDisabled" class="danger">
            At 0 HLP the ship can&rsquo;t move or perform maneuvers. Each turn it starts here, the
            technician makes an Intelligence save against DC {{ ship.zeroHullDC }} or loses 1 SI.
          </p>
        </div>
      </div>
    </SheetPanel>

    <SheetPanel title="Structural Integrity" inset>
      <div class="vitals">
        <CircularGauge
          :value="ship.maxSi"
          :max="ship.maxSi"
          :fill="ship.siCurrent"
          plain
          color="var(--ps-purple)"
          :size="74"
          label="Max SI"
        />
        <div class="vitals__side">
          <label class="big">
            <input v-model.number="ship.siCurrent" type="number" />
            <span>Remaining SI</span>
          </label>
          <div class="basis">
            <label><input v-model.number="ship.baseStructuralIntegrity" type="number" /><span>Base SI</span></label>
            <label><input :value="ship.technician.wisdom" readonly /><span>Tech WIS</span></label>
          </div>
          <p class="formula">Max {{ ship.maxSi }} = base SI + technician&rsquo;s WIS</p>
          <p v-if="ship.isDestroyed" class="danger">At 0 SI the ship is destroyed.</p>
        </div>
      </div>
    </SheetPanel>

    <SheetPanel title="Patch Repair" inset>
      <p class="hint">
        One hour, up to two hull dice plus the technician&rsquo;s Wisdom. Ends any System Failure
        effects. Spend SI for an extra die each.
      </p>
      <div class="repair">
        <label><input v-model="ship.hullDie" placeholder="d10" /><span>Hull Die</span></label>
        <label><input :value="ship.technician.wisdom" readonly /><span>Tech WIS</span></label>
        <label><input v-model.number="ship.patchRepairsUsed" type="number" /><span># Used</span></label>
        <label>
          <input v-model.number="siToSpend" type="number" min="0" :max="ship.siCurrent" />
          <span>SI Spent</span>
        </label>
      </div>
      <button
        type="button"
        class="roll"
        :disabled="ship.maxHull <= 0"
        :title="`Roll ${ship.patchRepair} and restore that many hull points`"
        @click="rolls.rollPatchRepair({ siSpent: siToSpend })"
      >
        Patch Repair &middot; {{ ship.patchRepair }}
      </button>
    </SheetPanel>

    <SheetPanel title="Defense Systems">
      <textarea v-model="ship.defenseSystems" rows="4" />
      <label class="stacked">
        <span>Resistances (Half Damage)</span>
        <input v-model="ship.resistances" />
      </label>
    </SheetPanel>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.hull {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--ps-gap-lg);
  align-items: start;
}

.total {
  font-size: 30px;
  font-weight: 700;
  color: var(--ps-derived, var(--ps-heading));
  text-align: center;
  line-height: 1;
  margin-bottom: 4px;
}

.parts {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;

  em { font-style: normal; color: var(--ps-text-muted); padding-bottom: 12px; }

  label { display: flex; flex-direction: column; align-items: center; min-width: 0; flex: 1; }

  input {
    @include ps-well;
    width: 100%;
    height: 26px;
    font-size: 13px;
    font-weight: 700;
    text-align: center;

    &[readonly] { background: var(--ps-panel-alt); color: var(--ps-derived, var(--ps-text)); }
    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  span { @include ps-caption; font-size: 8px; margin-top: 1px; text-align: center; }
}

.vitals { display: flex; gap: 10px; align-items: flex-start; }
.vitals__side { flex: 1; min-width: 0; }

.big {
  display: flex;
  flex-direction: column;

  input {
    @include ps-well;
    height: 32px;
    font-size: 18px;
    font-weight: 700;
    text-align: center;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  span { @include ps-caption; font-size: 8.5px; margin-top: 1px; }
}

.basis {
  display: flex;
  gap: 4px;
  margin-top: 5px;

  label { display: flex; flex-direction: column; flex: 1; min-width: 0; }

  input {
    @include ps-well;
    height: 22px;
    font-size: 12px;
    text-align: center;

    &[readonly] { background: var(--ps-panel-alt); color: var(--ps-derived, var(--ps-text)); }
    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  span { @include ps-caption; font-size: 8px; margin-top: 1px; }
}

.formula { font-size: 9px; color: var(--ps-text-muted); margin: 4px 0 0; line-height: 1.4; }
.warn { font-size: 9px; color: var(--ps-gold-dark); margin: 3px 0 0; line-height: 1.4; }
.danger { font-size: 9.5px; color: var(--ps-red); font-weight: 700; margin: 3px 0 0; line-height: 1.4; }
.hint { font-size: 9.5px; color: var(--ps-text-muted); margin: 0 0 5px; line-height: 1.4; }

.repair {
  display: flex;
  gap: 4px;

  label { display: flex; flex-direction: column; flex: 1; min-width: 0; }

  input {
    @include ps-well;
    height: 24px;
    font-size: 12px;
    text-align: center;

    &[readonly] { background: var(--ps-panel-alt); color: var(--ps-derived, var(--ps-text)); }
    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  span { @include ps-caption; font-size: 8px; margin-top: 1px; }
}

.roll {
  @include ps-heading(11px);
  width: 100%;
  margin-top: 6px;
  background: var(--ps-panel);
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  padding: 4px 8px;
  color: var(--ps-heading);
  cursor: pointer;

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
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

.stacked {
  display: flex;
  flex-direction: column;
  margin-top: 6px;

  > span { @include ps-caption; margin-bottom: 2px; }

  input {
    @include ps-well;
    height: 24px;
    font-size: 11.5px;
    text-align: left;
    padding: 0 5px;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }
}
</style>
