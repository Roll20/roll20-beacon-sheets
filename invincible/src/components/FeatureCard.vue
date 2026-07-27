<template>
  <div
    :class="[
      'text-black border-b border-zinc-200 pb-3 transition-all duration-200 select-none',
      isOpen ? 'col-span-full' : ''
    ]"
  >
    <GenericCollapsible v-model:open="isOpen">
      <template #summary>
        <div class="flex items-center gap-2 text-left">
          <span class="material-symbols-outlined text-base font-black shrink-0" :class="feature.type === 'talent' ? 'text-secondary' : 'text-accent'" v-tooltip="feature.type === 'talent' ? 'Talent' : 'Drawback'">
            {{ feature.type === 'talent' ? 'verified' : 'warning' }}
          </span>
          <span class="font-space-grotesk font-black uppercase text-base tracking-wide">{{ feature.name }}</span>
        </div>
      </template>

      <template #actions>
        <SendToChatButton
          v-if="feature.name"
          :characterName="characterName"
          :title="feature.name"
          :textContent="feature.description || 'No description'"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">chat_bubble</span>
        </SendToChatButton>

        <button
          @click="$emit('edit')"
          v-tooltip="'Edit Trait'"
          type="button"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
        >
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
      </template>

      <template #content>
        
        <div class="mt-3 border-t-2 border-black pt-3 flex flex-col gap-3 text-left">
          <div
            v-if="feature.description"
            class="prose prose-sm max-w-none font-lexend text-sm text-zinc-700 leading-relaxed text-left"
            v-html="renderedHtml"
          />
          <div v-else class="text-zinc-400 italic text-[11px] font-lexend text-left">
            No description provided.
          </div>

          
          <div v-if="feature.effects?.value?.length > 0" class="border-t border-zinc-200 pt-2 text-left">
            <span class="font-black uppercase tracking-wider text-xs text-zinc-500 block mb-1">
              Active Effects
            </span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="eff in feature.effects.value"
                :key="eff._id"
                class="px-2 py-0.5 border border-black bg-zinc-50 rounded font-mono text-xs flex items-center gap-1 shadow-sm"
              >
                <span class="font-black text-primary">{{ eff.attribute }}</span>
                <span class="text-zinc-500 font-bold">{{ eff.operation }}</span>
                <span class="font-black text-tertiary">{{ eff.value }}</span>
              </span>
            </div>
          </div>
        </div>
      </template>
    </GenericCollapsible>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import type { FeatureItem } from '@/schemas/hydrate/features';
import SendToChatButton from './SendToChatButton.vue';
import GenericCollapsible from './GenericCollapsible.vue';

interface Props {
  feature: FeatureItem;
  characterName?: string;
  isOpen?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'toggle-expand', isOpen: boolean): void;
}>();

const isOpen = computed({
  get: () => !!props.isOpen,
  set: (val) => emit('toggle-expand', val)
});

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const renderedHtml = computed(() => {
  const dirtyHtml = md.render(props.feature.description || '');
  return DOMPurify.sanitize(dirtyHtml);
});
</script>
