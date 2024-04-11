<template>
  <div class="sheet">
    <div class="card">
      <div class="title">Quickstart Sheet</div>
      <button class="button-lg" @click="appStore.loadExampleData">
        Set Defaults
      </button>
    </div>
    <div class="card">
      <div class="avatar">
        <img :src="meta.avatar" alt="Character Avatar" />
      </div>
      <label for="name">
        <span class="label">Character Name</span>
      </label>
      <input id="name" v-model="meta.name" />
      <label for="faction">
        <span class="label">Faction</span>
      </label>
      <input id="faction" v-model="sheet.faction" />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/index.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetStore } from '@/stores/sheetStore.js'

const meta = useMetaStore();
const sheet = useSheetStore();
const appStore = useAppStore();
</script>

<style scoped>
.sheet {
  display: grid;
  justify-content: center;
  gap: 1rem;
}
.card {
  display: grid;
  justify-content: center;
  gap: .5rem;
  border-radius: 2rem;
  padding: 1rem;
  background: #1f1f1f;
  box-shadow: 0px 7px 8px 0px rgba(0, 0, 0, 0.20), 0px 5px 22px 0px rgba(0, 0, 0, 0.12), 0px 12px 17px 0px rgba(0, 0, 0, 0.14);
  &:hover { background: #353535; }
}
.title {
  font-size: 2.5rem;
  line-height: 3rem;
}
.button-lg {
  cursor: pointer;
  background: #e016e7;
  color: #ffffff;
  border-radius: .25rem;
  font-size: .9rem;
  padding: 5px 15px;
  border: none;
  font-weight: 500;
  max-width: fit-content;
  text-align: center;
  &:hover { background: rgba(174, 11, 237, 0.95); }
}
.label {
  font-weight: 600;
  font-size: 1rem;
}
input {
  font-size: .75rem;
}
.avatar {
  img { height: 10rem; border-radius: .5rem; }
}
</style>
