<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal"
      @mousedown.self="onBackdropClick"
    >
      <div
        class="bg-white border-3 border-primary action-shadow-lg outline-3 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        
        <div class="px-4 py-3 bg-primary text-primary-foreground flex justify-between items-center select-none">
          <slot name="header">
            <h3 class="font-space-grotesk font-black uppercase tracking-wide text-base md:text-lg">
              {{ title }}
            </h3>
          </slot>
          <button
            @click="close"
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-black/10 transition-colors cursor-pointer text-primary-foreground focus:outline-none"
          >
            <span class="material-symbols-outlined text-xl font-black">close</span>
          </button>
        </div>

        
        <div class="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50">
          <slot />
        </div>

        
        <div
          v-if="$slots.footer"
          class="border-t-4 border-black px-4 py-3 bg-zinc-100 flex items-center justify-end gap-2"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';

interface Props {
  show: boolean;
  title?: string;
  closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function close() {
  emit('close');
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    close();
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
.modal {
  --color-select-border: var(--color-primary);
  --color-select-text: var(--color-primary-foreground);
}
</style>
