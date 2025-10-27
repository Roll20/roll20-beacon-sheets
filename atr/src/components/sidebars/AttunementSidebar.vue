<template>
  <form ref="form" class="view-container">
    <div class="attunement-sidebar__slots-editor">
      <label for="max-slots">
        {{ $t('titles.attunement-slots') }}
        <input
          id="max-slots"
          type="number"
          v-model.number="max"
          @blur="updateAttunedItems"
          min="0"
        />
      </label>
    </div>
    <div class="attunement-sidebar__attunable-list">
      <div v-for="item in attunableItems" :key="item._id" class="attunable-item">
        <span class="attunable-item__name">{{ item.name }}</span>
        <ToggleSwitch
          :modelValue="attunedItemIds.includes(item._id)"
          :disabled="!attunedItemIds.includes(item._id) && availableSlots <= 0"
          @update:modelValue="(value: any) => toggleAttunement(item._id, !!value)"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAttunementStore } from '@/sheet/stores/attunement/attunementStore';
import { useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { useTagsStore } from '@/sheet/stores/tags/tagsStore';
import { useSidebar } from './useSidebar';
import { jsonClone } from '@/utility/jsonTools';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
const form = ref<HTMLFormElement | null>(null);

const attunementStore = useAttunementStore();
const equipmentStore = useEquipmentStore();
const tagsStore = useTagsStore();

const max = ref(attunementStore.maxSlots);
const equipment = ref(jsonClone(equipmentStore.equipment));
const attunedItemIds = ref<string[]>(jsonClone(attunementStore.attunedItemIds));
const availableSlots = ref(attunementStore.availableSlots);

const attunableItems = computed(() => {
  return equipment.value
    .filter((item) => tagsStore.groupHasTag(item.tagId, 'attunement'))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const toggleAttunement = (itemId: string, isChecked: boolean) => {
  const item = equipment.value.find((item) => item._id === itemId);
  if (item && isChecked) {
    item.isAttuned = true;
    attunedItemIds.value.push(itemId);
    availableSlots.value--;
  } else if (item) {
    item.isAttuned = false;
    attunedItemIds.value = attunedItemIds.value.filter((id) => id !== itemId);
    availableSlots.value++;
  }
};

const updateAttunedItems = () => {
  if (max.value < attunedItemIds.value.length) {
    attunedItemIds.value.forEach((element) => {
      const item = equipment.value.find((item) => item._id === element);
      if (item) {
        item.isAttuned = false;
      }
    });
    attunedItemIds.value = [];
  }
  availableSlots.value = max.value - attunedItemIds.value.length;
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  attunementStore.attunedItemIds = attunedItemIds.value;
  attunementStore.maxSlots = max.value;
  equipmentStore.equipment = equipment.value;
  useSidebar().close();
};

defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
.attunement-sidebar__slots-editor {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f5f5f5;
  padding: 0.75rem;
  border-radius: var(--size-border-radius-medium);

  label {
    font-weight: bold;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    input {
      width: 50px;
      text-align: center;
    }
  }
}

.attunement-sidebar__summary {
  text-align: center;
  color: var(--color-tertiary);
  font-weight: bold;
  margin-top: -0.5rem;
}

h4 {
  margin: 0;
}

.attunement-sidebar__attunable-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: var(--size-gap-medium);
}

.attunable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-tertiary);
  border-radius: 5px;
}

.attunable-item__name {
  font-weight: bold;
}
</style>
