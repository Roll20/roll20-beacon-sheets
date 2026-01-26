<template>
  <div class="domains-tab">
    <div class="domains-header">
      <h3>Domains and Disciplines</h3>
      <img :src="eyeIcon" class="eye-icon" alt="Eye" title="Edit Domains and Disciplines" @click="showModal = true" />
    </div>

    <div class="domains-grid">
      <div v-for="(column, columnIndex) in domainColumns" :key="columnIndex" class="domain-column">
        <div v-for="domainKey in column" :key="domainKey" class="domain-group">
          <!-- Domain Row -->
          <div class="domain-row">
            <span class="roll-icon" @click="domainRoll(domainKey)">
              <img :src="dieIcon" :alt="`Roll ${domainToFriendlyName(domainKey)}`" />
            </span>
            <span class="domain-name">{{ domainToFriendlyName(domainKey) }}</span>
            <span class="domain-total"
              >Total:
              <input
                title="Click on 👁️ to edit"
                type="number"
                :value="ways.domains[domainKey as keyof typeof ways.domains].total"
                readonly
                class="total-input readonly"
            /></span>
          </div>

          <!-- Disciplines for this domain -->
          <div v-for="discipline in getDisciplinesForDomain(domainKey)" :key="discipline._id" class="discipline-row">
            <span class="discipline-indent"></span>
            <span class="roll-icon" @click="disciplineRoll(discipline.name)">
              <img :src="dieIcon" :alt="`Roll ${discipline.name}`" />
            </span>
            <span class="discipline-name">{{ discipline.name }}</span>
            <span class="discipline-total"
              >Total: <input title="Click on 👁️ to edit" type="number" :value="discipline.total" readonly class="total-input readonly"
            /></span>
          </div>
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import DomainsAndDisciplinesModal from '@/components/modals/DomainsAndDisciplinesModal.vue';
import { useWaysStore } from '@/sheet/stores/ways/waysStore';
import { domainRoll, disciplineRoll } from '@/system/rolls';
import { domainToFriendlyName } from '@/utility/formattedNames';

const dieIcon = new URL('@/assets/d10.svg', import.meta.url).href;
const eyeIcon = new URL('@/assets/eye.svg', import.meta.url).href;

const ways = useWaysStore();
const showModal = ref(false);

// Get all domain keys dynamically from the store
const allDomains = computed(() => {
  return Object.keys(ways.domains);
});

// Helper function to get disciplines for a specific domain
const getDisciplinesForDomain = (domainKey: string) => {
  return ways.disciplines.filter((discipline) => discipline.parentDomain === domainKey);
};

// Split domains into columns of 7 rows each
const domainColumns = computed(() => {
  const domains = allDomains.value;
  const columns = [];
  const rowsPerColumn = 7;

  for (let i = 0; i < domains.length; i += rowsPerColumn) {
    columns.push(domains.slice(i, i + rowsPerColumn));
  }

  return columns;
});

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

    .domain-group {
      margin-bottom: 0.75rem;

      &:last-child {
        margin-bottom: 0;
      }

      &:nth-child(even) .domain-row {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    .domain-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;

      .roll-icon {
        cursor: pointer;
        width: 16px;
        font-size: 1rem;
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
            cursor: help;
          }
        }
      }
    }

    .discipline-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      background-color: rgba(0, 0, 0, 0.02);
      border-left: 3px solid rgba(0, 0, 0, 0.1);
      margin-left: 0.5rem;
      margin-top: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .discipline-indent {
        width: 16px;
        flex-shrink: 0;
      }

      .roll-icon {
        cursor: pointer;
        width: 14px;
        font-size: 0.9rem;
        opacity: 0.8;

        img {
          width: 14px;
          height: 14px;
        }
      }

      .discipline-name {
        flex: 1;
        font-size: 0.9rem;
        font-weight: 500;
        color: #555;
        min-width: 0;
      }

      .discipline-total {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.85rem;
        white-space: nowrap;

        .total-input {
          width: 35px;
          padding: 0.25rem;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid #ccc;
          border-radius: 3px;
          font-size: 0.85rem;

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
