<script setup>
import { useSheetStore,useMetaStore } from '@/stores';
const sheet = useSheetStore();
const meta = useMetaStore();
</script>

<template>
  <header class="master-header">
    <img src="@/assets/magiKnight-header.png" alt="magi-knight logo" class="logo">
    <div class="flex-box tiny-gap flex-column character-name">
      <input type="text" class="underline" v-model="meta.name">
      <span class="capitalize">magi-knight name</span>
    </div>
    <div class="flex-box tiny-gap flex-column level">
      <input type="text" class="underline" pattern="/\d+/" v-model="sheet.level">
      <span class="capitalize">magi-knight level</span>
    </div>
    <div class="flex-box tiny-gap flex-column player">
      <input type="text" class="underline" v-model="sheet.player">
      <span class="capitalize">player name</span>
    </div>
    <div class="flex-box tiny-gap flex-column reputation">
      <input type="text" class="underline" pattern="/\d+/" v-model="sheet.reputation">
      <span class="capitalize">reputation level</span>
    </div>
  </header>
</template>

<style lang="scss">
  .master-header{
    display: grid;
    grid-template-columns: 1fr [logo-start] 1fr 80px 1fr [logo-end] 1fr;
    grid-template-rows: [logo-start]80px auto auto [logo-end];
    grid-template-areas:
      ".        .        . .      ."
      "charname charname . level level"
      "player player . reputation reputation";
    position: relative;
    .logo{
      grid-area: logo;
      position:absolute;
      height: 100%;
      place-self: start center;
    }
    > :nth-child(odd){
      align-items: end;
      *{
        text-align: right;
      }
    }
  }
  .character-name{
    grid-area: charname;
    width: 97%;
  }
  .level{
    grid-area: level;
  }
  .player{
    grid-area: player;
    width: 97%;
  }
  .reputation{
    grid-area: reputation;
  }
  .underline{
    width: 100%;
  }
</style>