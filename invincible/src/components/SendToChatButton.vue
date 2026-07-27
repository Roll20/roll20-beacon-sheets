<template>
  <button
    type="button"
    @click="handleSend"
    v-tooltip="'Send to Chat'"
    :class="{
      'px-2 py-1 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-300 rounded text-sm font-semibold text-gray-700 transition shadow-sm inline-flex items-center gap-1.5': !hasSlot,
      'cursor-pointer': true
    }"
  >
    <slot v-if="hasSlot" />
    <template v-else>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </template>
  </button>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import type { CommonParameters } from '@/rolltemplates/rolltemplates';
import sendToChat from '@/utility/sendToChat';

const props = defineProps<{
  characterName?: string;
  title: string;
  subtitle?: string;
  keyValues?: Record<string, string | number | boolean>;
  traits?: string[];
  textContent?: string | string[];
  visibility?: 'gm' | 'secret';
}>();

const emit = defineEmits<{
  (e: 'done'): void;
  (e: 'error', error: unknown): void;
}>();

const slots = useSlots();
const hasSlot = computed(() => !!slots.default);

const chatArgs = computed((): CommonParameters => ({
  characterName: props.characterName,
  title: props.title,
  subtitle: props.subtitle,
  keyValues: props.keyValues,
  traits: props.traits,
  textContent: props.textContent,
  visibility: props.visibility,
}));

const tooltipInfo = computed(() => {
  let text = `<strong>${props.title}</strong>`;
  if (props.subtitle) {
    text += `<br/><span style="opacity: 0.8">${props.subtitle}</span>`;
  }
  return { content: text, html: true };
});

async function handleSend(): Promise<void> {
  try {
    await sendToChat(chatArgs.value);
    emit('done');
  } catch (err) {
    emit('error', err);
  }
}
</script>
