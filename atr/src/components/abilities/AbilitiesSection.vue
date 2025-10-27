<template>
  <div class="abilities-section">
    <div class="rows">
      <AbilityItem
        v-for="ability in abilities.abilities"
        :key="ability.label"
        :_id="ability._id"
        :label="ability.label"
        :score="ability.score"
        :modifiedScore="abilities.getModifiedAbilityScore(ability)"
        :modifier="abilities.getAbilityModifier(ability)"
        :onBaseChange="(val) => ability.score = val"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import AbilityItem from './AbilityItem.vue';

const abilities = useAbilitiesStore();
</script>
<style lang="scss" scoped>
.abilities-section {
  .rows {
    gap: var(--size-gap-large);
  }
}
</style>
