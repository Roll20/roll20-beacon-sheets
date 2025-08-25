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
                <th>Way</th>
                <th class="align-input">Penalty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(domain, domainKey) in ways.domainsAndDisciplines" :key="domainKey">
                <td class="domain-name">{{ domainToFriendlyName(domainKey) }}</td>
                <td>
                  <input
                    type="number"
                    :value="domain.base"
                    @input="(event) => ways.setDomainBase(domainKey, Number((event.target as HTMLInputElement)?.value) || 0)"
                    class="form-control"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    :value="domain.bonus"
                    @input="(event) => ways.setDomainBonus(domainKey, Number((event.target as HTMLInputElement)?.value) || 0)"
                    class="form-control"
                  />
                </td>
                <td class="way-info">
					<span class="way-title">{{ capitalizeFirst(domain.way.title) }}</span>
                  ({{ getWayScore(domain.way.title) }})
                </td>
                <td>
                  <input
                    type="number"
                    :value="domain.penalty"
                    @input="(event) => ways.setDomainPenalty(domainKey, Number((event.target as HTMLInputElement)?.value) || 0)"
                    class="form-control"
                  />
                </td>
                <td>
                  <span class="total-readonly">{{ domain.total }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useWaysStore } from '@/sheet/stores/ways/waysStore';
import { domainToFriendlyName } from '@/utility/formattedNames';

const ways = useWaysStore();

const props = defineProps({
  show: Boolean,
});

// Helper function to capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
  width: 60%;
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

.domain-name {
  font-weight: 500;
  min-width: 150px;
}

.align-input {
	width: 35px;
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
  width: 35px;
  cursor: not-allowed;
}

.domains-table .form-control {
  width: 35px;
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

.domains-table td:last-child {
  text-align: center;
}
</style>
