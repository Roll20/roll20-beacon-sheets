<script setup>
import { ref } from 'vue';
import RepeatingItem from './RepeatingItem.vue';
import RepeatingSection from './RepeatingSection.vue';
import Modal from './Modal.vue';

import { useSheetStore } from '@/stores';

const sheet = useSheetStore();
const show = ref(false);
const modalObj = ref({});
const openSpellEdit = (item) => {
  show.value = true;
  modalObj.value = item;
};
const close = () => {
  show.value = false;
  modalObj.value = {};
}
const addSpell = (id) => {
  const item = sheet.sections.spells.rows.find(o => o._id === id);
  if(item){
    openSpellEdit(item);
  }
}
</script>

<template>
  <Modal class="spell-backdrop" mclass="spell-modal" @close="close" v-show="show">
    <div class="flex-box half-gap grow-label">
      <label for="spell-name">Name:</label>
      <input class="underline" type="text" v-model="modalObj.name" id="spell-name">
    </div>
    <div class="flex-box half-gap grow-label">
      <label for="spell-range">Range:</label>
      <input class="underline" type="text" v-model="modalObj.range" id="spell-range">
    </div>
    <div class="tier-container" v-for="tier in ['I','II','III','IV','V','VI']">
      <h4>Tier {{ tier }}</h4>
      <div class="flex-box half-gap grow-label">
        <label :for="`spell-${tier}-name`">Name:</label>
        <input class="underline" type="text" v-model="modalObj[`tier_${tier}_name`]" :id="`spell-${tier}-name`">
      </div>
      <div class="flex-box half-gap grow-label">
        <label :for="`spell-${tier}-action`">Action:</label>
        <input class="underline" type="text" v-model="modalObj[`tier_${tier}_action`]" :id="`spell-${tier}-action`">
      </div>
      <div class="flex-box half-gap grow-label">
        <label :for="`spell-${tier}-dice`">Dice:</label>
        <input class="underline" type="text" v-model="modalObj[`tier_${tier}_dice`]" :id="`spell-${tier}-dice`">
      </div>
      <div class="grid">
        <label :for="`spell-${tier}-special`">Special:</label>
        <textarea class="underline" v-model="modalObj[`tier_${tier}_special`]" :id="`spell-${tier}-special`"></textarea>
      </div>
      <div class="grid">
        <label :for="`spell-${tier}-description`">Description:</label>
        <textarea class="underline" v-model="modalObj[`tier_${tier}_description`]" :id="`spell-${tier}-description`"></textarea>
      </div>
    </div>
  </Modal>
  <RepeatingSection name="spells" class="repeating-spells" @add="addSpell">
    <RepeatingItem v-for="item in sheet.sections.spells.rows" :key="item._id" :row="item" name="spells" class="gear-item">
      <h5 class="spell-header">{{ item.name || 'Spell Path' }}</h5>
      <button class="overlay-opener material-symbols-outlined" @click="openSpellEdit(item)">edit</button>
      <button v-for="tier in ['I','II','III','IV','V','VI']" @click="sheet.rollSpell(item,tier)">{{ item[`tier_${tier}_dice`] || item[`tier_${tier}_name`] || "Spell's effect" }}</button>
    </RepeatingItem>
  </RepeatingSection>
</template>

<style lang="scss">
  .grow-label{
    > :not(:first-child){
      flex: 1;
    }
  }
  .spell-backdrop{
    padding: var(--gap);
    z-index: 100;
  }
  .spell-modal{
    background-color: var(--masterBack);
    border-radius: 10px;
    flex: 1;
    min-height: 400px;
    max-height: calc(100% - (var(--gap) * 2));
    padding: var(--gap);
    display: grid;
    gap: var(--half-gap);
    overflow-y: auto;
    .tier-container{
      display: grid;
      gap: inherit;
      padding-top: var(--half-gap);
    }
  }
  .repeating-spells{
    display: contents;
    .repcontainer{
      grid-area: rep;
      display: grid;
      grid-template-rows: subgrid;
      grid-auto-flow: column;
      justify-content: start;
    }
    .repitem{
      display: grid;
      grid-row: 1 / -1;
      grid-template-rows: subgrid;
      position: relative;
      .spell-header:hover{
        + .overlay-opener{
          opacity: 1;
        }
      }
    }
    .overlay-opener{
      position: absolute;
      place-self: center end;
      grid-row: 1 / 2;
      z-index: 10;
      opacity: 0;
      background: radial-gradient(circle at center,var(--header-blue),var(--header-blue) 40%,transparent);
      color: var(--masterBack);
      border-radius: 100%;
      aspect-ratio: 1 / 1;
      &:is(:focus-visible,:hover){
        opacity: 1;
      }
    }
  }
</style>