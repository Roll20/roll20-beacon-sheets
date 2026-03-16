<template>
  <div class="view view--configuration" v-if="isGM">
    <div class="configuration">
      <span class="title">Sheet Type</span>
      <div class="list">
        <button type="button" @click="setCharacter" :class="{ active: sheetType === 'character' }">
          <span>Character</span>
        </button>
        <button type="button" @click="setChallenge" :class="{ active: sheetType === 'challenge' }">
          <span>Challenge</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { challengeStore } from '@/sheet/stores/challenge/challengeStore';
import { computed, ref, watch } from 'vue';
import router from '@/router';

const meta = metaStore();
const challenge = challengeStore();

const sheetType = ref<'character' | 'challenge' | undefined>(challenge.sheetType || 'character');

const isGM = computed(() => meta.permissions.isGM);

const setCharacter = () => {
  sheetType.value = 'character';
  save();
};

const setChallenge = () => {
  sheetType.value = 'challenge';
  save();
};

const save = () => {
  challenge.sheetType = sheetType.value;
  if(sheetType.value === 'challenge') challenge.mode = 'edit';
  router.replace({ name: sheetType.value });
};

watch(
  () => meta.permissions.isGM,
  (isGM) => {
    if (!isGM) {
      sheetType.value = challenge.sheetType || 'character';
      router.replace({ name: sheetType.value });
    } else {
      //Nothing to do
    }
  }
);
</script>
<style scoped lang="scss">
  .view--configuration {
    --color-palette-highlight: 207 255 87;
    
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 18px;
    .configuration {
      min-width: 200px;
      background-color: rgb(41 36 53 / 90%);
      border-radius: 5px;
      border: 2px solid rgb(var(--color-palette-foreground) / 0.15);
      padding: 15px;
      box-shadow: 0 0 10px rgb(var(--color-palette-shadow));
    }
    .title {
      display: grid;
      grid-template-columns: 1fr max-content 1fr;
      gap: 5px;
      text-align: center;
      font-size: 24px;
      font-family: var(--font-family-title);
      text-transform: uppercase;
      margin-bottom: 10px;
      color: var(--color-text-secondary);
      &:before, &:after {
        content: '';
        height: 2px;
        background-color: rgba(0,0,0,0.35);
        align-self: center;
      }
    }
    button {
      background-color: rgb(var(--color-palette-foreground) / 0.05);
      box-sizing: border-box;
      width: 100%;
      height: 28px;
      border: 2px solid rgb(var(--color-palette-foreground) / 0.15);
      border-radius: 5px;
      cursor: pointer;
      span{
        color: var(--color-text-primary);
        font-size: var(--font-size-xlarge);
        font-family: var(--font-family-body);
        text-transform: uppercase;
        font-weight: normal;
      }
      &:hover {
        background-color: rgb(var(--color-palette-shadow) / 0.25);
        border: 2px solid rgb(var(--color-palette-highlight));
        span{
          color: rgb(var(--color-palette-highlight));
        }
      }
    }
  }
</style>