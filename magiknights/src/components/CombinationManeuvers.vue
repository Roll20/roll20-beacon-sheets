<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';

const sheet = useSheetStore();

// Summary text for collapsed state
const collapsedSummary = computed(() => {
  if (!sheet.unity_available) {
    return 'Requires Reputation Level II';
  }
  return `${sheet.unity_points}/${sheet.unity_max} Unity Points`;
});

// Maneuver keys as array for iteration, ordered by participant count
const maneuverKeys = [
  'avengingFlare',
  'planetaryAegis',
  'starstormRestoration',
  'blueshiftCollision',
  'envoysOfHope',
  'ultimateRadiantReflection',
  'ringshineFulminationNova',
  'ringshineFulminationZenith'
];

// Get maneuver type icons/colors based on effect type
const maneuverStyles = {
  avengingFlare: { icon: '🔥', color: '#e65100' },          // Counter-attack - Orange
  planetaryAegis: { icon: '🛡️', color: '#1565c0' },         // Defense - Blue
  starstormRestoration: { icon: '✨', color: '#7b1fa2' },    // Damage+Heal - Purple
  blueshiftCollision: { icon: '⚡', color: '#0097a7' },      // Extra Turn - Cyan
  envoysOfHope: { icon: '💫', color: '#689f38' },           // Aura - Green
  ultimateRadiantReflection: { icon: '🔮', color: '#5e35b1' }, // Reflect - Deep Purple
  ringshineFulminationNova: { icon: '💥', color: '#c62828' },  // Legendary AoE - Red
  ringshineFulminationZenith: { icon: '⭐', color: '#f9a825' } // Legendary Single - Gold
};

// Check if character has enough participants for a maneuver
const hasEnoughParticipants = (maneuverKey) => {
  const maneuver = sheet.combinationManeuverData[maneuverKey];
  return sheet.comboParticipants >= maneuver.participants;
};

// Check if character has enough unity for a maneuver
const hasEnoughUnity = (maneuverKey) => {
  const maneuver = sheet.combinationManeuverData[maneuverKey];
  return sheet.unity_points >= maneuver.unityCost;
};

// Get the participant options (2-6)
const participantOptions = [2, 3, 4, 5, 6];
</script>

<template>
  <NotchContainer class="combos-container" width="thick" notchType="curve">
    <h4>Combination Maneuvers</h4>
    <Collapsible
      class="combos-collapsible"
      :default="sheet.combosCollapsed"
      @collapse="sheet.combosCollapsed = !sheet.combosCollapsed"
    >
      <template v-slot:collapsed>
        <div class="combos-summary">
          <span class="summary-icon">⚔️</span>
          <span class="summary-text" :class="{ 'available': sheet.unity_available }">
            {{ collapsedSummary }}
          </span>
        </div>
      </template>
      <template v-slot:expanded>
        <div class="combos-header">
          <p class="combos-info">
            Requires 2+ Magi-Knights and Unity Points. Each participant pays the Unity cost.
          </p>
          <div class="participant-selector">
            <label>Participants:</label>
            <select v-model.number="sheet.comboParticipants">
              <option v-for="num in participantOptions" :key="num" :value="num">
                {{ num }} Magi-Knights
              </option>
            </select>
          </div>
        </div>

        <div v-if="!sheet.unity_available" class="combos-locked">
          <span class="lock-icon">🔒</span>
          <span>Combination Maneuvers unlock at Reputation Level II</span>
        </div>

        <div v-else class="combos-grid">
          <div
            v-for="key in maneuverKeys"
            :key="key"
            class="maneuver-card"
            :class="{
              'available': hasEnoughParticipants(key) && hasEnoughUnity(key),
              'insufficient-participants': !hasEnoughParticipants(key),
              'legendary': sheet.combinationManeuverData[key].isLegendary
            }"
          >
            <div class="maneuver-header" :style="{ borderColor: maneuverStyles[key].color }">
              <span class="maneuver-icon">{{ maneuverStyles[key].icon }}</span>
              <span class="maneuver-name">{{ sheet.combinationManeuverData[key].name }}</span>
            </div>

            <div class="maneuver-requirements">
              <div class="requirement" :class="{ 'met': hasEnoughParticipants(key) }">
                <span class="req-value">{{ sheet.combinationManeuverData[key].participants }}+</span>
                <span class="req-label">MK</span>
              </div>
              <div class="requirement unity" :class="{ 'met': hasEnoughUnity(key) }">
                <span class="req-value">{{ sheet.combinationManeuverData[key].unityCost }}</span>
                <span class="req-label">Unity</span>
              </div>
              <div class="requirement action">
                <span class="req-label">{{ sheet.combinationManeuverData[key].actionType }}</span>
              </div>
            </div>

            <div class="maneuver-tags">
              <span v-if="sheet.combinationManeuverData[key].isQuick" class="tag quick">Quick</span>
              <span v-if="sheet.combinationManeuverData[key].isLingering" class="tag lingering">Lingering</span>
              <span v-if="sheet.combinationManeuverData[key].isLegendary" class="tag legendary">Legendary</span>
            </div>

            <div class="maneuver-effect">
              {{ sheet.combinationManeuverData[key].shortEffect(sheet.reputation) }}
            </div>

            <div class="maneuver-description">
              {{ sheet.combinationManeuverData[key].description }}
            </div>

            <div class="maneuver-actions">
              <button
                class="execute-btn"
                :style="{
                  backgroundColor: hasEnoughParticipants(key) && hasEnoughUnity(key)
                    ? maneuverStyles[key].color
                    : '#999'
                }"
                @click="sheet.executeManeuver(key)"
                :disabled="!hasEnoughParticipants(key) || !hasEnoughUnity(key)"
                :title="!hasEnoughParticipants(key)
                  ? `Requires ${sheet.combinationManeuverData[key].participants}+ Magi-Knights`
                  : !hasEnoughUnity(key)
                    ? `Requires ${sheet.combinationManeuverData[key].unityCost} Unity Points`
                    : 'Execute Maneuver'"
              >
                Execute
              </button>
            </div>
          </div>
        </div>

        <div class="combos-footer">
          <div class="unity-display">
            <span class="unity-label">Unity Points:</span>
            <div class="unity-controls">
              <button
                class="unity-btn"
                @click="sheet.unity_points = Math.max(0, sheet.unity_points - 1)"
                :disabled="sheet.unity_points <= 0"
              >-</button>
              <span class="unity-value">{{ sheet.unity_points }} / {{ sheet.unity_max }}</span>
              <button
                class="unity-btn"
                @click="sheet.unity_points = Math.min(sheet.unity_max, sheet.unity_points + 1)"
                :disabled="sheet.unity_points >= sheet.unity_max"
              >+</button>
            </div>
          </div>
          <p class="tax-reminder">
            <strong>Maneuver Tax:</strong> All participants roll Mysticism (CON) DC 14. Fail = 1 Exhaustion.
          </p>
        </div>
      </template>
    </Collapsible>
  </NotchContainer>
</template>

<style lang="scss">
.combos-container {
  h4 {
    color: var(--header-blue);
    margin-bottom: var(--tiny-gap);
  }

  .combos-collapsible {
    min-height: 1.5em;
  }

  .combos-summary {
    display: flex;
    align-items: center;
    gap: var(--tiny-gap);
    padding: var(--tiny-gap) 0;

    .summary-icon {
      font-size: 1.2rem;
    }

    .summary-text {
      font-size: 0.9rem;
      color: #666;

      &.available {
        color: var(--header-blue);
        font-weight: bold;
      }
    }
  }

  .combos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--tiny-gap);
    margin-bottom: var(--half-gap);
  }

  .combos-info {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
    flex: 1;
    min-width: 200px;
  }

  .participant-selector {
    display: flex;
    align-items: center;
    gap: var(--tiny-gap);

    label {
      font-size: 0.85rem;
      font-weight: bold;
    }

    select {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--borderColor);
      background: var(--masterBack);
      font-size: 0.85rem;
    }
  }

  .combos-locked {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--half-gap);
    padding: var(--half-gap);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    color: #666;
    font-style: italic;

    .lock-icon {
      font-size: 1.5rem;
    }
  }
}

.combos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--half-gap);
}

.maneuver-card {
  border: 2px solid var(--borderColor);
  border-radius: 8px;
  padding: var(--half-gap);
  background: var(--masterBack);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &.available {
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  &:not(.available) {
    opacity: 0.6;
  }

  &.legendary {
    border-style: double;
    border-width: 3px;
  }
}

.maneuver-header {
  display: flex;
  align-items: center;
  gap: var(--tiny-gap);
  padding-bottom: var(--tiny-gap);
  border-bottom: 2px solid;
  margin-bottom: var(--tiny-gap);

  .maneuver-icon {
    font-size: 1.2rem;
  }

  .maneuver-name {
    font-weight: bold;
    flex: 1;
    font-size: 0.85rem;
  }
}

.maneuver-requirements {
  display: flex;
  gap: var(--tiny-gap);
  margin-bottom: var(--tiny-gap);
  flex-wrap: wrap;

  .requirement {
    display: flex;
    align-items: baseline;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.1);
    font-size: 0.75rem;

    &.met {
      background: rgba(76, 175, 80, 0.2);
      color: #2e7d32;
    }

    &.unity {
      background: rgba(33, 150, 243, 0.15);

      &.met {
        background: rgba(33, 150, 243, 0.3);
        color: #1565c0;
      }
    }

    &.action {
      background: rgba(156, 39, 176, 0.15);
      color: #7b1fa2;
    }

    .req-value {
      font-weight: bold;
    }

    .req-label {
      font-size: 0.65rem;
      text-transform: uppercase;
    }
  }
}

.maneuver-tags {
  display: flex;
  gap: 4px;
  margin-bottom: var(--tiny-gap);
  flex-wrap: wrap;

  .tag {
    font-size: 0.65rem;
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
    font-weight: bold;

    &.quick {
      background: #fff3e0;
      color: #e65100;
    }

    &.lingering {
      background: #e8f5e9;
      color: #2e7d32;
    }

    &.legendary {
      background: linear-gradient(135deg, #ffd54f, #ff8f00);
      color: #fff;
    }
  }
}

.maneuver-effect {
  font-weight: bold;
  color: var(--header-blue);
  margin-bottom: var(--tiny-gap);
  font-size: 0.85rem;
}

.maneuver-description {
  font-size: 0.7rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: var(--half-gap);
  flex: 1;
}

.maneuver-actions {
  margin-top: auto;

  .execute-btn {
    width: 100%;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    color: white;

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.combos-footer {
  margin-top: var(--half-gap);
  padding-top: var(--half-gap);
  border-top: 1px solid var(--borderColor);

  .unity-display {
    display: flex;
    align-items: center;
    gap: var(--half-gap);
    margin-bottom: var(--tiny-gap);

    .unity-label {
      font-weight: bold;
      font-size: 0.9rem;
    }

    .unity-controls {
      display: flex;
      align-items: center;
      gap: var(--tiny-gap);

      .unity-btn {
        width: 24px;
        height: 24px;
        border: 1px solid var(--borderColor);
        border-radius: 4px;
        background: var(--masterBack);
        cursor: pointer;
        font-weight: bold;

        &:hover:not(:disabled) {
          background: var(--header-blue);
          color: white;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .unity-value {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--header-blue);
        min-width: 60px;
        text-align: center;
      }
    }
  }

  .tax-reminder {
    font-size: 0.75rem;
    color: #666;
    font-style: italic;
  }
}

html.dark {
  .combos-container {
    .combos-info {
      color: #aaa;
    }

    .combos-summary .summary-text:not(.available) {
      color: #aaa;
    }

    .combos-locked {
      background: rgba(255, 255, 255, 0.1);
      color: #aaa;
    }
  }

  .maneuver-card {
    &:not(.available) {
      opacity: 0.5;
    }
  }

  .maneuver-description {
    color: #aaa;
  }

  .maneuver-requirements .requirement {
    background: rgba(255, 255, 255, 0.1);

    &.met {
      background: rgba(76, 175, 80, 0.3);
    }
  }

  .maneuver-tags .tag {
    &.quick {
      background: rgba(230, 81, 0, 0.3);
      color: #ffb74d;
    }

    &.lingering {
      background: rgba(46, 125, 50, 0.3);
      color: #81c784;
    }
  }

  .combos-footer .tax-reminder {
    color: #aaa;
  }
}
</style>
