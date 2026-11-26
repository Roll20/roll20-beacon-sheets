<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/index.js'
import { useBuilder } from '@/composables/useBuilder.js'
import { useCatalog } from '@/composables/useCatalog.js'
import { premadesOf, PREMADES_CATEGORY } from '@/builder/premades.js'
import { NPC } from '@/sheetTypes.js'
import psLogo from '@/assets/img/ps-logo.webp'
import PremadePicker from './PremadePicker.vue'

defineProps({ available: { type: Boolean, default: true } })

const app = useAppStore()
const { builder, start } = useBuilder()

const { lists, loadCategory } = useCatalog()
loadCategory(PREMADES_CATEGORY)
const premades = computed(() => {
  const list = lists[PREMADES_CATEGORY]
  return list?.status === 'ok' ? premadesOf(list.options) : []
})
const picking = ref(false)

const editDirectly = () => builder.skip()
const makeNpc = () => {
  builder.skip()
  app.setSheetType(NPC)
}
</script>

<template>
  <PremadePicker v-if="picking" :premades="premades" @back="picking = false" />
  <div v-else class="landing">
    <div class="landing__banner">
      <img :src="psLogo" class="landing__logo" alt="Phantasy Star Tabletop Roleplaying" />
      <h1 class="landing__title">Press Start!</h1>
      <p class="landing__lead">Design a new hero step by step, or fill in the sheet yourself.</p>
      <div class="landing__starts">
        <button type="button" class="landing__build" :disabled="!available" @click="start">Build a Character</button>
        <button v-if="premades.length" type="button" class="landing__build landing__build--alt" @click="picking = true">
          Ready-to-Play Characters
        </button>
      </div>
      <p v-if="!available" class="landing__needs">
        The character builder requires the <em>Phantasy Star Tabletop Roleplaying</em> core book on Roll20.
      </p>
    </div>

    <h2 class="landing__heading">Other Options</h2>
    <div class="landing__options">
      <button type="button" class="landing__option" @click="editDirectly">
        <strong>Edit Sheet Directly</strong>
        <small>Build and customize manually.</small>
      </button>
      <button type="button" class="landing__option" @click="makeNpc">
        <strong>Create NPC</strong>
        <small>Create a non-player character or a NPC ship.</small>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.landing {
  max-width: 760px;
  margin: 0 auto;
  padding: 16px 12px 24px;
}

.landing__banner {
  @include ps-panel(var(--ps-panel));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 18px 20px 20px;
}

.landing__logo { width: 190px; height: auto; display: block; }

.landing__title { @include ps-heading(26px); margin: 4px 0 0; }

.landing__lead { margin: 0; color: var(--ps-text-muted); font-size: 12px; }

.landing__build {
  @include ps-button;
  margin-top: 8px;
  padding: 9px 28px;
  font-size: 16px;
}

.landing__build:disabled { opacity: 0.45; cursor: default; }

.landing__starts { display: flex; flex-wrap: wrap; gap: 8px; }

.landing__build--alt { @include ps-button(var(--ps-field), var(--ps-panel-alt)); color: var(--ps-heading); }

.landing__needs { margin: 0; color: var(--ps-text-muted); font-size: 12px; }

.landing__heading { @include ps-heading(16px); margin: 18px 0 8px; }

.landing__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--ps-gap-lg);
}

.landing__option {
  @include ps-panel(var(--ps-panel));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  color: var(--ps-text);
  font-family: inherit;

  &:hover { background: var(--ps-panel-alt); }

  strong { color: var(--ps-heading); font-size: 13px; }
  small { color: var(--ps-text-muted); font-size: 11px; }
}
</style>
