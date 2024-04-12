<script setup>
import { useAppStore } from '@/stores/index.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetStore } from '@/stores/sheetStore.js'

// These stores should drive how to access the data in your sheet, and how to trigger actionable events.
const appStore = useAppStore()
// The meta store has generic character info for every sheet.
const meta = useMetaStore()
// The sheet store is where you want to be to customize what data / fields are on your sheet.
const sheet = useSheetStore()
</script>
<template>
  <div class="header">
    <div class="title">Quickstart Sheet</div>
    <button class="button" @click="appStore.loadExampleData">Reset</button>
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
        <div class="subtitle">Traits - {{ sheet.traitsCount }}</div>
        <button class="button" @click="sheet.addTrait">Add</button>
      </div>
      <div class="traits">
        <div class="trait-item" v-for="trait in sheet.traits" :key="trait._id">
          <input v-model="trait.name" placeholder="Name" />
          <input v-model="trait.description" placeholder="Description" />
          <button class="button" @click="sheet.postTraitToChat(trait)">Chat</button>
          <button class="button" @click="sheet.removeTrait(trait._id)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*
The quickstart header. Replace this with a logo, your sheet title, or remove this.
*/
.header {
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: auto auto;
  gap: 0.5rem;
  padding-top: 1rem;
}
.title {
  font-size: 2.5rem;
  line-height: 3rem;
}

/*
This is a boilerplate layout that uses grid to help you get started on your sheet.
Customize this layout by modifying the template columns and rows you will need for each section.
*/
.sheet {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 2rem;
}
.card {
  display: grid;
  gap: 0.5rem;
  border-radius: 2rem;
  padding: 1rem;
  background: #1f1f1f;
  &:hover {
    background: rgba(14, 98, 107, 0.86);
  }
}

/*
Header for each card in your grid layout
*/
.subheader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.subtitle {
  padding-top: 1.25rem;
  font-size: 1.75rem;
  line-height: 2rem;
}

/*
Styling for buttons
*/
.button {
  cursor: pointer;
  width: auto;
  height: fit-content;
  background: #b719be;
  color: #ffffff;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem;
  border: none;
  font-weight: 500;
  &:hover {
    background: rgb(200, 68, 206);
  }
}

/*
Styling for form labels
*/
.label {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}
/*
Styling for form inputs, currently this quickstart is only using default inputs that handle text.
*/
input {
  font-size: 1rem;
  color: #ffffff;
  background-color: #000000;
  border-radius: 0.25rem;
  border: none;
  height: 2rem;
  padding: 0.25rem;
  &:focus {
    outline-color: #ffffff;
    outline-style: groove;
  }
}
/*
Avatar positioning and default styles
*/
.avatar {
  justify-self: center;
  img {
    height: 10rem;
    border-radius: 0.5rem;
  }
}
/*
Styling for the scrollable traits list.
*/
.traits {
  overflow-y: scroll;
  height: 15rem;
  padding: 0.25rem;
}
/*
Styling for each trait row, that uses a grid.
*/
.trait-item {
  display: grid;
  grid-template-columns: 8rem 1fr auto auto 1rem;
  column-gap: 0.25rem;
  padding-bottom: 0.25rem;
}
</style>
