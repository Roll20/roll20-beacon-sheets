<template>
  <div class="section bio">
	<h3>NPC Info</h3>
    <div class="section__body bio__body">
      <div class="bio__form">
        <div class="bio__fields">
          <div class="bio__row">
            <label for="name">
              <span id="name" class="name">{{ meta.name }}</span>
            </label>
          </div>

          <div class="bio__row">
            <label for="player">
              <span class="label">Level:</span>
              <input id="player" v-model="npc.level" />
            </label>
          </div>

          <div class="bio__row">
            <label for="description" class="bio__description-label">
              <span class="label">Description:</span>
              <textarea id="description" v-model="npc.description" rows="3"></textarea>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNPCStore } from '@/sheet/stores/character/npcStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';

const npc = useNPCStore();
const meta = useMetaStore();
</script>

<style scoped lang="scss">
.bio {
  &__body {
    display: flex;
    gap: 0.5rem;
    padding: 0 0.5rem;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__row {
    display: flex;
    gap: 1rem;

    label {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      flex: 1;

      .name {
        background-color: rgba(0, 0, 0, 0.05) !important;
        width: 100%;
        border: 1px solid #7a7971;
        border-radius: 2px;
        padding: 1rem 0.25rem;
        font-size: 1.4rem;
        font-weight: bold;
        text-align: center;
      }

      &:only-child {
        flex: 1;
      }
    }
  }

  .label {
    font-weight: 600;
    text-align: left;
  }

  input,
  textarea {
    flex: 1;
    min-width: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid #7a7971;
    border-radius: 2px;
    padding: 0.25rem;
  }

  textarea {
    resize: vertical;
    min-height: 60px;
    width: 100%;
  }
}

.traits {
  &__group {
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.25rem 0;
  }

  &__divider {
    height: 1px;
    background-color: #7a7971;
    margin: 0.25rem 0 0.5rem 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__item {
    padding: 0.25rem;
    border-radius: 0.25rem;
    background-color: #2c2c2c;
  }
}
</style>
