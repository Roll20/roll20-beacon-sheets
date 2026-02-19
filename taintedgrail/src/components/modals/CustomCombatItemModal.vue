<template>
  <Teleport to="body">
    <div v-if="show" class="modal-mask" @click.self="emit('close')">
      <div class="modal-container taintedgrail">
        <div class="modal-header">
          <h3>Add Custom {{ itemTypeLabel }}</h3>
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
          <div class="input-group" v-if="props.type === 'weapon'">
            <label>Damage</label>
            <input type="number" min="0" v-model.number="damage" />
          </div>
          <div class="input-group" v-if="props.type === 'weapon'">
            <label>Range</label>
            <input type="number" min="0" v-model.number="range" />
          </div>
          <div class="input-group" v-if="props.type === 'armor' || props.type === 'shield'">
            <label>Protection</label>
            <input type="number" min="0" v-model.number="protection" />
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
import { computed, ref, watch } from 'vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';

const props = defineProps<{
  show: boolean;
  type: 'weapon' | 'armor' | 'shield';
}>();

const emit = defineEmits<{
  close: [];
}>();

const inventory = useInventoryStore();
const name = ref('');
const description = ref('');
const damage = ref(0);
const range = ref(0);
const protection = ref(0);

const itemTypeLabel = computed(() => {
  if (props.type === 'armor') return 'Armor';
  if (props.type === 'shield') return 'Shield';
  return 'Weapon';
});

watch(
  () => [props.show, props.type],
  () => {
    if (!props.show) return;
    name.value = '';
    description.value = '';
    damage.value = 0;
    range.value = 0;
    protection.value = 0;
  },
);

const submit = () => {
  if (!name.value.trim()) return;
  if (props.type === 'weapon') {
    inventory.addCustomWeapon({
      name: name.value,
      description: description.value,
      damage: damage.value,
      range: range.value,
    });
  } else if (props.type === 'armor') {
    inventory.addCustomArmor({
      name: name.value,
      description: description.value,
      protection: protection.value,
    });
  } else {
    inventory.addCustomShield({
      name: name.value,
      description: description.value,
      protection: protection.value,
    });
  }
  name.value = '';
  description.value = '';
  damage.value = 0;
  range.value = 0;
  protection.value = 0;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

</style>
