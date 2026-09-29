<script setup>
import { computed, ref, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/index.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { initValues, dispatchRef } from '@/relay/relay.js'
import { onSettingsChange } from '@/relay/handlers/handlers.js'
import { applyTheme, themeOf } from '@/theme.js'
import CharacterPage from '@/components/character/CharacterPage.vue'
import TechniquesPage from '@/components/techniques/TechniquesPage.vue'
import BioPage from '@/components/bio/BioPage.vue'
import ShipPage from '@/components/ship/ShipPage.vue'
import NpcPage from '@/components/npc/NpcPage.vue'
import SettingsPage from '@/components/settings/SettingsPage.vue'
import { PC, NPC, STARSHIP } from '@/sheetTypes.js'
import psLogo from '@/assets/img/ps-logo.webp'
import { defineAsyncComponent } from 'vue'

const appStore = useAppStore()
const meta = useMetaStore()

const TABS_BY_TYPE = {
  [PC]: [
    { id: 'character', label: 'Character' },
    { id: 'techniques', label: 'Techniques' },
    { id: 'bio', label: 'Bio & Gear' },
    { id: 'settings', label: 'Settings' },
  ],
  [NPC]: [
    { id: 'npc', label: 'Stat Block' },
    { id: 'settings', label: 'Settings' },
  ],
  [STARSHIP]: [
    { id: 'ship', label: 'Starship' },
    { id: 'settings', label: 'Settings' },
  ],
}

const tabs = computed(() => TABS_BY_TYPE[appStore.sheetType] ?? TABS_BY_TYPE[PC])
const activeTab = ref('character')

const tabBar = ref(null)
let tabBarObserver = null
onMounted(() => {
  if (!tabBar.value || typeof ResizeObserver === 'undefined') return
  tabBarObserver = new ResizeObserver(([entry]) => {
    const root = tabBar.value?.closest('.ps-sheet')
    root?.style.setProperty('--ps-tabs-h', `${Math.ceil(entry.target.offsetHeight)}px`)
  })
  tabBarObserver.observe(tabBar.value)
})
onBeforeUnmount(() => tabBarObserver?.disconnect())

watch(
  () => appStore.sheetType,
  () => {
    if (!tabs.value.some((t) => t.id === activeTab.value)) activeTab.value = tabs.value[0].id
  },
  { immediate: true },
)

const PREFERRED_HEIGHT = 820
let sizeAsked = false

watchEffect(() => {
  const dispatch = dispatchRef.value
  if (sizeAsked || typeof dispatch?.setContainerSize !== 'function') return
  if (initValues.settings.settingsSheet) return
  sizeAsked = true
  if (window.innerHeight >= PREFERRED_HEIGHT - 40) return
  Promise.resolve(dispatch.setContainerSize({ width: 900, height: PREFERRED_HEIGHT })).catch(() => {
  })
})

watchEffect(() => applyTheme(initValues.settings.colorTheme))

const isSettingsSheet = computed(() => !!initValues.settings.settingsSheet)

const readOnly = computed(() => !meta.canEdit)

const isDev = import.meta.env.MODE === 'development'

const DEV_THEME_KEY = 'ps-dev-theme'
const isDark = computed(() => themeOf(initValues.settings.colorTheme) === 'dark')
const setDevTheme = (colorTheme) => {
  onSettingsChange({ settings: { colorTheme } })
  try { localStorage.setItem(DEV_THEME_KEY, colorTheme) } catch { }
}
if (isDev) {
  let saved = null
  try { saved = localStorage.getItem(DEV_THEME_KEY) } catch { }
  if (saved) onSettingsChange({ settings: { colorTheme: saved } })
}

const DevChat = isDev
  ? defineAsyncComponent(() => import('@/components/dev/DevChat.vue'))
  : null
</script>

<template>
  <div class="ps-sheet" :class="{ 'has-dev-chat': isDev }">
    <SettingsPage v-if="isSettingsSheet" />

    <template v-else>
    <nav ref="tabBar" class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
      <button v-if="isDev" type="button" class="tab dev" @click="appStore.loadExampleData">
        Load Example
      </button>
      <button v-if="isDev" type="button" class="tab dev dev--theme" @click="setDevTheme(isDark ? 'light' : 'dark')">
        {{ isDark ? 'Light' : 'Dark' }}
      </button>
    </nav>

    <p v-if="readOnly" class="read-only">
      View only &mdash; you do not control this character.
    </p>

    <div class="pages" :inert="readOnly || undefined">
      <CharacterPage v-if="activeTab === 'character'" />
      <TechniquesPage v-else-if="activeTab === 'techniques'" />
      <BioPage v-else-if="activeTab === 'bio'" />
      <ShipPage v-else-if="activeTab === 'ship'" />
      <NpcPage v-else-if="activeTab === 'npc'" />
      <SettingsPage v-else-if="activeTab === 'settings'" />

      <div v-else class="placeholder">
        <p>The {{ tabs.find((t) => t.id === activeTab)?.label ?? 'Stat Block' }} page is not built yet.</p>
      </div>
    </div>
    </template>

    <footer class="colophon">
      <img :src="psLogo" class="logo" alt="Phantasy Star Tabletop Roleplaying" />
      <small>
        &copy; Skydawn Game Studios Inc. &copy; SEGA.
        All rights reserved.
      </small>
    </footer>

    <component :is="DevChat" v-if="isDev" />
  </div>
</template>

<style lang="scss">
@use '@/styles/theme.scss';
@use '@/styles/tokens.scss' as *;

.ps-sheet {
  @include ps-baseline;
  background: var(--ps-paper);
  min-height: 100%;

  textarea { font-size: 11px; }

  &.has-dev-chat { padding-right: 318px; }
}

.tabs {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 2px solid var(--ps-line);
  background: var(--ps-paper);
  flex-wrap: wrap;
}

.tab {
  @include ps-heading(14px);
  background: var(--ps-panel);
  border: var(--ps-border);
  border-bottom: none;
  border-radius: 7px 7px 0 0;
  padding: 4px 14px;
  cursor: pointer;
  color: var(--ps-heading);

  &:hover { background: var(--ps-panel-alt); }
  &.active {
    background: var(--ps-paper);
    color: var(--ps-heading);
  }
  &.dev {
    margin-left: auto;
    background: var(--ps-gold-light);
    border-color: var(--ps-gold-dark);
    color: var(--ps-on-gold-fill, var(--ps-heading));
    font-variant: normal;
    font-size: 11px;
  }
  &.dev + &.dev { margin-left: 0; }
}

.placeholder {
  padding: 40px 16px;
  text-align: center;
  color: var(--ps-text-muted);
}

.read-only {
  margin: 0;
  padding: 5px 16px;
  background: var(--ps-gold-light);
  border-bottom: 1.5px solid var(--ps-gold-dark);
  color: var(--ps-on-gold-fill, var(--ps-heading));
  font-size: 11px;
  font-weight: 700;
  font-variant: small-caps;
  letter-spacing: 0.04em;
}

.pages[inert] {
  opacity: 0.72;
  filter: saturate(0.8);
}

.colophon {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  font-size: 9px;
  color: var(--ps-text-muted);
  padding: 4px 16px 14px;
  text-align: right;

  .logo {
    width: 175px;
    height: auto;
    display: block;
  }
}
</style>
