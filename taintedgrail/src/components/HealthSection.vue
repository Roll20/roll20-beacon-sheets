<template>
  <div class="section health">
    <div class="section__body">
      <!-- Health Condition -->
      <div class="health__condition-section">
        <div class="health__condition-header">Health Condition</div>
        <div class="health__conditions">
          <div class="condition-row">
            <span class="condition-label">Good</span>
            <div class="condition-circles">
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(1) }" @click="characterStore.setHealth(1)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(2) }" @click="characterStore.setHealth(2)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(3) }" @click="characterStore.setHealth(3)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(4) }" @click="characterStore.setHealth(4)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(5) }" @click="characterStore.setHealth(5)"></div>
            </div>
          </div>
          <div class="condition-row">
            <span class="condition-label">Okay</span>
            <div class="condition-circles">
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(6) }" @click="characterStore.setHealth(6)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(7) }" @click="characterStore.setHealth(7)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(8) }" @click="characterStore.setHealth(8)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(9) }" @click="characterStore.setHealth(9)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(10) }" @click="characterStore.setHealth(10)"></div>
            </div>
          </div>
          <div class="condition-row">
            <span class="condition-label">Bad</span>
            <div class="condition-circles">
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(11) }" @click="characterStore.setHealth(11)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(12) }" @click="characterStore.setHealth(12)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(13) }" @click="characterStore.setHealth(13)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(14) }" @click="characterStore.setHealth(14)"></div>
            </div>
          </div>
          <div class="condition-row">
            <span class="condition-label">Critical</span>
            <div class="condition-circles">
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(15) }" @click="characterStore.setHealth(15)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(16) }" @click="characterStore.setHealth(16)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(17) }" @click="characterStore.setHealth(17)"></div>
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(18) }" @click="characterStore.setHealth(18)"></div>
            </div>
          </div>
          <div class="condition-row">
            <span class="condition-label">Agony</span>
            <div class="condition-circles">
              <div class="condition-circle" :class="{ checked: characterStore.isHealthChecked(19) }" @click="characterStore.setHealth(19)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stamina and Survival -->
      <div class="health__stats">
        <div class="stat-group">
          <div class="stat-label">Stamina:</div>
          <input 
            type="number" 
            v-model="characterStore.stamina" 
            class="stat-input"
            min="0"
          />
        </div>
        <div class="stat-group">
          <div class="stat-label">Survival:</div>
          <input 
            type="number" 
            v-model="characterStore.survival" 
            class="stat-input"
            min="0"
          />
        </div>
      </div>

      <!-- Sanity -->
      <div class="health__sanity">
        <div class="health__sanity-header">Sanity</div>
        <div class="health__divider"></div>
        <div class="sanity-group">
          <div class="stat-label">Mental Resistance:</div>
          <input 
            type="text" 
            v-model="characterStore.mentalResistance" 
            class="mental-resistance-input"
          />
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
    padding-right: 0.5rem;
    
    .stat-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      
      .stat-label {
        font-weight: 600;
        font-size: 1rem;
      }
      
      .stat-input {
        width: 100%;
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
    flex-direction: column;
	padding-right: 0.5rem;
    gap: 0.25rem;
    
    .stat-label {
      font-weight: 600;
      font-size: 1rem;
    }
    
    .mental-resistance-input {
      width: 100%;
      padding: 0.25rem;
      background-color: rgba(0, 0, 0, 0.05);
      border: 1px solid #7a7971;
      border-radius: 3px;
    }
  }
}
</style>
