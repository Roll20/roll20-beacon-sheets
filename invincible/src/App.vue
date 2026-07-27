<template>
  <div class="sheet">
    
    <div v-if="isSettingsSheet">
      <SharedSettingsView />
    </div>
    <div v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { characterStore } from './sheet/stores';
import SharedSettingsView from './views/SharedSettingsView.vue';
import { initValues } from './relay/relay.ts';

const { t } = useI18n();
const sheet = characterStore();
const campaignId = sheet.meta.campaignId;

document.title = t('app.name');
const isSettingsSheet = computed(() => initValues.settings?.settingsSheet ?? false);

watch(isSettingsSheet, (val) => {
  console.log('[App.vue] isSettingsSheet changed to:', val);
}, { immediate: true });

watch(
  () => sheet.biography.avatarColors,
  (colors) => {
    if (colors && colors.heroColor && colors.heroColorSecondary) {
      document.documentElement.style.setProperty('--hero-color', colors.heroColor);
      document.documentElement.style.setProperty('--hero-color-secondary', colors.heroColorSecondary);
      document.documentElement.style.setProperty('--hero-color-blood', colors.heroColorBlood || '190 4 20');
    } else {
      document.documentElement.style.removeProperty('--hero-color');
      document.documentElement.style.removeProperty('--hero-color-secondary');
      document.documentElement.style.removeProperty('--hero-color-blood');
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped>
</style>
