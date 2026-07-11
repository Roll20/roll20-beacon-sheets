<script setup>
import { useStatsStore } from '@/stores/statsStore.js'
const stats = useStatsStore()
</script>

<template>
  <div class="notes">
    <section class="area">
      <h2 class="section-title">Notes</h2>
      <textarea v-model="stats.notes" placeholder="Notes libres…"></textarea>
    </section>
  </div>
</template>

<style scoped lang="scss">
.notes {
  padding: 1rem;
}
textarea {
  width: 100%;
  min-height: 480px;
  padding: 0.5rem;
  font-size: 0.9rem;
  resize: vertical;
}
</style>
