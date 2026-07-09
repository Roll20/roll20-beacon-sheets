<template>
  <div class="sheet">
    <header>
      
    </header>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
    
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { characterStore } from './sheet/stores';

const { t } = useI18n();
const sheet = characterStore();
const campaignId = sheet.meta.campaignId;

document.title = t('app.name');

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
