<template>
  <div class="header">
    <div class="title">Quickstart Sheet</div>
    <button class="button" @click="appStore.loadExampleData">
      Reset
    </button>
  </div>
  <div class="sheet">
    <div class="card">
      <div class="avatar">
        <img :src="meta.avatar" alt="Character Avatar" />
      </div>
      <label for="character_name">
        <span class="label">Character Name</span>
      </label>
      <input id="character_name" v-model="meta.name" />
      <label for="faction">
        <span class="label">Faction</span>
      </label>
      <input id="faction" v-model="sheet.faction" />
    </div>
    <div class="card">
      <div class="subheader">
        <div class="subtitle">Traits - {{sheet.traitsCount}}</div>
        <button class="button" @click="sheet.addTrait">
          Add
        </button>
      </div>
      <div class="traits">
        <div class="trait-item" v-for="(trait) in sheet.traits" :key="trait._id">
          <input v-model="trait.name" placeholder="Name" />
          <input v-model="trait.description" placeholder="Description" />
          <button class="button" @click="sheet.removeTrait(trait._id)">
            Remove
          </button>
        </div>
      </div>
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
.header {
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: auto auto;
  gap: .5rem;
  padding-top: 1rem;
}
.subheader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 2rem;
}
.card {
  display: grid;
  gap: .5rem;
  border-radius: 2rem;
  padding: 1rem;
  background: #1f1f1f;
  &:hover { background: rgba(14, 98, 107, 0.86); }
}
.title {
  font-size: 2.5rem;
  line-height: 3rem;
}
.subtitle {
  padding-top: 1.25rem;
  font-size: 1.75rem;
  line-height: 2rem;
}
.button {
  cursor: pointer;
  width: auto;
  height: fit-content;
  background: #b719be;
  color: #ffffff;
  border-radius: .25rem;
  font-size: .75rem;
  padding: .25rem;
  border: none;
  font-weight: 500;
  &:hover { background: rgb(200, 68, 206); }
}
.label {
  font-weight: 600;
  font-size: .75rem;
  text-transform: uppercase;
}
input {
  font-size: 1rem;
  color: #ffffff;
  background-color: #000000;
  border-radius: .25rem;
  border: none;
  height: 2rem;
  padding: .25rem;
  &:focus {
    outline-color: #ffffff;
    outline-style: groove;
  }
}
.avatar {
  justify-self: center;
  img { height: 10rem; border-radius: .5rem; }
}
.traits {
  overflow-y: scroll;
  height: 15rem;
  padding: .25rem;
}
.trait-item {
  display: grid;
  grid-template-columns: 10rem 1fr auto 1rem;
  column-gap: .25rem;
  padding-bottom: .25rem;
}
</style>
