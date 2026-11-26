<script setup>
import { useAppStore } from '@/stores/index.js'
import RoleHeader from '@/components/RoleHeader.vue'
import TraitsBlock from '@/components/TraitsBlock.vue'
import DriveStorytelling from '@/components/DriveStorytelling.vue'
import Tricks from '@/components/Tricks.vue'
import Tracks from '@/components/Tracks.vue'
import DogDetails from '@/components/DogDetails.vue'
import Pacts from '@/components/Pacts.vue'
import ReferencePanel from '@/components/ReferencePanel.vue'
import { isDevBuild } from '@/env.js'

const appStore = useAppStore()

// Dev-only fixture loader. It must never reach a player: loadExampleData() overwrites the role,
// traits, drive, storytelling, tricks AND the character name with no confirm — selectRole's
// `force` flag deliberately bypasses the window.confirm that an ordinary role change shows.
// Vite inlines DEV, so in a production build isDevBuild() compiles to `()=>!1` and the v-if
// renders a comment node instead of the button. The branch itself is NOT tree-shaken (the flag
// passes through a call Rollup can't fold), so the string survives in the bundle — that is
// bytes, not capability: loadExampleData stays reachable through the store either way.
const isDev = isDevBuild()
</script>

<template>
  <div class="ddd-sheet">
    <RoleHeader />
    <div class="ddd-sheet__grid">
      <TraitsBlock />
      <DriveStorytelling />
      <Tracks />
      <Tricks />
      <Pacts />
      <DogDetails />
    </div>
    <ReferencePanel />
    <button v-if="isDev" class="reset ddd-btn" @click="appStore.loadExampleData()">Reset (dev)</button>
  </div>
</template>
