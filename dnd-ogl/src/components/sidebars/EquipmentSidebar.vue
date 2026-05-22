<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-6">
        <label class="span-3">
          {{ $t('titles.name') }} *
          <input v-model="name" required />
        </label>
        <label class="span-3">
          {{ $t('titles.type') }} *
          <select v-model="type" required>
            <option v-for="eType in equipmentTypes" :key="eType" :value="eType">
              {{ $t(`titles.equipment-types.${eType}`) }}
            </option>
          </select>
        </label>
        <label class="span-2">
          {{ $t('titles.quantity') }}
          <input type="number" v-model.number="quantity" min="0" />
        </label>
        <label class="span-2">
          {{ $t('titles.weight') }}
          <input type="number" v-model.number="weight" min="0" step="any" />
        </label>
        <label class="span-2">
          {{ $t('titles.value') }}
          <input type="number" v-model.number="valueAmount" min="0" class="value-inputs__amount" />
        </label>
        <label class="span-2">
          {{ $t('titles.currency') }}
          <select v-model="valueCurrency">
            <option v-for="currency in currencyTypes" :key="currency" :value="currency">
              {{ $t(`titles.currency-types.${currency}`) }}
            </option>
          </select>
        </label>
        <label>
          {{ $t('titles.description') }}
          <textarea v-model="description" rows="4" />
        </label>
        <TagsInput :tagId="tagId" @update="updateTags" label="titles.tags" tagSource="equipment" />
        <details>
          <summary>
            <label class="effects-editor">
              {{ $t('titles.effects') }}
            </label>
          </summary>
          <textarea v-model="effects" rows="5" />
        </details>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useSidebar } from './useSidebar';
import {
  type Equipment,
  useEquipmentStore,
  type EquipmentValue,
} from '@/sheet/stores/equipment/equipmentStore';
import {
  useEffectsStore,
  type Effect,
  type SingleEffect,
} from '@/sheet/stores/modifiers/modifiersStore';
import type { Currency } from '@/sheet/stores/currency/currencyStore';
import { config } from '@/config';
import { useTagsStore, type Tag } from '@/sheet/stores/tags/tagsStore';
import TagsInput from '../shared/ItemTagsInput.vue';
import { stripIds } from '@/utility/jsonTools';
import { useAttunementStore } from '@/sheet/stores/attunement/attunementStore';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  equipment: Partial<Equipment> | null;
}>();

const equipmentTypes = config.equipmentTypes;
const { currencyTypes } = config;

const equipmentStore = useEquipmentStore();
const effectsStore = useEffectsStore();
const attunementStore = useAttunementStore();

const _id = props.equipment?._id ?? uuidv4();
const effectId = props.equipment?.effectId ?? uuidv4();

const name = ref(props.equipment?.name ?? '');
const quantity = ref(props.equipment?.quantity ?? 1);
const weight = ref(props.equipment?.weight ?? 0);
const type = ref(props.equipment?.type ?? 'equipment');
const description = ref(props.equipment?.description ?? '');

const tagsStore = useTagsStore();
const tagId = props.equipment?.tagId ?? uuidv4();
const initialTagGroup = tagsStore.getExistingOrCreate(tagId, 'equipment');
const currentTags = ref<Tag[]>(JSON.parse(JSON.stringify(initialTagGroup.tags)));
const valueAmount = ref(props.equipment?.value?.amount ?? 0);
const valueCurrency = ref(props.equipment?.value?.currency ?? currencyTypes[0]); //Change this for currency type support in the future

const updateTags = (tags: Tag[]) => {
  currentTags.value = tags;
};

let initialEffects = JSON.stringify(
  stripIds(effectsStore.getEmptyEffect({ _id: effectId })),
  null,
  2,
);
if (props.equipment?.effectId) {
  const existingEffects = effectsStore.effects.find((e) => e._id === props.equipment!.effectId);
  if (existingEffects) {
    initialEffects = JSON.stringify(stripIds(existingEffects), null, 2);
  }
}
const effects = ref(initialEffects);

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const isAttunementRequired = currentTags.value.some(
    (tag) => tag.text.toLowerCase() === 'attunement',
  );

  if (!isAttunementRequired) {
    attunementStore.unattuneItem(_id);
  }

  const equipmentValue: EquipmentValue = {
    amount: valueAmount.value,
    currency: valueCurrency.value as Currency,
  };
  const equipmentData: Partial<Equipment> = {
    _id,
    name: name.value.trim(),
    quantity: Math.max(0, quantity.value),
    weight: Math.max(0, weight.value),
    type: type.value,
    description: description.value.trim(),
    effectId,
    tagId,
    value: equipmentValue,
  };

  equipmentStore.update(equipmentData);

  let parsedEffects: Partial<Effect> = {};
  try {
    parsedEffects = JSON.parse(effects.value);
    parsedEffects._id = effectId;
  } catch {
    parsedEffects = { _id: effectId, effects: [] };
  }
  const requiresAttunement = parsedEffects.effects?.some((effect: SingleEffect) =>
    effect.required?.includes('attuned'),
  );

  if (requiresAttunement && !isAttunementRequired) {
    currentTags.value.push({ _id: uuidv4(), text: 'attunement', isDefault: true });
  }

  effectsStore.update(parsedEffects);
  tagsStore.update({ _id: tagId, tags: currentTags.value });
  useSidebar().close();
};

const remove = () => {
  if (props.equipment?._id) {
    if (props.equipment.effectId) {
      effectsStore.remove(props.equipment.effectId);
    }
    if (props.equipment.tagId) {
      tagsStore.remove(props.equipment.tagId);
    }
    equipmentStore.remove(props.equipment._id);
    useSidebar().close();
  }
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped></style>
