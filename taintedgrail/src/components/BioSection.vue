<template>
  <div class="section bio">
    <div class="section__body bio__body">
      <div class="bio__form">
        <div class="bio__fields">
          <div class="bio__name">
            <input id="name" v-model="meta.name" />
          </div>
          
          <div class="bio__row">
            <label for="player">
              <span class="label">Player:</span>
              <input id="player" v-model="bio.player" />
            </label>
          </div>
          
          <div class="bio__row">
            <label for="age">
              <span class="label">Age:</span>
              <input id="age" v-model="bio.age" />
            </label>
            <label for="origin">
              <span class="label">Origin:</span>
              <input id="origin" v-model="bio.origin" />
            </label>
          </div>
          
          <div class="bio__row">
            <label for="occupation">
              <span class="label">Occupation:</span>
              <input id="occupation" v-model="bio.occupation" />
            </label>
            <label for="experience">
              <span class="label">Experience:</span>
              <input id="experience" v-model="bio.experience" />
            </label>
          </div>
          
          <div class="bio__row">
            <label for="description" class="bio__description-label">
              <span class="label">Description:</span>
              <textarea id="description" v-model="bio.description" rows="3"></textarea>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';

const meta = useMetaStore();
const bio = useBioStore();
</script>

<style scoped lang="scss">
.bio {
  &__body {
    display: flex;
    gap: 0.5rem;
  }
  
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  &__name {
    flex: 1;
    width: 100%;
    
    input {
      width: 100% !important;
      font-size: 1.2rem;
      font-weight: bold;
      text-align: center;
      padding: 0.5rem;
      box-sizing: border-box;
      flex: none;
    }
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
      
      &:only-child {
        flex: 1;
      }
    }
  }
  
  .label {
    font-weight: 600;
    text-align: left;
  }
  
  input, textarea {
    flex: 1;
    min-width: 0;
    width: 100%;
  }
  
  textarea {
    resize: vertical;
    min-height: 60px;
    background: transparent;
    width: 100%;
  }
}
</style>
