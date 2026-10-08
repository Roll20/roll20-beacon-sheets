<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import RollBar from '@/components/shared/RollBar.vue'
import RestButtons from '@/components/shared/RestButtons.vue'
import IdentityHeader from './IdentityHeader.vue'
import AbilitiesPanel from './AbilitiesPanel.vue'
import SkillsPanel from './SkillsPanel.vue'
import CoreStatsColumn from './CoreStatsColumn.vue'
import FeaturesPanel from './FeaturesPanel.vue'
import DefensePanel from './DefensePanel.vue'
import AttacksPanel from './AttacksPanel.vue'
import VitalsPanels from './VitalsPanels.vue'
import LowerPanels from './LowerPanels.vue'
import ResourcesPanel from './ResourcesPanel.vue'
import StatDropdown from '@/components/shared/StatDropdown.vue'
import D20Icon from '@/components/shared/D20Icon.vue'
import { formatModifier } from '@/rules/index.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const speedParts = computed(() => sheet.featureMovementParts.parts.filter((p) => p.speed))
const agilityParts = computed(() => sheet.featureMovementParts.parts.filter((p) => p.agility))
</script>

<template>
  <div class="page">
    <IdentityHeader />

    <div class="topbar">
      <RollBar />
      <RestButtons />
    </div>

    <div class="upper">
      <div class="upper-left">
        <div class="ability-row">
          <AbilitiesPanel />
          <CoreStatsColumn />
        </div>

        <FeaturesPanel class="features-panel" />
      </div>

      <SkillsPanel class="skills-col" />
    </div>

    <hr class="rule" />

    <div class="lower-grid">
      <div class="lower-left">
        <div class="movement">
          <div class="move">
            <StatDropdown :value="sheet.speedValue" label="Speed">
              <label class="part">
                <span>Base</span>
                <input v-model.number="sheet.speed" type="number" />
              </label>
              <label class="part">
                <span>Misc</span>
                <input v-model.number="sheet.speedMisc" type="number" />
              </label>
              <div v-for="p in speedParts" :key="p.name" class="part">
                <span>{{ p.name }}</span>
                <output>+{{ p.speed }}</output>
              </div>
            </StatDropdown>
            <div class="move-text">
              <strong>Speed</strong>
              <small>Base Speed + Misc</small>
            </div>
          </div>
          <div class="move">
            <StatDropdown :value="sheet.agilityValue" label="Agility">
              <div class="part">
                <span>Base (DEX)</span>
                <output>{{ formatModifier(sheet.abilities.dexterity) }}</output>
              </div>
              <label class="part">
                <span>Misc</span>
                <input v-model.number="sheet.agilityMisc" type="number" />
              </label>
              <div v-for="p in agilityParts" :key="p.name" class="part">
                <span>{{ p.name }}</span>
                <output>+{{ p.agility }}</output>
              </div>
            </StatDropdown>
            <div class="move-text">
              <strong>Agility</strong>
              <small>DEX + Misc</small>
            </div>
          </div>
          <button type="button" class="initiative" @click="rolls.rollInitiative()">
            <D20Icon class="initiative__die" />
            Initiative
          </button>
        </div>

        <DefensePanel />
        <AttacksPanel class="fill" />
      </div>

      <div class="lower-right">
        <VitalsPanels />
        <ResourcesPanel />
        <LowerPanels />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  padding: 12px;
  max-width: 1180px;
  margin: 0 auto;
}

.upper {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.95fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.upper-left {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  min-width: 0;
  align-self: stretch;
}

.features-panel {
  flex: 1;
  min-height: 150px;
  contain: size;
}

.ability-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, auto);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.rule {
  border: none;
  border-top: 2px solid var(--ps-gold);
  margin: 2px 0;
}

.movement {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;

  > .move:first-child { margin-right: 12px; }
}

.move {
  display: flex;
  align-items: center;
  gap: 8px;
}

.part {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  span { @include ps-caption; font-size: 9px; white-space: nowrap; }

  input, output {
    @include ps-well;
    width: 44px;
    height: 24px;
    font-size: 12px;
    font-weight: 700;
    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  output {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ps-panel-alt);
  }
}

.initiative {
  @include ps-heading(14px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ps-panel);
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  padding: 3px 12px 3px 9px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(--ps-blue);
    border-color: var(--ps-blue);
    color: var(--ps-on-fill);
  }

  &__die { font-size: 16px; }
}

.move-text {
  strong { @include ps-heading(16px); display: block; }
  small { font-size: 9px; color: var(--ps-text-muted); }
}

.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: stretch;
}

.lower-left, .lower-right {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  min-width: 0;
}

.fill {
  flex: 1;
  min-height: 0;
}

@media (max-width: 1000px) {
  .ability-row { grid-template-columns: 1fr; }
}

@media (max-width: 700px) {
  .upper, .lower-grid { grid-template-columns: 1fr; }
  .features-panel { contain: none; }
}
</style>
