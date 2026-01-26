<template>
  <div class="section attunement-section">
    <div class="section__header">
      <h3>{{ $t('titles.attunement') }}</h3>
      <SidebarLink
        componentName="AttunementSidebar"
        :options="{
          title: $t('titles.attunement'),
          hasSave: true,
        }"
        display="icon"
        label="config"
      />
    </div>
    <div :class="gridStyle">
      <div
        v-for="(item, index) in store.attunedItemsWithDetails"
        :key="index"
        :class="['attunement-slot', item ? 'attunement-slot--filled' : 'attunement-slot--empty']"
      >
        <div class="attunement-slot__item-name">
          <SidebarLink
            componentName="EquipmentSidebar"
            :props="{ equipment: item }"
            :options="{
              title: t('actions.edit-equipment'),
              hasSave: true,
              hasDelete: true,
            }"
            :label="`${item.name}`"
            class="equipment-item__name"
            v-if="item?.name"
          />
          <span v-else>{{ $t('titles.empty') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useAttunementStore } from '@/sheet/stores/attunement/attunementStore';
import SidebarLink from '@/components/shared/SidebarLink.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
const { t } = useI18n();

const store = useAttunementStore();

const gridStyle = computed(() => {
  const base = ['attunement-section__grid'];
  if (store.attunedItemsWithDetails.length > 3) {
    base.push('attunement-section__grid--single');
  }
  return base;
});
</script>

<style lang="scss" scoped>
.attunement-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  &__grid {
    display: flex;
    gap: var(--size-gap-medium);

    .attunement-slot {
      flex-grow: 1;
      flex: 1;
      position: relative;
      padding: var(--size-gap-small) var(--size-gap-medium);
      border-radius: var(--size-border-radius-medium);
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;

      &--filled {
        border: 2px solid var(--color-box);
        background-color: var(--color-background);
      }

      &--empty {
        border: 2px dashed var(--color-tertiary);
        color: var(--color-tertiary);
        font-style: italic;
      }

      &__number {
        position: absolute;
        top: -5px;
        left: 5px;
        font-size: 2.5em;
        font-weight: bold;
        color: var(--color-tertiary);
        opacity: 0.2;
        z-index: 0;
      }

      &__item-name {
        z-index: 1;
        font-weight: var(--font-weight-bold);
      }
    }
    &--single {
      flex-direction: column;
      .attunement-slot {
        min-height: auto;
      }
    }
  }
}
</style>