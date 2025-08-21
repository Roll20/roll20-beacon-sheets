<template>
  <div class="domains-tab">
    <div class="domains-header">
      <h3>Domains and Disciplines</h3>
    </div>

    <div class="domains-grid">
      <!-- First Column -->
      <div class="domain-column">
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('closeCombat')">
            <img :src="dieIcon" alt="Roll Close Combat" />
          </span>
          <span class="discipline-name">Close Combat</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.closeCombat.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('communication')">
            <img :src="dieIcon" alt="Roll Communication" />
          </span>
          <span class="discipline-name">Communication</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.communication.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('compassion')">
            <img :src="dieIcon" alt="Roll Compassion" />
          </span>
          <span class="discipline-name">Compassion</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.compassion.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('craft')">
            <img :src="dieIcon" alt="Roll Craft" />
          </span>
          <span class="discipline-name">Craft</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.craft.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('erudition')">
            <img :src="dieIcon" alt="Roll Erudition" />
          </span>
          <span class="discipline-name">Erudition</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.erudition.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('feats')">
            <img :src="dieIcon" alt="Roll Feats" />
          </span>
          <span class="discipline-name">Feats</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.feats.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('healing')">
            <img :src="dieIcon" alt="Roll Healing" />
          </span>
          <span class="discipline-name">Healing</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.healing.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
      </div>

      <!-- Second Column -->
      <div class="domain-column">
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('inspiration')">
            <img :src="dieIcon" alt="Roll Inspiration" />
          </span>
          <span class="discipline-name">Inspiration</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.inspiration.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('leadership')">
            <img :src="dieIcon" alt="Roll Leadership" />
          </span>
          <span class="discipline-name">Leadership</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.leadership.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('magic')">
            <img :src="dieIcon" alt="Roll Magic" />
          </span>
          <span class="discipline-name">Magic</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.magic.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('monsters')">
            <img :src="dieIcon" alt="Roll Monsters" />
          </span>
          <span class="discipline-name">Monsters</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.monsters.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('mountedCombat')">
            <img :src="dieIcon" alt="Roll Mounted Combat" />
          </span>
          <span class="discipline-name">Mounted Combat</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.mountedCombat.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('naturalEnvironment')">
            <img :src="dieIcon" alt="Roll Natural Environment" />
          </span>
          <span class="discipline-name">Natural Environment</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.naturalEnvironment.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('perception')">
            <img :src="dieIcon" alt="Roll Perception" />
          </span>
          <span class="discipline-name">Perception</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.perception.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
      </div>

      <!-- Third Column -->
      <div class="domain-column">
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('performance')">
            <img :src="dieIcon" alt="Roll Performance" />
          </span>
          <span class="discipline-name">Performance</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.performance.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('religion')">
            <img :src="dieIcon" alt="Roll Religion" />
          </span>
          <span class="discipline-name">Religion</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.religion.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('shootingAndThrowing')">
            <img :src="dieIcon" alt="Roll Shooting and Throwing" />
          </span>
          <span class="discipline-name">Shooting and Throwing</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.shootingAndThrowing.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('stealth')">
            <img :src="dieIcon" alt="Roll Stealth" />
          </span>
          <span class="discipline-name">Stealth</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.stealth.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('travel')">
            <img :src="dieIcon" alt="Roll Travel" />
          </span>
          <span class="discipline-name">Travel</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.travel.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="waysStore.rollDomain('wyrdnessMysteries')">
            <img :src="dieIcon" alt="Roll Wyrdness Mysteries" />
          </span>
          <span class="discipline-name">Wyrdness Mysteries</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="waysStore.domainsAndDisciplines.wyrdnessMysteries.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWaysStore } from '@/sheet/stores/waysStore';

const dieIcon = new URL('@/assets/d10.svg', import.meta.url).href;

const waysStore = useWaysStore();
</script>

<style scoped lang="scss">
.domains-tab {
  .domains-header {
    margin-bottom: 1rem;

    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }
  }

  .domains-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .domain-column {
    .column-header {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      text-align: center;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ddd;
    }

    .discipline-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.9rem;

      &:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .roll-icon {
        cursor: pointer;
        width: 16px;
        font-size: 1rem;
      }

      .discipline-name {
        flex: 1;
        font-size: 1rem;
        font-weight: 500;
        min-width: 0;
      }

      .discipline-total {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.9rem;
        white-space: nowrap;

        .total-input {
          width: 35px;
          padding: 0.25rem;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid #ccc;
          border-radius: 3px;
          font-size: 0.9rem;

          &.readonly {
            background-color: rgba(0, 0, 0, 0.02);
            border-color: #ddd;
            color: #666;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>
