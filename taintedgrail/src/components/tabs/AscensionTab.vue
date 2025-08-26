<template>
  <div class="ascension-tab">
    <!-- Quest Section -->
    <div class="ascension-section">
      <div class="ascension-row">
        <div class="quest-group">
          <label class="quest-label">Quest:</label>
          <input type="text" v-model="characterStore.quest" class="quest-input" />
        </div>
        <div class="points-group">
          <label class="points-label">Ascension Points:</label>
          <input type="text" v-model="characterStore.ascensionPoints" class="points-input" />
        </div>
      </div>
    </div>

    <!-- Acts Section -->
    <div class="acts-section">
      <div class="acts-row">
        <div class="act-group">
          <label class="act-label">Act 1</label>
          <textarea v-model="characterStore.act1" class="act-textarea" rows="2"></textarea>
        </div>
        <div class="act-group">
          <label class="act-label">Act 2</label>
          <textarea v-model="characterStore.act2" class="act-textarea" rows="2"></textarea>
        </div>
        <div class="act-group">
          <label class="act-label">Act 3</label>
          <textarea v-model="characterStore.act3" class="act-textarea" rows="2"></textarea>
        </div>
      </div>
    </div>

    <!-- Ascension Gauge -->
    <div class="ascension-gauge-section">
      <div class="gauge-header">Ascension Gauge</div>
      <div class="gauge-circles">
        <!-- Generate 45 circles for the ascension gauge (0-44, starting at 0) -->
        <div
          v-for="i in 45"
          :key="i - 1"
          class="gauge-circle"
          :title="i - 1"
          :class="{ checked: characterStore.isAscensionChecked(i - 1) }"
          @click="characterStore.setAscensionGauge(i - 1)"
        ></div>
      </div>

      <!-- Ascension Categories -->
      <div class="ascension-categories">
        <div class="category-group">
          <div class="category-header">
            <span>Premise</span>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>Awakening</span>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>Rise</span>
          </div>
        </div>
        <div class="category-group">
          <div class="category-header">
            <span>Ascension</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';

const characterStore = useCharacterStore();
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
      gap: 0.5rem;
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
