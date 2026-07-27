<template>
  <SheetTypeView v-if="mode !== 'compact' && mode !== 'normal' && !isPrinting && isGM" />
  <NormalView v-else-if="mode === 'normal' && !isPrinting" />
  <CompactView v-else />
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { characterStore } from '@/sheet/stores';
import NormalView from './NormalView.vue';
import CompactView from './CompactView.vue';
import SheetTypeView from './SheetTypeView.vue';

const sheet = characterStore();
const isPrinting = ref(false);

const isGM = computed(() => sheet.meta.permissions.isGM);

const mode = computed(() => isGM.value ? sheet.settings.mode : 'normal');

const handleBeforePrint = () => {
  isPrinting.value = true;
};

const handleAfterPrint = () => {
  isPrinting.value = false;
};

onMounted(() => {
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);
});

onUnmounted(() => {
  window.removeEventListener('beforeprint', handleBeforePrint);
  window.removeEventListener('afterprint', handleAfterPrint);
});
</script>
