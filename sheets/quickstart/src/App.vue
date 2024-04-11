<template>
  <div>Quickstart Sheet</div>

  <div class="header">
    <div class="profile">
      <div class="name">{{name}}</div>
    </div>
    <div class="avatar">
      <img :src="avatar" alt="Character Avatar" />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/index.js'

const appStore = useAppStore();
const { meta: { name, avatar } } = appStore;
</script>

<style scoped>
.header {
  display: grid;
}
</style>
