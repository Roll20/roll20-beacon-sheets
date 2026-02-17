<template>
  <div class="section equipment-section">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.equipment') }}</h3>
        <SidebarLink
          componentName="EquipmentSidebar"
          :props="{ equipment: null }"
          :options="{
            title: t('actions.add-equipment'),
            hasSave: true,
            hasDelete: false,
          }"
          display="icon"
          label="add"
        />
      </div>
    </StyledBox>
    <div class="list list--separated">
      <EquipmentItem v-for="item in equipmentStore.equipment" :key="item._id" :equipment="item" />
    </div>
    <div class="section__footer">
      <EncumbranceMeter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import EquipmentItem from './EquipmentItem.vue';
import EncumbranceMeter from './EncumbranceMeter.vue';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';
import StyledBox from '../shared/StyledBox.vue';

const equipmentStore = useEquipmentStore();
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.equipment-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--size-gap-small);
  }
  
  &__footer {
    margin-top: 0.5rem;
    text-align: right;
    font-size: 0.9em;
  }
}
</style>
