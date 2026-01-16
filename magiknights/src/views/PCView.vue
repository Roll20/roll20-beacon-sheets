<script setup>
import { useMetaStore } from '@/stores/metaStore.js';
import { useSheetStore } from '@/stores/sheetStore.js';
import MasterHeader from '@/components/MasterHeader.vue';
import HPContainer from '@/components/HPContainer.vue';
import BaseSplit from '@/components/BaseSplit.vue';
import KnightNav from '@/components/KnightNav.vue';
import SkillSection from '@/components/SkillSection.vue';
import NotchContainer from '@/components/NotchContainer.vue';

let permissions = useMetaStore().permissions;
const sheet = useSheetStore();

</script>

<template>
  <div v-if="permissions.isOwner || permissions.isGM" class="player-view">
    <div class="top-section">
      <MasterHeader />
      <BaseSplit class="base-split" />
      <KnightNav />
    </div>
    <div class="column">
      <HPContainer />
      <SkillSection />
    </div>
    <div class="specific-view column">
      <RouterView />
    </div>
    <div class="token-images-section">
      <NotchContainer class="token-image-field">
        <h4>Student Token Image</h4>
        <input class="underline" type="text" v-model="sheet.studentTokenImage" placeholder="Paste student form token image URL">
      </NotchContainer>
      <NotchContainer class="token-image-field">
        <h4>Magi-Knight Token Image</h4>
        <input class="underline" type="text" v-model="sheet.knightTokenImage" placeholder="Paste magi-knight form token image URL">
      </NotchContainer>
    </div>
  </div>
  <div v-else class="no-permissions">
    <img class="centered-image" src="@/assets/no-character-access.png" alt="You do not have access to this character">
  </div>
</template>

<style lang="scss">
.player-view{
  display: grid;
  grid-template-columns: 270px 1fr;
  grid-auto-flow: dense;
  gap: var(--half-gap);
  > .top-section{
    grid-column: 1 / -1;
    gap: inherit;
    display: grid;
  }
  > .specific-view{
    container-type: inline-size;
  }
  > .column{
    display: grid;
    gap: inherit;
    align-content: start;
  }
  > .token-images-section {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--half-gap);
    margin-top: var(--half-gap);
    padding-top: var(--half-gap);
    border-top: 1px solid var(--border-color, #ccc);
  }
}
.token-image-field {
  padding: var(--half-gap);
  h4 {
    margin-bottom: var(--half-gap);
    text-align: center;
  }
  input {
    width: 100%;
    font-size: 0.8em;
  }
}
.knight-nav{
  grid-column: 1 / -1;
  > ul{
    display: flex;
    justify-content: space-around;
    gap: var(--half-gap);
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
}
.overflow-container {
  --_overflow: 25px;
  position: relative;
  margin-top: var(--_overflow);
  display: flex;
  flex-direction: column;

  .overflow-header {
    margin-top: calc(var(--_overflow) * -1);
    align-self: center;
    background: var(--masterBack);
  }
}

.no-permissions {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
  background-color: #000; /* Optional background color */
}

.centered-image {
  max-width: 80%; /* Ensure the image scales for smaller screens */
  max-height: 80%;
  object-fit: contain; /* Maintain aspect ratio */
}
</style>