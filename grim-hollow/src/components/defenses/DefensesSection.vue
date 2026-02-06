<template>
  <div class="section defenses-section">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.defenses') }}</h3>
        <SidebarLink
          componentName="DefensesSidebar"
          :options="{
            title: $t('titles.defenses'),
            hasSave: true,
          }"
          display="icon"
          label="config"
        />
      </div>
    </StyledBox>
    <div class="section__body">
      <div class="list">
        <div class="defense" v-if="defenseStore.displayDamageResistances.length > 0">
          <strong>{{ $t('titles.damage-resistances') }}: </strong>
          <span>{{
            defenseStore.displayDamageResistances
              .map((item: Tag) => $t(`titles.damage-types.${item.text}`))
              .sort()
              .join(', ')
          }}</span>
        </div>
        <div class="defense" v-if="defenseStore.displayDamageImmunities.length > 0">
          <strong>{{ $t('titles.damage-immunities') }}: </strong>
          <span>{{
            defenseStore.displayDamageImmunities
              .map((item: Tag) => $t(`titles.damage-types.${item.text}`))
              .sort()
              .join(', ')
          }}</span>
        </div>
        <div class="defense" v-if="defenseStore.displayDamageVulnerabilities.length > 0">
          <strong>{{ $t('titles.damage-vulnerabilities') }}: </strong>
          <span>{{
            defenseStore.displayDamageVulnerabilities
              .map((item: Tag) => $t(`titles.damage-types.${item.text}`))
              .sort()
              .join(', ')
          }}</span>
        </div>
        <div class="defense" v-if="defenseStore.combinedConditionImmunities.length > 0">
          <strong>{{ $t('titles.condition-immunities') }}: </strong>
          <span>{{
            defenseStore.combinedConditionImmunities
              .map((item: Tag) => $t(`titles.condition.${item.text.toLowerCase()}`))
              .sort()
              .join(', ')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDefenseStore } from '@/sheet/stores/defenses/defenseStore';
import { config } from '@/config';
import SidebarLink from '../shared/SidebarLink.vue';
import { type Tag } from '@/sheet/stores/tags/tagsStore';
import StyledBox from '../shared/StyledBox.vue';

const defenseStore = useDefenseStore();
const { autocomplete } = config;
</script>

<style scoped lang="scss">
.defenses-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    > * {
      padding: 0.25rem 0;
    }
    > *:first-child {
      padding-top: 0;
    }
    > *:last-child {
      padding-bottom: 0;
    }
  }
}
</style>
