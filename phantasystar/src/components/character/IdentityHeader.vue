<script setup>
import { useMetaStore } from '@/stores/metaStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { computed, ref } from 'vue'
import { sharedSettings } from '@/relay/sheetSettings.js'
import { levelProgress } from '@/rules/index.js'
import ProfessionOptionsModal from './ProfessionOptionsModal.vue'

const meta = useMetaStore()
const sheet = useCharacterStore()

const broken = ref(false)

const professionOptions = ref(false)

const xpProgress = computed(() => levelProgress(sheet.xp, sheet.effectiveLevel))
</script>

<template>
  <div class="identity" :class="{ 'no-xp': sharedSettings.milestone }">
    <div class="portrait">
      <img
        v-if="meta.avatar && !broken"
        :src="meta.avatar"
        :alt="meta.name || 'Character portrait'"
        @error="broken = true"
      />
    </div>

    <div class="fields">
      <label class="line wide">
        <input v-model="meta.name" />
        <span>Character Name</span>
      </label>

      <label class="line">
        <input v-model="sheet.species" />
        <span>Species</span>
      </label>
      <label class="line">
        <input v-model="sheet.background" />
        <span>Background</span>
      </label>

      <div class="line">
        <div class="with-gear">
          <input id="identity-profession" v-model="sheet.profession" />
          <button type="button" class="gear" title="Profession Options" @click="professionOptions = true">
            &#9881;
          </button>
        </div>
        <label for="identity-profession">Profession</label>
      </div>
      <label class="line">
        <input v-model="sheet.path" />
        <span>Path</span>
      </label>
    </div>

    <div class="level-block">
      <div class="level-badge">
        <input v-model.number="sheet.level" type="number" min="1" max="20" />
      </div>
      <div class="level-caption">Level</div>
    </div>

    <div v-if="!sharedSettings.milestone" class="xp-block">
      <label class="line">
        <input v-model.number="sheet.xp" type="number" min="0" />
        <span>XP</span>
      </label>
      <div v-if="xpProgress" class="xp-bar">
        <div class="xp-bar__track">
          <div class="xp-bar__fill" :style="{ width: `${xpProgress.fraction * 100}%` }" />
        </div>
        <span class="xp-bar__next">{{ xpProgress.next.toLocaleString() }}</span>
      </div>
      <div v-if="sheet.levelForXp > sheet.effectiveLevel" class="xp-hint">
        Recommended Level: {{ sheet.levelForXp }}
      </div>
    </div>

    <ProfessionOptionsModal :open="professionOptions" @close="professionOptions = false" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.identity {
  display: grid;
  --ps-portrait: 117px;
  grid-template-columns: var(--ps-portrait) minmax(220px, 1fr) auto minmax(90px, 140px);
  gap: var(--ps-gap-lg);
  align-items: start;

  &.no-xp { grid-template-columns: var(--ps-portrait) minmax(220px, 1fr) auto; }
}

.portrait {
  width: 100%;
  aspect-ratio: 1;
  align-self: start;
  position: relative;
  border: 2.5px solid var(--ps-line);
  border-radius: 8px;
  box-shadow: inset 0 0 0 2px var(--ps-paper), inset 0 0 0 4px var(--ps-line-soft);
  background: var(--ps-panel-alt);
  overflow: hidden;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

.line {
  display: flex;
  flex-direction: column;
  min-width: 0;

  &.wide { grid-column: 1 / -1; }

  input,
  select {
    border: none;
    border-bottom: 1.5px solid var(--ps-line);
    background: transparent;
    font-size: var(--ps-fs-body);
    font-family: var(--ps-font);
    color: var(--ps-text);
    padding: 2px 2px 1px;
    min-width: 0;
    &:focus { outline: none; border-bottom-color: var(--ps-blue); background: var(--ps-panel); }
  }
  select { cursor: pointer; }

  > span,
  > label {
    @include ps-caption;
    margin-top: 1px;
  }
}

.with-gear {
  display: flex;
  align-items: flex-end;
  min-width: 0;

  input { flex: 1; }
}

.gear {
  @include ps-gear-button(13px);
  border-bottom: 1.5px solid var(--ps-line);
  padding-bottom: 1px;
}

.level-block { display: flex; flex-direction: column; align-items: center; }

.level-badge {
  width: 58px;
  height: 58px;
  border: 2.5px solid var(--ps-line);
  border-radius: 8px;
  box-shadow: inset 0 0 0 2px var(--ps-paper), inset 0 0 0 4px var(--ps-line-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ps-field);

  input {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: var(--ps-entry, var(--ps-heading));
    font-family: var(--ps-font);
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    &:focus { outline: none; }
  }
}

.level-caption {
  @include ps-heading(15px);
  margin-top: 2px;
}

.xp-block { padding-top: 26px; }

.xp-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;

  &__track {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: var(--ps-field);
    box-shadow: inset 0 0 0 1px rgba(var(--ps-line-soft-rgb), 0.35);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: var(--ps-green);
    transition: width 0.25s ease;
  }

  &__next {
    font-size: 9px;
    color: var(--ps-text-muted);
    font-variant-numeric: tabular-nums;
  }
}

.xp-hint {
  font-size: 9px;
  color: var(--ps-gold-dark);
  margin-top: 2px;
}

@media (max-width: 620px) {
  .identity { grid-template-columns: 1fr auto; }
  .xp-block { grid-column: 1 / -1; padding-top: 0; max-width: 160px; }
}

@media (max-width: 700px) {
  .identity,
  .identity.no-xp {
    --ps-portrait: 88px;
    grid-template-columns: var(--ps-portrait) minmax(160px, 1fr);
  }

  .level-block { justify-self: start; }
}
</style>
