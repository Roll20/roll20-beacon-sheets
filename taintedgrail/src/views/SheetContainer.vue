<template>
  <div class="sheet-container">
    <PCSheetView v-if="settings.actorType === 'pc'" />
    <NPCSheetView v-if="settings.actorType === 'npc'" />
    <div v-if="!settings.actorType" class="actor-type-overlay">
      <div class="overlay-content">
        <h2 class="overlay-title">Select Character Type</h2>
        <div class="button-container">
          <button @click="settings.setActorType('pc')" class="actor-button">Player</button>
          <button @click="settings.setActorType('npc')" class="actor-button">NPC</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PCSheetView from './PCSheetView.vue';
import NPCSheetView from './NPCSheetView.vue';
import { useTaintedGrailStore } from '@/sheet/stores';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

useTaintedGrailStore();
const settings = useSettingsStore();
</script>

<style lang="scss">
.sheet-container {
  gap: 1rem;
  min-height: 100vh;
  position: relative;
}

.actor-type-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  background: #1f1f1f;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 600px;
  width: 90%;
}

.overlay-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
}

.button-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.actor-button {
  padding: 1rem 2rem !important;
  border: 1px solid #89018b;
  border-radius: 6px;
  font-size: 1.5rem !important;
  cursor: pointer;
  background: #89018b !important;
  color: #fff !important;
  min-width: 200px;
  display: inline-block;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style>
