<template>
  <section>
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

<style scoped>

</style>