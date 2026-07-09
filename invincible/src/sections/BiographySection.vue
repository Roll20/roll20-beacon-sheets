<template>
  <section>
    
    <h2><ComicTitle text="Personal Stuff" /></h2>
    <ComicPanel noPadding headerBg="bg-primary text-white">
      <div class="p-6 space-y-4">
        
        <div class="flex flex-col sm:flex-row gap-2 border-b border-zinc-200 pb-3">
          <span class="font-space-grotesk font-black uppercase text-sm w-28 shrink-0 flex items-center text-zinc-500">{{ $t('sheet.occupation') }}:</span>
          <LazyInput
            v-model="sheet.biography.personalDossier.occupation"
            class="flex-1 text-sm border border-transparent hover:border-zinc-300 focus:border-black focus:outline-none p-1 bg-zinc-50 focus:bg-white font-bold"
          />
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2 border-b border-zinc-200 pb-3">
          <span class="font-space-grotesk font-black uppercase text-sm w-28 shrink-0 flex items-center text-zinc-500">{{ $t('sheet.personality') }}:</span>
          <LazyInput
            v-model="sheet.biography.personalDossier.personality"
            class="flex-1 text-sm border border-transparent hover:border-zinc-300 focus:border-black focus:outline-none p-1 bg-zinc-50 focus:bg-white font-bold"
          />
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2 border-b border-zinc-200 pb-3">
          <span class="font-space-grotesk font-black uppercase text-sm w-28 shrink-0 flex items-center text-zinc-500">{{ $t('sheet.drive') }}:</span>
          <LazyInput
            v-model="sheet.biography.personalDossier.drive"
            class="flex-1 text-sm border border-transparent hover:border-zinc-300 focus:border-black focus:outline-none p-1 bg-zinc-50 focus:bg-white font-bold"
          />
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2 border-b border-zinc-200 pb-3">
          <span class="font-space-grotesk font-black uppercase text-sm w-28 shrink-0 flex items-center text-zinc-500">{{ $t('sheet.flaw') }}:</span>
          <LazyInput
            v-model="sheet.biography.personalDossier.flaw"
            class="flex-1 text-sm border border-transparent hover:border-zinc-300 focus:border-black focus:outline-none p-1 bg-zinc-50 focus:bg-white font-bold"
          />
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2">
          <span class="font-space-grotesk font-black uppercase text-sm w-28 shrink-0 flex items-center text-zinc-500">{{ $t('sheet.relationships') }}:</span>
          <LazyInput
            v-model="sheet.biography.personalDossier.relationships"
            class="flex-1 text-sm border border-transparent hover:border-zinc-300 focus:border-black focus:outline-none p-1 bg-zinc-50 focus:bg-white font-bold"
          />
        </div>
      </div>
    </ComicPanel>
  </section>
</template>

<script lang="ts" setup>
import ComicPanel from '@/components/ComicPanel.vue';
import LazyInput from '@/components/LazyInput.vue';
import { characterStore } from '@/sheet/stores';
import { useBreakpoints } from '@/utility/useBreakpoints';
import ComicTitle from '@/components/ComicTitle.vue';

const sheet = characterStore();
const { sm } = useBreakpoints();
</script>
