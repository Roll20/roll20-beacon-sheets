<template>
  <NineSlicedBox theme="a">
    <SkillsSection />
    <CustomSkillSection />
  </NineSlicedBox>
</template>

<script setup lang="ts">
import SkillsSection from './SkillsSection.vue';
import CustomSkillSection from './CustomSkillSection.vue';
import NineSlicedBox from '../shared/NineSlicedBox.vue';
</script>