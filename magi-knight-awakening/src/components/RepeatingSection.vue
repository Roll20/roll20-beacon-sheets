<script setup>
import {useSheetStore} from '@/stores';
import { ref } from 'vue';
const props = defineProps({
  name: String
});

const emit = defineEmits(['add'])

const sheet = useSheetStore();
const editState = ref(false);
const editSection = () => {
  editState.value = !editState.value;
}
const add = () => {
  const id = sheet.addRow(props.name);
  emit('add',id);
}
</script>

<template>
  <div class="repeating-section">
    <div :class="`repcontainer${editState ? ' editmode' : ''}`">
      <slot></slot>
    </div>
    <button class="material-symbols-outlined rep-add-button" @click="add">add</button>
    <button class="material-symbols-outlined rep-edit-button" @click="editSection">edit</button>
  </div>
</template>

<style lang="scss">
.repeating-section{
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'items items'
    'add edit';
  padding: var(--tiny-gap);
  gap: var(--tiny-gap);
  > .header{
    grid-area: header;
  }
  > .repcontainer{
    grid-area: items;
    display: grid;
    gap: var(--half-gap);
    align-content: start;
  }
  .rep-add-button{
    grid-area: add;
    background: radial-gradient(circle at center,var(--header-blue),var(--header-blue) 40%,transparent);
    color: var(--masterBack);
    border-radius: 100%;
    aspect-ratio: 1 / 1;
  }
  .rep-edit-button{
    grid-area: edit;
    background: radial-gradient(circle at center,var(--header-blue),var(--header-blue) 40%,transparent);
    color: var(--masterBack);
    border-radius: 100%;
    aspect-ratio: 1 / 1;
  }
  > button{
    place-self: center;
  }
}
</style>