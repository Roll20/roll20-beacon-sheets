import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; 
import { config } from '@/config';
import { useEquipmentStore } from '../equipment/equipmentStore'; 
import { useTagsStore } from '../tags/tagsStore';

export type Currency = typeof config.currencyTypes[number];
export type CurrencyHydrate = {
  currency: {
    values: Record<Currency, number>;
  };
};

export const useCurrencyStore = defineStore('currency', () => {
  const initialValues = config.currencyTypes.reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {} as Record<Currency, number>);

  const values = ref<Record<Currency, number>>(initialValues);

  const updateCurrency = (updates: Partial<Record<Currency, number>>, add: boolean = true) => {
    for (const key in updates) {
      const currency = key as Currency;
      const amount = updates[currency] || 0;
      if (add) {
        values.value[currency] += amount;
      } else {
        values.value[currency] -= amount;
      }
      values.value[currency] = Math.max(0, values.value[currency]);
    }
  };

  const getCurrencyBreakdown = computed(() => {
    const equipmentStore = useEquipmentStore();
    const tagsStore = useTagsStore();

    let totalFromCurrencies = 0;
    Object.values(values.value).forEach(amount => {
      totalFromCurrencies += amount;
    });

    const treasureItems = equipmentStore.equipment
      .filter(item => item.value && item.value.amount > 0 && tagsStore.groupHasTag(item.tagId, 'treasure'))
      .map(item => ({
        _id: item._id,
        name: item.name,
        value: { amount: (item.value?.amount ?? 0) * item.quantity },
      }));

    let totalFromTreasure = 0;
    treasureItems.forEach(item => {
      totalFromTreasure += item.value.amount;
    });

    const totalResources = totalFromCurrencies //+ totalFromTreasure;

    const breakdown = config.currencyTypes.reduce((acc, type) => {
      acc[type] = {
        total: values.value[type],
      };
      return acc;
    }, {} as Record<Currency, { total: number }>);

    return {
      totalResources,
      treasureItems,
      breakdown,
    };
  });


  const dehydrate = (): CurrencyHydrate => ({
    currency: {
      values: values.value,
    },
  });

  const hydrate = (hydrateStore: CurrencyHydrate) => {
    if (hydrateStore?.currency?.values) {
      values.value = { ...initialValues, ...hydrateStore.currency.values };
    }
  };

  return {
    values,
    updateCurrency,
    getCurrencyBreakdown,
    dehydrate,
    hydrate,
  };
});