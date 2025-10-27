<template>
  <div class="section custom-skills-section">
    <div class="section__header">
      <h3>{{ $t('titles.tools') }}</h3>
      <SidebarLink
        componentName="SkillSidebar"
        :props="{ skill: null }"
        :options="{
          title: t('actions.add-skill'),
          hasSave: true,
        }"
        display="icon"
        label="add"
      />
    </div>
    <div class="list">
      <ProficiencyItem
        v-for="tool in tools"
        :key="tool._id"
        :_id="tool._id"
        :label="tool.label"
        :ability="tool.ability"
        :level="tool.level"
        :modifiedLevel="proficiencies.getModifiedProficiencyLevel(tool)"
        :proficiencyModifier="proficiencies.getProficiencyModifier(tool)"
        :group="tool.group"
        @update:level="(val) => proficiencies.updateRanked(tool._id, { level: val as ProficiencyLevelBase })"
        @update:ability="(val) => proficiencies.updateRanked(tool._id, { ability: val })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProficiencyItem from '../shared/ProficiencyItem.vue';
import {
  type ProficiencyLevelBase,
  useProficienciesStore,
} from '@/sheet/stores/proficiencies/proficienciesStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '../shared/SidebarLink.vue';

const { t } = useI18n();

const proficiencies = useProficienciesStore();
const tools = computed(() =>
  proficiencies.ranked
    .filter((proficiency) => proficiency.group === 'tools')
    .slice().sort((a, b) => a.label.localeCompare(b.label)),
);
</script>

<style lang="scss" scoped>
.custom-skills-section {
  .list {
    grid-template-columns: minmax(min-content, 1fr) min-content min-content;
    gap: var(--size-gap-small) var(--size-gap-medium);
  }
}
</style>
