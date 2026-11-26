<template>
  <details
    :open="isOpen || isTransitioning"
    class="relative group w-full list-none"
  >
    <summary
      class="list-none flex items-center justify-between cursor-pointer select-none outline-none"
      @click.prevent="toggleOpen"
    >
      
      <slot name="summary" :isOpen="isOpen" />

      <div class="flex items-center gap-2" @click.stop>
        
        <div
          class="flex items-center gap-1.5 transition-opacity duration-200"
          :class="alwaysShowActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        >
          <slot name="actions" />
        </div>

        
        <button
          v-if="showCaret"
          @click.prevent="toggleOpen"
          v-tooltip="isOpen ? 'Collapse' : 'Expand'"
          type="button"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
        >
          <span class="material-symbols-outlined text-sm transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
            keyboard_arrow_down
          </span>
        </button>
      </div>
    </summary>

    
    <div class="w-full">
      <div class="grid grid-rows-[0fr] transition-all duration-200" :class="{'grid-rows-[1fr]': isExpanded}">
        
        <div class="overflow-hidden">
          <slot name="content" />
        </div>
      </div>
    </div>
  </details>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue';

const isOpen = defineModel<boolean>('open', { default: false });

withDefaults(defineProps<{
  showCaret?: boolean;
  alwaysShowActions?: boolean;
}>(), {
  showCaret: true,
  alwaysShowActions: false,
});

const isTransitioning = ref(false);
const isExpanded = ref(isOpen.value);
let timeoutId: any = null;

watch(isOpen, (newVal) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (newVal) {
    
    isTransitioning.value = false;
    
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isExpanded.value = true;
        });
      });
    });
  } else {
    
    isExpanded.value = false;
    isTransitioning.value = true;
    timeoutId = setTimeout(() => {
      isTransitioning.value = false;
      timeoutId = null;
    }, 200); 
  }
});

function toggleOpen(e?: Event) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  isOpen.value = !isOpen.value;
}
</script>

<style scoped>
summary::-webkit-details-marker {
  display: none;
}
</style>
