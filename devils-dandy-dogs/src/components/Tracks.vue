<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
const sheet = useSheetStore()
const PIPS = [1, 2, 3]
const setRend = (n) => sheet.setShadowRends(sheet.shadowRends === n ? n - 1 : n)
</script>

<template>
  <section class="tracks ddd-section">
    <h2 class="ddd-banner">Shadow &amp; Memory</h2>
    <div class="ddd-panel">
      <div class="track">
        <span class="label">Shadow Rends</span>
        <button
          v-for="n in PIPS"
          :key="n"
          class="rend-pip"
          :class="{ filled: sheet.shadowRends >= n }"
          :aria-pressed="sheet.shadowRends >= n"
          :aria-label="`Shadow Rend ${n}`"
          @click="setRend(n)"
        >{{ sheet.shadowRends >= n ? '◆' : '◇' }}</button>
        <span v-if="sheet.shadowRiven" class="riven">Shadow Riven</span>
      </div>

      <div class="track">
        <span class="label">Memory Shards</span>
        <input type="number" min="0" v-model.number="sheet.memoryShards" />
        <button class="unlock-memory ddd-btn" :disabled="!sheet.canUnlockMemory" @click="sheet.unlockMemory()">
          Unlock Memory (&minus;3)
        </button>
      </div>

      <div class="memories">
        <div class="memories__head">
          <h3 class="sub">Unlocked Memories</h3>
          <button class="add-memory ddd-btn" @click="sheet.addMemory">Add</button>
        </div>
        <div v-for="m in sheet.memories" :key="m._id" class="memory">
          <textarea v-model="m.text" rows="2" placeholder="Memory note"></textarea>
          <button class="ddd-btn" @click="sheet.removeMemory(m._id)">Remove</button>
        </div>
      </div>
    </div>
  </section>
</template>
