<template>
  <div :class="['sheet', { 'ctrl-key-active': isCtrlPressed, 'sheet--npc': npcStore.isNpc }]">
    <div class="logo">
      <img src="https://i.postimg.cc/zXVY0Dtc/logo.png" alt="Logo" />
    </div>
    <div class="header">
      <div class="header__tabs">
        <router-link to="/core" v-if="!npcStore.isNpc">{{ $t(`titles.tabs.core`) }}</router-link>
        <router-link to="/spells" v-if="!npcStore.isNpc">{{ $t(`titles.tabs.spells`) }}</router-link>
        <!-- <router-link to="/npcs">NPCs Tab</router-link> -->
      </div>
    </div>
    <div class="npc-switch" v-if="isGM">
      {{ $t(`titles.npc-sheet`) }}
      <ToggleSwitch v-model="npcStore.isNpc" :disabled="false"/>
    </div>
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
    <SidebarModal />
    <RollDialog />
  </div>
  <div class="sheet-background"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import SidebarModal from './components/sidebars/SidebarModal.vue';
import { useSheetStore } from './sheet/stores';
import { useNpcStore } from './sheet/stores/npc/npcStore';
import { useRouter } from 'vue-router';
import ToggleSwitch from './components/shared/ToggleSwitch.vue';
import RollDialog from './components/shared/RollDialog.vue'; 
import { useMetaStore } from './sheet/stores/meta/metaStore';

const store = useSheetStore();
const npcStore = useNpcStore();
const router = useRouter();
const meta = useMetaStore();

const isCtrlPressed = ref(false);

function handleKeyDown(e) {
  //if (e.ctrlKey) isCtrlPressed.value = true;
}
function handleKeyUp(e) {
  //if (!e.ctrlKey) isCtrlPressed.value = false;
}

const isGM = computed(() => meta.permissions.isGM);

if(npcStore.isNpc) {
  router.replace({ name: "npcs" });
} else {
  router.replace({ name: "core" });
}

watch(
  () => npcStore.isNpc,
  (isNpc) => {
    if (isNpc) {
      router.replace({ name: "npcs" });
    } else {
      router.replace({ name: "core" });
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>

<style lang="scss" scoped>
.logo {
  display: flex;
  justify-content: center;
   img {
     max-width: 180px;//200px;
     height: auto;
   }
}
.header {
  margin-bottom: var(--size-gap-large);
  margin-top: var(--size-gap-medium);
  display: flex;
  justify-content: center;

  &__tabs {
    display: flex;
    gap: 1rem;
    a {
      color: var(--color-secondary);
      background-color: var(--color-disabled);
      padding: var(--size-gap-small);
      border-radius: var(--size-border-radius-medium);
      text-decoration: none;
      min-width: 150px;
      text-align: center;
      font-family: var(--font-family-title);
      text-transform: uppercase;
      font-weight: normal;
      font-size: var(--size-font-large);

      &.router-link-active {
        color: #ebc837;
        text-shadow: 0 0 10px red;
      }
    }
  }
}

.npc-switch {
  display: flex;
  align-items: center;
  gap: var(--size-gap-medium);
  position: absolute;
  top: 20px;
  right: 20px;
  font-family: var(--font-family-title);
  text-transform: uppercase;
  font-weight: normal;
}
</style>
