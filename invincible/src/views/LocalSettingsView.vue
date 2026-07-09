<template>
  <main>
    <h2>Local Settings</h2>
    <div>Is Owner: {{ isOwner }}</div>
    <div>Is GM: {{ isGM }}</div>
  </main>
</template>

<script lang="ts" setup>
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { computed } from 'vue';

const meta = metaStore();

const isOwner = computed(() => meta.permissions.isOwner);
const isGM = computed(() => meta.permissions.isGM);

</script>

<style lang="scss" scoped>
@use '../common/scss/vars.scss';

</style>
