<template>
  <div class="view-container">
    <div class="columns columns-3">
      <div class="total-resources span-3">
        <span class="total-resources__value">{{ breakdown.totalResources }}</span>
        <span class="total-resources__label">{{ $t('titles.total') }}<!-- <template v-if="breakdown.treasureItems.length"> ({{ $t('descriptions.including-treasure') }})</template> --></span>
      </div>
      <label v-for="currency in currencyTypes" :key="currency" class="span-1">
        {{ $t(`titles.currency-types.${currency}`) }}
        <template v-if="breakdown.breakdown[currency].total > 0"> ({{ breakdown.breakdown[currency].total }})</template>
        <input
          :id="`currency-input-${currency}`"
          v-model.number="currencyInputs[currency]"
          type="number"
          min="0"
          placeholder="0"
          class="currency-form__input"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCurrencyStore, type Currency } from '@/sheet/stores/currency/currencyStore';
import { config } from '@/config';
import { useSidebar } from './useSidebar';

const currencyStore = useCurrencyStore();
const { currencyTypes } = config;

const breakdown = computed(() => currencyStore.getCurrencyBreakdown);

const createInitialInputs = () =>
  currencyTypes.reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {} as Record<Currency, number>);

const currencyInputs = ref(createInitialInputs());

const handleUpdate = (add: boolean) => {
  const updates: Partial<Record<Currency, number>> = {};
  for (const key in currencyInputs.value) {
    const currency = key as Currency;
    if (currencyInputs.value[currency] > 0) {
      updates[currency] = currencyInputs.value[currency];
    }
  }

  if (Object.keys(updates).length > 0) {
    currencyStore.updateCurrency(updates, add);
  }

  currencyInputs.value = createInitialInputs();
  useSidebar().close();
};

const sum = () => {
  handleUpdate(true);
};

const subtract = () => {
  handleUpdate(false);
};
defineExpose({
  sum,
  subtract
});
</script>

<style lang="scss" scoped>
.total-resources {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-disabled);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  &__value {
    font-size: var(--size-font-xxxlarge);
    font-weight: bold;
  }
  &__label {
    font-size: var(--size-font-medium);
    color: var(--color-secondary);
  }
}
label {
  text-align: center;
  input {
    text-align: center;
  }
}
</style>