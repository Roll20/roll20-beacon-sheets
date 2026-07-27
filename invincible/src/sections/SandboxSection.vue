<template>
  <div class="space-y-4">
    <ComicPanel title="Developer Tools & Offline Sandbox" noPadding headerBg="bg-zinc-800 text-white border-b-4 border-black">
    <template #header-icon>
      <span class="material-symbols-outlined">bug_report</span>
    </template>
    <div class="p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4 text-black">
          <h4 class="font-space-grotesk font-black text-sm uppercase tracking-wider text-zinc-500 border-b pb-1">Effects</h4>
          <div class="flex flex-col gap-3 pr-2">
            <div
              v-for="effect in allEffectsList"
              :key="effect._id || (effect.attribute + '-' + effect.operation + '-' + effect.value)"
              class="flex flex-col gap-1 bg-white border-2 border-black p-3 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs uppercase tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 rounded">
                  {{ effect.label || 'Unnamed Source' }}
                </span>
                <button
                  v-if="effect._id"
                  @click="toggleEffect(effect)"
                  :class="[
                    'px-2 py-0.5 border-2 border-black font-black text-[10px] uppercase rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                    effect.disabled ? 'bg-red-400 hover:bg-red-500 text-black' : 'bg-emerald-400 hover:bg-emerald-500 text-black'
                  ]"
                >
                  {{ effect.disabled ? 'Disabled' : 'Enabled' }}
                </button>
                <span v-else class="text-[9px] font-bold text-zinc-400 uppercase italic">
                  Read-Only (String-based)
                </span>
              </div>
              <div class="flex items-center justify-between text-xs font-mono text-zinc-700 mt-1">
                <span>{{ effect.attribute }} {{ effect.operation }} {{ effect.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4 text-black">
          <h4 class="font-space-grotesk font-black text-sm uppercase tracking-wider text-zinc-500 border-b pb-1">Compendium & Effects Editor</h4>
          <CompendiumDropper />
          <EffectEditor v-model="sheet.sample.effects" />
          
          <div class="pt-4 border-t border-zinc-200">
            <h4 class="font-space-grotesk font-black text-sm uppercase tracking-wider text-zinc-500 mb-2">Sheet Mode</h4>
            <div class="flex gap-2">
              <button
                @click="sheet.settings.mode = 'normal'"
                type="button"
                class="flex-1 h-10 border-2 border-black font-space-grotesk font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus:outline-none"
                :class="sheet.settings.mode === 'normal' ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'"
              >
                Normal
              </button>
              <button
                @click="sheet.settings.mode = 'compact'"
                type="button"
                class="flex-1 h-10 border-2 border-black font-space-grotesk font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus:outline-none"
                :class="sheet.settings.mode === 'compact' ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'"
              >
                Compact
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-zinc-200">
            <h4 class="font-space-grotesk font-black text-sm uppercase tracking-wider text-zinc-500 mb-2">Debug Actions</h4>
            <div class="flex flex-col gap-2">
              <button
                @click="clearTeamsSharedSettings"
                type="button"
                class="w-full h-10 border-2 border-black bg-red-500 hover:bg-red-600 text-white font-space-grotesk font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus:outline-none"
              >
                Reset Teams Shared Data
              </button>
              <button
                @click="clearInitiativeSharedSettings"
                type="button"
                class="w-full h-10 border-2 border-black bg-red-500 hover:bg-red-600 text-white font-space-grotesk font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus:outline-none"
              >
                Reset Initiative Shared Data
              </button>
              <button
                @click="clearRollsSharedSettings"
                type="button"
                class="w-full h-10 border-2 border-black bg-red-500 hover:bg-red-600 text-white font-space-grotesk font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer focus:outline-none"
              >
                Reset Rolls Shared Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-zinc-200">
        <span class="font-bold text-sm uppercase text-zinc-700 block mb-2">Character Database Output</span>
        <pre class="bg-zinc-900 text-green-400 p-4 rounded border font-mono text-xs overflow-auto max-h-60 whitespace-pre-wrap">{{ characterData }}</pre>
      </div>

      <div class="pt-4 border-t border-zinc-200">
        <span class="font-bold text-sm uppercase text-zinc-700 block mb-2">Campaign Teams Shared Settings</span>
        <pre class="bg-zinc-900 text-green-400 p-4 rounded border font-mono text-xs overflow-auto max-h-60 whitespace-pre-wrap">{{ formattedTeamsData }}</pre>
      </div>

      <div class="pt-4 border-t border-zinc-200">
        <span class="font-bold text-sm uppercase text-zinc-700 block mb-2">Campaign Initiative Shared Settings</span>
        <pre class="bg-zinc-900 text-green-400 p-4 rounded border font-mono text-xs overflow-auto max-h-60 whitespace-pre-wrap">{{ formattedInitiativeData }}</pre>
      </div>

      <div class="pt-4 border-t border-zinc-200">
        <span class="font-bold text-sm uppercase text-zinc-700 block mb-2">Campaign Rolls Shared Settings</span>
        <pre class="bg-zinc-900 text-green-400 p-4 rounded border font-mono text-xs overflow-auto max-h-60 whitespace-pre-wrap">{{ formattedRollsData }}</pre>
      </div>
    </div>
    </ComicPanel>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import ComicPanel from '@/components/ComicPanel.vue';
import CompendiumDropper from '@/components/CompendiumDropper.vue';
import EffectEditor from '@/components/EffectEditor.vue';
import { characterStore, getCharacterData } from '@/sheet/stores';
import { resolveExpression } from '@/system/expression/resolveExpression';
import { ruleSets } from '@/system';
import { sharedSettings, dispatchRef } from '@/relay/relay';
import { updateSharedData } from '@/utility/updateSharedData';

const clearTeamsSharedSettings = async () => {
  console.log('[DEBUG] clearTeamsSharedSettings invoked');
  const dispatch = dispatchRef.value;
  sharedSettings.value = { ...sharedSettings.value, teams: [] };
  try {
    await updateSharedData({ settings: { teams: JSON.stringify([]) } });
    console.log('[DEBUG] Successfully completed updateSharedData for teams');
  } catch (err) {
    console.error('[DEBUG] Error while running updateSharedData for teams:', err);
  }
};

const clearInitiativeSharedSettings = async () => {
  console.log('[DEBUG] clearInitiativeSharedSettings invoked');
  const dispatch = dispatchRef.value;
  sharedSettings.value = { ...sharedSettings.value, initiative: {} };
  try {
    await updateSharedData({ settings: { initiative: JSON.stringify({}) } });
    console.log('[DEBUG] Successfully completed updateSharedData for initiative');
  } catch (err) {
    console.error('[DEBUG] Error while running updateSharedData for initiative:', err);
  }
};

const clearRollsSharedSettings = async () => {
  console.log('[DEBUG] clearRollsSharedSettings invoked');
  const dispatch = dispatchRef.value;
  sharedSettings.value = { ...sharedSettings.value, rolls: {} };
  try {
    await updateSharedData({ settings: { rolls: JSON.stringify({}) } });
    console.log('[DEBUG] Successfully completed updateSharedData for rolls');
  } catch (err) {
    console.error('[DEBUG] Error while running updateSharedData for rolls:', err);
  }
};

const sheet = characterStore();

const expressionSource = ref('');
const expressionResult = ref<any>({ value: '' });

const allEffectsList = computed(() => {
  return ruleSets.effects({});
});

const toggleEffect = (effect: any) => {
  const targetId = effect._id;
  if (!targetId) return;

  
  if (sheet.sample.effects?.value) {
    const found = sheet.sample.effects.value.find(e => e._id === targetId);
    if (found) {
      found.disabled = !found.disabled;
      return;
    }
  }

  
  if (sheet.effects.effects?.value) {
    const found = sheet.effects.effects.value.find(e => e._id === targetId);
    if (found) {
      found.disabled = !found.disabled;
      return;
    }
  }

  
  if (sheet.powers.list) {
    for (const power of sheet.powers.list) {
      if (power.effects?.value) {
        const found = power.effects.value.find(e => e._id === targetId);
        if (found) {
          found.disabled = !found.disabled;
          return;
        }
      }
      if (power.modifiers) {
        for (const mod of power.modifiers) {
          if (mod.effects?.value) {
            const found = mod.effects.value.find(e => e._id === targetId);
            if (found) {
              found.disabled = !found.disabled;
              return;
            }
          }
        }
      }
    }
  }

  
  if (sheet.combat.criticalInjuries) {
    for (const injury of sheet.combat.criticalInjuries) {
      if (injury.effects?.value) {
        const found = injury.effects.value.find(e => e._id === targetId);
        if (found) {
          found.disabled = !found.disabled;
          return;
        }
      }
    }
  }

  
  if (sheet.features.list) {
    for (const feature of sheet.features.list) {
      if (feature.effects?.value) {
        const found = feature.effects.value.find(e => e._id === targetId);
        if (found) {
          found.disabled = !found.disabled;
          return;
        }
      }
    }
  }
};

const formattedTeamsData = computed(() => {
  const raw = sharedSettings.value.teams;
  if (!raw) return '[]';
  if (typeof raw === 'string') {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  return JSON.stringify(raw, null, 2);
});

const formattedInitiativeData = computed(() => {
  const raw = sharedSettings.value.initiative;
  if (!raw) return '{}';
  if (typeof raw === 'string') {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  return JSON.stringify(raw, null, 2);
});

const formattedRollsData = computed(() => {
  const raw = sharedSettings.value.rolls;
  if (!raw) return '{}';
  if (typeof raw === 'string') {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  return JSON.stringify(raw, null, 2);
});

watch(expressionSource, () => {
  expressionResult.value = resolveExpression(expressionSource.value);
});

const characterData = computed(() => {
  try {
    const c = getCharacterData();
    return JSON.stringify(c, null, 2);
  } catch (err: any) {
    return `Error: ${err.message || err}`;
  }
});
</script>
