<template>
  <div class="section actions-section">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.actions') }}</h3>
        <ListFilter ref="filterRef" :list="orderedActions" :filterOptions="[
          { label: t('titles.action-groups.actions'), value: 'actions', property: 'group' },
          { label: t('titles.action-groups.bonus-actions'), value: 'bonus-actions', property: 'group' },
          { label: t('titles.action-groups.reactions'), value: 'reactions', property: 'group' },
          { label: t('titles.action-groups.free-actions'), value: 'free-actions', property: 'group' },
        ]" class="filter" />
        <SidebarLink
          componentName="ActionSidebar"
          :props="{ action: null }"
          :options="{
            title: t('actions.add-action'),
            hasSave: true,
            hasDelete: false,
          }"
          display="icon"
          label="add"
        />
      </div>
    </StyledBox>
    <div class="list">
      <ActionItem v-for="orderedAction in filteredList" :key="orderedAction._id" :action="orderedAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionItem from './ActionItem.vue';
import { useActionsStore } from '@/sheet/stores/actions/actionsStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { computed, ref } from 'vue';
import StyledBox from '../shared/StyledBox.vue';
import SvgIcon from '../shared/SvgIcon.vue';
import ListFilter from '../shared/ListFilter.vue';

const { t } = useI18n();
const actions = useActionsStore();

const orderedActions = computed(() => actions.actions.slice().sort((a, b) => a.name.localeCompare(b.name)));

const filterRef = ref();

const filteredList = computed(() => {
  if(filterRef.value) {
    return filterRef.value.filteredList;
  }
  return orderedActions.value;
});
</script>

<style lang="scss" scoped>
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    > * { padding: 0.25rem 0 };
    > *:first-child { padding-top: 0 };
    > *:last-child { padding-bottom: 0 };
  }
}
.custom-actions__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}
</style>
