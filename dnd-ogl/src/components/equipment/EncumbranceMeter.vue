<template>
  <div class="encumbrance-meter" :class="encumbranceClass">
    <div class="encumbrance-meter__details">
      <span>({{ $t('titles.max') }}: {{ maxWeight }} {{ $t('titles.unit-lbs') }})</span>
      <span class="with-icon" v-if="status !== 'normal'" v-tooltip="{ content: warningMessage, html: true }">{{ $t('titles.total-weight') }}: {{ totalWeight.toFixed(1) }} {{ $t('titles.unit-lbs') }}<SvgIcon class="info-icon" icon="info" /></span>
      <span v-else>{{ $t('titles.total-weight') }}: {{ totalWeight.toFixed(1) }} {{ $t('titles.unit-lbs') }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
import { useEquipmentStore } from '@/sheet/stores/equipment/equipmentStore';
import { useEffectsStore } from '@/sheet/stores/modifiers/modifiersStore';
import { effectKeys } from '@/effects.config';
import SvgIcon from '../shared/SvgIcon.vue';

const { t } = useI18n();
const abilitiesStore = useAbilitiesStore();
const equipmentStore = useEquipmentStore();

const strengthAbility = computed(() =>
  abilitiesStore.abilities.find((a) => a.label === 'strength'),
);

const strengthScore = computed(() => {
  return abilitiesStore.getModifiedAbilityScore(strengthAbility.value!).value.final;
});

const totalWeight = computed(() => equipmentStore.getTotalWeight);

const encumberedThreshold = computed(() => strengthScore.value * 5 * useEffectsStore().getModifiedValue(1, effectKeys['carry-capacity']).value.final);
const heavilyEncumberedThreshold = computed(() => strengthScore.value * 10 * useEffectsStore().getModifiedValue(1, effectKeys['carry-capacity']).value.final);
const maxWeight = computed(() => strengthScore.value * 15 * useEffectsStore().getModifiedValue(1, effectKeys['carry-capacity']).value.final);

const status = computed(() => {
  if (totalWeight.value > heavilyEncumberedThreshold.value) return 'heavily-encumbered';
  if (totalWeight.value > encumberedThreshold.value) return 'encumbered';
  return 'normal';
});

const encumbranceClass = computed(() => {
  switch (status.value) {
    case 'heavily-encumbered':
      return 'encumbrance-meter--heavy';
    case 'encumbered':
      return 'encumbrance-meter--encumbered';
    default:
      return '';
  }
});

const warningMessage = computed(() => {
  if (status.value === 'heavily-encumbered') {
    return t('warnings.encumbrance.heavily-encumbered');
  }
  if (status.value === 'encumbered') {
    return t('warnings.encumbrance.encumbered');
  }
  return '';
});
</script>
<style lang="scss" scoped>
.encumbrance-meter {
  &__details {
    display: flex;
    justify-content: space-between;
    font-size: var(--size-text-small);
  }
  &__status {
    margin-top: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
  }
  &__details {
    display: flex;
    justify-content: space-between;
    font-size: var(--size-text-small);
  }

  &--encumbered {
    
  }
  &--encumbered .encumbrance-meter__status {

  }
  &--heavy {
  }
  &--heavy .encumbrance-meter__status {
  }
  .info-icon {
    position: relative;
    right: auto;
    top: auto;
  }
  .with-icon {
    display: flex;
    gap: 5px;
    color: var(--color-highlight);
    font-weight: var(--weight-bold);
  }
}
</style>
