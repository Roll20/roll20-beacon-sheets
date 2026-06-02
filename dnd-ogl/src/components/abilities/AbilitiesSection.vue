<template>
  <div class="abilities-section">
    <div class="rows gap--medium">
      <AbilityBox
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
import AbilityBox from './AbilityBox.vue';

const abilities = useAbilitiesStore();
</script>
<style lang="scss" scoped>
.abilities-section {
  .rows {
  }
}
</style>
