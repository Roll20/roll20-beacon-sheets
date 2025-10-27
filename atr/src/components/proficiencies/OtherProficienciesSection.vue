<template>
  <div class="section other-proficiencies-section">
    <div class="section__header">
      <h3>{{ $t('titles.proficiency-types.other-proficiencies') }}</h3>
      <SidebarLink
        componentName="OtherProficienciesSidebar"
        :options="{ 
          title: $t('titles.proficiency-types.other-proficiencies'),
          hasSave: true,
        }"
        display="icon"
        label="config"
      />
    </div>
    <div class="section__body">
      <div class="list">
        <div class="defense" v-if="proficienciesStore.combinedLanguages.length > 0">
          <strong>{{ $t('titles.languages') }}: </strong>
          <span>{{
            proficienciesStore.combinedLanguages
              .map((item: Tag) => (item.isDefault ? $t(`titles.language.${item.text}`) : item.text))
              .sort()
              .join(', ')
          }}</span>
        </div>
        <div class="defense" v-if="proficienciesStore.combinedArmorProficiencies.length > 0">
          <strong>{{ $t('titles.proficiency-types.armor-proficiencies') }}: </strong>
          <span>{{
            proficienciesStore.combinedArmorProficiencies
              .map((item: Tag) =>
                item.isDefault
                  ? $t(`titles.proficiency-type.armor-proficiencies.${item.text}`)
                  : item.text,
              )
              .sort()
              .join(', ')
          }}</span>
        </div>
        <div class="defense" v-if="proficienciesStore.combinedWeaponProficiencies.length > 0">
          <strong>{{ $t('titles.proficiency-types.weapon-proficiencies') }}: </strong>
          <span>{{
            proficienciesStore.combinedWeaponProficiencies
              .map((item: Tag) =>
                item.isDefault
                  ? $t(`titles.proficiency-type.weapon-proficiencies.${item.text}`)
                  : item.text,
              )
              .sort()
              .join(', ')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnrankedProficienciesStore } from '@/sheet/stores/proficiencies/unrankedProficienciesStore';
import SidebarLink from '../shared/SidebarLink.vue';
import type { Tag } from '@/sheet/stores/tags/tagsStore';

const proficienciesStore = useUnrankedProficienciesStore();

</script>

<style scoped lang="scss">
.other-proficiencies-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    > * { padding: 0.25rem 0 };
    > *:first-child { padding-top: 0 };
    > *:last-child { padding-bottom: 0 };
  }
}
</style>