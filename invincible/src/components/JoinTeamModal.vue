<template>
  <Modal :show="show" title="Join or Create Team" @close="emit('close')">
    <div class="flex flex-col gap-6 text-black">
      
      <div class="border-2 border-black p-4 bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 class="font-space-grotesk font-black uppercase text-sm mb-3 tracking-wider text-zinc-700">Create a New Team</h3>
        <div class="flex gap-2">
          <input
            v-model="newTeamName"
            type="text"
            placeholder="Enter Team Name..."
            class="flex-1 border-2 border-black p-2 font-bold focus:outline-none bg-white text-sm"
            @keyup.enter="handleCreateTeam"
          />
          <button
            @click="handleCreateTeam"
            type="button"
            class="h-10 px-4 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer font-space-grotesk font-black uppercase tracking-wider text-sm"
          >
            Create
          </button>
        </div>
      </div>

      
      <div class="flex flex-col gap-3">
        <h3 class="font-space-grotesk font-black uppercase text-sm tracking-wider text-zinc-700">Existing Teams</h3>
        <div v-if="teams.length === 0" class="border-2 border-dashed border-zinc-400 p-6 text-center bg-zinc-50">
          <span class="text-zinc-400 font-bold uppercase tracking-wider italic text-xs">No teams available</span>
        </div>
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="team in teams"
            :key="team._id"
            class="flex items-center justify-between border-2 border-black p-3 bg-white hover:bg-zinc-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            
            <div class="flex flex-col gap-1 min-w-0">
              <span class="font-space-grotesk font-black text-base truncate">{{ team.name }}</span>
              
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mr-1">Members:</span>
                <div v-if="team.members.length === 0" class="text-xs italic text-zinc-400">Empty</div>
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
                      :title="member.name"
                      v-tooltip="member.name"
                      class="inline-block h-6 w-6 bg-zinc-200 object-cover"
                    />
                    <div
                      v-else
                      class="inline-flex h-6 w-6 items-center justify-center bg-zinc-300 text-[10px] font-black uppercase text-black"
                      :title="member.name"
                      v-tooltip="member.name"
                    >
                      {{ member.name.substring(0, 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <button
              @click="handleJoinTeam(team._id)"
              type="button"
              class="h-9 px-4 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer font-space-grotesk font-black uppercase tracking-wider text-sm"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <template #footer>
      <button
        @click="emit('close')"
        type="button"
        class="w-40 h-9 px-4 border-2 border-black bg-zinc-500 text-white hover:bg-zinc-600 font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none"
      >
        Close
      </button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@/components/Modal.vue';
import { characterStore } from '@/sheet/stores';
import { sharedSettings, dispatchRef } from '@/relay/relay';
import { ensureArray } from '@/utility/ensureArray';
import { updateSharedData } from '@/utility/updateSharedData';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const sheet = characterStore();
const newTeamName = ref('');

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

const handleCreateTeam = async () => {
  const nameVal = newTeamName.value.trim();
  if (!nameVal) return;

  const dispatch = dispatchRef.value;
  let list = [...teams.value];

  
  list = list.map((t: any) => {
    return {
      ...t,
      members: ensureArray(t.members).filter((m: any) => m._id !== sheet.meta.id)
    };
  }).filter((t: any) => ensureArray(t.members).length > 0);
  
  const newTeam = {
    _id: uuidv4(),
    name: nameVal,
    members: [
      {
        _id: sheet.meta.id,
        name: sheet.meta.name,
        avatar: sheet.meta.avatar || '',
        civilianName: sheet.biography.civilianName || '',
      }
    ],
    features: []
  };

  list.push(newTeam);

  try {
    await updateSharedData({ settings: { teams: JSON.stringify(list) } });
  } catch (err) {
    console.error('[teams] Failed to update settings on creating team:', err);
  }

  newTeamName.value = '';
  emit('close');
};

const handleJoinTeam = async (teamId: string) => {
  const dispatch = dispatchRef.value;
  let list = [...teams.value];

  
  list = list.map((t: any) => {
    return {
      ...t,
      members: ensureArray(t.members).filter((m: any) => m._id !== sheet.meta.id)
    };
  }).filter((t: any) => ensureArray(t.members).length > 0);

  
  list = list.map((t: any) => {
    if (t._id === teamId) {
      const members = [...ensureArray(t.members)];
      if (!members.some(m => m._id === sheet.meta.id)) {
        members.push({
          _id: sheet.meta.id,
          name: sheet.meta.name,
          avatar: sheet.meta.avatar || '',
          civilianName: sheet.biography.civilianName || '',
        });
      }
      return { ...t, members };
    }
    return t;
  });

  try {
    await updateSharedData({ settings: { teams: JSON.stringify(list) } });
  } catch (err) {
    console.error('[teams] Failed to update settings on joining team:', err);
  }

  emit('close');
};

const sortMembers = (members: any) => {
  const arr = ensureArray(members);
  return [...arr].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};
</script>
