<template>
  <div class="ascension-tab">
    <!-- Quest Section -->
    <div class="ascension-section">
      <div class="ascension-row">
        <div class="quest-group">
          <label class="quest-label">Quest:</label>
          <input type="text" v-model="character.quest" class="quest-input" />
        </div>
        <div class="points-group">
          <label class="points-label">Ascension Points:</label>
          <input type="text" v-model="character.ascensionPoints" class="points-input" />
        </div>
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
      <div class="gauge-header">Ascension Gauge</div>
      <div class="gauge-circles">
        <div
          v-for="i in 45"
          :key="i"
          class="gauge-circle"
          :title="i.toString()"
          :class="{ checked: character.isAscensionChecked(i) }"
          @click="handleAscensionClick(i)"
        ></div>
      </div>

      <!-- Ascension Categories -->
      <div class="ascension-categories">
        <div class="category-group">
          <div class="category-header">
            <span>Premise / Fall</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="premise in inventory.premises" :key="premise._id">
              <Item :item="premise" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>Awakening / Ruin</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="awakening in inventory.awakenings" :key="awakening._id">
              <Item :item="awakening" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>Rise / Infamy</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="rise in inventory.rises" :key="rise._id">
              <Item :item="rise" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>Ascension / Disgrace</span>
          </div>
          <div class="category-content">
            <div class="category-item" v-for="ascension in inventory.ascensions" :key="ascension._id">
              <Item :item="ascension" :canRoll="false" :isCompact="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Item from '@/components/parts/Item.vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';

const character = useCharacterStore();
const inventory = useInventoryStore();

const handleAscensionClick = (value: number) => {
  if (character.ascensionGauge === value) {
    if (value === 1) {
      character.setAscensionGauge(0);
    } else {
      character.setAscensionGauge(value - 1);
    }
  } else {
    character.setAscensionGauge(value);
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
      font-weight: 600;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid #782e22;
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
