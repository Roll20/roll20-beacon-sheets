<template>
  <section>
    <div class="flex justify-between items-center">
      <h2><ComicTitle text="Gear" /></h2>
      <button
        @click="$emit('add-gear')"
        class="w-8 h-8 flex items-center justify-center border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground action-shadow-sm transition-all focus:outline-none font-bold cursor-pointer active:translate-y-0.5"
        type="button"
        v-tooltip="'Add New Item'"
      >
        <span class="material-symbols-outlined text-base font-black">add</span>
      </button>
    </div>
    <ComicPanel>
      <div class="grid grid-cols-1 gap-8">
        <div class="space-y-4">
          <div v-if="sheet.gear.list.length === 0" class="bg-zinc-100 border-2 border-dashed border-zinc-400 p-8 text-center">
            <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">No gear added yet</span>
          </div>
          <div v-else class="space-y-3">
            <GenericCollapsible
              v-for="item in sortedGear"
              :key="item._id"
              :open="isGearExpanded(item._id!)"
              @update:open="toggleGearExpand(item._id!)"
              class="text-black border-b border-zinc-200 pb-3"
            >
              <template #summary>
                <div class="flex items-center gap-3 text-left flex-1 min-w-0">
                  
                  <ToggleButton
                    v-model="item.isActive"
                    @click.stop
                    class="scale-75 shrink-0"
                  />

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      
                      <h4
                        class="font-space-grotesk font-black uppercase text-base tracking-wide truncate"
                        :class="item.isActive ? 'text-black' : 'text-zinc-500'"
                      >
                        {{ item.name }}
                      </h4>

                        <span class="px-1.5 py-0.5 border bg-zinc-100 font-mono text-[10px] font-black uppercase tracking-wider" :class="{'border-zinc-500': item.isActive, 'border-black': !item.isActive}">
                          {{ item.type }}
                        </span>
                    </div>
                  </div>
                </div>
              </template>

              <template #actions>
                
                <SendToChatButton
                  v-if="item.name"
                  :characterName="sheet.meta.name"
                  :title="item.name"
                  :textContent="item.description || 'No description'"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-base">chat_bubble</span>
                </SendToChatButton>

                
                <button
                  @click="$emit('edit-gear', item)"
                  type="button"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
                  v-tooltip="'Edit Item'"
                >
                  <span class="material-symbols-outlined text-base">edit</span>
                </button>
              </template>

              <template #content>
                <div class="mt-3 border-t-2 border-black pt-3 flex flex-col gap-3">
                  
                  <div class="text-left">
                    <span
                      class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border rounded"
                      :class="item.type === 'weapon' ? 'bg-red-50 border-red-200 text-red-700' : (item.type === 'armor' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-zinc-50 border-zinc-200 text-zinc-700')"
                    >
                      {{ item.type }}
                    </span>
                  </div>

                  
                  <div
                    v-if="item.description"
                    class="prose prose-sm max-w-none font-lexend text-sm text-zinc-700 leading-relaxed text-left"
                    v-html="renderMarkdown(item.description)"
                  />
                  <div v-else class="text-zinc-400 italic text-[11px] font-lexend text-left">
                    No description provided.
                  </div>

                  
                  <div v-if="item.effects?.value?.length > 0" class="border-t border-zinc-200 pt-2 text-left">
                    <span class="font-black uppercase tracking-wider text-xs text-zinc-500 block mb-1">
                      Active Effects
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="eff in item.effects.value"
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
        </div>
        <div class="grid grid-cols-[1fr_40px] items-center">
          <h3 class="font-space-grotesk font-black text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-1 justify-end">
            <span class="material-symbols-outlined text-sm">diamond</span>
            resources
          </h3>
          <ModifiedValueInput
            :modifiedValue="resources"
            unstyled
            class="font-space-grotesk font-black text-2xl leading-none text-black text-right w-full bg-transparent focus:outline-none p-0 border-b border-transparent hover:border-zinc-400 focus:border-black"
          />
        </div>
      </div>
    </ComicPanel>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import ComicTitle from '@/components/ComicTitle.vue';
import ComicPanel from '@/components/ComicPanel.vue';
import GenericCollapsible from '@/components/GenericCollapsible.vue';
import SendToChatButton from '@/components/SendToChatButton.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import { characterStore } from '@/sheet/stores';
import type { GearItem } from '@/schemas/hydrate/gear';
import { ruleSets } from '@/system';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';

const md = new MarkdownIt({ html: false, linkify: true });
const renderMarkdown = (text: string) => {
  return DOMPurify.sanitize(md.render(text));
};

const sheet = characterStore();

defineEmits<{
  (e: 'add-gear'): void;
  (e: 'edit-gear', gear: GearItem): void;
}>();

const sortedGear = computed(() => {
  return [...sheet.gear.list].sort((a, b) => a.name.localeCompare(b.name));
});

const expandedGearIds = ref<string[]>([]);

const toggleGearExpand = (id: string) => {
  if (expandedGearIds.value.includes(id)) {
    expandedGearIds.value = expandedGearIds.value.filter(x => x !== id);
  } else {
    expandedGearIds.value.push(id);
  }
};

const isGearExpanded = (id: string) => {
  return expandedGearIds.value.includes(id);
};

const resources = computed(() => {
  return ruleSets.resources();
});
</script>
