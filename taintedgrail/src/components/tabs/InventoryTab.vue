<template>
  <div class="inventory-tab">
    <!-- Riches Section -->
    <div class="riches-section">
      <div class="riches-container">
        <h3>Riches</h3>
        <input type="number" id="riches" v-model="character.riches" placeholder="0" min="0" />
      </div>
    </div>

    <!-- Equipment Section -->
    <div class="equipment-section">
      <div class="equipment-block">
        <h3>Equipment</h3>
        <div class="equipment-body"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
const character = useCharacterStore();
</script>

<style scoped lang="scss">
.inventory-tab {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h3 {
    font-weight: 600;
    margin: 0;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid #8b4513;
    padding-bottom: 0.25rem;
    color: #5a3a1a;
  }

  // Riches Section
  .riches-section {
    .riches-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      h3 {
        border: none;
        margin: 0;
        font-size: 1.2rem;
        min-width: fit-content;
      }

      position: relative;
      display: flex;
      align-items: center;
      width: 120px;

      input {
        width: 100%;
        padding: 0.375rem 2rem 0.375rem 0.5rem;
        font-size: 1rem;
        font-weight: 500;
        background-color: rgba(0, 0, 0, 0.05);
        border: 1px solid #7a7971;
        border-radius: 4px;
        text-align: center;

        &:focus {
          outline: none;
          border-color: #b8860b;
        }

        &::placeholder {
          color: #999;
          font-weight: normal;
        }
      }
    }
  }

  .equipment-section {
    flex: 1;

    .equipment-block {
      padding: 0.5rem 0;

      .equipment-body {
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-style: italic;
      }
    }
  }
}
</style>
