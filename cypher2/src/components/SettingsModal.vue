<script setup>
import { computed } from 'vue'
import ModalShell from '@/components/ModalShell.vue'
import ImportExportPanel from '@/components/ImportExportPanel.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { THEMES, resolveTheme } from '@/components/themes.js'

const emit = defineEmits(['close'])
const sheet = useSheetStore()

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

<template>
  <ModalShell label="Settings" @close="emit('close')">
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
  </ModalShell>
</template>
