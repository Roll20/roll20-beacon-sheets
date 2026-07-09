<template>
  <h2>Global Settings</h2>
  <template v-if="isGM">
    GM SETTINGS
  </template>
  <template v-else>
    PLAYER SETTINGS
  </template>
</template>

<script lang="ts" setup>
import { initValues, sharedSettings } from '@/relay/relay';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { computed } from 'vue';

const meta = metaStore();

const isGM = computed(() => meta.permissions.isGM);

console.log(initValues, sharedSettings);
</script>

<style lang="scss" scoped>
@use '../common/scss/vars.scss';

</style>