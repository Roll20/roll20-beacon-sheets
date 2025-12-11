<template>
  <div class="domains-section">
    <div class="domains-header">
      <h3>Domains</h3>
    </div>

    <div class="domains-grid">
      <div class="domain-column">
        <!-- Perception Domain -->
        <div class="domain-group">
          <div class="domain-row">
            <span class="roll-icon" @click="genericNpcDomainRoll(npcStore.perception, 'Perception')">
              <img :src="dieIcon" alt="Roll Perception" />
            </span>
            <span class="domain-name">Perception</span>
            <span class="domain-total">
              Total:
              <input
                type="number"
                v-model.number="npcStore.perception"
                class="total-input editable"
                min="0"
              />
            </span>
          </div>
        </div>

        <!-- Stealth Domain -->
        <div class="domain-group">
          <div class="domain-row">
            <span class="roll-icon" @click="genericNpcDomainRoll(npcStore.stealth, 'Stealth')">
              <img :src="dieIcon" alt="Roll Stealth" />
            </span>
            <span class="domain-name">Stealth</span>
            <span class="domain-total">
              Total:
              <input
                type="number"
                v-model.number="npcStore.stealth"
                class="total-input editable"
                min="0"
              />
            </span>
          </div>
        </div>

        <!-- Feats Domain -->
        <div class="domain-group">
          <div class="domain-row">
            <span class="roll-icon" @click="genericNpcDomainRoll(npcStore.feats, 'Feats')">
              <img :src="dieIcon" alt="Roll Feats" />
            </span>
            <span class="domain-name">Feats</span>
            <span class="domain-total">
              Total:
              <input
                type="number"
                v-model.number="npcStore.feats"
                class="total-input editable"
                min="0"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNPCStore } from '@/sheet/stores/character/npcStore';
import { genericNpcDomainRoll } from '@/system/rolls';

const dieIcon = new URL('@/assets/d10.svg', import.meta.url).href;
const npcStore = useNPCStore();
</script>

<style scoped lang="scss">
.domains-section {
  .domains-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .domain-column {
    .domain-group {
      margin-bottom: 0.75rem;

      &:last-child {
        margin-bottom: 0;
      }

      &:nth-child(odd) .domain-row {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    .domain-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      padding: 0.5rem;
      border-radius: 4px;

      .roll-icon {
        cursor: pointer;
        width: 16px;
        font-size: 1rem;

        img {
          width: 16px;
          height: 16px;
        }

        &:hover {
          opacity: 0.7;
        }
      }

      .domain-name {
        flex: 1;
        font-size: 1rem;
        font-weight: 500;
        min-width: 0;
      }

      .domain-total {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.9rem;
        white-space: nowrap;

        .total-input {
          width: 50px;
          padding: 0.25rem;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid #7a7971;
          border-radius: 3px;
          font-size: 0.9rem;
          font-weight: 500;

          &.editable {
            cursor: text;

            &:focus {
              outline: none;
              border-color: #782e22;
              background-color: rgba(0, 0, 0, 0.08);
            }

            &:hover {
              border-color: #782e22;
              background-color: rgba(0, 0, 0, 0.08);
            }
          }
        }
      }
    }
  }
}
</style>
