<template>
  <div class="text-center p-2 border-2 border-secondary relative group hover:bg-primary-container transition-colors">
    <span class="block text-xs font-black uppercase tracking-wider text-zinc-500 truncate">
      {{ $t('sheet.slugfest_dmg') }}
    </span>
    <ModifiedValueInput
      :modifiedValue="slugfestDamageModified"
      class="font-space-grotesk font-black text-3xl leading-none text-black mt-1 text-center w-full bg-transparent border-none focus:outline-none p-0"
      unstyled
    />
    
    <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
      <RollButton
        :characterName="sheet.meta.name"
        :title="$t('sheet.slugfest_attack')"
        :components="rollComponents"
        :solver="actionDamageRollSolver"
        class="text-xs p-0.5 text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
      >
        <span class="material-symbols-outlined text-sm">casino</span>
      </RollButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ruleSets } from '@/system';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';
import RollButton from '@/components/RollButton.vue';
import { characterStore } from '@/sheet/stores';
import { actionDamageRollSolver } from '@/system/rolls/action';
import { computed } from 'vue';
import { calculateRollComponents } from '@/system/effects/calculateRollComponents';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const fighting = computed(() => ruleSets.fighting().value || 0);
const slugfestDamageModified = computed(() => ruleSets.slugfest_damage());
const slugfestDamage = computed(() => { 
  const dmg = slugfestDamageModified.value;
  if(dmg.error) return 0;
  return Number(dmg.value) || 0;
});

const actionComponents = computed(() => {
  return calculateRollComponents({
    attributes: ['fighting_roll' as any],
    baseComponents: [
      { rollFormula: `${fighting.value}d6`, label: 'Fighting' }
    ],
  });
});

const damageComponents = computed(() => {
  return calculateRollComponents({
    attributes: ['slugfest_damage_roll' as any, 'slugfest_damage' as any],
    baseComponents: [
      { value: slugfestDamage.value, label: t('sheet.slugfest_dmg') }
    ],
  });
});

const rollComponents = computed(() => {
  return {
    action: actionComponents.value,
    damage: damageComponents.value,
  };
});

const sheet = characterStore();
</script>
