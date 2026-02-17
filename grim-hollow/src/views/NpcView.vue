<template>
  <div class="npc-tab">
    <div class="npc-tab__controls">
      <label>
        <ToggleSwitch v-model="editMode" :disabled="false"/>
        {{ t('actions.edit-mode') }}
      </label>
      <!-- <button @click="duplicateNpc" :disabled="store.npcs.length === 0" class="npc-tab__button">
          {{ t('actions.duplicate') }}
        </button> -->
    </div>
    <div class="npc-tab__list">
      <NpcStatblock
        v-for="npc in store.regularNpcs"
        :key="npc._id"
        :npc="npc"
        :editMode="editMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'; 
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import NpcStatblock from '@/components/npcs/NpcStatblock.vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
const { t } = useI18n();
const store = useNpcStore();

// Toggles edit mode for all NPCs in the store
const editMode = computed({
  get: () => store.isEditMode,
  set: (value) => (store.isEditMode = value),
});

// Duplicates the first NPC in the list
const duplicateNpc = () => {
  if (store.npcs.length > 0) {
    const firstNpcId = store.npcs[0]._id;
    store.duplicateNpc(firstNpcId);
  }
};
</script>

<style lang="scss" scoped>
.npc-tab__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  gap: 1rem; 
  label {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}
.npc-tab__controls div {
  display: flex;
  gap: 0.5rem;
}
.npc-tab__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
</style>