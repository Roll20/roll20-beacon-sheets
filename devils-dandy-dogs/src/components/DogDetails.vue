<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
const sheet = useSheetStore()
</script>

<template>
  <section class="details ddd-section">
    <h2 class="ddd-banner">Details</h2>
    <div class="ddd-panel">
      <label class="label">Devil&rsquo;s Mark &mdash; Location</label>
      <input v-model="sheet.devilsMark.location" />
      <label class="label">Devil&rsquo;s Mark &mdash; Description</label>
      <textarea v-model="sheet.devilsMark.description" rows="2"></textarea>
      <label class="label">Goal</label>
      <textarea v-model="sheet.goal" rows="2"></textarea>
      <label class="label">Packmates</label>
      <textarea v-model="sheet.packmates" rows="3"></textarea>
      <label class="label">Notes</label>
      <textarea v-model="sheet.notes" rows="4"></textarea>
    </div>
  </section>
</template>
