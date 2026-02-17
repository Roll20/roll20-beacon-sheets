<template>
  <div class="section health">
    <div class="section__body">
      <!-- Health Condition -->
      <div class="health__condition-section">
        <div class="health__condition-header">Health Condition</div>
        <!-- Health Breakpoint Inputs -->
        <div class="health__stats health__breakpoints">
          <div class="breakpoint-group">
            <input type="number" v-model="npc.hpGoodMax" class="stat-input" min="0" title="Max HP for Good condition" />
          </div>
          <span class="breakpoint-separator">/</span>
          <div class="breakpoint-group">
            <input type="number" v-model="npc.hpOkayMax" class="stat-input" min="0" title="Max HP for Okay condition" />
          </div>
          <span class="breakpoint-separator">/</span>
          <div class="breakpoint-group">
            <input type="number" v-model="npc.hpBadMax" class="stat-input" min="0" title="Max HP for Bad condition" />
          </div>
          <span class="breakpoint-separator">/</span>
          <div class="breakpoint-group">
            <input type="number" v-model="npc.hpCriticalMax" class="stat-input" min="0" title="Max HP for Critical condition" />
          </div>
        </div>
        <div class="health__conditions">
          <div v-for="condition in healthConditions" :key="condition.label" class="condition-row">
            <span class="condition-label">{{ condition.label }}</span>
            <div class="condition-circles">
              <div
                v-for="healthValue in condition.values"
                :key="healthValue"
                class="condition-circle"
                :title="`${condition.label}: ${healthValue}`"
                :class="{ checked: npc.healthCondition >= healthValue }"
                @click="npc.setHealth(healthValue)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNPCStore } from '@/sheet/stores/character/npcStore';
const npc = useNPCStore();

const generateHealthRange = (start: number, end: number) => {
  const values = [];
  for (let i = start; i <= end; i++) {
    values.push(i);
  }
  return values;
};

// Example: hpGoodMax = 25, hpOkayMax = 15, hpBadMax = 9, hpCriticalMax = 2
// Good: 1 to 10 = 10 circles
// Okay: 11 to 16 = 6 circles
// Bad: 17 to 23 = 7 circles
// Critical: 24 to 25 = 2 circles
const healthConditions = computed(() => {
  const { hpGoodMax, hpOkayMax, hpBadMax, hpCriticalMax } = npc;
  const hasMissingValues = !hpGoodMax || !hpOkayMax || !hpBadMax || !hpCriticalMax;
  const hasInvalidValues = hpGoodMax <= hpOkayMax || hpOkayMax <= hpBadMax || hpBadMax <= hpCriticalMax || hpCriticalMax <= 0;

  let conditions = [];
  if (hasMissingValues || hasInvalidValues) {
    conditions = [
      { label: 'Good', values: [] },
      { label: 'Okay', values: [] },
      { label: 'Bad', values: [] },
      { label: 'Critical', values: [] },
    ];
  } else {
    conditions = [
      { label: 'Good', values: generateHealthRange(1, hpGoodMax - hpOkayMax) },
      { label: 'Okay', values: generateHealthRange(hpGoodMax - hpOkayMax + 1, hpGoodMax - hpBadMax) },
      { label: 'Bad', values: generateHealthRange(hpGoodMax - hpBadMax + 1, hpGoodMax - hpCriticalMax) },
      { label: 'Critical', values: generateHealthRange(hpGoodMax - hpCriticalMax + 1, hpGoodMax) },
    ];
  }

  return conditions;
});
</script>

<style scoped lang="scss">
.health {
  min-height: 200px;
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
      align-items: flex-start;
      margin-bottom: 0;
      padding: 0.6rem 0.5rem;

      &:nth-child(odd) {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .condition-label {
        width: 50px;
        font-size: 1.2rem;
        margin-right: 2rem;
        flex-shrink: 0;
      }

      .condition-circles {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;

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
      }
    }
  }

  &__divider {
    height: 1px;
    background-color: #782e22;
    margin: 0.2rem 0;
  }

  &__stats {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;

    .breakpoint-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;

      .stat-input {
        width: 60px;
        font-weight: 500;
        padding: 0.6rem 0.4rem;
        font-size: 1rem;
        text-align: center;
        background-color: rgba(0, 0, 0, 0.05);
        border: 1px solid #7a7971;
        border-radius: 3px;
      }
    }

    .breakpoint-separator {
      display: flex;
      align-items: center;
      color: #7a7971;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0.75rem;
      flex-shrink: 0;
    }
  }

  &__breakpoints {
    gap: 0.5rem;
  }
}
</style>
