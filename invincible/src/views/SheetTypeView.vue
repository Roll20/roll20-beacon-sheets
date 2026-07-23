<template>
  <div>
    <div class="grid min-h-screen items-center relative z-10">
      <div class="flex flex-col items-center -mt-20">
        <ComicTitle class="mb-4" text="Sheet Type" />
        <ComicPanel class="w-full max-w-sm">
          <div class="flex flex-col gap-4 py-2">
            <button
              type="button"
              @click="setMode('normal')"
              class="px-4 py-3 font-space-grotesk font-bold text-lg uppercase transition-colors border-2 border-black flex items-center justify-center gap-2"
              :class="currentMode === 'normal' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] translate-x-[-2px]' : 'bg-white text-black hover:bg-zinc-100'"
            >
              <span v-if="currentMode === 'normal'" class="material-symbols-outlined text-lg">check_circle</span>
              Full Sheet
            </button>
            <button
              type="button"
              @click="setMode('compact')"
              class="px-4 py-3 font-space-grotesk font-bold text-lg uppercase transition-colors border-2 border-black flex items-center justify-center gap-2"
              :class="currentMode === 'compact' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px] translate-x-[-2px]' : 'bg-white text-black hover:bg-zinc-100'"
            >
              <span v-if="currentMode === 'compact'" class="material-symbols-outlined text-lg">check_circle</span>
              Compact Mode
            </button>
          </div>
        </ComicPanel>
      </div>
    </div>
    <div class="background fixed z-1 top-0 left-0 w-full h-full object-cover pointer-events-none"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { characterStore } from '@/sheet/stores';
import ComicPanel from '@/components/ComicPanel.vue';
import ComicTitle from '@/components/ComicTitle.vue';

const store = characterStore();
const currentMode = computed(() => store.settings.mode);

const setMode = (mode: 'normal' | 'compact') => {
  store.settings.mode = mode;
};
</script>

<style lang="scss"  scoped>
.background {
  background-image: url('@/assets/sheet_background_grayscale.png');
  background-size: cover;
  background-position: center;
  background-color: var(--color-secondary);
  background-blend-mode: hard-light;
  opacity: 0.5;
}
</style>
