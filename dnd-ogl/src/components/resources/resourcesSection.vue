<template>
  <NineSlicedBox theme="c-r">
    <div class="section resources-section">
      <div class="section__header">
        <h3>{{ $t('titles.resources') }}</h3>
        <SidebarLink
          componentName="ResourceSidebar"
          :props="{ resource: null }"
          :options="{
            title: t('actions.add-resource'),
            hasSave: true,
            hasDelete: false,
          }"
          display="icon"
          label="add"
        />
        <SidebarLink
          componentName="HitDiceSidebar"
          :props="{ resource: null }"
          :options="{
            title: t('actions.add-resource'),
            hasSave: true,
          }"
          display="icon"
          label="config"
        />
      </div>
      <div class="list" :class="{'list--empty': hitDice.filter(die => progressionStore.getHitDice[die] && progressionStore.getHitDice[die] > 0).length === 0 && resourcesStore.resources.length === 0}">
        <HitDiceItem
          v-for="hitDie in hitDice"
          :hitDie="hitDie"
          :key="hitDie"
          :class="{
            'resource-item--centered': true,
            'hidden': progressionStore.getHitDice[hitDie] === 0,
          }"
        />
        <ResourceItem
          v-for="resource in resourcesStore.resources"
          :key="resource._id"
          :resource="resource"
          class="resource-item--centered"
        />
      </div>
    </div>
  </NineSlicedBox>
</template>

<script setup lang="ts">
import ResourceItem from './resourceItem.vue';
import { useResourcesStore } from '@/sheet/stores/resources/resourcesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';
import HitDiceSection from '../hitdice/HitDiceSection.vue';
import HitDiceItem from '../hitdice/HitDiceItem.vue';
import { type HitDieSize, useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { computed, ComputedRef } from 'vue';

const { t } = useI18n();
const resourcesStore = useResourcesStore();
const progressionStore = useProgressionStore();

const hitDice: ComputedRef<HitDieSize[]> = computed(() =>
  Object.keys(progressionStore.getHitDice).map((key) => key as HitDieSize)
);
</script>

<style lang="scss" scoped>
.resources-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    grid-template-columns: 1fr 1fr;
    gap: var(--size-gap-medium)!important;
    &--empty {
      display: none!important;
    }
  }
  .hidden {
    display: none;
  }
}
</style>
