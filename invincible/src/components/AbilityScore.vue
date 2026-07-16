<template>
  <div class="border-2 border-secondary p-2 bg-zinc-50 relative group select-none hover:bg-primary-container transition-colors">
    <div class="flex flex-col h-full items-center justify-between text-center gap-1 py-1">
      <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        
        <RollButton
          v-if="rollable"
          :characterName="characterName"
          :title="`${$t(`abilities.${modifiedValue.key}`)} Check`"
          :components="rollComponents"
          :solver="actionRollSolver"
          class="text-xs p-0.5 text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
        >
          <span class="material-symbols-outlined text-sm">casino</span>
        </RollButton>
      </div>

      
      <span
        class="text-xs uppercase tracking-wider block leading-none text-zinc-500"
      >
        {{ showFull ? $t(`score_description.${modifiedValue.description}`) : $t(`score_description.${modifiedValue.description}_short`) }}
      </span>

      <span class="text-xs font-black uppercase text-zinc-700 tracking-wider block leading-none">
        {{ showFull ? $t(`abilities.${modifiedValue.key}`) : $t(`abilities.${modifiedValue.key}_short`) }}
      </span>

      
      <ModifiedValueInput
        :modifiedValue="modifiedValue"
        unstyled
        class="font-space-grotesk font-black text-3xl leading-none text-black mt-1 text-center w-full bg-transparent border-none focus:outline-none p-0"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import RollButton from '@/components/RollButton.vue';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';
import { calculateRollComponents } from '@/system/effects/calculateRollComponents';
import type { AttributeValue } from '@/system/abilities/attributeRule';
import { useI18n } from 'vue-i18n';
import { actionRollSolver } from '@/system/rolls/action';

const { t } = useI18n();

interface Props {
  modifiedValue: AttributeValue;
  baseValue: number;
  characterName?: string;
  rollable?: boolean;
  showFull?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  characterName: 'Hero',
  rollable: true,
  showFull: false,
});

const rollComponents = computed(() => {
  const attributeKey = props.modifiedValue.key; 
  const label = t(`abilities.${attributeKey}`);
  
  return calculateRollComponents({
    attributes: [`${attributeKey}_roll` as any],
    baseComponents: [
      { rollFormula: `${props.modifiedValue.value}d6`, label }
    ],
  });
});
</script>
