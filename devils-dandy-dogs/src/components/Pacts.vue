<script setup>
import { ref } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
const sheet = useSheetStore()
const picked = ref('')
// Tracks CLOSED rather than open, so a newly added card starts expanded without needing to be
// registered here first.
const shut = ref({})
const add = () => { if (picked.value) { sheet.addPact(picked.value); picked.value = '' } }
const toggle = (id) => { shut.value[id] = !shut.value[id] }
</script>

<template>
  <section class="pacts ddd-section">
    <h2 class="ddd-banner">Pact Cards</h2>
    <div class="ddd-panel">
      <div class="pacts__add">
        <select class="pact-picker" v-model="picked">
          <option value="">Choose a pact&hellip;</option>
          <option v-for="p in sheet.pacts" :key="p.name" :value="p.name">{{ p.name }}</option>
        </select>
        <button class="add-pact ddd-btn" @click="add">Add</button>
      </div>
      <div v-for="p in sheet.savedPacts" :key="p._id" class="pact">
        <div class="pact__row">
          <button class="pact__toggle ddd-btn" :aria-expanded="!shut[p._id]" @click="toggle(p._id)">
            {{ shut[p._id] ? 'Show' : 'Hide' }}
          </button>
          <span class="pact__name">{{ p.name }}</span>
          <button class="ddd-btn" @click="sheet.postPact(p)">Chat</button>
          <button class="ddd-btn" @click="sheet.removePact(p._id)">Remove</button>
        </div>
        <!-- pact text is trusted bundled HTML -->
        <div v-if="!shut[p._id]" class="pact__text" v-html="p.text"></div>
      </div>
    </div>
  </section>
</template>
