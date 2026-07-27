<template>
  <div class="text-center p-2 border-2 border-secondary relative group hover:bg-primary-container transition-colors select-none overflow-hidden">
    <span class="block text-xs font-black uppercase tracking-wider text-zinc-500 truncate">{{ $t('sheet.initiative') }}</span>
    <div class="font-space-grotesk font-black text-3xl leading-none text-black mt-1 h-8 flex items-center justify-center">
      {{ myInitiatives.length > 0 ? myInitiatives.join(', ') : '—' }}
    </div>
    
    <div class="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        v-if="myInitiatives.length > 0"
        @click="clearInitiative"
        class="text-red-600 hover:text-red-800 focus:outline-none cursor-pointer flex items-center justify-center p-0.5"
        type="button"
        title="Clear Initiative"
      >
        <span class="material-symbols-outlined text-base">delete</span>
      </button>
    </div>
    
    <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        @click="rollInitiative"
        class="text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer flex items-center justify-center p-0.5"
        type="button"
        title="Roll Initiative"
      >
        <span class="material-symbols-outlined text-base">casino</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { characterStore } from '@/sheet/stores';
import { sharedSettings, dispatchRef } from '@/relay/relay';
import { rollInitiativeAction, clearInitiativeAction, resolveDuplicatesAction } from '@/system/initiative/initiative';
import sendToChat from '@/utility/sendToChat';
import { useI18n } from 'vue-i18n';
import { ensureArray } from '@/utility/ensureArray';
import { updateSharedData } from '@/utility/updateSharedData';

const { t } = useI18n();
const sheet = characterStore();

const initiativeMap = computed(() => {
  const raw = sharedSettings.value.initiative;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }
  return raw;
});

const myInitiatives = computed(() => {
  const myCharId = sheet.meta.id;
  if (!myCharId) return [];
  const myData = initiativeMap.value[myCharId];
  return myData ? ensureArray(myData.initiative) : [];
});

const rollInitiative = async () => {
  const myCharId = sheet.meta.id;
  if (!myCharId) return;
  const dispatch = dispatchRef.value;
  let currentMap = { ...initiativeMap.value };
  const updatedMap = await rollInitiativeAction(myCharId, currentMap, dispatch, sheet.meta.avatar, sheet.meta.name);

  const oldList = ensureArray(currentMap[myCharId]?.initiative);
  const newList = ensureArray(updatedMap[myCharId]?.initiative);
  const rolledValue = newList.length > oldList.length ? newList[newList.length - 1] : null;

  try {
    await updateSharedData({ settings: { initiative: JSON.stringify(updatedMap) } });
  } catch (err) {
    console.error('[initiative] Failed to update initiative settings on roll:', err);
  }

  if (rolledValue !== null) {
    try {
      await sendToChat({
        characterName: sheet.meta.name,
        title: t('sheet.initiative'),
        rollTemplate: 'numberOnly',
        total: rolledValue
      }, dispatch);
    } catch (err) {
      console.error('[initiative] Failed to send initiative roll to chat:', err);
    }
  }
};

const clearInitiative = async () => {
  const myCharId = sheet.meta.id;
  if (!myCharId) return;
  const dispatch = dispatchRef.value;
  let currentMap = { ...initiativeMap.value };
  
  const updatedMap = clearInitiativeAction(myCharId, currentMap);

  try {
    await updateSharedData({ settings: { initiative: JSON.stringify(updatedMap) } });
  } catch (err) {
    console.error('[initiative] Failed to clear initiative settings:', err);
  }
};

let isResolving = false;
const resolveLocalDuplicates = async () => {
  if (isResolving) return;
  isResolving = true;
  try {
    const myCharId = sheet.meta.id;
    if (!myCharId) return;
    const dispatch = dispatchRef.value;
    const currentMap = { ...initiativeMap.value };

    const { changed, updatedMap } = await resolveDuplicatesAction(myCharId, currentMap, dispatch);

    if (changed) {
      try {
        await updateSharedData({ settings: { initiative: JSON.stringify(updatedMap) } });
      } catch (err) {
        console.error('[initiative] Failed to update initiative settings on resolving duplicates:', err);
      }
    }
  } finally {
    isResolving = false;
  }
};

watch(
  () => initiativeMap.value,
  async (newVal) => {
    if (!newVal) return;
    await resolveLocalDuplicates();
  },
  { deep: true }
);
</script>
