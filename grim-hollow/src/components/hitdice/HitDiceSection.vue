<template>
  <div class="section hit-dice-section">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.hit-dice') }}</h3>
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
    </StyledBox>
    <div class="list">
      <HitDiceItem
        v-for="hitDie in hitDice"
        :hitDie="hitDie"
        :key="hitDie"
        class="resource-item--centered"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type HitDieSize, useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { computed, type ComputedRef } from 'vue';
import HitDiceItem from './HitDiceItem.vue';
import StyledBox from '../shared/StyledBox.vue';

const { t } = useI18n();
const progressionStore = useProgressionStore();
const hitDice: ComputedRef<HitDieSize[]> = computed(() =>
  Object.keys(progressionStore.getHitDice).map((key) => key as HitDieSize)
);
</script>

<style lang="scss" scoped>
.hit-dice-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    grid-template-columns: 1fr 1fr;
    gap: var(--size-gap-medium)!important;
  }
}
</style>
