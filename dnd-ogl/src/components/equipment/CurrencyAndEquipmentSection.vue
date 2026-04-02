<template>
  <NineSlicedBox theme="c">
    <CurrencySection />
    <EquipmentSection />
    <AttunementSection />
  </NineSlicedBox>
</template>

<script setup lang="ts">
import CurrencySection from './CurrencySection.vue';
import EquipmentSection from './EquipmentSection.vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';
import AttunementSection from './AttunementSection.vue';
</script>