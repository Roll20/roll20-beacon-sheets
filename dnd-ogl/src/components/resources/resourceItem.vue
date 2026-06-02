<template>
  <div class="resource-item">
    <SidebarLink
      componentName="ResourceSidebar"
      :props="{ resource: resource }"
      :options="{
        title: t('actions.edit-resource'),
        hasSave: true,
        hasDelete: true,
      }"
      :label="resource.name"
      class="resource-item__label"
    />
    <CurrentMaxNumber :count="resource.count" :max="max" @update="updateCount" />
  </div>
</template>

<script setup lang="ts">
import { type Resource } from '@/sheet/stores/resources/resourcesStore';
import CurrentMaxNumber from '../shared/CurrentMaxNumber.vue';
import { useResourcesStore } from '@/sheet/stores/resources/resourcesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import { computed } from 'vue';
import { parseFormulaAndEvaluate } from '@/sheet/stores/formulas';

const { t } = useI18n();
const props = defineProps<{
  resource: Resource & { isFromEffect?: boolean; sourceEffectId?: string; sourceEffectLabel?: string };
}>();

const updateCount = (newCount: number) => {
  const patch: Partial<Resource> & { sourceEffectId?: string } = {
    _id: props.resource._id,
    count: newCount,
  };

  if (props.resource.sourceEffectId) {
    patch.sourceEffectId = props.resource.sourceEffectId;
  }

  useResourcesStore().update(patch);
};

const max = computed(() => {
  return parseFormulaAndEvaluate(props.resource.max);
});
</script>

<style lang="scss" scoped>
.resource-item {
  &__label {
    margin-bottom: var(--size-gap-xsmall);
  }
  &--centered {
    .sidebar-link {
      text-align: center;
      width: 100%;
    }
  }
}
</style>
