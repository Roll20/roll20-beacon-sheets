<template>
  <div class="section features-section">
    <div class="section__header">
      <h3>{{ $t('titles.features') }}</h3>
      <SidebarLink
        componentName="FeatureSidebar"
        :props="{ feature: null }"
        :options="{
          title: t('actions.add-feature'),
          hasSave: true,
          hasDelete: false,
        }"
        display="icon"
        label="add"
      />
    </div>
    <div class="list">
      <FeatureItem v-for="orderedFeature in orderedFeatures" :key="orderedFeature._id" :feature="orderedFeature" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FeatureItem from './FeatureItem.vue';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { computed } from 'vue';

const features = useFeaturesStore();
const { t } = useI18n();

const orderedFeatures = computed(() => features.features.slice().sort((a, b) => a.label.localeCompare(b.label)));
</script>

<style lang="scss" scoped>
.features-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    > * { padding: 0.25rem 0 };
    > *:first-child { padding-top: 0 };
    > *:last-child { padding-bottom: 0 };
  }
}
</style>
