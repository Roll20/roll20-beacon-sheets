<template>
  <div class="section currency-section">
    <div class="section__header">
      <h3>{{ $t('titles.currency') }}</h3>
      <SidebarLink
        componentName="CurrencySidebar"
        :options="{ 
          title: t('actions.edit-currency'),
          hasSubtract: true,
          hasSum: true,
        }"
        display="icon"
        label="config"
      />
    </div>
    <div class="cols">
      <div :class="`currency-box currency-box--${currency} box box--headless`" v-for="currency in currencyTypes" :key="currency">
        <div class="box__header">
          {{ $t(`titles.currency-types.${currency}`) }}
        </div>
        <div class="box__content">
          <input
            type="number"
            class="currency-value-input"
            :value="currencyStore.values[currency]"
            min="0"
            @change="updateStore(currency, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrencyStore, type Currency } from '@/sheet/stores/currency/currencyStore';
import { config } from '@/config';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue'; 
import { has } from 'lodash';

const currencyStore = useCurrencyStore();
const { t } = useI18n();

const { currencyTypes } = config;
const updateStore = (currency: Currency, value: string) => {
  const numValue = parseInt(value, 10);
  currencyStore.values[currency] = !isNaN(numValue) ? Math.max(0, numValue) : 0;
};


</script>

<style lang="scss" scoped>
.currency-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  > .cols {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--size-gap-medium);
    height: 6rem;
  }
}
/*
.currency-section {
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
}
.currency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.currency-header h4 {
  margin: 0;
  font-size: 1.1em;
}
.currency-display {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}
.currency-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.currency-value {
  font-weight: bold;
  font-size: 1.2em;
}
.currency-label {
  font-size: 0.8em;
  color: #666;
}
.currency-value-input {
  font-weight: bold;
  font-size: 1.2em;
  width: 5em;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.25rem;
}
*/
</style>
