<template>
  <ComicPanel class="vital-stats-panel">
    <div class="space-y-6">
      
      <div class="space-y-1 vital-stats-top-item">
        <div class="flex justify-between items-end mb-1">
          <span class="font-space-grotesk font-black uppercase text-sm tracking-wider text-zinc-800">{{ $t('sheet.health') }}</span>
          <div class="flex items-center gap-1 font-space-grotesk font-black">
            <LazyInput v-model="sheet.combat.health" :isNumber="true" :isIncremental="true" :max="modifiedHealthMax" class="text-right pr-4 font-space-grotesk font-black text-3xl leading-none text-blacktext-left bg-transparent border-none focus:outline-none p-0 w-16" />
            <span class="font-space-grotesk font-black text-3xl leading-none text-zinc-500">/</span>
            <ModifiedValueInput
              :modifiedValue="healthMaxModified"
              unstyled
              class="font-space-grotesk font-black text-3xl leading-none text-zinc-500 text-right bg-transparent border-none focus:outline-none p-0 w-9"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="sheet.combat.health--"
            class="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xl focus:outline-none cursor-pointer"
            type="button"
          >
            -
          </button>
          <div class="flex-1 h-6 border-2 border-black bg-zinc-100 relative overflow-hidden">
            <div
              class="health-bar-fill absolute inset-y-0 left-0 bg-accent"
              :class="{ 'is-damage': isDamage }"
              :style="{ '--health-pct': healthPct }"
              :key="barAnimKey"
            ></div>
            <div class="absolute inset-0 halftone"></div>
          </div>
          <button
            @click="sheet.combat.health < modifiedHealthMax && sheet.combat.health++"
            class="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xl focus:outline-none cursor-pointer"
            type="button"
          >
            +
          </button>
        </div>
      </div>

      
      <div class="space-y-1 vital-stats-top-item">
        <div class="flex justify-between items-end mb-1">
          <span class="font-space-grotesk font-black uppercase text-sm tracking-wider text-zinc-800">{{ $t('sheet.resolve') }}</span>
          <div class="flex items-center gap-1 font-space-grotesk font-black">
            <LazyInput v-model="sheet.combat.resolve" :isNumber="true" :isIncremental="true" :min="0" :max="modifiedResolveMax" class="text-right pr-4 font-space-grotesk font-black text-3xl leading-none text-blacktext-left bg-transparent border-none focus:outline-none p-0 w-16" />
            <span class="font-space-grotesk font-black text-3xl leading-none text-zinc-500">/</span>
            <ModifiedValueInput
              :modifiedValue="resolveMaxModified"
              unstyled
              class="font-space-grotesk font-black text-3xl leading-none text-zinc-500 text-right bg-transparent border-none focus:outline-none p-0 w-9"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="sheet.combat.resolve > 0 && sheet.combat.resolve--"
            class="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xl focus:outline-none cursor-pointer"
            type="button"
          >
            -
          </button>
          <div class="flex-1 h-6 border-2 border-black bg-zinc-100 relative overflow-hidden">
            <div
              class="absolute inset-0 bg-[#0055ff] transition-all duration-300"
              :style="{ width: `${Math.min(100, Math.max(0, (sheet.combat.resolve / modifiedResolveMax) * 100))}%` }"
            ></div>
            <div class="absolute inset-0 halftone"></div>
          </div>
          <button
            @click="sheet.combat.resolve < modifiedResolveMax && sheet.combat.resolve++"
            class="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xl focus:outline-none cursor-pointer"
            type="button"
          >
            +
          </button>
        </div>
      </div>

      
      <div class="grid grid-cols-[2fr_minmax(min-content,1fr)_2fr] gap-4 vital-stats-top-item">
        <SlugfestDmg />
        <ArmorPane/>
        <InitiativePane/>
      </div>

      
      <InjuryPane class="pt-4 border-t-2 border-black border-dashed injury-pane-section" />
    </div>
  </ComicPanel>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import ComicPanel from '@/components/ComicPanel.vue';
import LazyInput from '@/components/LazyInput.vue';
import SlugfestDmg from '@/components/SlugfestDmg.vue';
import ArmorPane from '@/components/ArmorPane.vue';
import InjuryPane from '@/components/InjuryPane.vue';
import { characterStore } from '@/sheet/stores';
import { ruleSets } from '@/system';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';
import { modifiedHealthMax, modifiedResolveMax } from '@/sheet/stores/combat/combatStore';
import InitiativePane from '@/components/InitiativePane.vue';

const sheet = characterStore();

const healthMaxModified = computed(() => ruleSets.health_max());
const resolveMaxModified = computed(() => ruleSets.resolve_max());

const healthPct = computed(() => {
  const max = modifiedHealthMax.value || 1;
  return Math.min(1, Math.max(0, sheet.combat.health / max));
});

const isDamage  = ref(false);
const barAnimKey = ref(0);
watch(
  () => sheet.combat.health,
  (newVal, oldVal) => {
    if (newVal !== undefined && oldVal !== undefined) {
      isDamage.value = newVal < oldVal;
      if (newVal < oldVal) barAnimKey.value++; 
    }
  },
);
</script>

<style lang="scss" scoped>

.health-bar-fill {
  width: 100%;
  transform: scaleX(var(--health-pct, 1));
  transform-origin: left;
  transition: transform 300ms ease;
}

.health-bar-fill.is-damage {
  
  animation: bar-bounce 0.75s ease-out;
}

@keyframes bar-bounce {
  0%   { transform: scaleX(var(--health-pct, 1)); }
  16%  { transform: scaleX(calc(var(--health-pct, 1) * 1.18)); }
  33%  { transform: scaleX(calc(var(--health-pct, 1) * 0.90)); }
  50%  { transform: scaleX(calc(var(--health-pct, 1) * 1.09)); }
  67%  { transform: scaleX(calc(var(--health-pct, 1) * 0.96)); }
  83%  { transform: scaleX(calc(var(--health-pct, 1) * 1.03)); }
  100% { transform: scaleX(var(--health-pct, 1)); }
}
</style>
