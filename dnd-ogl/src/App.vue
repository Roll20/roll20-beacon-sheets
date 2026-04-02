<template>
  <div v-if="isSettingsSheet">
    <SettingsView />
  </div>
  <div v-else-if="!patron.isPatron">
    <SheetLockedView />
  </div>
  <template v-else>
    <div :class="['sheet', { 'ctrl-key-active': isCtrlPressed, 'sheet--npc': npcStore.isNpc }]">
      <div class="header">
        <div class="header__tabs">
          <router-link to="/core" v-if="!npcStore.isNpc">{{ $t(`titles.tabs.core`) }}</router-link>
          <router-link to="/spells" v-if="!npcStore.isNpc">{{$t(`titles.tabs.spells`)}}</router-link>
          <!-- <router-link to="/npcs">NPCs Tab</router-link> -->
        </div>
      </div>
      <div class="badges" v-if="patron.isPatron || patron.patronTierValue() >= 4">
        <span class="premium-badge" v-if="patron.isPatron">🌟 Premium Active</span>
        <span class="premium-badge premium-badge--gm" v-if="patron.patronTierValue() >= 4">👑 GM Pro</span>
      </div>
      <div class="npc-switch" v-if="isGM">
        {{ $t(`titles.npc-sheet`) }}
        <ToggleSwitch v-model="npcStore.isNpc" :disabled="false" />
      </div>
      <router-view v-slot="{ Component }">
        <transition>
          <component :is="Component" />
        </transition>
      </router-view>
      <SidebarModal />
      <RollDialog />
    </div>
  </template>
  <div class="sheet-background"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import SidebarModal from './components/sidebars/SidebarModal.vue';
import { useNpcStore } from './sheet/stores/npc/npcStore';
import { useRouter } from 'vue-router';
import ToggleSwitch from './components/shared/ToggleSwitch.vue';
import RollDialog from './components/shared/RollDialog.vue';
import { useMetaStore } from './sheet/stores/meta/metaStore';
import { useVersionStore } from './sheet/stores/version/versionStore';
import { initValues } from './relay/relay';
import SettingsView from './views/SettingsView.vue';
import SheetLockedView from './views/SheetLockedView.vue';

const npcStore = useNpcStore();
const router = useRouter();
const meta = useMetaStore();
const patron = useVersionStore();

const isCtrlPressed = ref(false);
const isSettingsSheet = computed(() => initValues.settings?.settingsSheet ?? false);

function handleKeyDown(e) {
  //if (e.ctrlKey) isCtrlPressed.value = true;
}
function handleKeyUp(e) {
  //if (!e.ctrlKey) isCtrlPressed.value = false;
}

const isGM = computed(() => meta.permissions.isGM);

if (npcStore.isNpc) {
  router.replace({ name: 'npcs' });
} else {
  router.replace({ name: 'core' });
}

watch(
  () => npcStore.isNpc,
  (isNpc) => {
    if (isNpc) {
      router.replace({ name: 'npcs' });
    } else {
      router.replace({ name: 'core' });
    }
  },
);

onMounted(() => {
  patron.checkPremiumStatus();

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
    max-width: 180px; //200px;
    height: auto;
  }
}
.header {
  margin-bottom: var(--size-gap-large);
  //margin-top: var(--size-gap-medium);
  display: flex;
  justify-content: center;

  &__tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 300px;
    gap: 1rem;
    a {
      color: var(--color-secondary);
      background-color: var(--color-disabled);
      padding: var(--size-gap-small);
      border-radius: var(--size-border-radius-medium);
      text-decoration: none;
      text-align: center;
      font-family: var(--font-family-title);
      text-transform: uppercase;
      font-weight: normal;
      font-size: var(--size-font-large);

      &.router-link-active {
        color: var(--rollbonus-color-hover);
        //text-shadow: 0 0 15px rgb(255, 0, 0, 0.5);
      }
    }
  }
}

.npc-switch {
  display: flex;
  align-items: center;
  gap: var(--size-gap-medium);
  position: absolute;
  top: 23px;
  right: 20px;
  font-family: var(--font-family-title);
  text-transform: uppercase;
  font-weight: normal;
}

.badges {
  position: absolute;
  top: 0;
  right: 20px;
  display: flex;
  gap: var(--size-gap-small);
}
.premium-badge {
  font-size: var(--size-font-small);
  font-family: var(--font-family-title);
  background-color: var(--color-disabled);
  padding: 2px 8px 4px 4px;
  border-radius: 0 0 var(--size-border-radius-medium) var(--size-border-radius-medium);
  white-space: nowrap;

  &--gm {
    right: 320px;
  }
}
</style>
