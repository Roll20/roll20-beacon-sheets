<template>
  <div class="section conditions-section">
    <div class="section__header">
      <h3>{{ $t('titles.conditions') }}</h3>
      <SidebarLink
        componentName="ConditionsSidebar"
        :options="{
          title: $t('titles.conditions'),
          hasSave: true,
        }"
        display="icon"
        label="config"
      />
    </div>
    <div class="list">
      <div v-if="store.activeConditions.length > 0" class="conditions-section__grid">
        <div v-for="key in store.activeConditions" :key="key" class="condition-pill" v-tooltip="{ content: t(`descriptions.conditions.${key}`), html: true }">
          <span>{{ t(`titles.condition.${key}`) }}</span>
          <SvgIcon icon="delete" @click="store.toggleCondition(key)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useConditionsStore } from '@/sheet/stores/conditions/conditionsStore';
import SidebarLink from '@/components/shared/SidebarLink.vue';
import { useI18n } from 'vue-i18n';
import SvgIcon from '../shared/SvgIcon.vue';

const store = useConditionsStore();
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.conditions-section {
  .list {
    padding-top: var(--size-gap-small);
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-gap-small);
  }

  &__none-active {
    color: var(--color-tertiary);
    font-style: italic;
  }
  .condition-pill {
    color: var(--color-primary);
    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
    border: 1px solid var(--color-primary);
    border-radius: 20px;
    font-weight: bold;
    white-space: nowrap;
    cursor: help;
    display: flex;
    align-items: center;
    gap: var(--size-gap-xsmall);
    &:hover {
      background-color: var(--color-box);
      color: var(--color-box-detail);
      .svg-icon {
        fill: var(--color-box-detail);
      }
    }
  }
}
.svg-icon {
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
  cursor: pointer;
  &:hover {
    fill: var(--color-negative)!important;
  }
}
</style>