<script setup>
import { inject } from 'vue';
import { useSheetStore, useMetaStore } from '@/stores';
import { initValues } from '@/relay';
import NotchContainer from '@/components/NotchContainer.vue';

const sheet = useSheetStore();
const meta = useMetaStore();
const dispatch = inject('dispatch');

const handleTransform = async () => {
  const { isTransformed, tokenImage, formName } = sheet.toggleTransform();

  // Update token image if a URL is configured
  if (tokenImage && dispatch) {
    await dispatch.updateTokensByCharacter({
      characterId: initValues.character.id,
      token: {
        imgsrc: tokenImage,
      },
    });
  }

  // Post transformation message to chat
  if (dispatch) {
    dispatch.post({
      characterId: initValues.character.id,
      content: `transforms into ${formName} form!`,
      options: { whisper: false },
    });
  }
};
</script>

<template>
  <header class="master-header">
    <div class="logo" aria-label="magi-knight logo"></div>
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
    <div class="transform-toggle" @click="handleTransform">
      <NotchContainer class="transform-notch" :class="{ active: sheet.isTransformed }" notchType="wedge">
        {{ sheet.isTransformed ? 'Magi-Knight' : 'Student' }}
      </NotchContainer>
      <span class="transform-label">Current Form</span>
    </div>
  </header>
</template>

<style lang="scss">
  .master-header{
    display: grid;
    grid-template-columns: 1fr [logo-start] 1fr 80px 1fr [logo-end] 1fr;
    grid-template-rows: [logo-start]80px auto auto [logo-end];
    grid-template-areas:
      ".        .        . .      .         "
      "charname charname . level  level     "
      "player   player   . reputation reputation";
    position: relative;
    .logo{
      grid-area: logo;
      position:absolute;
      height: 100%;
      width: 100%;
      background-size: 80% 100%;
      background-repeat: no-repeat;
      background-position: 50% center;
      place-self: start center;
      background-image: var(--header-image);
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
  .transform-toggle {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 10;
    cursor: pointer;
  }
  .transform-notch {
    padding: var(--half-gap) var(--gap);
    --borderColor: var(--header-blue);
    line-height: 1.2;
    min-height: calc(1.2em + (var(--half-gap) * 2));

    &:hover,
    &:focus-visible {
      background-color: var(--header-blue);
      color: var(--masterBack);
    }

    &.active {
      background-color: var(--header-blue);
      color: var(--masterBack);
    }
  }
  .transform-label {
    font-size: 0.7em;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.5px;
  }
</style>
