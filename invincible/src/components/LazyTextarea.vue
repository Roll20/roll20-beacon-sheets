<template>
  <OverlayScrollbarsComponent
    :options="{
      scrollbars: { autoHide: 'leave', theme: 'os-theme-dark' },
      overflow: { x: 'hidden', y: 'scroll' }
    }"
    class="lazy-textarea-wrapper"
    :class="$attrs.class || 'h-[6rem] border border-transparent focus-within:border-black focus-within:bg-white/40 p-2 transition-colors'"
    :style="$attrs.style"
    @click="focusTextarea"
  >
    <textarea
      ref="textareaRef"
      :value="localValue"
      @input="onInput"
      @blur="commit"
      :placeholder="placeholder"
      class="w-full resize-none bg-transparent focus:outline-none block overflow-hidden text-sm font-lexend leading-relaxed text-black"
      v-bind="filteredAttrs"
      spellcheck="false"
    />
  </OverlayScrollbarsComponent>
</template>

<script lang="ts" setup>
import { ref, watch, computed, useAttrs, onMounted, onUnmounted, nextTick } from 'vue';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const attrs = useAttrs();
const filteredAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs;
  return rest;
});

const localValue = ref(props.modelValue ?? '');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  adjustHeight();
  if (textareaRef.value) {
    let lastWidth = textareaRef.value.clientWidth;
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width !== lastWidth) {
          lastWidth = width;
          adjustHeight();
        }
      }
    });
    resizeObserver.observe(textareaRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = newVal ?? '';
    nextTick(() => {
      adjustHeight();
    });
  }
);

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  localValue.value = target.value;
  nextTick(() => {
    adjustHeight();
  });
};

const commit = () => {
  emit('update:modelValue', localValue.value);
};

const focusTextarea = () => {
  textareaRef.value?.focus();
};
</script>

<style lang="scss" scoped>
.lazy-textarea-wrapper {
  overflow: hidden;
  width: 100%;
  resize: none;
  &:hover, &:focus-within {
    resize: vertical;
  }
}
</style>
