<script setup>
import NotchContainer from '@/components/NotchContainer.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import ShardItem from '@/components/ShardItem.vue';

import {useSheetStore} from '@/stores';
const sheet = useSheetStore();
</script>

<template>

  <NotchContainer notchType="wedge" width="thick" class="overflow-container shards-container">
    <NotchContainer width="thin" class="overflow-header">
      <h3>Shards of Power</h3>
    </NotchContainer>
    <RepeatingSection name="shards">
      <ShardItem v-for="row in sheet.sections.shards.rows" :key="row.id" :item="row"/>
    </RepeatingSection>
  </NotchContainer>
</template>

<style lang="scss">
.shards-container{
  display: grid;
  padding: var(--tiny-gap);
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  .overflow-header{
    place-self: center;
  }
  .repeating-section{
    flex: 1;
  }
}
</style>