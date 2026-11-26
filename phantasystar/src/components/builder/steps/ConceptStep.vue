<script setup>
import { computed } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import { SETTINGS, builderSetting } from '@/builder/setting.js'

const builder = useBuilderStore()

const setting = computed({
  get: () => builderSetting(builder.draft, sharedSettings.setting),
  set: (id) => { builder.draft.setting = id },
})
</script>

<template>
  <div class="fields">
    <label class="field">
      <span class="field__label">Name</span>
      <input v-model="builder.draft.concept.name" type="text" class="field__input" autocomplete="off" />
    </label>
    <label class="field">
      <span class="field__label">Concept</span>
      <input
        v-model="builder.draft.concept.concept"
        type="text"
        class="field__input"
        placeholder="ex: Android with no memory / Avenging Princess"
        autocomplete="off"
      />
    </label>
    <label class="field">
      <span class="field__label">Setting</span>
      <select v-model="setting" class="field__input field__select">
        <option v-for="s in SETTINGS" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </label>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.fields { display: flex; flex-direction: column; gap: 10px; max-width: 460px; }

.field { display: flex; flex-direction: column; gap: 3px; }

.field__label { @include ps-caption; }

.field__input {
  @include ps-control(28px);
  text-align: left;
  padding: 0 8px;
}

.field__select { max-width: 160px; cursor: pointer; }
</style>
