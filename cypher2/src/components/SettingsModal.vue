<script setup>
import { computed } from 'vue'
import ModalShell from '@/components/ModalShell.vue'
import ImportExportPanel from '@/components/ImportExportPanel.vue'
import CreatureImportExportPanel from '@/components/CreatureImportExportPanel.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { THEMES, resolveTheme } from '@/components/themes.js'

const emit = defineEmits(['close'])
const sheet = useSheetStore()
const meta = useMetaStore()
const npc = useNpcStore()

// Resolve on BOTH sides, exactly as the retired SettingsTab did: reading normalises an
// unknown stored value so the select never renders blank, and writing refuses to store
// one.
const theme = computed({
  get: () => resolveTheme(sheet.ui.theme),
  set: (v) => {
    sheet.ui.theme = resolveTheme(v)
  }
})
</script>

<!-- Sheet type (spec §7.1). GM-only, and it takes effect at once with no confirmation:
     switching deletes nothing, so a misclick is undone by switching back. `:value` plus
     `@change`, not v-model, because switchTo is the only write path. It is what creates
     the default branch on a first switch, and a raw assignment would skip that.

     The v-if hides the DISPLAY only. isGM is read once at load, and journal permissions
     are the real barrier (spec §2.3, decision 9).

     For a GM this select is now the first control in the dialog, which is the position
     ruling R6 worried about for the skin select. ModalShell still parks initial focus on
     the panel, so a stray arrow key reaches neither select.

     NPC mode hides the three settings that only mean something for a character: guided
     rolls, whisper item cards, and character import-export. Part C (ddd-zm47.3) adds the
     creature panel beside this template. -->
<template>
  <ModalShell label="Settings" @close="emit('close')">
    <label v-if="meta.permissions.isGM" class="settings__row">
      <span class="microlabel">Sheet type</span>
      <select class="settings__sheet-type field" :value="npc.sheetType" @change="npc.switchTo($event.target.value)">
        <option value="character">Character</option>
        <option value="npc">NPC</option>
      </select>
    </label>

    <label class="settings__row">
      <span class="microlabel">Sheet skin</span>
      <select class="settings__theme field" v-model="theme">
        <option v-for="t in THEMES" :key="t.key" :value="t.key">{{ t.label }}</option>
      </select>
    </label>
    <p class="settings__hint">
      Per character. Stored with this sheet's display settings, not with the character
      data — an exported character carries no skin.
    </p>

    <template v-if="!npc.isNpc">
      <label class="settings__toggle">
        <input class="settings__guided" type="checkbox" v-model="sheet.ui.guidedRoll" />
        <span>Guided rolls — walk through skill, assets, and Effort; spends pool points.</span>
      </label>

      <label class="settings__toggle">
        <input class="settings__whisper" type="checkbox" v-model="sheet.ui.whisperItemCards" />
        <span>Whisper item cards to the GM — chat cards sent from a row stay private. Rolls
          are unaffected.</span>
      </label>

      <ImportExportPanel />
    </template>
    <!-- Spec §7.1: in NPC mode the creature panel takes the character panel's place. -->
    <CreatureImportExportPanel v-if="npc.isNpc" />
  </ModalShell>
</template>
