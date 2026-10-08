<script setup>
import NpcCard from '@/components/NpcCard.vue'
import { useMetaStore } from '@/stores/metaStore.js'

const meta = useMetaStore()
const emit = defineEmits(['open-settings'])
</script>

<!-- NPC mode for a GM (spec §7.2): the header keeps the name field and the gear, and
     one NPC card replaces the play strip, both rails and the clusters.

     The name is meta.name, the Roll20 character name, shared with Character mode (spec
     decision 5). The gear is the only route to Settings in NPC mode, at every width. It
     shares .header__settings' rule in main.css, so both cogs keep the same 24px floor. -->
<template>
  <div class="npc-sheet">
    <header class="npc-sheet__header panel">
      <div class="npc-sheet__nameplate">
        <label class="npc-sheet__name-row">
          <span class="microlabel">Name</span>
          <input class="npc-sheet__name field" v-model="meta.name" placeholder="NPC name" />
        </label>
        <button class="npc-sheet__settings" type="button" aria-label="Settings" @click="emit('open-settings')">⚙</button>
      </div>
    </header>

    <NpcCard />
  </div>
</template>
