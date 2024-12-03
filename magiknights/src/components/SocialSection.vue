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
  <div class="social-section">
    <div class="social-header">
      <h5>name</h5>
      <h5>social points</h5>
      <h5>bond ability</h5>
    </div>
    <RepeatingSection :name="`${name}-social`">
      <RepeatingItem :class="`${name}-social-item`" v-for="item in sheet.sections[`${name}-social`].rows" :key="item._id" :name="`${name}-social`" :row="item">
        <Collapsible class="social-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
          <template v-slot:collapsed>
            <span>{{ item.name || 'New Bond' }}</span>
            <span>{{ item.points }}</span>
            <span>{{ item.bond_ability }}</span>
          </template>
          <template v-slot:expanded>
            <input type="text" class="underline" v-model="item.name">
            <input type="number" class="underline" v-model="item.points">
            <textarea class="underline" v-model="item.bond_ability"></textarea>
          </template>
        </Collapsible>
      </RepeatingItem>
    </RepeatingSection>
  </div>
</template>

<style lang="scss">
.social-section{
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
  gap: 1px;
  &,
  .repcontainer{
    background-color: var(--borderColor);
  }
  .rep-add-button{
    grid-column: 1;
  }
  .rep-edit-button{
    grid-column: 3;
  }
  :is(.social-header,.repeating-section,.repcontainer,.repitem,.social-content){
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    gap: inherit;
    padding: 0;
  }
  .social-header,.repcontainer{
    padding: 1px;
  }
  .social-header{
    *{
      background-color: var(--masterBack);
    }
  }
  .repeating-section{
    background-color: var(--masterBack);
  }
  .social-content{
    :not(:first-child){
      background-color: var(--masterBack);
      border: 0;
    }
  }
}
</style>