<template>
  <div class="initiative">
    <ProficiencyItem
      :_id="initiative._id"
      :label="initiative.label"
      :ability="initiative.ability"
      :level="initiative.level"
      :modifiedLevel="proficiencies.getModifiedProficiencyLevel(initiative)"
      :proficiencyModifier="proficiencies.getProficiencyModifier(initiative)"
      :group="initiative.group"

      @update:level="(val) => proficiencies.updateRanked(initiative._id, { level: val as ProficiencyLevelBase })"
      @update:ability="(val) => proficiencies.updateRanked(initiative._id, { ability: val })"
    />
  </div>
</template>

<script setup lang="ts">
import ProficiencyItem from '../shared/ProficiencyItem.vue';
import { type ProficiencyLevelBase, useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
const proficiencies = useProficienciesStore();
const initiative = proficiencies.initiative;
</script>
<style lang="scss">
.initiative {
  .proficiency-item {
    .proficiency-item__select, .proficiency-item__proficiency {
      display: none;
    }
  }
}
</style>