<template>
  <GenericCollapsible
    v-model:open="isOpen"
    :class="[
      'text-black border-b border-zinc-200 pb-3 transition-opacity duration-200',
      { 'animate-pulse opacity-75': injury.isPlaceholder }
    ]"
  >
    <template #summary>
      <div class="flex-1 min-w-0 flex items-center gap-2 text-left">
        
        <span
          v-if="injury.isPlaceholder"
          class="material-symbols-outlined text-accent animate-spin text-xl shrink-0"
          style="animation-duration: 2s;"
        >
          casino
        </span>
        
        
        <span class="font-space-grotesk font-black uppercase text-base tracking-wide text-black">
          {{ injury.name }}
        </span>
      </div>
    </template>

    <template #actions>
      
      <button
        v-if="!injury.isPlaceholder"
        @click="$emit('remove')"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors focus:outline-none cursor-pointer"
        type="button"
        v-tooltip="'Remove Injury'"
      >
        <span class="material-symbols-outlined text-base">delete</span>
      </button>
    </template>

    <template #content>
      
      <div class="mt-3 border-t-2 border-black pt-3 flex flex-col gap-2 text-sm text-left">
        
        <p v-if="injury.description" class="font-lexend text-zinc-700 leading-relaxed text-left italic">
          {{ injury.description }}
        </p>
        <div v-else class="text-zinc-400 italic text-[11px] font-lexend text-left">
          No description provided.
        </div>

        
        <div class="border-t border-zinc-200 pt-2 flex flex-col gap-2 text-left">
          <div v-if="injury.healingTime && injury.healingTime !== '-'" class="font-lexend text-xs text-zinc-500">
            <strong class="uppercase text-zinc-700">Healing Time:</strong> {{ injury.healingTime }}
          </div>

          
          <div v-if="injury.effects?.value?.length > 0" class="space-y-1">
            <strong class="uppercase text-zinc-700 text-xs">Penalties:</strong>
            <div class="flex flex-wrap gap-1.5">
              <div
                v-for="eff in injury.effects.value"
                :key="eff._id"
                class="px-1.5 py-0.5 border bg-zinc-100 font-mono text-[10px] font-black uppercase tracking-wider"
              >
                <span
                  :class="{
                    'line-through text-zinc-400 font-normal': eff.disabled,
                    'text-black': !eff.disabled
                  }"
                >
                  {{ $t(`modifiers.${eff.attribute}`) }} {{ eff.operation === 'subtract' ? '-' : '+' }}{{ eff.value }}
                </span>
                <span
                  v-if="eff.disabled"
                  class="text-[7px] bg-zinc-200 text-zinc-500 px-1 py-0.2 border border-zinc-300 font-bold uppercase tracking-wider scale-95"
                >
                  Suppressed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </GenericCollapsible>
</template>

<script lang="ts" setup>
import type { InjuryItem } from '@/schemas/hydrate/injury';
import GenericCollapsible from './GenericCollapsible.vue';

interface Props {
  injury: InjuryItem;
}

defineProps<Props>();

defineEmits<{
  (e: 'remove'): void;
}>();

const isOpen = defineModel<boolean>('open', { default: false });
</script>
