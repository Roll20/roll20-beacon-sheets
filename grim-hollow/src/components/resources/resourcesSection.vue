<template>
  <div class="section resources-section">
    <StyledBox mode="gothic">
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
      </div>
    </StyledBox>
    <div class="list">
      <ResourceItem
        v-for="resource in resourcesStore.resources"
        :key="resource._id"
        :resource="resource"
        class="resource-item--centered"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ResourceItem from './resourceItem.vue';
import { useResourcesStore } from '@/sheet/stores/resources/resourcesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import StyledBox from '../shared/StyledBox.vue';

const { t } = useI18n();
const resourcesStore = useResourcesStore();
</script>

<style lang="scss" scoped>
.resources-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    grid-template-columns: 1fr 1fr;
    gap: var(--size-gap-medium)!important;
  }
}
</style>
