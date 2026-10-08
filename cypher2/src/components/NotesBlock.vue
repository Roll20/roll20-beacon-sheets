<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'

const sheet = useSheetStore()
</script>

<template>
  <div class="notes-block panel">
    <h3 class="banner">Notes &amp; Background</h3>
    <label class="notes-block__field">
      <span class="microlabel">Background</span>
      <textarea class="field" v-model="sheet.background" rows="6" />
    </label>
    <label class="notes-block__field">
      <span class="microlabel">Notes</span>
      <textarea class="field" v-model="sheet.notes" rows="6" />
    </label>
  </div>
</template>
