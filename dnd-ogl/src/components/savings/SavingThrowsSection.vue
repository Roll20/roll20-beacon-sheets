<template>
  <NineSlicedBox theme="a">
    <div class="section savings-section">
      <div class="section__header">
        <h3>{{ $t('titles.saving-throws') }}</h3>
      </div>
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
      <!-- <template v-if="!combat.life.hitPoints || combat.life.hitPoints <= 0">
        <div class="nine-sliced-box__divider"></div>
        <div class="list">
          <ProficiencyItem
            :_id="proficiencies.deathSaving._id"
            label="death-saving"
            :ability="proficiencies.deathSaving.ability"
            :level="proficiencies.deathSaving.level"
            :modifiedLevel="proficiencies.getModifiedProficiencyLevel(proficiencies.deathSaving)"
            :proficiencyModifier="proficiencies.getProficiencyModifier(proficiencies.deathSaving)"
            group="savings"

            @update:level="(val) => proficiencies.updateRanked(proficiencies.deathSaving._id, { level: val as ProficiencyLevelBase })"
            @update:ability="(val) => proficiencies.updateRanked(proficiencies.deathSaving._id, { ability: val })"
          />
        </div>
      </template> -->
    </div>
  </NineSlicedBox>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProficiencyItem from '../shared/ProficiencyItem.vue';
import { type ProficiencyLevelBase, useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import NineSlicedBox from '../shared/NineSlicedBox.vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';

const proficiencies = useProficienciesStore();
const combat = useCombatStore();
const savings = computed(() => proficiencies.ranked.filter(proficiency => proficiency.group === 'savings'));
</script>

<style lang="scss" scoped>
.savings-section {
  .list {
    grid-template-columns: minmax(min-content, 1fr) min-content min-content;
    gap: var(--size-gap-small) var(--size-gap-medium);
  }
  .nine-sliced-box__divider {
  }
}
</style>