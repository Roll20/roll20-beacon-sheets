<template>
  <!-- {{ settings.gameSystem = undefined }} -->
  <transition name="fade">
    <NewSplashView v-if="!settings.gameSystem" @close="setTheme" />
  </transition>
  <main v-if="settings.gameSystem" >
    <div class="system-header">
            <img v-if="settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e'" src="/src//assets/logos/fantasyage.png" style="width: 100%;height: auto;margin-left:10px;" alt="Fantasy AGE">
            <img v-if="settings.gameSystem === 'mage'" src="/src/assets/logos/modernage.png" style="width: 90%;height: auto;margin-left:10px;" alt="Fantasy AGE">
            <img v-if="settings.gameSystem === 'blue rose'" src="/src/assets/logos/bluerose.png" style="width: 90%;height: auto;margin-left:10px;" alt="Fantasy AGE">
            <img v-if="settings.gameSystem === 'threefold'" src="/src/assets/logos/threefold.png" style="width: 90%;height: auto;margin-left:10px;" alt="Fantasy AGE">
            <img v-if="settings.gameSystem === 'expanse'" src="/src/assets/logos/expanse.png" style="width: 90%;height: auto;margin-left:10px;" alt="Fantasy AGE">
            <!-- <img v-if="settings.gameSystem === 'cthulhu'" src="/src/assets/logos/cthulhu.png" style="width: 90%;height: auto;margin-left:10px;" alt="Fantasy AGE"> -->
            <div class="age-header-options">
              <div class="age-header-btn-container">
                <div class="age-header-btn">
                  <button v-if="settings.whisperRollsGM === 'toggle'" :class="{ active: settings.whisperRollsGMToggle }" class="age-btn" @click="settings.whisperRollsGMToggle = !settings.whisperRollsGMToggle">
                    <div class="age-toggle-btn-icon age-toggle-whisper-icon"></div>
                    <span>Whisper</span>
                  </button>
                </div>
                <div class="age-header-btn">
                  <button v-if="settings.aimToggle === 'toggle'" :class="{ active: settings.aim }" class="age-btn" @click="updateToggle;settings.aim = !settings.aim">
                    <div class="age-toggle-btn-icon age-toggle-aim-icon"></div>
                    <span>Aim</span>
                  </button>
                </div>
                <div class="age-header-btn">
                  <button v-if="settings.guardToggle === 'toggle'" :class="{ active: settings.guard }" class="age-btn" @click="settings.guard = !settings.guard">
                    <div class="age-toggle-btn-icon age-toggle-guard-icon"></div>
                    <span>Guard</span>
                  </button>
                </div>
                <div class="age-header-btn">
                  <button v-if="settings.rerollStunt === 'toggle'" :class="{ active: settings.reroll  }" class="age-btn" @click="settings.reroll = !settings.reroll">
                    <div class="age-toggle-btn-icon age-toggle-reroll-icon"></div>
                    <span>ReRoll</span>
                  </button>
                </div>
                <!-- <div class="age-header-btn">
                  <button v-if="isGM" :class="{ active: !settings.sheetView }" class="age-btn" @click="settings.sheetView = !settings.sheetView">
                    <span>
                      {{ settings.sheetView ? 'PC View' : 'NPC View' }}
                    </span>
                  </button>
                </div> -->
                <div class="age-header-btn">
                  <button class="age-btn" @click="openSidebar">
                      <span>Notes</span>
                   </button>
                </div>
                <div class="age-header-btn">
                  <button class="age-btn" @click="showModal = true">
                    <font-awesome-icon style="padding-right: 5px;" :icon="['fa', 'sheet-plastic']" />
                      <span>Sheet Settings</span>
                   </button>
                </div>
              </div>
                <!-- <button style="background: url(https://i.ibb.co/5GtgFDZ/21.png); border: rgba(0, 0, 0, 0.5);color:#1e4e7a" @click="showModal = true"></button> -->
            </div>
            <div class="age-header-menu">
              <div class="dropdown" style="text-align: right;">
                <button class="btn" type="button" aria-expanded="false">
                  <font-awesome-icon style="font-size: 24px;" :icon="['fa', 'bars']" />
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <button v-if="settings.whisperRollsGM === 'toggle'" :class="{ active: settings.whisperRollsGMToggle }" class="age-btn" @click="settings.whisperRollsGMToggle = !settings.whisperRollsGMToggle">
                    <div class="age-toggle-btn-icon age-toggle-whisper-icon"></div>
                    <span>Whisper</span>
                  </button>
                  </li>
                  <li>
                    <button v-if="settings.aimToggle === 'toggle'" :class="{ active: settings.aim }" class="age-btn" @click="updateToggle;settings.aim = !settings.aim">
                    <div class="age-toggle-btn-icon age-toggle-aim-icon"></div>
                    <span>Aim</span>
                  </button>
                  </li>
                  <li>
                    <button v-if="settings.guardToggle === 'toggle'" :class="{ active: settings.guard }" class="age-btn" @click="settings.guard = !settings.guard">
                    <div class="age-toggle-btn-icon age-toggle-guard-icon"></div>
                    <span>Guard</span>
                  </button>
                  </li>
                  <li>
                    <button v-if="settings.rerollStunt === 'toggle'" :class="{ active: settings.reroll  }" class="age-btn" @click="settings.reroll = !settings.reroll">
                    <div class="age-toggle-btn-icon age-toggle-reroll-icon"></div>
                    <span>ReRoll</span>
                  </button>
                  </li>
                  <!-- <li>
                    <button v-if="isGM" :class="{ active: !settings.sheetView }" class="age-btn" @click="settings.sheetView = !settings.sheetView">
                    <span>
                      {{ settings.sheetView ? 'PC View' : 'NPC View' }}
                    </span>
                  </button>
                  </li> -->
                  <li>
                    <button class="age-btn" @click="openSidebar">
                    <!-- <font-awesome-icon style="padding-right: 5px;padding-top: 4px;padding-left: 1px;" :icon="['fa', 'sheet-plastic']" /> -->
                      <span>Notes</span>
                   </button>
                  </li>
                  <li>
                    <button class="age-btn" @click="showModal = true">
                    <font-awesome-icon style="padding-right: 5px;padding-top: 4px;padding-left: 1px;" :icon="['fa', 'sheet-plastic']" />
                      <span>Sheet Settings</span>
                   </button>
                  </li>
                </ul>
              </div>
            </div>
    </div>
    <PCView v-if="settings.sheetView" />
    <NPCView v-if="!settings.sheetView" />
  </main>


  <Teleport to="body">
      <SettingsView v-if="showModal" :show="showModal" @close="closeModal">
      <template #header>
          <h3 class="age-attack-details-header">AGE Sheet Settings</h3>
      </template>
      </SettingsView>
  </Teleport>

  <!-- Character Notes -->
  <Teleport to="body">
    <SidebarSection ref="sidebarRef" :className="'age-notes'" >
      <h2>Character Notes</h2>
      <QuillEditor ref="quillEditor" contentType="html"  toolbar="" :options="{
                modules: {
                    keyboard: {
                        bindings: {
                            enter: {
                                key: 13, // 'Enter' key
                                handler: (range, context) => {
                                // Default behavior of Quill (inserts a single paragraph)
                                const quill = this.$refs.quillEditor.quill;
                                quill.formatLine(range.index, 1, 'block', true);
                                },
                            },
                        },
                    },
                },
                scrollingContainer: true}"  v-model:content="meta.bio" />
    </SidebarSection>
    </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { useAgeSheetStore } from './sheet/stores';
import BioSection from '@/components/character/BioSection.vue';
import PCView from './views/PCView.vue';
import NPCView from './views/NPCView.vue';
import { initValues } from './relay/relay';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore'
import SettingsView from './views/SettingsView.vue';
import { settingsSheet } from '@/relay/relay';
import SidebarSection from './components/SidebarSection.vue';
import NewSplashView from './views/NewSplashView.vue';
import { productLineStyle } from '@/utility/productLineStyle';
import {loadLegacyAbilityScores,loadLegacyCharacterDetails,loadLegacyGroupings} from '@/utility/legacyAdapter';
const showModal = ref(false)

const store = useAgeSheetStore();
const meta = useMetaStore();
const settings = useSettingsStore();
const campaignId = store.meta.campaignId;
const colorTheme = initValues.settings.colorTheme;
const isGM = computed(() => meta.permissions.isGM);
if(settings.gameSystem) productLineStyle(settings.gameSystem,colorTheme,{cthulhuMythos:settings.cthulhuMythos,technofantasy:settings.technofantasy,cyberpunk:settings.cyberpunk});

function closeModal() {
  showModal.value = false;
}
const toggleSheetView = () => {
  meta.sheetView = !meta.sheetView;
}
// Reference to the SlidingSidebar component
const sidebarRef = ref(null);

// Method to open the sidebar by calling the component's method
const openSidebar = () => {
  sidebarRef.value?.openSidebar(); // Optional chaining ensures sidebarRef is defined
};

const setTheme = () => {
  const colorTheme = initValues.settings.colorTheme;
  productLineStyle(settings.gameSystem,colorTheme);
}

// loadLegacyAbilityScores(initValues.character.attributes);
// loadLegacyCharacterDetails(initValues.character.attributes);
// loadLegacyGroupings(initValues.character.attributes);
</script>

<style scoped lang="scss">
/* Fade transition styles */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.header {
  margin-bottom: 0.5rem;

  .campaignId {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  .tabs {
    display: flex;
    gap: 1rem;
    justify-content: space-evenly;
    a {
      color: black;
      padding: 0.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      border: 1px solid lightgrey;
      border-bottom: none;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      margin-bottom: -5px;
      font-size: 14px;
      flex: 1;
      text-align: center;
      // Router-links get this class added if you're already on the page it leads you to. Useful for tabs.
      &.router-link-active {
        color: var(--examplesheet-primary);
        font-weight: 600;
        text-decoration: underline;
        border-color: var(--examplesheet-primary);
      }
    }
  }
}
.footer {
  margin-top: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
