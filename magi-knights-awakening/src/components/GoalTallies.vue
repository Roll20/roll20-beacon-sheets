<script setup>
import { useSheetStore } from '@/stores';

import RepeatingItem from './RepeatingItem.vue';
import RepeatingSection from './RepeatingSection.vue';
import Collapsible from './Collapsible.vue';

const sheet = useSheetStore();
const props = defineProps({
  name: String
});

</script>

<template>
  <div class="goalTallies-section">
    <div class="goalTallies-header">
      <h5>name</h5>
      <h5>number</h5>
    </div>
    <RepeatingSection :name="`${name}-goalTallies`">
      <RepeatingItem :class="`${name}-goalTallies-item`" v-for="item in sheet.sections[`${name}-goalTallies`].rows" :key="item._id" :name="`${name}-goalTallies`" :row="item">
        <Collapsible class="goalTallies-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
          <template v-slot:collapsed>
            <span>{{ item.name || 'Name' }}</span>
            <span>{{ item.description }}</span>
          </template>
          <template v-slot:expanded>
            <input type="text" class="underline" v-model="item.name">
            <input type="text" class="underline" v-model="item.description">
          </template>
        </Collapsible>
      </RepeatingItem>
    </RepeatingSection>
  </div>
</template>

<style lang="scss">
.goalTallies-section{
  display: grid;
  grid-template-columns: 50% auto;
  gap: 1px;
  &,
  .repcontainer{
    background-color: var(--borderColor);
  }
  .rep-add-button{
    grid-column: 1;
  }
  .rep-edit-button{
    grid-column: 2;
  }
  :is(.goalTallies-header,.repeating-section,.repcontainer,.repitem,.goalTallies-content){
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    gap: inherit;
    padding: 0;
  }
  .goalTallies-header,.repcontainer{
    padding: 1px;
  }
  .goalTallies-header{
    *{
      background-color: var(--masterBack);
    }
  }
  .repeating-section{
    background-color: var(--masterBack);
  }
  .goalTallies-content{
    :not(:first-child){
      background-color: var(--masterBack);
      border: 0;
    }
  }
}
</style>