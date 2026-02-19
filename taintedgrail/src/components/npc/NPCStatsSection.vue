<template>
  <div class="section stats">
    <h3>Stats</h3>
    <div class="section__body">
      <!-- Attack, Defense, Damage, Protection -->
      <div class="stats__row">
        <div class="stat-group">
          <div class="stat-label">
            <span class="roll-icon" @click="npcAttackRoll()">
              <img :src="DIE_ICON" title="Roll Attack" />
            </span>
            Attack:
          </div>
          <input type="number" v-model="npc.attack" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">
            <span class="roll-icon" @click="npcDefenseRoll()">
              <img :src="SPEECH_BUBBLE_ICON" title="Show Defense in Chat" />
            </span>
            Defense:
          </div>
          <input type="number" v-model="npc.defense" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">Damage:</div>
          <input type="number" v-model="npc.damage" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">Protection:</div>
          <input type="number" v-model="npc.protection" class="stat-input" min="0" />
        </div>
      </div>

      <!-- Stamina, Mental Resistance, Speed, Potential -->
      <div class="stats__row">
        <div class="stat-group">
          <div class="stat-label">Stamina:</div>
          <input type="number" v-model="npc.stamina" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">Mental Resistance:</div>
          <input type="number" v-model="npc.mentalResistance" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">Speed:</div>
          <input type="number" v-model="npc.speed" class="stat-input" min="0" />
        </div>
        <div class="stat-group">
          <div class="stat-label">Potential:</div>
          <input type="number" v-model="npc.potential" class="stat-input" min="0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNPCStore } from '@/sheet/stores/character/npcStore';
import { npcAttackRoll, npcDefenseRoll } from '@/system/rolls';

const npc = useNPCStore();

const DIE_ICON = new URL('@/assets/d10.svg', import.meta.url).href;
const SPEECH_BUBBLE_ICON = new URL('@/assets/speech-bubble.svg', import.meta.url).href;
</script>

<style scoped lang="scss">
.stats {
  .stats__row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    .stat-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;

      .stat-label {
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;

        .roll-icon {
          cursor: pointer;
          width: 16px;
          height: 16px;

          img {
            width: 100%;
          }
        }
      }

      .stat-input {
        width: auto;
        font-weight: 500;
        padding: 0.5rem;
        font-size: 1rem;
        background-color: rgba(0, 0, 0, 0.05);
        border: 1px solid #7a7971;
        border-radius: 3px;
      }
    }
  }
}
</style>
