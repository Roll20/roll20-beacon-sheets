<template>
  <Teleport to="body">
    <div v-if="show" class="modal-mask" @click.self="emit('close')">
      <div class="modal-container taintedgrail">
        <div class="modal-header">
          <h3>Add Custom Spell</h3>
          <button class="btn-close" @click="emit('close')" aria-label="Close"></button>
        </div>
        <div class="custom-item-form">
          <div class="input-group">
            <label>Name</label>
            <input type="text" v-model="name" />
          </div>
          <div class="input-group">
            <label>Description</label>
            <input type="text" v-model="description" />
          </div>
          <div class="input-group">
            <label>Discipline</label>
            <select v-model="discipline">
              <option v-for="option in spellDisciplineOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label>MP Cost</label>
            <input type="number" min="0" v-model.number="mpCost" />
          </div>
          <div class="input-group">
            <label>Cast Time</label>
            <input type="text" v-model="castTime" />
          </div>
          <div class="form-actions">
            <button class="action-btn" @click="submit">Add</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { SPELL_DISCIPLINE_NAME_MAP } from '@/utility/formattedNames';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const inventory = useInventoryStore();
const name = ref('');
const description = ref('');
const spellDisciplineOptions = Object.entries(SPELL_DISCIPLINE_NAME_MAP).map(([value, label]) => ({ value, label }));
const discipline = ref<keyof typeof SPELL_DISCIPLINE_NAME_MAP>('lowMagic');
const mpCost = ref(0);
const castTime = ref('');

watch(
  () => props.show,
  () => {
    if (!props.show) return;
    name.value = '';
    description.value = '';
    discipline.value = 'lowMagic';
    mpCost.value = 0;
    castTime.value = '';
  },
);

const submit = () => {
  if (!name.value.trim()) return;
  inventory.addCustomSpell({
    name: name.value,
    description: description.value,
    discipline: discipline.value,
    mpCost: mpCost.value,
    castTime: castTime.value,
  });
  emit('close');
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
  width: min(380px, 92vw);
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

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:before {
  content: '×';
  line-height: 1;
}

.custom-item-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-group input {
  padding: 0.25rem;
  border: 1px solid #7a7971;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}

.input-group select {
  padding: 0.25rem;
  border: 1px solid #7a7971;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

</style>
