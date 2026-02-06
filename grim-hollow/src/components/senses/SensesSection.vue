<template>
  <div class="section senses-section">
    <StyledBox mode="gothic">
      <div class="section__header">
        <h3>{{ $t('titles.senses') }}</h3>
        <SidebarLink
          componentName="SensesSidebar"
          :options="{
            title: $t('titles.senses'),
            hasSave: true,
          }"
          display="icon"
          label="config"
        />
      </div>
    </StyledBox>
    <div class="section__body" v-if="sensesStore.activeSenses.length > 0">
      <div class="senses-section__display">
        <span v-for="(sense, index) in sensesStore.activeSenses" :key="sense.key">
          <strong>{{ $t(sense.label) }}</strong>
          {{ ` ${sense.value.value.final} ${$t('abbreviations.measurement-unit')}` }}
          <span v-if="index < sensesStore.activeSenses.length - 1">, </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSensesStore } from '@/sheet/stores/senses/sensesStore';
import SidebarLink from '../shared/SidebarLink.vue';
import { useI18n } from 'vue-i18n';
import StyledBox from '../shared/StyledBox.vue';

const sensesStore = useSensesStore();

</script>

<style scoped lang="scss">
.senses-section {
  &__display {
    padding-top: var(--size-gap-small);
  }
}
</style>