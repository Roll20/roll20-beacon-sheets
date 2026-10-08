<template>
  <section class="team-section">
    
    <div class="flex justify-between items-center">
      <h2><ComicTitle text="Team" /></h2>
      
      
      <button
        @click="!myTeam ? isJoinModalOpen = true : handleLeaveTeam()"
        class="w-8 h-8 flex items-center justify-center border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground action-shadow-sm transition-all focus:outline-none font-bold cursor-pointer active:translate-y-0.5"
        type="button"
        v-tooltip="!myTeam ? 'Join Team' : 'Leave Team'"
      >
        <span class="material-symbols-outlined text-base font-black">{{ !myTeam ? 'add' : 'close_small' }}</span>
      </button>
    </div>

    
    <ComicPanel>
      
      <div v-if="!myTeam" class="bg-zinc-100 border-2 border-dashed border-zinc-400 p-8 text-center">
        <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs block">
          Not part of a team yet
        </span>
      </div>

      
      <div v-else class="space-y-6 text-black">
        <div class="flex flex-col gap-3">
          
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col w-full">
              <span class="text-xs uppercase font-space-grotesk font-black text-zinc-500 tracking-wider">Active Team</span>
              <LazyInput
                :model-value="myTeam.name"
                @update:model-value="handleTeamNameUpdate"
                class="font-space-grotesk font-black text-2xl uppercase tracking-wide leading-tight border-0 border-b border-transparent hover:border-zinc-400 focus:border-black bg-transparent p-0 focus:outline-none w-full"
              />
            </div>
          </div>

          
          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="member in sortedMembers"
                :key="member._id"
                class="flex items-center gap-3 border-2 border-black p-2 bg-zinc-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                
                <img
                  v-if="member.avatar"
                  :src="member.avatar"
                  :alt="member.name"
                  class="w-10 h-10 border border-zinc-400 object-cover bg-zinc-200"
                />
                <div
                  v-else
                  class="w-10 h-10 border border-zinc-400 bg-zinc-300 flex items-center justify-center font-black uppercase text-sm text-black"
                >
                  {{ member.name.substring(0, 2) }}
                </div>

                
                <div class="flex flex-col min-w-0">
                  <span class="font-space-grotesk font-black text-sm truncate">{{ member.name }}</span>
                  <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">{{ member.civilianName || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="space-y-4 power-source">
          <h3 class="font-space-grotesk font-black text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-zinc-200 pb-1">
            <span class="material-symbols-outlined text-sm">dataset</span>
            base
          </h3>
          <LazyTextarea
            v-model="baseDescription"
            rows="5"
            class="w-full text-sm font-lexend leading-relaxed bg-transparent focus:outline-none border border-transparent hover:border-t-zinc-400 hover:border-b-zinc-400 focus-within:border-t-black! focus-within:border-b-black! resize-y font-bold text-black py-0 pl-0 transition-colors"
            :placeholder="'How does your team base look like?'"
          />
        </div>
        <div class="space-y-3 pt-4 border-t-2 border-black border-dashed">
          <div class="flex justify-between items-center">
            <h3 class="font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">bedroom_child</span>
              Base Features
            </h3>
            <button
              @click="openAddFeature()"
              class="w-6 h-6 flex items-center justify-center border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground action-shadow transition-all focus:outline-none font-bold cursor-pointer"
              type="button"
              title="Add Base Feature"
            >
              <span class="material-symbols-outlined text-xs font-black">add</span>
            </button>
          </div>

          
          <div v-if="!myTeam.baseFeatures || myTeam.baseFeatures.length === 0" class="border-2 border-dashed border-zinc-300 p-4 text-center bg-zinc-55">
            <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-[10px]">No base features added yet</span>
          </div>

          
          <div v-else class="flex flex-col">
            <GenericCollapsible
              v-for="feature in myTeam.baseFeatures"
              :key="feature._id"
              class="text-black border-b border-zinc-200 pb-3"
            >
              
              <template #summary>
                <div class="flex-1 min-w-0 flex items-center gap-2 text-left">
                  <span class="font-space-grotesk font-black uppercase text-sm tracking-wide">
                    {{ feature.name }}
                  </span>
                </div>
              </template>

              <!-- Hover actions: Send to Chat + Edit -->
              <template #actions>
                <SendToChatButton
                  :characterName="sheet.meta.name"
                  :title="feature.name"
                  subtitle="Team Feature"
                  :textContent="feature.description || 'No description'"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-base">chat_bubble</span>
                </SendToChatButton>
                <button
                  @click.stop="openEditFeature(feature)"
                  type="button"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 active:bg-zinc-300 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer focus:outline-none"
                >
                  <span class="material-symbols-outlined text-base">edit</span>
                </button>
              </template>

              <!-- Body: description -->
              <template #content>
                <div class="mt-3 border-t-2 border-black pt-3 text-sm text-left">
                  <p
                    v-if="feature.description"
                    class="font-lexend text-zinc-700 text-xs leading-relaxed whitespace-pre-wrap"
                  >
                    {{ feature.description }}
                  </p>
                  <p v-else class="text-zinc-400 italic text-[11px] font-lexend">
                    No description provided.
                  </p>
                </div>
              </template>
            </GenericCollapsible>
          </div>
        </div>
      </div>
    </ComicPanel>

    <!-- Modals -->
    <JoinTeamModal :show="isJoinModalOpen" @close="isJoinModalOpen = false" />
    <EditTeamFeatureModal
      :show="isFeatureModalOpen"
      :feature="editingFeature"
      :isNew="isNewFeature"
      @close="isFeatureModalOpen = false"
      @save="handleSaveFeature"
      @delete="handleDeleteTeamFeature"
    />
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import ComicTitle from '@/components/ComicTitle.vue';
import ComicPanel from '@/components/ComicPanel.vue';
import GenericCollapsible from '@/components/GenericCollapsible.vue';
import SendToChatButton from '@/components/SendToChatButton.vue';
import LazyInput from '@/components/LazyInput.vue';
import JoinTeamModal from '@/components/JoinTeamModal.vue';
import EditTeamFeatureModal from '@/sections/EditTeamFeatureModal.vue';
import { characterStore } from '@/sheet/stores';
import { sharedSettings, dispatchRef } from '@/relay/relay';
import { ensureArray } from '@/utility/ensureArray';
import { updateSharedData } from '@/utility/updateSharedData';
import LazyTextarea from '@/components/LazyTextarea.vue';

const sheet = characterStore();
const isJoinModalOpen = ref(false);
const isFeatureModalOpen = ref(false);
const isNewFeature = ref(false);
const editingFeature = ref<{ _id: string; name: string; description: string } | null>(null);

const openAddFeature = () => {
  isNewFeature.value = true;
  editingFeature.value = null;
  isFeatureModalOpen.value = true;
};

const openEditFeature = (feature: { _id: string; name: string; description: string }) => {
  isNewFeature.value = false;
  editingFeature.value = { ...feature };
  isFeatureModalOpen.value = true;
};

const teams = computed(() => {
  const raw = sharedSettings.value.teams;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return ensureArray(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return ensureArray(raw);
});

const myTeam = computed(() => {
  return teams.value.find((t: any) => ensureArray(t.members).some((m: any) => m._id === sheet.meta.id));
});

const sortedMembers = computed(() => {
  if (!myTeam.value) return [];
  const members = ensureArray(myTeam.value.members);
  return [...members].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
});

const handleLeaveTeam = async () => {
  const dispatch = dispatchRef.value;
  if (!myTeam.value) return;

  const leavingTeamId = myTeam.value._id;
  let list = [...teams.value];

  list = list.map((t: any) => {
    if (t._id === leavingTeamId) {
      return {
        ...t,
        members: ensureArray(t.members).filter((m: any) => m._id !== sheet.meta.id)
      };
    }
    return t;
  }).filter((t: any) => ensureArray(t.members).length > 0); 

  
  sharedSettings.value = { ...sharedSettings.value, teams: list };

  try {
    if (dispatch && typeof dispatch.updateSharedSettings === 'function') {
      await dispatch.updateSharedSettings({ settings: { teams: JSON.stringify(list) } });
    }
  } catch (err) {
    console.error('[teams] Failed to update settings on leaving team:', err);
  }
};

const handleTeamNameUpdate = async (newName: string | number) => {
  const dispatch = dispatchRef.value;
  const nameStr = String(newName).trim();
  if (!myTeam.value || !nameStr) return;

  const list = teams.value.map((t: any) =>
    t._id === myTeam.value._id ? { ...t, name: nameStr } : t
  );

  sharedSettings.value = { ...sharedSettings.value, teams: list };

  try {
    if (dispatch && typeof dispatch.updateSharedSettings === 'function') {
      await dispatch.updateSharedSettings({ settings: { teams: JSON.stringify(list) } });
    }
  } catch (err) {
    console.error('[teams] Failed to update team name:', err);
  }
};

const handleSaveFeature = async (data: { name: string; description: string }) => {
  const dispatch = dispatchRef.value;
  if (!myTeam.value) return;

  const list = teams.value.map((t: any) => {
    if (t._id === myTeam.value._id) {
      if (isNewFeature.value) {
        
        const baseFeatures = [...ensureArray(t.baseFeatures)];
        baseFeatures.push({ _id: uuidv4(), name: data.name, description: data.description });
        return { ...t, baseFeatures };
      } else if (editingFeature.value) {
        
        const baseFeatures = ensureArray(t.baseFeatures).map((f: any) =>
          f._id === editingFeature.value!._id
            ? { ...f, name: data.name, description: data.description }
            : f
        );
        return { ...t, baseFeatures };
      }
    }
    return t;
  });

  sharedSettings.value = { ...sharedSettings.value, teams: list };

  try {
    await updateSharedData({ settings: { teams: JSON.stringify(list) } });
  } catch (err) {
    console.error('[teams] Failed to update settings on saving team feature:', err);
  }

  isFeatureModalOpen.value = false;
};

const handleDeleteTeamFeature = async (featureId: string) => {
  const dispatch = dispatchRef.value;
  if (!myTeam.value) return;

  const list = teams.value.map((t: any) => {
    if (t._id === myTeam.value._id) {
      return {
        ...t,
        baseFeatures: ensureArray(t.baseFeatures).filter((f: any) => f._id !== featureId)
      };
    }
    return t;
  });

  
  sharedSettings.value = { ...sharedSettings.value, teams: list };

  try {
    await updateSharedData({ settings: { teams: JSON.stringify(list) } });
  } catch (err) {
    console.error('[teams] Failed to update settings on deleting team feature:', err);
  }
};

let isValidating = false;
const validateAndCleanTeams = async () => {
  if (isValidating) return;
  isValidating = true;
  try {
    const raw = sharedSettings.value.teams;
    if (raw) {
      await updateSharedData({ settings: { teams: typeof raw === 'string' ? raw : JSON.stringify(raw) } });
    }
  } catch (err) {
    console.error('[teams] Failed to clean up deleted team members:', err);
  } finally {
    isValidating = false;
  }
};

const handleBaseUpdate = async (newVal: string) => {
  const dispatch = dispatchRef.value;
  if (!myTeam.value) return;

  const list = teams.value.map((t: any) =>
    t._id === myTeam.value._id ? { ...t, base: newVal } : t
  );

  sharedSettings.value = { ...sharedSettings.value, teams: list };

  try {
    await updateSharedData({ settings: { teams: JSON.stringify(list) } });
  } catch (err) {
    console.error('[teams] Failed to update team base:', err);
  }
};

const baseDescription = computed({
  get() {
    return myTeam.value?.base || '';
  },
  set(newVal: string) {
    handleBaseUpdate(newVal);
  }
});

let hasCleanedOnLoad = false;
watch(
  () => sharedSettings.value.teams,
  async (newVal) => {
    const arr = ensureArray(newVal);
    if (arr.length === 0 || hasCleanedOnLoad) return;
    hasCleanedOnLoad = true;
    await validateAndCleanTeams();
  },
  { immediate: true }
);

watch(
  () => [sheet.meta.name, sheet.biography.civilianName, sheet.meta.avatar, myTeam.value],
  async ([newName, newCivilian, newAvatar, currentTeam]) => {
    if (!currentTeam) return;
    const dispatch = dispatchRef.value;
    let list = [...teams.value];
    let changed = false;

    list = list.map((t: any) => {
      if (t._id === (currentTeam as any)._id) {
        const members = ensureArray(t.members).map((m: any) => {
          if (m._id === sheet.meta.id) {
            if (m.name !== newName || m.civilianName !== newCivilian || m.avatar !== newAvatar) {
              changed = true;
              return {
                ...m,
                name: newName,
                civilianName: newCivilian,
                avatar: newAvatar
              };
            }
          }
          return m;
        });
        return { ...t, members };
      }
      return t;
    });

    if (changed) {
      
      sharedSettings.value = { ...sharedSettings.value, teams: list };

      try {
        await updateSharedData({ settings: { teams: JSON.stringify(list) } });
      } catch (err) {
        console.error('[teams] Failed to sync character profile to team on server:', err);
      }
    }
  }
);
</script>
