<template>
  <ThePCHeader />
  <hr>
  <main>
    <ThePCAttributes />
    <ThePCDepartments />
    <TheReadout />
  </main>
</template>

<script setup lang="ts">
import ThePCAttributes from '@/components/PC/ThePCAttributes.vue';
import ThePCDepartments from '@/components/PC/ThePCDepartments.vue';
import ThePCHeader from '@/components/PC/ThePCHeader.vue';
import TheReadout from '@/components/PC/TheReadout/TheReadout.vue';

</script>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: 2px;
    row-gap: 4px;
  }
</style>