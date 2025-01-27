<template>
  <div class="settings">
    SETTINGS
    <button
      class="big-button"
      @click="goBack"
    >
      Back
    </button>
    <button
      class="big-button"
      :disabled="!(isOwner || isGM)"
      @click="loadExampleData"
    >
      Add mock data
    </button>
    <div class="settings__main">
      <label
        class="settings__item"
        for="encumbrance-penalty"
      >
        <span class="settings__item__name">Encumbrance penalty</span>
        <span class="settings__item__desc">(Added to ability rolls when over-encumbered)</span>
        <input
          v-model="settings.encumbrancePenalty"
          class="settings__item__input"
          type="number"
        >
      </label>
    </div>
  </div>
</template>

<script setup>
import router from '@/router';
import { useStarTrekStore } from '@/sheet/stores';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { computed } from 'vue';

const store = useStarTrekStore();
const meta = useMetaStore();
const settings = useSettingsStore();

const isOwner = computed(() => meta.permissions.isOwner);
const isGM = computed(() => meta.permissions.isGM);

const goBack = () => router.replace({ name: 'sheet' });

const loadExampleData = () => {
  store.loadExampleData();
  goBack();
};
</script>

<style lang="scss" scoped>
@use '../common/scss/vars.scss';

.settings {
  &__main {
    margin: 2rem 0;
  }
  &__item {
    padding: 1rem;
    border: 1px solid black;
    border-radius: 0.5rem;
    display: inline-block;

    &__name {
      display: block;
      font-weight: 600;
    }
    &__desc {
      display: block;
    }
    &__input {
      display: block;
      margin-top: 0.5rem;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
  }
}

.big-button {
  border: none;
  color: var(--examplesheet-contrast-font-color);
  padding: 1rem 2rem;
  background-color: var(--examplesheet-button-background-color);
  font-family: var(--examplesheet-font-family);
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  margin-top: 1rem;
  margin-left: 1rem;

  &:hover {
    filter: brightness(1.2);
    cursor: pointer;
  }
}
</style>
