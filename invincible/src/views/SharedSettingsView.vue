<template>
  <div class="flex flex-col gap-6 p-4 md:p-8 bg-background text-on-background w-full h-max">    
    <template v-if="isGM">
      <ComicPanel noPadding headerBg="bg-secondary text-white border-b-4 border-black">
        
        <div class="flex">
          <button
            type="button"
            @click="currentTab = 'initiative'"
            class="flex-1 py-3 text-center font-space-grotesk font-black uppercase text-base focus:outline-none transition-colors cursor-pointer"
            :class="currentTab !== 'initiative' ? 'bg-secondary text-secondary-disabled' : 'bg-white text-black hover:bg-zinc-100'"
          >
            Initiative
          </button>
          <button
            type="button"
            @click="currentTab = 'teams'"
            class="flex-1 py-3 text-center font-space-grotesk font-black uppercase text-base focus:outline-none transition-colors cursor-pointer"
            :class="currentTab !== 'teams' ? 'bg-secondary text-secondary-disabled' : 'bg-white text-black hover:bg-zinc-100'"
          >
            Teams
          </button>
        </div>

        
        <div class="p-6">
          
          <div v-if="currentTab === 'initiative'" class="flex flex-col gap-3">
            <div v-if="initiativesList.length === 0" class="border-2 border-dashed border-zinc-400 p-6 text-center bg-zinc-50">
              <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">No active initiatives</span>
            </div>
            <template v-else>
              <div
                v-for="entry in initiativesList"
                :key="entry.charId"
                class="group flex items-center justify-between border-2 border-black p-3 bg-white hover:bg-zinc-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div class="flex items-center gap-4">
                  <div class="relative flex-shrink-0">
                    <img
                      v-if="entry.avatar"
                      :src="entry.avatar"
                      :alt="entry.name || 'Character'"
                      class="h-10 w-10 bg-zinc-200 object-cover border border-zinc-300"
                      :title="entry.name || 'Character'"
                    />
                    <div
                      v-else
                      class="flex h-10 w-10 items-center justify-center bg-zinc-300 text-sm font-black uppercase text-black border border-zinc-400"
                      :title="entry.name || 'Character'"
                    >
                      {{ String(entry.name || 'Ch').substring(0, 2) }}
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="font-space-grotesk font-black text-lg truncate leading-none">
                      {{ entry.name || 'Unknown' }}
                    </span>
                    <span class="font-bold text-sm text-zinc-600">
                      {{ entry.initiative.length > 0 ? entry.initiative.join(', ') : '—' }}
                    </span>
                  </div>
                </div>
                <button
                  @click="deleteInitiative(entry.charId)"
                  class="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity focus:outline-none cursor-pointer flex items-center justify-center"
                  type="button"
                  title="Delete Initiative"
                >
                  <span class="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </template>
          </div>

          <!-- TEAMS TAB -->
          <div v-if="currentTab === 'teams'" class="flex flex-col gap-3">
            <div v-if="teamsList.length === 0" class="border-2 border-dashed border-zinc-400 p-6 text-center bg-zinc-50">
              <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">No teams available</span>
            </div>
            <template v-else>
              <div
                v-for="team in teamsList"
                :key="team._id"
                class="group flex items-center justify-between border-2 border-black p-3 bg-white hover:bg-zinc-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div class="flex flex-col gap-1 min-w-0">
                  <span class="font-space-grotesk font-black text-base truncate">{{ team.name }}</span>
                  
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mr-1">Members:</span>
                    <div v-if="ensureArray(team.members).length === 0" class="text-xs italic text-zinc-400">Empty</div>
                    <div v-else class="flex -space-x-1.5 overflow-hidden">
                      <div
                        v-for="member in sortMembers(team.members)"
                        :key="member._id"
                        class="relative"
                      >
                        <img
                          v-if="member.avatar"
                          :src="member.avatar"
                          :alt="member.name"
                          class="inline-block h-6 w-6 bg-zinc-200 object-cover border border-white"
                          :title="member.name"
                        />
                        <div
                          v-else
                          class="inline-flex h-6 w-6 items-center justify-center bg-zinc-300 text-[10px] font-black uppercase text-black border border-white"
                          :title="member.name"
                        >
                          {{ String(member.name || 'Ch').substring(0, 2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  @click="deleteTeam(team._id)"
                  class="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity focus:outline-none cursor-pointer flex items-center justify-center"
                  type="button"
                  title="Delete Team"
                >
                  <span class="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </ComicPanel>
    </template>
    
    <template v-else>
      <div class="border-2 border-dashed border-zinc-400 p-6 text-center bg-zinc-50">
        <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-sm">GM settings are restricted</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { sharedSettings } from '@/relay/relay';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import ComicPanel from '@/components/ComicPanel.vue';
import { ensureArray } from '@/utility/ensureArray';
import { updateSharedData } from '@/utility/updateSharedData';
import { clearInitiativeAction } from '@/system/initiative/initiative';

const meta = metaStore();
const isGM = computed(() => meta.permissions.isGM);

const currentTab = ref<'initiative' | 'teams'>('initiative');

const initiativeMap = computed(() => {
  const raw = sharedSettings.value.initiative;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) || {}; } catch { return {}; }
  }
  return raw;
});

const initiativesList = computed(() => {
  const map = initiativeMap.value;
  return Object.entries(map)
    .filter(([_, data]: [string, any]) => data && ensureArray(data.initiative).length > 0)
    .map(([charId, data]: [string, any]) => ({
      charId,
      name: data.name,
      avatar: data.avatar,
      initiative: ensureArray(data.initiative),
      timestamp: data.timestamp || 0
    }))
    .sort((a, b) => {
      
      const aMax = Math.max(...a.initiative);
      const bMax = Math.max(...b.initiative);
      if (aMax !== bMax) return bMax - aMax;
      
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
});

const deleteInitiative = async (charId: string) => {
  try {
    const updatedMap = clearInitiativeAction(charId, { ...initiativeMap.value });
    await updateSharedData({ settings: { initiative: JSON.stringify(updatedMap) } });
  } catch (err) {
    console.error('[SharedSettings] Failed to clear initiative:', err);
  }
};

const teamsList = computed(() => {
  const raw = sharedSettings.value.teams;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { return ensureArray(JSON.parse(raw)); } catch { return []; }
  }
  return ensureArray(raw);
});

const sortMembers = (members: any) => {
  return [...ensureArray(members)].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
};

const deleteTeam = async (teamId: string) => {
  try {
    const list = teamsList.value.filter((t: any) => t._id !== teamId);
    await updateSharedData({ settings: { teams: JSON.stringify(list) } });
  } catch (err) {
    console.error('[SharedSettings] Failed to delete team:', err);
  }
};
</script>

<style lang="scss" scoped>
@use '../common/scss/vars.scss';
</style>