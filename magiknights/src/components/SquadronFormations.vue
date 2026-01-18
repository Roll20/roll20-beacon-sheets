<script setup>
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';

const sheet = useSheetStore();

// Summary text for collapsed state
const collapsedSummary = computed(() => {
  if (sheet.activeFormation) {
    const formation = sheet.formationData[sheet.activeFormation];
    return `${formation.name} Active - ${formation.shortEffect(sheet.reputation)}`;
  }
  return 'No formation active';
});

// Formation types as array for iteration
const formationKeys = ['arrow', 'victory', 'barrage', 'diamond'];

// Get formation type icons/colors
const formationStyles = {
  arrow: { icon: '⚔️', color: '#c62828' },      // Attack - Red
  victory: { icon: '🛡️', color: '#1565c0' },    // Defense - Blue
  barrage: { icon: '💥', color: '#6a1b9a' },    // Destruction - Purple
  diamond: { icon: '💚', color: '#2e7d32' }     // Restoration - Green
};

// Check if character can use formations (has inspiration)
const canAfford = (cost) => {
  return sheet.inspiration >= cost;
};
</script>

<template>
  <NotchContainer class="formations-container" width="thick" notchType="curve">
    <h4>Squadron Formations</h4>
    <Collapsible
      class="formations-collapsible"
      :default="sheet.formationsCollapsed"
      @collapse="sheet.formationsCollapsed = !sheet.formationsCollapsed"
    >
      <template v-slot:collapsed>
        <div class="formations-summary">
          <span v-if="sheet.activeFormation" class="summary-icon">{{ formationStyles[sheet.activeFormation].icon }}</span>
          <span class="summary-text" :class="{ 'has-active': sheet.activeFormation }">{{ collapsedSummary }}</span>
        </div>
      </template>
      <template v-slot:expanded>
        <p class="formations-info">
          Requires 3+ Magi-Knights within 60ft. Any participant may contribute Inspiration.
        </p>

        <div class="formations-grid">
          <div
            v-for="key in formationKeys"
            :key="key"
            class="formation-card"
            :class="{
              'active': sheet.activeFormation === key,
              'affordable': canAfford(sheet.formationData[key].cost)
            }"
          >
            <div class="formation-header" :style="{ borderColor: formationStyles[key].color }">
              <span class="formation-icon">{{ formationStyles[key].icon }}</span>
              <span class="formation-name">{{ sheet.formationData[key].name }}</span>
              <span class="formation-type">{{ sheet.formationData[key].type }}</span>
            </div>

            <div class="formation-cost">
              <span class="cost-value">{{ sheet.formationData[key].cost }}</span>
              <span class="cost-label">Inspiration</span>
            </div>

            <div class="formation-effect">
              {{ sheet.formationData[key].shortEffect(sheet.reputation) }}
            </div>

            <div class="formation-description">
              {{ sheet.formationData[key].description }}
            </div>

            <div class="formation-actions">
              <button
                v-if="sheet.activeFormation !== key"
                class="activate-btn"
                :style="{ backgroundColor: formationStyles[key].color }"
                @click="sheet.activateFormation(key)"
                :title="canAfford(sheet.formationData[key].cost) ? 'Activate Formation' : `Requires ${sheet.formationData[key].cost} Inspiration`"
              >
                Activate
              </button>
              <button
                v-else
                class="deactivate-btn"
                @click="sheet.deactivateFormation()"
              >
                End Formation
              </button>
            </div>
          </div>
        </div>

        <div v-if="sheet.activeFormation" class="active-formation-banner">
          <span class="banner-icon">{{ formationStyles[sheet.activeFormation].icon }}</span>
          <span class="banner-text">
            <strong>{{ sheet.formationData[sheet.activeFormation].name }}</strong> Active
          </span>
          <span class="banner-effect">
            {{ sheet.formationData[sheet.activeFormation].shortEffect(sheet.reputation) }}
          </span>
        </div>
      </template>
    </Collapsible>
  </NotchContainer>
</template>

<style lang="scss">
.formations-container {
  h4 {
    color: var(--header-blue);
    margin-bottom: var(--tiny-gap);
  }

  .formations-collapsible {
    min-height: 1.5em;
  }

  .formations-summary {
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

      &.has-active {
        color: var(--header-blue);
        font-weight: bold;
      }
    }
  }

  .formations-info {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: var(--half-gap);
    font-style: italic;
  }
}

.formations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--half-gap);
}

.formation-card {
  border: 2px solid var(--borderColor);
  border-radius: 8px;
  padding: var(--half-gap);
  background: var(--masterBack);
  transition: all 0.2s ease;

  &.active {
    box-shadow: 0 0 10px rgba(var(--header-blue-rgb, 33, 150, 243), 0.5);
    border-color: var(--header-blue);
  }

  &:not(.affordable):not(.active) {
    opacity: 0.7;
  }
}

.formation-header {
  display: flex;
  align-items: center;
  gap: var(--tiny-gap);
  padding-bottom: var(--tiny-gap);
  border-bottom: 2px solid;
  margin-bottom: var(--tiny-gap);

  .formation-icon {
    font-size: 1.2rem;
  }

  .formation-name {
    font-weight: bold;
    flex: 1;
    font-size: 0.9rem;
  }

  .formation-type {
    font-size: 0.7rem;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--borderColor);
  }
}

.formation-cost {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: var(--tiny-gap);

  .cost-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--header-blue);
  }

  .cost-label {
    font-size: 0.75rem;
    color: #666;
  }
}

.formation-effect {
  font-weight: bold;
  color: var(--header-blue);
  margin-bottom: var(--tiny-gap);
  font-size: 0.9rem;
}

.formation-description {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: var(--half-gap);
  min-height: 4em;
}

.formation-actions {
  display: flex;
  gap: var(--tiny-gap);

  button {
    flex: 1;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .activate-btn {
    color: white;
  }

  .deactivate-btn {
    background: #666;
    color: white;
  }
}

.active-formation-banner {
  margin-top: var(--half-gap);
  padding: var(--half-gap);
  background: linear-gradient(90deg, var(--header-blue), transparent);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: var(--half-gap);
  color: white;

  .banner-icon {
    font-size: 1.5rem;
  }

  .banner-text {
    flex: 1;
  }

  .banner-effect {
    font-size: 0.85rem;
    opacity: 0.9;
  }
}

html.dark {
  .formations-container {
    .formations-info {
      color: #aaa;
    }

    .formations-summary .summary-text:not(.has-active) {
      color: #aaa;
    }
  }

  .formation-card {
    &:not(.affordable):not(.active) {
      opacity: 0.6;
    }
  }

  .formation-description {
    color: #aaa;
  }

  .formation-cost .cost-label {
    color: #aaa;
  }
}
</style>
