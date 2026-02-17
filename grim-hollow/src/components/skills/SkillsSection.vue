<template>
  <div class="section skill-section">
    <StyledBox mode="gothic">
      <div class="section__header"><h3>{{ $t('titles.skills') }}</h3></div>
    </StyledBox>
    <div class="list">
      <ProficiencyItem
        v-for="skill in skills"
        :key="skill._id"
        :_id="skill._id"
        :label="skill.label"
        :ability="skill.ability"
        :level="skill.level"
        :modifiedLevel="proficiencies.getModifiedProficiencyLevel(skill)"
        :proficiencyModifier="proficiencies.getProficiencyModifier(skill)"
        :group="skill.group"
        @update:level="(val) => proficiencies.updateRanked(skill._id, { level: val as ProficiencyLevelBase })"
        @update:ability="(val) => proficiencies.updateRanked(skill._id, { ability: val })"
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
import StyledBox from '../shared/StyledBox.vue';

const { t } = useI18n();

const proficiencies = useProficienciesStore();
const skills = computed(() =>
  proficiencies.ranked
    .filter((proficiency) => proficiency.group === 'default-skills')
    .sort((a, b) => t(`titles.default-skills.${a.label}`).localeCompare(t(`titles.default-skills.${b.label}`))),
);
</script>

<style lang="scss" scoped>
.skill-section {
  .list {
    grid-template-columns: minmax(min-content, 1fr) min-content min-content;
    gap: var(--size-gap-small) var(--size-gap-medium);
  }
}
</style>
