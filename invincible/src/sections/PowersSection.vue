<template>
  <section>
    <div class="flex justify-between items-center">
      <h2><ComicTitle :text="$t('sheet.powers_boosts')" /></h2>
      <button
        @click="$emit('add-power')"
        class="w-8 h-8 flex items-center justify-center border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground action-shadow-sm transition-all focus:outline-none font-bold cursor-pointer active:translate-y-0.5"
        type="button"
        v-tooltip="'Add New Power'"
      >
        <span class="material-symbols-outlined text-base font-black">add</span>
      </button>
    </div>
    <ComicPanel>
      <div class="grid grid-cols-1 gap-8">
        
        <div class="space-y-4">
          
          <div v-if="sheet.powers.list.length === 0" class="bg-zinc-100 border-2 border-dashed border-zinc-400 p-8 text-center">
            <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">{{ $t('sheet.empty_list') }}</span>
          </div>
          <div v-else class="space-y-3">
            <GenericCollapsible
              v-for="power in sortedPowers"
              :key="power._id"
              :open="isPowerExpanded(power._id!)"
              @update:open="togglePowerExpand(power._id!)"
              class="text-black border-b border-zinc-200 pb-3"
            >
              <template #summary>
                <div class="flex-1 min-w-0 text-left">
                  
                  <h4 class="font-space-grotesk font-black uppercase text-base tracking-wide">{{ power.name }}</h4>
                  
                  
                  <div v-if="getBoostsList(power) || getLimitsList(power)" class="mt-1 flex flex-col gap-0.5 text-xs font-lexend text-zinc-500">
                    <div v-if="getBoostsList(power)">
                      <strong class="font-bold text-secondary uppercase tracking-wider text-xs">Boosts:</strong> {{ getBoostsList(power) }}
                    </div>
                    <div v-if="getLimitsList(power)">
                      <strong class="font-bold text-red-700 uppercase tracking-wider text-xs">Limits:</strong> {{ getLimitsList(power) }}
                    </div>
                  </div>
                </div>
              </template>

              <template #actions>
                
                <SendToChatButton
                  v-if="power.name"
                  :characterName="sheet.meta.name"
                  :title="power.name"
                  :textContent="power.description || 'No description'"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-base">chat_bubble</span>
                </SendToChatButton>

                
                <button
                  @click="$emit('edit-power', power)"
                  v-tooltip="'Edit Power'"
                  type="button"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
                >
                  <span class="material-symbols-outlined text-base">edit</span>
                </button>
              </template>

              <template #content>
                
                <div class="mt-3 border-t-2 border-black pt-3 flex flex-col gap-3">
                  
                  <div
                    v-if="power.description"
                    class="prose prose-sm max-w-none font-lexend text-sm text-zinc-700 leading-relaxed text-left"
                    v-html="renderMarkdown(power.description)"
                  />
                  <div v-else class="text-zinc-400 italic text-[11px] font-lexend text-left">
                    No description provided.
                  </div>

                  
                  <div v-if="power.effects?.value?.length > 0" class="border-t border-zinc-200 pt-2 text-left">
                    <span class="font-black uppercase tracking-wider text-xs text-zinc-500 block mb-1">
                      Active Effects
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="eff in power.effects.value"
                        :key="eff._id"
                        class="px-2 py-0.5 border border-black bg-zinc-50 rounded font-mono text-xs flex items-center gap-1 shadow-sm"
                      >
                        <span class="font-black text-primary">{{ eff.attribute }}</span>
                        <span class="text-zinc-500 font-bold">{{ eff.operation }}</span>
                        <span class="font-black text-tertiary">{{ eff.value }}</span>
                      </span>
                    </div>
                  </div>

                  
                  <div v-if="power.modifiers && power.modifiers.length > 0" class="border-t border-zinc-200 pt-2 space-y-2 text-left">
                    <span class="font-black uppercase tracking-wider text-xs text-zinc-500 block">
                      Modifiers Detail
                    </span>
                    <div class="space-y-2">
                      <div
                        v-for="mod in power.modifiers"
                        :key="mod._id"
                        class="p-2.5 border border-zinc-300 bg-zinc-50/50 rounded flex flex-col gap-1.5 transition-opacity duration-200"
                        :class="{ 'opacity-50 bg-zinc-100/30': mod.isActive === false }"
                      >
                        
                        <div class="flex justify-between items-center">
                          <div class="flex items-center gap-1.5">
                            <span class="font-bold text-sm uppercase tracking-wider text-zinc-800" :class="{ 'line-through text-zinc-400': mod.isActive === false }">{{ mod.name }}</span>
                            <span v-if="mod.isActive === false" class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">(Inactive)</span>
                          </div>
                          <span
                            class="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider border rounded"
                            :class="mod.type === 'boost' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'"
                          >
                            {{ mod.type }}
                          </span>
                        </div>

                        
                        <p v-if="mod.description" class="text-[11px] font-lexend text-zinc-600 leading-relaxed m-0">{{ mod.description }}</p>

                        
                        <div v-if="mod.effects?.value?.length > 0" class="flex flex-wrap gap-1 mt-0.5">
                          <span
                            v-for="eff in mod.effects.value"
                            :key="eff._id"
                            class="px-1.5 py-0.2 border border-zinc-300 bg-white rounded font-mono text-[8px] flex items-center gap-0.5"
                          >
                            <span class="font-bold text-primary">{{ eff.attribute }}</span>
                            <span class="text-zinc-500 font-bold">{{ eff.operation }}</span>
                            <span class="font-bold text-tertiary">{{ eff.value }}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </GenericCollapsible>
          </div>
        </div>

        <!-- Power Source Description -->
        <div class="space-y-4 power-source">
          <h3 class="font-space-grotesk font-black text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-zinc-200 pb-1">
            <span class="material-symbols-outlined text-sm">movie_info</span>
            {{ $t('sheet.power_source') }}
          </h3>
          <LazyTextarea
            v-model="sheet.powers.powerSourceDescription"
            rows="5"
            class="w-full text-sm font-lexend leading-relaxed bg-transparent focus:outline-none border border-transparent hover:border-t-zinc-400 hover:border-b-zinc-400 focus-within:border-t-black! focus-within:border-b-black! resize-y font-bold text-black py-0 pl-0 transition-colors"
            :placeholder="$t('sheet.power_source_placeholder')"
          />
        </div>
      </div>
    </ComicPanel>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { characterStore } from '@/sheet/stores';
import ComicTitle from '@/components/ComicTitle.vue';
import SendToChatButton from '@/components/SendToChatButton.vue';
import LazyTextarea from '@/components/LazyTextarea.vue';
import type { PowerItem } from '@/schemas/hydrate/powers';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import ComicPanel from '@/components/ComicPanel.vue';
import GenericCollapsible from '@/components/GenericCollapsible.vue';

const sheet = characterStore();

defineEmits<{
  (e: 'add-power'): void;
  (e: 'edit-power', power: PowerItem): void;
}>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const renderMarkdown = (text: string) => {
  if (!text) return '';
  return DOMPurify.sanitize(md.render(text));
};

const expandedPowerIds = ref<string[]>([]);

const togglePowerExpand = (id: string) => {
  if (expandedPowerIds.value.includes(id)) {
    expandedPowerIds.value = expandedPowerIds.value.filter(x => x !== id);
  } else {
    expandedPowerIds.value.push(id);
  }
};

const isPowerExpanded = (id: string) => expandedPowerIds.value.includes(id);

const getBoostsList = (power: PowerItem) => {
  if (!power.modifiers) return '';
  const boosts = power.modifiers.filter(m => m.type === 'boost' && m.isActive !== false).map(m => m.name).filter(Boolean);
  return boosts.length > 0 ? boosts.join(', ') : '';
};

const getLimitsList = (power: PowerItem) => {
  if (!power.modifiers) return '';
  const limits = power.modifiers.filter(m => m.type === 'limit' && m.isActive !== false).map(m => m.name).filter(Boolean);
  return limits.length > 0 ? limits.join(', ') : '';
};

const sortedPowers = computed(() => {
  return [...sheet.powers.list].sort((a, b) => {
    return (a.name || '').localeCompare(b.name || '');
  });
});
</script>

<style lang="scss" scoped>
  .power-source {
    
  }
</style>
