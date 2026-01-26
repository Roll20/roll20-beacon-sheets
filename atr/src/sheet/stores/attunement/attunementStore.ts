import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useEquipmentStore } from '../equipment/equipmentStore';
import { arrayToIndexedObject, arrayToObject, indexedObjectToArray, objectToArray } from '@/utility/objectify';

export type AttunementHydrate = {
  attunement: {
    maxSlots: number;
    attunedItemIds: Record<string, string>;
  };
};

export const useAttunementStore = defineStore('attunement', () => {
  const maxSlots = ref(3);
  const attunedItemIds = ref<string[]>([]);

  const equipmentStore = useEquipmentStore();

  watch(maxSlots, (newMax) => {
    if (newMax < attunedItemIds.value.length) {
      attunedItemIds.value = attunedItemIds.value.slice(0, newMax);
    }
  });

  const attunedItemsWithDetails = computed(() => {
    const items = Array(maxSlots.value).fill(null);
    attunedItemIds.value.forEach((id, index) => {
      if (index < maxSlots.value) {
        items[index] = equipmentStore.equipment.find((item) => item._id === id) || null;
      }
    });
    return items;
  });

  const isAttuned = (equipmentId: string): boolean => {
    return attunedItemIds.value.includes(equipmentId);
  };

  const availableSlots = computed(() => maxSlots.value - attunedItemIds.value.length);

  function attuneItem(equipmentId: string) {
    if (isAttuned(equipmentId) || availableSlots.value <= 0) return;
    attunedItemIds.value.push(equipmentId);
  }

  function unattuneItem(equipmentId: string) {
    attunedItemIds.value = attunedItemIds.value.filter((id) => id !== equipmentId);
  }

  const dehydrate = (): AttunementHydrate => ({
    attunement: {
      maxSlots: maxSlots.value,
      attunedItemIds: arrayToIndexedObject(attunedItemIds.value),
    },
  });

  const hydrate = (payload: AttunementHydrate) => {
    if (!payload?.attunement) return;
    maxSlots.value = payload.attunement.maxSlots ?? 3;
    attunedItemIds.value = indexedObjectToArray(payload.attunement.attunedItemIds) ?? [];
  };

  return {
    maxSlots,
    attunedItemIds,
    attunedItemsWithDetails,
    availableSlots,
    isAttuned,
    attuneItem,
    unattuneItem,
    hydrate,
    dehydrate,
  };
});