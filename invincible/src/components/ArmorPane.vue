<template>
  <div class="text-center p-2 border-2 border-secondary relative group hover:bg-primary-container transition-colors">
    <span class="block text-xs font-black uppercase tracking-wider text-zinc-500 truncate">
      {{ $t('sheet.armor') }}
    </span>
    <ModifiedValueInput
      :modifiedValue="ruleSets.armor()"
      class="font-space-grotesk font-black text-3xl leading-none text-black mt-1 text-center w-full bg-transparent border-none focus:outline-none p-0"
      unstyled
    />
  </div>
</template>

<script lang="ts" setup>
import { characterStore } from '@/sheet/stores';
import { ruleSets } from '@/system';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';

const sheet = characterStore();
</script>
