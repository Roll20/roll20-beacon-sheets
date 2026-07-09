<template>
  <section>
    <div class="flex justify-between items-center">
      <h2><ComicTitle :text="$t('sheet.actions_checks')" /></h2>
      <div class="flex gap-5">
        <button
          @click="sheet.actions.hideDefaultActions = !sheet.actions.hideDefaultActions"
          class="w-8 h-8 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-zinc-200 active:translate-y-0.5 action-shadow-sm transition-all focus:outline-none cursor-pointer"
          type="button"
          v-tooltip="sheet.actions.hideDefaultActions ? 'Show Default Actions' : 'Hide Default Actions'"
        >
          <span class="material-symbols-outlined text-base font-black select-none">
            {{ sheet.actions.hideDefaultActions ? 'visibility_off' : 'visibility' }}
          </span>
        </button>
        <button
          @click="$emit('add-action', sheet.actions.currentTab)"
          class="w-8 h-8 flex items-center justify-center border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground action-shadow-sm transition-all focus:outline-none font-bold cursor-pointer active:translate-y-0.5"
          type="button"
          v-tooltip="'Add New Action'"
        >
          <span class="material-symbols-outlined text-base font-black">add</span>
        </button>
      </div>
    </div>
    <ComicPanel noPadding headerBg="bg-secondary text-white border-b-4 border-black">
      
      <div class="flex">
        <button
          type="button"
          @click="sheet.actions.currentTab = 'quick'"
          class="flex-1 py-3 text-center font-space-grotesk font-black uppercase text-base focus:outline-none transition-colors cursor-pointer"
          :class="sheet.actions.currentTab !== 'quick' ? 'bg-secondary text-secondary-disabled' : 'bg-white text-black hover:bg-zinc-100'"
        >
          Quick Actions
        </button>
        <button
          type="button"
          @click="sheet.actions.currentTab = 'full'"
          class="flex-1 py-3 text-center font-space-grotesk font-black uppercase text-base focus:outline-none transition-colors cursor-pointer"
          :class="sheet.actions.currentTab !== 'full' ? 'bg-secondary text-secondary-disabled' : 'bg-white text-black hover:bg-zinc-100'"
        >
          Full Actions
        </button>
      </div>
      
      <div class="p-6 space-y-4">
        
        <div v-if="filteredActions.length === 0" class="bg-zinc-100 border-2 border-dashed border-zinc-400 p-8 text-center text-sm">
          <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">
            {{ $t('sheet.empty_actions') }}
          </span>
        </div>

        
        <div v-else class="flex flex-col gap-3">
          <ActionCard
            v-for="item in filteredActions"
            :key="item._id"
            :action="item"
            :characterName="sheet.meta.name"
            @edit="$emit('edit-action', item)"
          />
        </div>
      </div>
    </ComicPanel>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import ComicPanel from '@/components/ComicPanel.vue';
import ActionCard from '@/components/ActionCard.vue';
import type { ActionItem } from '@/schemas/hydrate/actions';
import { characterStore } from '@/sheet/stores';
import ComicTitle from '@/components/ComicTitle.vue';

const sheet = characterStore();

const filteredActions = computed(() => {
  let list = sheet.actions.list.filter(a => a.type === sheet.actions.currentTab).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  
  if (sheet.actions.hideDefaultActions) {
    list = list.filter(a => !a.isDefault);
  }

  
  return [...list].sort((a, b) => {
    const aVal = a.isDefault ? 1 : 0;
    const bVal = b.isDefault ? 1 : 0;
    if (aVal !== bVal) {
      return aVal - bVal;
    }
    return 1;
  });
});

defineEmits<{
  (e: 'add-action', type: 'quick' | 'full'): void;
  (e: 'edit-action', action: ActionItem): void;
}>();
</script>
