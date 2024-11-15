<script setup>
import NotchContainer from '@/components/NotchContainer.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import TechniqueItem from '@/components/TechniqueItem.vue';

import {useSheetStore} from '@/stores';

const sheet = useSheetStore();
</script>

<template>
  <NotchContainer class="technique-container" notchType="none" width="thick">
    <h3 class="header">techniques & tactics</h3>
    <RepeatingSection name="techniques">
      <TechniqueItem v-for="row in sheet.sections.techniques.rows" :key="row._id" :item="row"/>
    </RepeatingSection>
  </NotchContainer>
</template>

<style lang="scss">
.technique-container{
  display: grid;
  padding: var(--tiny-gap);
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}
</style>