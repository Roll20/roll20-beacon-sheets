<template>
  <div class="section companions-section">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.companions') }}</h3>
        <SidebarLink
          componentName="CompanionSidebar"
          :options="{
            title: t('actions.add-companion'),
            hasSave: true,
          }"
          display="icon"
          label="add"
          :onBeforeOpen="createNewCompanion"
        />
      </div>
    </StyledBox>
    <div class="list">
      <NpcStatblock
        v-for="npc in store.companionNpcs"
        :key="npc._id"
        :npc="npc"
        :editMode="false"
        :companionMode="true"
        @open-edit="openCompanion(npc._id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { useSidebar } from '@/components/sidebars/useSidebar';
import NpcStatblock from '@/components/npcs/NpcStatblock.vue';
import CompanionSidebar from '@/components/sidebars/CompanionsSidebar.vue';
import SidebarLink from '@/components/shared/SidebarLink.vue';
import StyledBox from '@/components/shared/StyledBox.vue';
import { useI18n } from 'vue-i18n';

const store = useNpcStore();
const sidebar = useSidebar();
const { t } = useI18n();

const createNewCompanion = () => {
  return { isNew: true };
};

const openCompanion = (npcId: string) => {
  sidebar.open(
    CompanionSidebar,
    { npcId, isNew: false },
    {
      title: t('actions.edit-companion'),
      hasClose: true,
      hasDelete: true,
    },
  );
};
</script>

<style scoped lang="scss">
.companions-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  > .list {
    gap: 1rem;
  }
}
</style>