<template>
  <div v-if="warnings.length" class="tof-panel warnpanel">
    <div
      v-for="(wn, i) in warnings"
      :key="i"
      :class="wn.severity === 'error' ? 'tof-warn' : 'tof-warn--soft'"
    >
      {{ wn.severity === 'error' ? 'x' : '!' }} {{ wn.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import type { CharacterMakerStep } from '@/maker/types';

const props = defineProps<{ step: CharacterMakerStep }>();
const store = useDraftStore();
const warnings = computed(() => store.stepWarnings(props.step));
</script>

<style scoped lang="scss">
.warnpanel {
  border-color: var(--tof-accent-red-bright);
  display: grid;
  gap: 0.3rem;
}
</style>
