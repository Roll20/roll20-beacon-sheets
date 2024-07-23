<script setup> 
import { useSheetStore } from '@/stores';
const sheet = useSheetStore();
const props = defineProps({
  row: Object,
  name: String
});
</script>

<template>
  <div class="repitem">
    <div class="repcontrol">
      <button class="delete-button material-symbols-outlined" @click="sheet.removeRow(props.name,props.row._id)">delete_forever</button>
    </div>
    <slot></slot>
  </div>
</template>

<style>
  .repitem{
    position: relative;
  }
  .repcontrol{
    inset: 0;
    position: absolute;
    display: grid;
    place-content: start stretch;
    grid-template-columns: auto 1fr auto;
    grid-template-areas: ". . delete";
    z-index: 100;
  }
  .delete-button{
    background: radial-gradient(circle at center,var(--error-red),var(--error-red) 40%,transparent);
    color: var(--masterBack);
    border-radius: 100%;
    aspect-ratio: 1 / 1;
  }
  .repcontainer:not(.editmode) > .repitem > .repcontrol{
    display: none;
  }
</style>