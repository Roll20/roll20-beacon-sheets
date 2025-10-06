import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { config } from '@/config';
import type { Currency } from '../currency/currencyStore.ts';
import { useAttunementStore } from '../attunement/attunementStore';
import { useEffectsStore } from '../modifiers/modifiersStore.js';
import { useTagsStore } from '../tags/tagsStore.js';

export type EquipmentType = (typeof config.equipmentTypes)[number];

export type EquipmentValue = {
  amount: number;
  currency: Currency;
};
export type Equipment = {
  _id: string;
  name: string;
  weight: number;
  quantity: number;
  type: EquipmentType;
  equipped: boolean;
  isAttuned: boolean;
  effectId: string;
  tagId: string;
  description: string;
  value?: EquipmentValue;
};

export type EquipmentHydrate = {
  equipment: Record<string, Equipment>;
};

export const useEquipmentStore = defineStore('equipment', () => {
  const equipment: Ref<Array<Equipment>> = ref([]);

  const getTotalWeight: ComputedRef<number> = computed(() =>
    equipment.value.reduce((total, item) => {
      return total + item.weight * item.quantity;
    }, 0),
  );

  const getEmptyEquipment = (patch: Partial<Equipment>): Equipment => {
    return {
      _id: patch._id ?? uuidv4(),
      name: patch.name ?? 'New Item',
      weight: patch.weight ?? 0,
      quantity: patch.quantity ?? 1,
      type: patch.type ?? 'equipment',
      equipped: patch.equipped ?? false,
      isAttuned: patch.isAttuned ?? false,
      effectId: patch.effectId ?? uuidv4(),
      tagId: patch.tagId ?? uuidv4(),
      description: patch.description ?? '',
    };
  };

  const add = (patch: Partial<Equipment> = {}) => {
    const newItem = getEmptyEquipment(patch);
    equipment.value.push(newItem);
  };

  const update = (patch: Partial<Equipment>) => {
    const index = patch._id ? equipment.value.findIndex((e) => e._id === patch._id) : -1;
    if (index === -1) {
      add(patch);
    } else {
      const existingItem = equipment.value[index];
      const updatedItem = { ...existingItem, ...patch };
      equipment.value[index] = updatedItem;
    }
  };

  const remove = (id: string) => {
    const attunementStore = useAttunementStore();
    attunementStore.unattuneItem(id);

    const indexToRemove = equipment.value.findIndex((item) => item._id === id);
    if (indexToRemove >= 0) {
      const existing = equipment.value[indexToRemove];
      if (existing.effectId) useEffectsStore().remove(existing.effectId);
      if (existing.tagId) useTagsStore().remove(existing.tagId);
      equipment.value.splice(indexToRemove, 1);
    }
  };

  const dehydrate = (): EquipmentHydrate => {
    return {
      equipment: arrayToObject(equipment.value),
    };
  };

  const hydrate = (hydrateStore: EquipmentHydrate) => {
    equipment.value = objectToArray(hydrateStore.equipment) ?? [];
  };

  return {
    equipment,
    getTotalWeight,
    getEmptyEquipment,
    update,
    remove,
    hydrate,
    dehydrate,
  };
});