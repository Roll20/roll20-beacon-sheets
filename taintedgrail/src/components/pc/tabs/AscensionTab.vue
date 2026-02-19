<template>
  <div class="ascension-tab">
    <!-- Quest Section -->
    <div class="ascension-section">
      <div class="ascension-row">
        <div class="quest-group">
          <label class="quest-label">Quest:</label>
          <input type="text" v-model="character.quest" class="quest-input" />
        </div>
        <!-- <div class="points-group">
          <label class="points-label">Ascension Points:</label>
          <input type="text" v-model="character.ascensionPoints" class="points-input" />
        </div> -->
      </div>
    </div>

    <!-- Acts Section -->
    <div class="acts-section">
      <div class="acts-row">
        <div class="act-group">
          <label class="act-label">Act 1</label>
          <textarea v-model="character.act1" class="act-textarea" rows="2"></textarea>
        </div>
        <div class="act-group">
          <label class="act-label">Act 2</label>
          <textarea v-model="character.act2" class="act-textarea" rows="2"></textarea>
        </div>
        <div class="act-group">
          <label class="act-label">Act 3</label>
          <textarea v-model="character.act3" class="act-textarea" rows="2"></textarea>
        </div>
      </div>
    </div>

    <!-- Ascension Gauge -->
    <div class="ascension-gauge-section">
      <div class="gauge-header">
        <span>{{ character.isDisgrace ? 'Disgrace Gauge' : 'Ascension Gauge' }}</span>
        <button
          class="mode-toggle-icon-btn"
          :class="character.isDisgrace ? 'is-disgrace' : 'is-ascension'"
          :title="toggleModeTooltip"
          :aria-label="toggleModeTooltip"
          @click="character.toggleDisgraceMode()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4a8 8 0 0 1 7.75 6h-2.2a6 6 0 1 0-1.59 5.87l1.42 1.41A8 8 0 1 1 12 4zm0 0V1l4 3-4 3V4z" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div class="gauge-circles">
        <div
          v-for="i in 45"
          :key="i"
          class="gauge-circle"
          :title="i.toString()"
          :class="{ checked: isGaugeChecked(i) }"
          @click="handleAscensionClick(i)"
        ></div>
      </div>

      <!-- Ascension Categories -->
      <div class="ascension-categories">
        <div class="category-group">
          <div class="category-header">
            <span>{{ character.isDisgrace ? 'Fall' : 'Premise' }}</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="item in activeFirstTierItems" :key="item._id">
              <ItemComponent :item="item" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>{{ character.isDisgrace ? 'Ruin' : 'Awakening' }}</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="item in activeSecondTierItems" :key="item._id">
              <ItemComponent :item="item" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>{{ character.isDisgrace ? 'Infamy' : 'Rise' }}</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="item in activeThirdTierItems" :key="item._id">
              <ItemComponent :item="item" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>{{ character.isDisgrace ? 'Disgrace' : 'Ascension' }}</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="item in activeFourthTierItems" :key="item._id">
              <ItemComponent :item="item" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ItemComponent from '@/components/parts/ItemComponent.vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';

const character = useCharacterStore();
const inventory = useInventoryStore();

const activeFirstTierItems = computed(() => (character.isDisgrace ? inventory.falls : inventory.premises));
const activeSecondTierItems = computed(() => (character.isDisgrace ? inventory.ruins : inventory.awakenings));
const activeThirdTierItems = computed(() => (character.isDisgrace ? inventory.infamies : inventory.rises));
const activeFourthTierItems = computed(() => (character.isDisgrace ? inventory.disgraces : inventory.ascensions));
const toggleModeTooltip = computed(() => (character.isDisgrace ? 'Revert to Ascension' : 'Change to Disgrace'));

const isGaugeChecked = (value: number) => {
  return character.isDisgrace ? character.isDisgraceChecked(value) : character.isAscensionChecked(value);
};

const handleAscensionClick = (value: number) => {
  const currentGauge = character.isDisgrace ? character.disgraceGauge : character.ascensionGauge;

  if (currentGauge === value) {
    if (value === 1) {
      if (character.isDisgrace) {
        character.setDisgraceGauge(0);
      } else {
        character.setAscensionGauge(0);
      }
    } else {
      if (character.isDisgrace) {
        character.setDisgraceGauge(value - 1);
      } else {
        character.setAscensionGauge(value - 1);
      }
    }
  } else {
    if (character.isDisgrace) {
      character.setDisgraceGauge(value);
    } else {
      character.setAscensionGauge(value);
    }
  }
};
</script>

<style scoped lang="scss">
.ascension-tab {
  .ascension-section {
    margin-bottom: 1rem;

    .ascension-row {
      display: flex;
      gap: 2rem;
      align-items: end;
      padding-right: 0.7rem;

      .quest-group {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .quest-label {
          font-weight: 600;
          font-size: 1rem;
        }

        .quest-input {
          padding: 0.25rem;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid #7a7971;
          border-radius: 3px;
          font-size: 1rem;
        }
      }

      .points-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .points-label {
          font-weight: 600;
          font-size: 1rem;
        }

        .points-input {
          padding: 0.25rem;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid #7a7971;
          border-radius: 3px;
          font-size: 1rem;
        }
      }
    }
  }

  .acts-section {
    margin-bottom: 1rem;

    .acts-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;

      .act-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .act-label {
          font-weight: 600;
          font-size: 1rem;
        }

        .act-textarea {
          padding: 0.5rem;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid #7a7971;
          border-radius: 3px;
          resize: vertical;
          font-size: 0.9rem;
          min-height: 40px;
        }
      }
    }
  }

  .ascension-gauge-section {
    .gauge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid #782e22;
      font-weight: 600;
      font-size: 1.2rem;

      .mode-toggle-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: 1px solid transparent;
        border-radius: 3px;
        cursor: pointer;
        color: #fff;
        transition: background-color 0.2s ease, border-color 0.2s ease;

        svg {
          width: 14px;
          height: 14px;
        }

        &.is-disgrace {
          background-color: #2d7a3f;
          border-color: #1f5c2e;
        }

        &.is-disgrace:hover {
          background-color: #245f32;
        }

        &.is-ascension {
          background-color: #8b2d2d;
          border-color: #6f2222;
        }

        &.is-ascension:hover {
          background-color: #6f2222;
        }
      }
    }

    .gauge-circles {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      justify-content: center;
      margin-bottom: 1rem;
      padding: 0.4rem;
      background-color: rgba(0, 0, 0, 0.05);
      border-top: 1px solid #7a7971;
      border-bottom: 1px solid #7a7971;

      .gauge-circle {
        width: 12px;
        height: 12px;
        border: 1px solid #7a7971;
        border-radius: 50%;
        background-color: transparent;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:nth-child(1),
        &:nth-child(15),
        &:nth-child(30),
        &:nth-child(45) {
          width: 18px;
          height: 18px;
          margin-top: -3px;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        &.checked {
          background-color: #666;
          border-color: #666;
        }
      }
    }

    .ascension-categories {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;

      .category-group {
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 0.5rem;
          border-bottom: 1px solid #782e22;
        }
      }
    }
  }
}
</style>
