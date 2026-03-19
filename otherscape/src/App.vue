<template>
  <div class="container">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import router from '@/router';
import { sheetStore } from './sheet/stores';
import { challengeStore } from './sheet/stores/challenge/challengeStore';

const store = sheetStore();
const challenge = challengeStore();

if(challenge.sheetType) {
  router.replace({ name: challenge.sheetType });
}
watch(
  () => challenge.sheetType,
  (sheetType) => {
    if (sheetType) {
      router.replace({ name: sheetType });
    } else {
      //Nothing to do
    }
  }
);
</script>

<style scoped lang="scss">
</style>
