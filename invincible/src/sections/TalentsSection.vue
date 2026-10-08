<template>
  <section>
    <div class="flex justify-between items-center">
      <h2><ComicTitle :text="$t('sheet.talents_drawbacks')" /></h2>
      <button
        @click="$emit('add-feature')"
        class="w-8 h-8 flex items-center justify-center border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground action-shadow-sm transition-all focus:outline-none font-bold cursor-pointer active:translate-y-0.5"
        type="button"
        v-tooltip="'Add New Trait'"
      >
        <span class="material-symbols-outlined text-base font-black">add</span>
      </button>
    </div>

    <ComicPanel>
      <div v-if="sheet.features.list.length === 0" class="bg-zinc-100 border-2 border-dashed border-zinc-400 p-8 text-center">
        <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">{{ $t('sheet.empty_list') }}</span>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <FeatureCard
          v-for="item in orderedFeatures"
          :key="item._id || item.name"
          :feature="item"
          :characterName="sheet.meta.name"
          :isOpen="expandedIds.includes(item._id!)"
          @toggle-expand="handleToggleExpand(item._id!, $event)"
          @edit="$emit('edit-feature', item)"
        />
      </div>
    </ComicPanel>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { characterStore } from '@/sheet/stores';
import ComicTitle from '@/components/ComicTitle.vue';
import ComicPanel from '@/components/ComicPanel.vue';
import FeatureCard from '@/components/FeatureCard.vue';
import type { FeatureItem } from '@/schemas/hydrate/features';
import { useBreakpoints } from '@/utility/useBreakpoints';

const sheet = characterStore();
const { sm } = useBreakpoints();

console.log(sheet.features);

defineEmits<{
  (e: 'add-feature'): void;
  (e: 'edit-feature', feature: FeatureItem): void;
}>();

const expandedIds = ref<string[]>([]);

function handleToggleExpand(id: string, isOpen: boolean) {
  if (isOpen) {
    if (!expandedIds.value.includes(id)) {
      expandedIds.value.push(id);
    }
  } else {
    expandedIds.value = expandedIds.value.filter(x => x !== id);
  }
}

const orderedFeatures = computed(() => {
  
  const list = [...sheet.features.list].sort((a, b) => {
    return (a.name || '').localeCompare(b.name || '');
  });
  if (!sm.value) {
    return list;
  }
  
  const ordered: typeof list = [];
  let col = 0; 

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item?._id) continue;
    const isExpanded = expandedIds.value.includes(item._id);

    if (isExpanded) {
      if (col === 1) {
        
        
        const last = ordered.pop();
        if (last) {
          ordered.push(item);
          ordered.push(last);
        } else {
          ordered.push(item);
          col = 0;
        }
      } else {
        ordered.push(item);
        col = 0;
      }
    } else {
      ordered.push(item);
      col = (col + 1) % 2;
    }
  }

  return ordered;
});
</script>
