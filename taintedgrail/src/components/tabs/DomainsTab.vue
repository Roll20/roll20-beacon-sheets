<template>
  <div class="domains-tab">
    <div class="domains-header">
      <h3>Domains and Disciplines</h3>
      <img
        :src="eyeIcon"
        class="eye-icon"
        alt="Eye"
        title="Edit Domains and Disciplines"
        @click="showModal = true"
      />
    </div>

    <div class="domains-grid">
      <!-- First Column -->
      <div class="domain-column">
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('closeCombat')">
            <img :src="dieIcon" alt="Roll Close Combat" />
          </span>
          <span class="discipline-name">Close Combat</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.closeCombat.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('communication')">
            <img :src="dieIcon" alt="Roll Communication" />
          </span>
          <span class="discipline-name">Communication</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.communication.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('compassion')">
            <img :src="dieIcon" alt="Roll Compassion" />
          </span>
          <span class="discipline-name">Compassion</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.compassion.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('craft')">
            <img :src="dieIcon" alt="Roll Craft" />
          </span>
          <span class="discipline-name">Craft</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.craft.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('erudition')">
            <img :src="dieIcon" alt="Roll Erudition" />
          </span>
          <span class="discipline-name">Erudition</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.erudition.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('feats')">
            <img :src="dieIcon" alt="Roll Feats" />
          </span>
          <span class="discipline-name">Feats</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.feats.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('healing')">
            <img :src="dieIcon" alt="Roll Healing" />
          </span>
          <span class="discipline-name">Healing</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.healing.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
      </div>

      <!-- Second Column -->
      <div class="domain-column">
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('inspiration')">
            <img :src="dieIcon" alt="Roll Inspiration" />
          </span>
          <span class="discipline-name">Inspiration</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.inspiration.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('leadership')">
            <img :src="dieIcon" alt="Roll Leadership" />
          </span>
          <span class="discipline-name">Leadership</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.leadership.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('magic')">
            <img :src="dieIcon" alt="Roll Magic" />
          </span>
          <span class="discipline-name">Magic</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.magic.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('monsters')">
            <img :src="dieIcon" alt="Roll Monsters" />
          </span>
          <span class="discipline-name">Monsters</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.monsters.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('mountedCombat')">
            <img :src="dieIcon" alt="Roll Mounted Combat" />
          </span>
          <span class="discipline-name">Mounted Combat</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.mountedCombat.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('naturalEnvironment')">
            <img :src="dieIcon" alt="Roll Natural Environment" />
          </span>
          <span class="discipline-name">Natural Environment</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.naturalEnvironment.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('perception')">
            <img :src="dieIcon" alt="Roll Perception" />
          </span>
          <span class="discipline-name">Perception</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.perception.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
      </div>

      <!-- Third Column -->
      <div class="domain-column">
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('performance')">
            <img :src="dieIcon" alt="Roll Performance" />
          </span>
          <span class="discipline-name">Performance</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.performance.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('religion')">
            <img :src="dieIcon" alt="Roll Religion" />
          </span>
          <span class="discipline-name">Religion</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.religion.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('shootingAndThrowing')">
            <img :src="dieIcon" alt="Roll Shooting and Throwing" />
          </span>
          <span class="discipline-name">Shooting and Throwing</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.shootingAndThrowing.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('stealth')">
            <img :src="dieIcon" alt="Roll Stealth" />
          </span>
          <span class="discipline-name">Stealth</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.stealth.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('travel')">
            <img :src="dieIcon" alt="Roll Travel" />
          </span>
          <span class="discipline-name">Travel</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.travel.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
        <div class="discipline-row">
          <span class="roll-icon" @click="ways.rollDomain('wyrdnessMysteries')">
            <img :src="dieIcon" alt="Roll Wyrdness Mysteries" />
          </span>
          <span class="discipline-name">Wyrdness Mysteries</span>
          <span class="discipline-total"
            >Total:
            <input
              type="number"
              :value="ways.domainsAndDisciplines.wyrdnessMysteries.total"
              readonly
              class="total-input readonly"
          /></span>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <DomainsAndDisciplinesModal v-if="showModal" :show="showModal" @close="closeModal">
      <template #header>
        <h3 class="domains-header">Domains and Disciplines</h3>
      </template>
    </DomainsAndDisciplinesModal>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import DomainsAndDisciplinesModal from '@/components/modals/DomainsAndDisciplinesModal.vue';
import { useWaysStore } from '@/sheet/stores/ways/waysStore';

const dieIcon = new URL('@/assets/d10.svg', import.meta.url).href;
const eyeIcon = new URL('@/assets/eye.svg', import.meta.url).href;

const ways = useWaysStore();
const showModal = ref(false);

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped lang="scss">
.domains-tab {
  .domains-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;

    h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
    }

    .eye-icon {
      cursor: pointer;
      width: 16px;
      height: 16px;
      font-size: 1rem;
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
