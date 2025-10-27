<template>
  <div class="section insanity-section">
    <div class="section__header">
      <h3>{{ $t('titles.insanity') }}</h3>
      <SidebarLink
        componentName="InsanitySidebar"
        :props="{ insanity: null }"
        :options="{
          title: t('actions.add-insanity'),
          hasSave: true,
          hasDelete: false,
        }"
        display="icon"
        label="add"
      />
    </div>
    <div class="insanity-section__global-modifiers">
      <div class="global-modifier">
        <label>{{ $t('titles.minor-insanity-modifier') }}</label>
        <div class="global-modifier__controls">
          <span class="global-modifier__total"
            >{{ $t('titles.total') }}: {{ store.totalMinorInsanityModifier }}</span
          >
          <input type="number" v-model.number="store.globalMinorModifier" />
        </div>
      </div>
      <div class="global-modifier">
        <label>{{ $t('titles.major-insanity-modifier') }}</label>
        <div class="global-modifier__controls">
          <span class="global-modifier__total"
            >{{ $t('titles.total') }}: {{ store.totalMajorInsanityModifier }}</span
          >
          <input type="number" v-model.number="store.globalMajorModifier" />
        </div>
      </div>
    </div>

    <div class="list">
      <InsanityItem v-for="item in store.insanities" :key="item._id" :insanity="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInsanityStore } from '@/sheet/stores/insanity/insanityStore';
import { useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import InsanityItem from './InsanityItem.vue';
import SidebarLink from '../shared/SidebarLink.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useInsanityStore();
const proficiencies = useProficienciesStore();
</script>

<style lang="scss" scoped>
.insanity-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__global-modifiers {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid var(--color-box);
  }
  .global-modifier {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .global-modifier input {
    width: 5em;
    text-align: right;
  }
  .global-modifier__controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .global-modifier__total {
    font-weight: bold;
  }
  .global-modifier__controls input {
    width: 5em;
    text-align: center;
  }
  .list {
    gap: var(--size-gap-small);
  }
}
</style>
