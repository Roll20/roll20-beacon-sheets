<template>
  <GenericCollapsible
    v-model:open="isOpen"
    class="text-black border-b border-zinc-200 pb-3"
  >
    <template #summary>
      <div class="flex-1 min-w-0 flex items-center gap-2 text-left">
        
        <span class="font-space-grotesk font-black uppercase text-sm tracking-wide" :class="{'text-zinc-500': action.isDefault, 'text-black': !action.isDefault}">{{ action.name }}</span>

        
        <span v-if="action.attributeUsed && action.attributeUsed !== '-'" class="px-1.5 py-0.5 border bg-zinc-100 font-mono text-[10px] font-black uppercase tracking-wider" :class="{'border-zinc-500': action.isDefault, 'border-black': !action.isDefault}">
          {{ action.attributeUsed }}
        </span>

        
        <span v-if="action.damage" v-tooltip="'Damage'" class="px-1.5 py-0.5 border border-red-200 bg-red-50 text-red-700 font-mono text-[10px] font-black tracking-wider">
          {{ action.damage }}
        </span>
      </div>
    </template>

    <template #actions>
      
      
      <RollButton
        v-if="action.attributeUsed !== '-'"
        :characterName="characterName"
        :title="action.name"
        :isQuery="action.attributeUsed === 'varies'"
        :components="action.damage ? actionDamageComponents : actionComponents"
        :solver="action.damage ? actionDamageRollSolver : actionRollSolver"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
      >
        <span class="material-symbols-outlined text-base">casino</span>
      </RollButton>

      
      <RollButton
        v-else-if="action.damage"
        :characterName="characterName"
        :title="`${action.name} (Damage)`"
        :components="[{ rollFormula: action.damage, label: 'Damage' }]"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
      >
        <span class="material-symbols-outlined text-base">casino</span>
      </RollButton>

      
      <SendToChatButton
        :characterName="characterName"
        :title="action.name"
        :subtitle="`${action.type === 'quick' ? 'Quick Action' : 'Full Action'}${action.attributeUsed && action.attributeUsed !== '-' ? ' • ' + action.attributeUsed.toUpperCase() : ''}`"
        :textContent="action.description || 'No description'"
        :keyValues="chatKeyValues"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
      >
        <span class="material-symbols-outlined text-base">chat_bubble</span>
      </SendToChatButton>

      
      <button
        v-if="!action.isDefault"
        @click="$emit('edit')"
        v-tooltip="'Edit Action'"
        type="button"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
      >
        <span class="material-symbols-outlined text-base">edit</span>
      </button>
    </template>

    <template #content>
      
      <div class="mt-3 border-t-2 border-black pt-3 flex flex-col gap-2 text-sm text-left">
        
        <div
          v-if="action.description"
          class="prose prose-sm max-w-none font-lexend text-zinc-700 leading-relaxed text-left"
          v-html="renderedHtml"
        />
        <div v-else class="text-zinc-400 italic text-[11px] font-lexend text-left">
          No description provided.
        </div>

        
        <div class="border-t border-zinc-200 pt-2 grid grid-cols-2 gap-4 font-lexend text-xs text-zinc-500 text-left">
          <div>
            <strong class="uppercase text-zinc-700">Type:</strong> {{ action.type === 'quick' ? 'Quick Action' : 'Full Action' }}
          </div>
          <div v-if="action.attributeUsed && action.attributeUsed !== '-'">
            <strong class="uppercase text-zinc-700">Attribute Used:</strong> <span class="uppercase">{{ action.attributeUsed }}</span>
          </div>
          <div v-if="action.damage">
            <strong class="uppercase text-zinc-700">Damage:</strong> {{ action.damage }}
          </div>
          <div>
            <strong class="uppercase text-zinc-700">Source:</strong> {{ action.isDefault ? 'Default action' : 'Custom action' }}
          </div>
        </div>
      </div>
    </template>
  </GenericCollapsible>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import type { ActionItem } from '@/schemas/hydrate/actions';
import SendToChatButton from './SendToChatButton.vue';
import RollButton from './RollButton.vue';
import GenericCollapsible from './GenericCollapsible.vue';
import { useI18n } from 'vue-i18n';
import { actionRollSolver, actionDamageRollSolver } from '@/system/rolls/action';
import { ruleSets } from '@/system';

interface Props {
  action: ActionItem;
  characterName?: string;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'edit'): void;
}>();

const { t } = useI18n();

const isOpen = ref(false);

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const renderedHtml = computed(() => {
  const dirtyHtml = md.render(props.action.description || '');
  return DOMPurify.sanitize(dirtyHtml);
});

const actionComponents = computed(() => {
  const attr = props.action.attributeUsed;
  let baseDice = 0;
  let label = 'Base';
  
  if (attr !== '-' && attr !== 'varies') {
    const ruleFn = ruleSets[attr as keyof typeof ruleSets] as () => { value: number | string };
    baseDice = Number(ruleFn().value) || 0;
    label = t(`sheet.${attr}`);
  }
  
  return [
    ...(attr !== 'varies' ? [{ rollFormula: `${baseDice}d6`, label }] : []),
    ...(props.action.bonus ? [{ rollFormula: `${props.action.bonus}d6`, label: 'Bonus' }] : [])
  ];
});

const actionDamageComponents = computed(() => {
  const attr = props.action.attributeUsed;
  let baseDice = 0;
  let label = 'Base';
  
  if (attr !== '-' && attr !== 'varies') {
    const ruleFn = ruleSets[attr as keyof typeof ruleSets] as () => { value: number | string };
    baseDice = Number(ruleFn().value) || 0;
    label = t(`sheet.${attr}`);
  }
  
  return {
    action: [
      ...(attr !== 'varies' ? [{ rollFormula: `${baseDice}d6`, label }] : []),
      ...(props.action.bonus ? [{ rollFormula: `${props.action.bonus}d6`, label: 'Bonus' }] : [])
    ],
    damage: [
      { rollFormula: props.action.damage || '0', label: 'Damage' }
    ]
  };
});

const chatKeyValues = computed(() => {
  const kv: Record<string, string | number | boolean> = {};
  if (props.action.attributeUsed && props.action.attributeUsed !== '-') {
    kv['Attribute Used'] = props.action.attributeUsed.toUpperCase();
  }
  if (props.action.damage) {
    kv['Damage'] = props.action.damage;
  }
  kv['Action Type'] = props.action.type === 'quick' ? 'Quick Action' : 'Full Action';
  return kv;
});
</script>

