<script setup>
import { useSheetStore } from '@/stores/sheetStore';

import AbilityScoreSection from '@/components/AbilityScoreSection.vue';
import Crystal from '@/components/Crystal.vue';
import EclipseChart from '@/components/EclipseChart.vue';
import TechniquesTactics from '../sections/TechniquesTactics.vue';
import PowerShards from '../sections/PowerShards.vue';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';
import ConditionTracker from '@/components/ConditionTracker.vue';

const sheet = useSheetStore();
</script>

<template>
  <div class="basic-view">
    <EclipseChart />
    <Crystal />
    <AbilityScoreSection class="tall-section" />
    <div class="subgrid tall-section">
      <TechniquesTactics />
      <PowerShards />
    </div>
    <!-- Conditions section (moved from PCView sidebar) -->
    <ConditionTracker />
    <!-- Level Abilities section (moved from KnightView) -->
    <NotchContainer class="level-abilities-container" width="thick" notchType="curve">
      <h4>Level Abilities</h4>
      <Collapsible :default="sheet.levelAbilitiesCollapsed" @collapse="sheet.levelAbilitiesCollapsed = !sheet.levelAbilitiesCollapsed">
        <template v-slot:expanded>
          <div class="level-abilities-list">
            <div
              v-for="(ability, key) in sheet.levelAbilityData"
              :key="key"
              class="level-ability-item"
              :class="{ unlocked: sheet.levelAbilities[key], locked: !sheet.levelAbilities[key] }"
              :title="ability.description"
            >
              <span class="ability-level-badge">{{ ability.level }}</span>
              <span class="ability-name">{{ ability.name }}</span>
              <label v-if="key === 'energySurge' && sheet.levelAbilities[key]" class="ability-toggle">
                <input type="checkbox" v-model="sheet.energySurgeUsed" />
                <span>Used</span>
              </label>
              <label v-if="key === 'flight' && sheet.levelAbilities[key]" class="ability-toggle">
                <input type="checkbox" v-model="sheet.isFlying" />
                <span>Active</span>
              </label>
            </div>
          </div>
        </template>
        <template v-slot:collapsed>
          <span class="level-abilities-summary">Level Abilities ({{ Object.values(sheet.levelAbilities).filter(v => v).length }}/{{ Object.keys(sheet.levelAbilityData).length }} unlocked)</span>
        </template>
      </Collapsible>
    </NotchContainer>
  </div>
</template>
<style lang="scss">
.basic-view {
  display: grid;
  gap: inherit;
  grid-auto-flow: dense;

  @container (650px < width) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @container (500px < width <=650px) {
    grid-template-columns: 1fr 1fr;
  }
}
.overflow-container {
  --_overflow: 25px;
  position: relative;
  margin-top: var(--_overflow);
  display: flex;
  flex-direction: column;

  .overflow-header {
    margin-top: calc(var(--_overflow) * -1);
    align-self: center;
    background: var(--masterBack);
  }
}

.level-abilities-container {
  .level-abilities-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .level-abilities-summary {
    font-size: 0.85em;
    font-weight: 600;
    color: var(--color);
    opacity: 0.8;
  }

  .level-ability-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.85em;
    cursor: default;

    &.locked {
      opacity: 0.3;
      font-size: 0.8em;
    }

    &.unlocked {
      opacity: 1;
    }
  }

  .ability-level-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(100, 100, 200, 0.3);
    font-size: 0.7em;
    font-weight: bold;
    flex-shrink: 0;
  }

  .ability-name {
    font-weight: 600;
    white-space: nowrap;
  }

  .unlocked .ability-level-badge {
    background: rgba(100, 200, 100, 0.4);
  }

  .ability-toggle {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.85em;
    cursor: pointer;
    flex-shrink: 0;
    input[type="checkbox"] { margin: 0; }
  }
}

</style>