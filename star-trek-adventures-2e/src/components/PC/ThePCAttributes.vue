<template>
  <section class="attributes-section">
    <h2>Attributes</h2>
    <AttributeInterface 
      v-for="attribute in AttributeKeys" 
      :attribute="attribute"
    />
  </section>
</template>

<script setup lang="ts">
import { AttributeKeys } from '@/system/gameTerms';
import AttributeInterface from './AttributeInterface/AttributeInterface.vue';

</script>

<style lang="scss">
  .attributes-section {
    display: grid;
    grid-column: span 6;
    grid-template-columns: subgrid;
    grid-gap: 2px;

    padding: 4px;
    border-radius: 4px;

    background-color: var(--secondary-background);

    h2 {
      text-transform: uppercase;
      font-weight: 400;
      color: var(--secondary-text-color);
      text-align: center;
      margin: 0;
      grid-column: span 6;
    }
  }
</style>