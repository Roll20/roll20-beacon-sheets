<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
const sheet = useSheetStore()
</script>

<template>
  <section class="tricks ddd-section">
    <h2 class="ddd-banner">Tricks</h2>
    <div class="ddd-panel">
      <div class="tricks__head">
        <button class="add-trick ddd-btn" @click="sheet.addTrick()">Add</button>
      </div>
      <div v-for="trick in sheet.tricks" :key="trick._id" class="trick">
        <div class="trick__row">
          <input v-model="trick.name" placeholder="Trick name" />
          <button class="post ddd-btn" @click="sheet.postTrick(trick)">Chat</button>
          <button class="remove ddd-btn" @click="sheet.removeTrick(trick._id)">Remove</button>
        </div>
        <!-- trick text is trusted bundled HTML when loaded from a Role -->
        <div class="trick__text" v-html="trick.text"></div>
      </div>
    </div>
  </section>
</template>
