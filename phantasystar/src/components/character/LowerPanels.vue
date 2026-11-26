<script setup>
import { ref, computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import {
  resistanceLabels, ARMOR_PROFICIENCIES, weaponProficiencyList, toolProficiencyLabels,
} from '@/rules/index.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import ResistancesModal from './ResistancesModal.vue'
import ProficienciesModal from './ProficienciesModal.vue'

const sheet = useCharacterStore()

const resistOpen = ref(false)
const resisted = computed(() => resistanceLabels(sheet.resistances))

const profOpen = ref(false)
const weapons = computed(() => weaponProficiencyList(sheet.proficiencies))
const others = (text) => String(text ?? '').split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
const tools = computed(() => [
  ...toolProficiencyLabels(sheet.proficiencies),
  ...others(sheet.proficiencies.otherTools),
])
</script>

<template>
  <div class="lower">
    <SheetPanel title="Hit Dice" inset>
      <div class="hd">
        <div class="cell">
          <div class="box readonly">{{ sheet.hitDice.total }}</div>
          <span>Max HD</span>
        </div>
        <div class="op">&times;</div>
        <div class="cell">
          <div class="box readonly">{{ sheet.hitDice.die }}</div>
          <span>Die Type</span>
        </div>
        <div class="op">+</div>
        <div class="cell">
          <div class="box readonly">{{ sheet.abilities.constitution }}</div>
          <span>CON</span>
        </div>
        <div class="cell">
          <div class="box"><input v-model.number="sheet.hitDiceUsed" type="number" min="0" /></div>
          <span># Used</span>
        </div>
      </div>
    </SheetPanel>

    <SheetPanel title="Resistances" inset>
      <template #actions>
        <button type="button" class="gear" title="Edit resistances" @click="resistOpen = true">
          &#9881;
        </button>
      </template>

      <div v-if="resisted.length" class="chips">
        <span v-for="label in resisted" :key="label" class="chip">{{ label }}</span>
      </div>
      <div v-else class="none">None</div>

      <ResistancesModal :open="resistOpen" @close="resistOpen = false" />
    </SheetPanel>

    <SheetPanel title="Proficiencies" class="prof" inset>
      <template #actions>
        <button type="button" class="gear" title="Edit proficiencies" @click="profOpen = true">
          &#9881;
        </button>
      </template>

      <div class="armor-row">
        <span class="armor-label">Armor:</span>
        <label v-for="a in ARMOR_PROFICIENCIES" :key="a.id">
          <input v-model="sheet.proficiencies.armor[a.id]" type="checkbox" /> {{ a.name }}
        </label>
      </div>

      <div class="prof-line">
        <span class="prof-label">Weapons</span>
        <div v-if="weapons.length || sheet.proficiencies.otherWeapons.trim()" class="chips">
          <span
            v-for="w in weapons"
            :key="w.id"
            class="chip"
            :class="{ 'chip--mastery': w.mastered }"
            :title="w.mastered ? `${w.name} (mastery)` : w.name"
          >{{ w.name }}</span>
          <span v-for="o in others(sheet.proficiencies.otherWeapons)" :key="o" class="chip">{{ o }}</span>
        </div>
        <div v-else class="none">None</div>
      </div>

      <div class="prof-line">
        <span class="prof-label">Tools / Vehicles</span>
        <div v-if="tools.length" class="chips">
          <span v-for="t in tools" :key="t" class="chip">{{ t }}</span>
        </div>
        <div v-else class="none">None</div>
      </div>

      <ProficienciesModal :open="profOpen" @close="profOpen = false" />
    </SheetPanel>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.lower {
  display: grid;
  grid-template-columns: minmax(236px, 1fr) minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.prof { grid-column: 1 / -1; }

.gear { @include ps-gear-button(14px); }

.chips { display: flex; flex-wrap: wrap; gap: 4px; }

.chip { @include ps-chip; }

.none { font-size: 11px; color: var(--ps-text-muted); }

.hd {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  .box {
    @include ps-well;
    width: 44px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ps-fs-body);
    font-weight: 700;
    &.readonly { background: var(--ps-panel-alt); color: var(--ps-derived, var(--ps-text)); }
    input {
      width: 100%;
      min-width: 0;
      border: none;
      background: transparent;
      text-align: center;
      font-size: var(--ps-fs-body);
      font-weight: 700;
      font-family: var(--ps-font);
      -moz-appearance: textfield;
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      &:focus { outline: none; }
    }
  }
  > span { @include ps-caption; font-size: 8.5px; white-space: nowrap; }
}

.op { font-weight: 700; color: var(--ps-heading); padding-bottom: 14px; }

.armor-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 5px;
  label { font-size: 10px; display: flex; align-items: center; gap: 3px; cursor: pointer; }
  input { @include ps-pip-check; }
}

.armor-label { @include ps-caption; }

.prof-line {
  margin-bottom: 5px;
  &:last-of-type { margin-bottom: 0; }
}

.prof-label { @include ps-caption; display: block; margin-bottom: 2px; }

.chip--mastery {
  border-color: var(--ps-gold-dark);
  box-shadow: inset 0 -2px 0 var(--ps-gold);
}

@media (max-width: 760px) {
  .lower { grid-template-columns: 1fr; }
}
</style>
