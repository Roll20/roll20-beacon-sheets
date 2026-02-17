<template>
  <div class="section health">
    <div class="section__body">
      <!-- Health Condition -->
      <div class="health__condition-section">
        <div class="health__condition-header">Health Condition</div>
        <div class="health__conditions">
          <div v-for="condition in healthConditions" :key="condition.label" class="condition-row">
            <span class="condition-label">{{ condition.label }}</span>
            <div class="condition-circles">
              <div
                v-for="index in condition.count"
                :key="condition.startIndex + index - 1"
                class="condition-circle"
                :title="`${condition.label}: ${condition.startIndex + index - 1}`"
                :class="{ checked: characterStore.isHealthChecked(condition.startIndex + index - 1) }"
                @click="characterStore.setHealth(condition.startIndex + index - 1)"
              ></div>
              <span class="health-modifier">{{ condition.modifier }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Max Survival -->
      <div class="health__survival">
        <div class="health__condition-header">Max Survival</div>
        <div class="survival-row">
          <div class="survival-circles">
            <div
              v-for="index in visibleMaxSurvival"
              :key="`max-survival-${index}`"
              class="survival-circle"
              :title="`Survival: ${index}`"
              :class="{ checked: characterStore.isSurvivalChecked(index) }"
              @click="characterStore.setSurvival(index)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Stamina and Max Survival -->
      <div class="health__stats">
        <div class="stat-group">
          <div class="stat-label">Stamina:</div>
          <input type="number" v-model="characterStore.stamina" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">Max Survival:</div>
          <input type="number" v-model="characterStore.maxSurvival" class="stat-input" min="0" :max="maxSurvivalCircleCount" />
        </div>
      </div>

      <!-- Sanity -->
      <div class="health__sanity">
        <div class="health__sanity-header">Sanity</div>
        <div class="health__divider"></div>
        <div class="sanity-group">
          <div class="stat-label">Mental Resistance:</div>
          <span class="mental-resistance-display">
            {{ characterStore.mentalResistance }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
const characterStore = useCharacterStore();

const healthConditions = computed(() => [
  { label: 'Good', startIndex: 1, count: 5, modifier: 0 },
  { label: 'Okay', startIndex: 6, count: 5, modifier: -1 },
  { label: 'Bad', startIndex: 11, count: 4, modifier: -2 },
  { label: 'Critical', startIndex: 15, count: 4, modifier: -3 },
  { label: 'Agony', startIndex: 19, count: 1, modifier: -3 },
]);

const maxSurvivalCircleCount = 10;
const visibleMaxSurvival = computed(() => {
  return Math.max(0, Math.min(maxSurvivalCircleCount, Math.floor(characterStore.maxSurvival || 0)));
});
</script>

<style scoped lang="scss">
.health {
  &__condition-section {
    margin-bottom: 1rem;
  }

  &__condition-header {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #782e22;
  }

  &__conditions {
    border-top: 1px solid #7a7971;
    border-bottom: 1px solid #7a7971;
    .condition-row {
      display: flex;
      align-items: center;
      margin-bottom: 0;
      padding: 0.25rem 0.5rem;

      &:nth-child(odd) {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .condition-label {
        width: 50px;
        font-size: 1rem;
        margin-right: 2rem;
      }

      .condition-circles {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 0.5rem;

        .condition-circle {
          width: 14px;
          height: 14px;
          border: 1px solid #7a7971;
          border-radius: 50%;
          background-color: transparent;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: rgba(0, 0, 0, 0.1);
          }

          &.checked {
            background-color: #666;
            border-color: #666;
          }
        }

        .health-modifier {
          font-size: 0.8rem;
          margin-left: auto;
        }
      }
    }
  }

  &__divider {
    height: 1px;
    background-color: #782e22;
    margin: 0.2rem 0;
  }

  &__survival {
    margin-bottom: 1rem;

    .survival-row {
      border-top: 1px solid #7a7971;
      border-bottom: 1px solid #7a7971;
      padding: 0.25rem 0.5rem;
    }

    .survival-circles {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .survival-circle {
      width: 14px;
      height: 14px;
      border: 1px solid #7a7971;
      border-radius: 50%;
      background-color: transparent;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }

      &.checked {
        background-color: #666;
        border-color: #666;
      }
    }
  }

  &__stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-right: 0.5rem;

    .stat-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      min-width: 0;

      .stat-label {
        font-weight: 600;
        font-size: 1rem;
      }

      .stat-input {
        width: 100%;
        box-sizing: border-box;
        font-weight: 500;
        padding: 0.25rem;
        background-color: rgba(0, 0, 0, 0.05);
        border: 1px solid #7a7971;
        border-radius: 3px;
      }
    }
  }

  &__sanity {
    margin-top: 1rem;
  }

  &__sanity-header {
    font-size: 1.2rem;
  }

  .sanity-group {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-right: 0.5rem;
    gap: 0.5rem;

    .stat-label {
      font-weight: 600;
      font-size: 1rem;
    }

    .mental-resistance-display {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.25rem;
      padding: 0.15rem 0.6rem;
      background: linear-gradient(180deg, #efe1c2 0%, #e4d1aa 100%);
      border: 1px solid #8d6b3f;
      border-radius: 3px;
      color: #4d3921;
      font-weight: 700;
      letter-spacing: 0.02em;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 1px 1px rgba(0, 0, 0, 0.2);
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
    }
  }
}
</style>
