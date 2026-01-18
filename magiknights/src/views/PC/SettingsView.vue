<script setup>
import { useSheetStore } from '@/stores';
import NotchContainer from '@/components/NotchContainer.vue';

const sheet = useSheetStore();
</script>

<template>
  <div class="settings-view">
    <h3>Sheet Mode</h3>
    <p class="settings-description">
      Switch between Player Character and NPC/Monster sheet modes.
    </p>
    <NotchContainer class="sheet-mode-section" notchType="wedge">
      <div class="mode-info">
        <span>Current Mode: <strong>Player Character</strong></span>
        <button class="mode-switch-btn" @click="sheet.sheet_mode = 'npc'">
          Switch to NPC Sheet
        </button>
      </div>
    </NotchContainer>

    <h3>Token Settings</h3>
    <p class="settings-description">
      Configure token images for automatic switching when transforming between Student and Magi-Knight forms.
      Paste the full URL of your uploaded Roll20 token images below.
    </p>
    <div class="token-images-grid">
      <NotchContainer class="token-image-field" notchType="wedge">
        <h4>Student Token Image</h4>
        <input
          class="underline"
          type="text"
          v-model="sheet.studentTokenImage"
          placeholder="Paste student form token image URL"
        >
      </NotchContainer>
      <NotchContainer class="token-image-field" notchType="wedge">
        <h4>Magi-Knight Token Image</h4>
        <input
          class="underline"
          type="text"
          v-model="sheet.knightTokenImage"
          placeholder="Paste magi-knight form token image URL"
        >
      </NotchContainer>
    </div>
  </div>
</template>

<style lang="scss">
.settings-view {
  display: grid;
  gap: var(--gap);
  padding: var(--half-gap);

  h3 {
    margin: 0;
    color: var(--header-blue, #4a4a8a);
  }

  .settings-description {
    font-size: 0.9em;
    color: #666;
    margin: 0;
    line-height: 1.4;
  }

  .token-images-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap);
  }

  .token-image-field {
    padding: var(--half-gap);

    h4 {
      margin-bottom: var(--half-gap);
      text-align: center;
    }

    input {
      width: 100%;
      font-size: 0.85em;
    }
  }

  .sheet-mode-section {
    padding: var(--half-gap);
  }

  .mode-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--half-gap);
  }

  .mode-switch-btn {
    padding: 8px 16px;
    background: var(--header-blue, #4a4a8a);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
