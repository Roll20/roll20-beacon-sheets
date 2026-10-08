<template>
  <div class="space-y-4">
    
    <div
      v-if="sheet.combat.health === 0"
      class="bg-accent border-2 border-black text-accent-foreground p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2 animate-bounce-subtle"
    >
      <span class="material-symbols-outlined text-xl animate-pulse">warning</span>
      <div class="space-y-0.5">
        <div class="font-space-grotesk font-black text-sm uppercase tracking-wider leading-none">
          Broken & Out of Action!
        </div>
        <p class="text-xs leading-tight text-white/90">
          You cannot move, roll for any attributes, or use any powers. Additional damage will trigger another critical injury.
        </p>
      </div>
    </div>

    
    <div class="flex justify-between items-center">
      <h4 class="font-space-grotesk font-black uppercase flex items-center gap-1 text-accent text-xs">
        <span class="material-symbols-outlined text-accent text-xl">local_hospital</span>
        {{ $t('sheet.critical_injuries') }}
      </h4>
    </div>

    
    <div v-if="sheet.combat.criticalInjuries.length === 0" class="bg-zinc-100 border-2 border-dashed border-zinc-400 h-20 flex items-center justify-center">
      <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">{{ $t('sheet.no_active_injuries') }}</span>
    </div>
    <div v-else class="space-y-3">
      <InjuryCard
        v-for="injury in sheet.combat.criticalInjuries"
        :key="injury._id"
        :injury="injury"
        :open="isInjuryExpanded(injury._id!)"
        @update:open="val => setInjuryExpand(injury._id!, val)"
        @remove="removeInjury(injury._id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { characterStore } from '@/sheet/stores';
import InjuryCard from '@/components/InjuryCard.vue';

const sheet = characterStore();

const expandedInjuryIds = ref<string[]>([]);

const setInjuryExpand = (id: string, val: boolean) => {
  if (val) {
    if (!expandedInjuryIds.value.includes(id)) {
      expandedInjuryIds.value.push(id);
    }
  } else {
    expandedInjuryIds.value = expandedInjuryIds.value.filter(x => x !== id);
  }
};

const isInjuryExpanded = (id: string) => expandedInjuryIds.value.includes(id);

watch(
  () => sheet.combat.criticalInjuries,
  (newVal, oldVal) => {
    if (!oldVal) return;
    newVal.forEach(injury => {
      if (injury._id && !injury.isPlaceholder) {
        const wasInOld = oldVal.some(oldInj => oldInj._id === injury._id);
        if (!wasInOld) {
          if (!expandedInjuryIds.value.includes(injury._id)) {
            expandedInjuryIds.value.push(injury._id);
          }
        }
      }
    });
  },
  { deep: true, immediate: true }
);

const rollInjury = () => {
  
  sheet.combat.rollCriticalInjury(0);
};

const removeInjury = (id: string | undefined) => {
  if (!id) return;
  sheet.deleteEntity(id);
};
</script>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}
</style>

