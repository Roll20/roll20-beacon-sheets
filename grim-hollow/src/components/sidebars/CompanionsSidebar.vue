<template>
  <div class="view-container">
    <div class="sidebar-controls">
      <label>
        {{ $t('actions.edit-mode') }}
        <ToggleSwitch v-model="isEditing" :disabled="false" />
      </label>
    </div>
    <NpcStatblock
      v-if="npcForStatblock"
      :npc="npcForStatblock"
      :editMode="isEditing"
      :forceExpanded="true"
      :showCollapseControl="false"
      :companionMode="true"
      ref="statblockRef"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSidebar } from './useSidebar';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import NpcStatblock from '../npcs/NpcStatblock.vue';
import { v4 as uuidv4 } from 'uuid';
import ToggleSwitch from '../shared/ToggleSwitch.vue';

const props = defineProps<{
  npcId?: string;
  isNew?: boolean;
}>();

const store = useNpcStore();
const sidebar = useSidebar();
const statblockRef = ref<InstanceType<typeof NpcStatblock> | null>(null);

const isEditing = ref(props.isNew ?? false);

const npcForStatblock = computed(() => {
  if (props.isNew) {
    return store.getEmptyNpc(false, true, { _id: uuidv4() });
  }
  return store.npcs.find((n) => n._id === props.npcId);
});

const save = () => {
  if (statblockRef.value) {
    statblockRef.value.saveChanges();
  }
  sidebar.close();
};

const remove = () => {
  if (statblockRef.value) {
    statblockRef.value.deleteNpc();
  }
  sidebar.close();
};

defineExpose({
  save,
  remove,
});
</script>

<style scoped lang="scss">

.sidebar-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: right;
  .toggle-switch {
    margin-left: 10px;
  }
}
</style>