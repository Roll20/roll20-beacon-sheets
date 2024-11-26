<template>
  <div class="config-container">
    <button type="button" class="config-btn age-icon-btn"  @click="showModal = true">
      <font-awesome-icon :icon="['fa', 'gear']" />
  </button> 
                    </div>     
  <div class="age-character-bio bio">
    <div class="bio__avatar">
        <img v-if="meta.avatar" :src="meta.avatar || DEFAULT_AVATAR_URL" />
        <font-awesome-icon v-if="!meta.avatar" :icon="['fa', 'user']" class="age-no-avatar" />
        

        <Tippy v-if="!settings.showXP" content=" " interactive placement="right-end" aria-expanded="true" class="age-label age-level-label">
          <div>
            {{  char.level }} 
          </div>
          <template #content>
            <div>
              <button class="age-levelup-btn" @click="levelUp">Level Up</button>
            </div>
          </template>
        </Tippy> 
        <div v-else class="age-label age-level-label">
            {{  char.level }} 
          </div>
      </div>
      <div class="age-character-details">
        <h1 class="age-character-name">
            {{ meta.name }}
        </h1>
        <div class="age-character-bio-container" v-if="bio.type === 'Character'">
          <div class="age-character-bio-value" v-if="bio.profession">
            {{ bio.profession }}
          </div>
          <div class="age-character-bio-value" v-if="bio.ancestry">
            {{ bio.ancestry }}
          </div>
          <div class="age-character-bio-value" v-if="bio.socialClass">
            {{ bio.socialClass }}
          </div>
          <div class="age-character-bio-value" v-if="bio.background">
            {{ bio.background }}
        </div>
        <div class="age-character-bio-value" v-if="bio.drive">
            {{ bio.drive }}
          </div>
        <div class="age-character-bio-container" v-if="bio.type === 'Animon'">
          <div class="age-character-bio-value">
            {{ bio.ancestry }}
          </div>
        </div>
        </div>
        <div class="age-character-bio-container" v-if="bio.type === 'AniMon'">
          <div class="age-character-bio-value">
            {{ bio.ancestry }}
          </div>
          <div class="age-character-bio-value">
            aka {{ bio.aliases }}
          </div>
          
          <div class="age-character-bio-value">
            Threat Level: {{ bio.threat }}
          </div>
        </div>
        
        
        
    </div>
      
  </div>

  <Teleport to="body">
    <BioModalView v-if="showModal" :show="showModal" @close="closeModal">
      <template #header>
        <h3 class="age-attack-details-header">Character Info</h3>
      </template>
    </BioModalView>
    </Teleport>
</template>

<script setup>
 import { Tippy } from 'vue-tippy'


import { ref } from 'vue';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import BioModalView from './BioModalView.vue';
import { useSettingsStore} from '@/sheet/stores/settings/settingsStore'
const DEFAULT_AVATAR_URL = 'http://placekitten.com/200/200';

const settings = useSettingsStore();
const meta = useMetaStore();
const bio = useBioStore();
const char = useCharacterStore();
const showModal = ref(false)
function closeModal() {
  showModal.value = false;
}
const levelUp = () => {
  char.levelUp();
}
</script>

<style scoped lang="scss">
.bio {
    display: grid;
    grid-template-columns: 160px calc(100% - 200px);
  &__body {
    display: flex;
    gap: 0.5rem;
  }

  &__avatar {
    // width: 14.5rem;
    // aspect-ratio: 1/1;
    margin: 0 auto;
    position: relative;
    height: fit-content;
    & .age-no-avatar {
      font-size: 12rem;
      color: rgba(0,0,0,0.5);
    }
    img {
      object-fit: cover;
      width: 100%;
    }
  }
  &__form {
    display: grid;
    grid-gap: 25px;
    grid-template-columns: 1fr 120px 120px;
    & .bio-primary {
      // display: grid;
      // grid-gap: 0 1%;
      // grid-template-columns: 49% 49%;
      & .age-label {
        height: 30px;
        clip-path: polygon(
            10px 0px, 
            calc(100% - 10px) 0px, 
            100% 10px, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            10px 100%, 
            0px calc(100% - 10px), 
            0px 10px);
      }
      & .age-label-content {
        clip-path: polygon(
            10px 0px, 
            calc(100% - 10px) 0px, 
            100% 10px, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            10px 100%, 
            0px calc(100% - 10px), 
            0px 10px);
      }
    }
    & .bio-secondary, .bio-tertiary {
      display: flex;
      flex-direction: column;
      & .age-label {
        clip-path: polygon(
            10px 0px, 
            calc(100% - 10px) 0px, 
            100% 10px, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            10px 100%, 
            0px calc(100% - 10px), 
            0px 10px);
      }
      & .age-label-content {
        text-align: center;
        clip-path: polygon(
            10px 0px, 
            calc(100% - 10px) 0px, 
            100% 10px, 
            100% calc(100% - 10px), 
            calc(100% - 10px) 100%, 
            10px 100%, 
            0px calc(100% - 10px), 
            0px 10px);
            & label {
              width:50px;
            }
            & .age-bio-input {
              width: inherit;
              font-size: 25px;
              font-weight: bold;
              text-align: center;
              padding-left: 20px;
            }
      }
    }
  }
  .label {
    font-weight: 600;
    width: 4.75rem;
    display: inline-block;
  }
}
.age-cl-columns {
  display: grid;
  grid-template-columns: 1fr 40px;
}
</style>
