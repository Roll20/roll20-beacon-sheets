<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container taintedgrail">
        <div class="modal-header">
          <h3>Domains and Disciplines</h3>
          <button class="btn-close" @click="$emit('close')" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <table class="domains-table">
            <thead>
              <tr>
                <th>Name</th>
                <th class="align-input">Score</th>
                <th class="align-input">Bonus</th>
                <th class="way-header">Way</th>
                <th class="align-input">Penalty</th>
                <th class="align-input">Total</th>
                <th class="actions-header"></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(domain, domainKey) in domains" :key="domainKey">
                <!-- Domain Row -->
                <tr class="domain-row">
                  <td class="domain-name">{{ domainToFriendlyName(domainKey) }}</td>
                  <td>
                    <input
                      type="number"
                      :value="domain.base"
                      @input="(event) => setDomainBase(domainKey, Number((event.target as HTMLInputElement)?.value) || 0)"
                      class="form-control"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      :value="domain.bonus"
                      @input="(event) => setDomainBonus(domainKey, Number((event.target as HTMLInputElement)?.value) || 0)"
                      class="form-control"
                    />
                  </td>
                  <td class="way-info">
                    <span class="way-title">{{ capitalizeFirstLetter(domain.way.title) }}</span>
                    ({{ getWayScore(domain.way.title) }})
                  </td>
                  <td>
                    <input
                      type="number"
                      :value="domain.penalty"
                      @input="(event) => setDomainPenalty(domainKey, Number((event.target as HTMLInputElement)?.value) || 0)"
                      class="form-control"
                    />
                  </td>
                  <td>
                    <span class="total-readonly">{{ domain.total }}</span>
                  </td>
                  <td class="domain-actions"></td>
                </tr>

                <!-- Discipline Rows -->
                <tr v-for="discipline in getDisciplinesForDomain(domainKey)" :key="discipline._id" class="discipline-row">
                  <td class="discipline-name">
                    <span class="discipline-indent">└</span>
                    {{ discipline.name }}
                  </td>
                  <td>
                    <input
                      type="number"
                      :value="discipline.base"
                      @input="(event) => updateDisciplineScore(discipline._id, Number((event.target as HTMLInputElement)?.value) || 0)"
                      class="form-control discipline-input"
                    />
                  </td>
                  <td class="discipline-total">
                    <span class="discipline-total-value">{{ getDomainBonus(discipline.parentDomain) }}</span>
                  </td>
                  <td class="way-info">
                    <span class="way-title">{{
                      capitalizeFirstLetter(domains[discipline.parentDomain as keyof typeof domains].way.title)
                    }}</span>
                    ({{ getWayScore(domains[discipline.parentDomain as keyof typeof domains].way.title) }})
                  </td>
                  <td class="discipline-total">
                    <span class="discipline-total-value">{{ getDomainPenalty(discipline.parentDomain) }}</span>
                  </td>
                  <td class="discipline-total">
                    <span class="discipline-total-value">{{ discipline.total }}</span>
                  </td>
                  <td class="discipline-actions">
                    <button @click="removeDiscipline(discipline._id)" class="trash-btn" title="Delete discipline">
                      <img :src="TRASH_ICON" alt="Delete discipline" />
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useWaysStore, type Discipline } from '@/sheet/stores/ways/waysStore';
import { capitalizeFirstLetter, domainToFriendlyName } from '@/utility/formattedNames';

const TRASH_ICON = new URL('@/assets/trash.svg', import.meta.url).href;

const { ways, disciplines, domains, removeDiscipline, setDomainBase, setDomainBonus, setDomainPenalty } = useWaysStore();

const props = defineProps({
  show: Boolean,
});

// Helper function to get disciplines for a specific domain
const getDisciplinesForDomain = (domainKey: string) => {
  return disciplines.filter((discipline) => discipline.parentDomain === domainKey);
};

const getDomainBonus = (parentDomain: string) => {
  return domains[parentDomain as keyof typeof domains].bonus;
};

const getDomainPenalty = (parentDomain: string) => {
  return domains[parentDomain as keyof typeof domains].penalty;
};

// Helper function to get way score safely
const getWayScore = (wayTitle: string) => {
  switch (wayTitle) {
    case 'combativeness':
      return ways.combativeness;
    case 'creativity':
      return ways.creativity;
    case 'awareness':
      return ways.awareness;
    case 'reason':
      return ways.reason;
    case 'conviction':
      return ways.conviction;
    default:
      return 0;
  }
};

const updateDisciplineScore = (disciplineId: string, newScore: number) => {
  const discipline = disciplines.find((d: Discipline) => d._id === disciplineId);
  if (discipline) {
    discipline.base = newScore;
  }
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  width: 70%;
  max-width: 1200px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.modal-header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  max-height: 650px;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  min-width: 20px;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:before {
  content: '×';
  font-size: 1.5rem;
  line-height: 1;
}

.btn-close:hover {
  color: #333;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* Table Styles */
.domains-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.domains-table th,
.domains-table td {
  padding: 0.25rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.domains-table th {
  background-color: rgba(0, 0, 0, 0.5);
  font-weight: 600;
  text-align: center;
  color: #f0f0e0;
}

.domains-table tbody tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.05);
}

.domain-row {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.domain-name {
  font-weight: 500;
  min-width: 150px;
}

.discipline-row {
  background-color: rgba(0, 0, 0, 0.02) !important;
  border-left: 3px solid rgba(0, 0, 0, 0.1);
}

.discipline-name {
  font-weight: 400;
  color: #555;
  min-width: 150px;
  padding-left: 0.5rem;

  .discipline-indent {
    color: #999;
    margin-right: 0.5rem;
    font-family: monospace;
  }
}

.discipline-input {
  background-color: rgba(0, 0, 0, 0.03);
  border-color: #ccc;
}

.discipline-empty {
  text-align: center;
  color: #999;
  font-style: italic;
}

.discipline-parent {
  color: #666;
  font-style: italic;
}

.discipline-total {
  text-align: center;
}

.discipline-total-value {
  display: inline-block;
  font-weight: 600;
  color: #666;
  background-color: rgba(0, 0, 0, 0.03);
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0.25rem;
  font-size: 0.9rem;
  width: 50px;
}

.align-input {
  width: 60px;
  text-align: center;
}

.actions-header {
  width: 20px;
  text-align: center;
}

.way-header {
  width: 140px;
}

.way-info {
  justify-content: center;
  color: #6c757d;
  width: 140px;

  .way-title {
    min-width: 100px;
    margin-right: 1rem;
    display: inline-block;
  }
}

.total-readonly {
  display: inline-block;
  font-weight: 600;
  color: #666;
  background-color: rgba(0, 0, 0, 0.02);
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0.25rem;
  font-size: 0.9rem;
  width: 50px;
  cursor: not-allowed;
}

.domains-table .form-control {
  width: 50px;
  padding: 0.25rem;
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid #7a7971;
  border-radius: 3px;
}

.domains-table td {
  vertical-align: middle;
}

.domains-table td:nth-child(2),
.domains-table td:nth-child(3),
.domains-table td:nth-child(5),
.domains-table td:nth-child(6) {
  text-align: center;
}

.domains-table td:last-child {
  text-align: center;
}

.domain-actions,
.discipline-actions {
  width: 30px;
  text-align: center;
  padding: 0px;
}

.trash-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  transition: background-color 0.2s;
  vertical-align: middle;
}

.trash-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.trash-btn img {
  width: 18px;
  height: 18px;
  opacity: 0.6;
}

.trash-btn:hover img {
  opacity: 1;
}
</style>
