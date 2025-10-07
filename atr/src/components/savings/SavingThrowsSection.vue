<template>
  <div class="section savings-section">
    <div class="section__header"><h3>{{ $t('titles.saving-throws') }}</h3></div>
    <div class="list">
      <ProficiencyItem
        v-for="saving in savings"
        :key="saving._id"
        :_id="saving._id"
        :label="saving.label"
        :ability="saving.ability"
        :level="saving.level"
        :modifiedLevel="proficiencies.getModifiedProficiencyLevel(saving)"
        :proficiencyModifier="proficiencies.getProficiencyModifier(saving)"
        :group="saving.group"

        @update:level="(val) => proficiencies.updateRanked(saving._id, { level: val as ProficiencyLevelBase })"
        @update:ability="(val) => proficiencies.updateRanked(saving._id, { ability: val })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProficiencyItem from '../shared/ProficiencyItem.vue';
import { type ProficiencyLevelBase, useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';

const proficiencies = useProficienciesStore();
const savings = computed(() => proficiencies.ranked.filter(proficiency => proficiency.group === 'savings'));
</script>

<style lang="scss" scoped>
.savings-section {
  .list {
    grid-template-columns: minmax(min-content, 1fr) min-content min-content;
    gap: var(--size-gap-small) var(--size-gap-medium);
  }
}
</style>