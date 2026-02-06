<template>
  <form class="view-container">
    <div class="conditions-sidebar__list">
      <div
        v-for="conditionKey in allConditions"
        :key="conditionKey"
        :class="[
          'condition-item',
          { 'condition-item--active': isConditionActiveLocally(conditionKey) },
        ]"
        @click="toggleConditionLocally(conditionKey)"
      >
        {{ t(`titles.condition.${conditionKey}`) }}
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConditionsStore } from '@/sheet/stores/conditions/conditionsStore';
import { useSidebar } from './useSidebar';
import { config } from '@/config';
import { useI18n } from 'vue-i18n';
const form = ref<HTMLFormElement | null>(null);

const store = useConditionsStore();
const { t } = useI18n();
const allConditions = config.autocomplete.conditions;

const localActiveConditions = ref<string[]>([...store.activeConditions]);

const isConditionActiveLocally = (conditionKey: string): boolean => {
  return localActiveConditions.value.includes(conditionKey);
};

const toggleConditionLocally = (conditionKey: string) => {
  if (isConditionActiveLocally(conditionKey)) {
    localActiveConditions.value = localActiveConditions.value.filter((c) => c !== conditionKey);
  } else {
    localActiveConditions.value.push(conditionKey);
  }
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  store.setActiveConditions(localActiveConditions.value);
  useSidebar().close();
};

defineExpose({ save });
</script>

<style lang="scss" scoped>
.conditions-sidebar__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.condition-item {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-tertiary);
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  text-align: center;

  &:hover:not(.condition-item--active) {
    border-color: var(--color-highlight);
    color: var(--color-highlight);
  }

  &--active {
    background-color: var(--color-highlight);
    border-color: var(--color-highlight);
    color: var(--color-highlight-detail);
  }
}
</style>
