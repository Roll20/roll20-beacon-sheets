<template>
  <div class="section features-section">
    <StyledBox mode="gothic">
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
    </StyledBox>
    <div class="list">
      <FeatureItem
        v-for="orderedFeature in orderedFeatures"
        :key="orderedFeature._id"
        :feature="orderedFeature"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FeatureItem from './FeatureItem.vue';
import { Feature, type FeatureGroup } from '@/sheet/stores/features/faturesStore';
import { useFeaturesStore } from '@/sheet/stores/features/faturesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { computed } from 'vue';
import StyledBox from '../shared/StyledBox.vue';

const features = useFeaturesStore();
const { t } = useI18n();

//const orderedFeatures = computed(() => features.features.slice().sort((a, b) => a.label.localeCompare(b.label)));
const orderedFeatures = computed(() => {
  const groups: Record<FeatureGroup, Feature[]> = {
    'class-features': [],
    'ancestry-features': [],
    feats: [],
    'background-features': [],
    'transformation-features': [],
    traits: [],
    others: [],
  };
  const orderedFeatures = features.features.slice().sort((a, b) => a.label.localeCompare(b.label));
  for (const feature of orderedFeatures) {
    const group = feature.group as FeatureGroup;
    if (groups[group]) {
      groups[group].push(feature);
    }
  }
  return [
    ...groups['ancestry-features'],
    ...groups['class-features'],
    ...groups['feats'],
    ...groups['transformation-features'],
    ...groups['traits'],
    ...groups['background-features'],
    ...groups['others'],
  ];
});
</script>

<style lang="scss" scoped>
.features-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    > * {
      padding: 0.25rem 0;
    }
    > *:first-child {
      padding-top: 0;
    }
    > *:last-child {
      padding-bottom: 0;
    }
  }
}
</style>
