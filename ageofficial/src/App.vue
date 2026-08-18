<template>
  <!-- {{ settings.gameSystem = undefined }} -->
  <transition name="fade">
    <NewSplashView v-if="!settings.gameSystem" @close="setTheme" />
  </transition>
  <main v-if="settings.gameSystem">
    <div class="system-header">
      <img
        v-if="
          settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e'
        "
        src="/src//assets/logos/fantasyage.png"
        class="sys-logo sys-logo--full"
        alt="Fantasy AGE"
      />
      <img
        v-if="settings.gameSystem === 'mage' && settings.theme !== 'threefold'"
        src="/src/assets/logos/modernage.png"
        class="sys-logo sys-logo--90"
        alt="Modern AGE"
      />
      <img
        v-if="settings.gameSystem === 'mage' && settings.theme === 'threefold'"
        src="/src/assets/logos/threefold.png"
        class="sys-logo sys-logo--90"
        alt="Threefold"
      />
      <img
        v-if="settings.gameSystem === 'blue rose'"
        src="/src/assets/logos/bluerose.png"
        class="sys-logo sys-logo--90"
        alt="Blue Rose"
      />
      <img
        v-if="settings.gameSystem === 'expanse'"
        src="/src/assets/logos/expansewhite.png"
        class="sys-logo sys-logo--90"
        alt="Fantasy AGE"
      />
      <!-- <img v-if="settings.gameSystem === 'cthulhu'" src="/src/assets/logos/cthulhu.png" style="width: 90%;height: auto;margin-left:10px;" alt="Fantasy AGE"> -->
      <div class="age-header-options">
        <div class="age-header-btn-container">
          <div class="age-header-btn">
            <button
              v-if="settings.whisperRollsGM === 'toggle'"
              :class="{ active: settings.whisperRollsGMToggle }"
              class="age-btn"
              @click="
                settings.whisperRollsGMToggle = !settings.whisperRollsGMToggle
              "
            >
              <div class="age-toggle-btn-icon age-toggle-whisper-icon"></div>
              <span>Whisper</span>
            </button>
          </div>
          <div class="age-header-btn">
            <button
              v-if="settings.aimToggle === 'toggle'"
              :class="{ active: settings.aim }"
              class="age-btn"
              @click="settings.aim = !settings.aim"
            >
              <div class="age-toggle-btn-icon age-toggle-aim-icon"></div>
              <span>Aim</span>
            </button>
          </div>
          <div class="age-header-btn">
            <button
              v-if="settings.guardToggle === 'toggle'"
              :class="{ active: settings.guard }"
              class="age-btn"
              @click="settings.guard = !settings.guard"
            >
              <div class="age-toggle-btn-icon age-toggle-guard-icon"></div>
              <span>Guard</span>
            </button>
          </div>
          <div class="age-header-btn">
            <button
              v-if="settings.rerollStunt === 'toggle'"
              :class="{ active: settings.reroll }"
              class="age-btn"
              @click="settings.reroll = !settings.reroll"
            >
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
          <!-- <div class="age-header-btn">
                  <button class="age-btn" @click="openSidebar">
                      <span>Notes</span>
                   </button>
                </div> -->
          <div class="age-header-btn">
            <button class="age-btn" @click="showModal = true">
              <font-awesome-icon
                class="header-icon"
                :icon="['fa', 'sheet-plastic']"
              />
              <span>Sheet Settings</span>
            </button>
          </div>
        </div>
        <!-- <button style="background: url(https://i.ibb.co/5GtgFDZ/21.png); border: rgba(0, 0, 0, 0.5);color:#1e4e7a" @click="showModal = true"></button> -->
      </div>
      <div class="age-header-menu">
        <div class="dropdown age-dropdown-right">
          <ul class="dropdown-menu">
            <li>
              <button
                v-if="settings.whisperRollsGM === 'toggle'"
                :class="{ active: settings.whisperRollsGMToggle }"
                class="age-btn"
                @click="
                  settings.whisperRollsGMToggle = !settings.whisperRollsGMToggle
                "
              >
                <div class="age-toggle-btn-icon age-toggle-whisper-icon"></div>
                <span>Whisper</span>
              </button>
            </li>
            <li>
              <button
                v-if="settings.aimToggle === 'toggle'"
                :class="{ active: settings.aim }"
                class="age-btn"
                @click="settings.aim = !settings.aim"
              >
                <div class="age-toggle-btn-icon age-toggle-aim-icon"></div>
                <span>Aim</span>
              </button>
            </li>
            <li>
              <button
                v-if="settings.guardToggle === 'toggle'"
                :class="{ active: settings.guard }"
                class="age-btn"
                @click="settings.guard = !settings.guard"
              >
                <div class="age-toggle-btn-icon age-toggle-guard-icon"></div>
                <span>Guard</span>
              </button>
            </li>
            <li>
              <button
                v-if="settings.rerollStunt === 'toggle'"
                :class="{ active: settings.reroll }"
                class="age-btn"
                @click="settings.reroll = !settings.reroll"
              >
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
                <font-awesome-icon
                  class="menu-icon"
                  :icon="['fa', 'sheet-plastic']"
                />
                <span>Sheet Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <PCView v-if="settings.sheetView && bio.type !== 'Ship'" />
    <NPCView v-if="!settings.sheetView && bio.type !== 'Ship'" />
    <ShipView v-if="settings.gameSystem === 'expanse' && bio.type === 'Ship'" />
  </main>

  <Teleport to="body">
    <SettingsView v-if="showModal" :show="showModal" @close="closeModal">
      <template #header>
        <h3 class="age-attack-details-header">AGE Sheet Settings</h3>
      </template>
    </SettingsView>
  </Teleport>

  <CompendiumDropHandler />

  <!-- Legacy import trigger. Not teleported: it is position:fixed, and a
       v-tippy directive inside a Teleport corrupts the Teleport's patch. -->
  <div class="age-import-panel" v-if="settings.allowImport">
    <button
      class="age-import-btn"
      type="button"
      v-tippy="{ content: 'Import', placement: 'left', delay: [300, 0] }"
      @click="openImportModal"
    >
      <span
        class="age-import-icon"
        :class="importIconClass"
        aria-hidden="true"
      ></span>
      <span class="age-visually-hidden">Import</span>
    </button>
  </div>

  <!-- Import modal: pick sections, then append or overwrite. -->
  <Teleport to="body">
    <div
      v-if="importModalOpen"
      class="age-import-overlay"
      @click.self="cancelImport"
    >
      <div
        ref="importModalRef"
        class="age-import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-import-title"
        tabindex="-1"
        @keydown="onImportKeydown"
      >
        <h3 id="age-import-title">Import {{ importCharacterName }}</h3>
        <p>
          Choose which sections to import, then add them to the sheet or
          overwrite the existing data.
        </p>
        <div class="age-import-sections">
          <label
            v-for="section in importSections"
            :key="section.key"
            class="age-import-section"
          >
            <input
              type="checkbox"
              :value="section.key"
              v-model="selectedSections"
            />
            <span>{{ section.label }}</span>
          </label>
        </div>
        <div class="age-import-actions">
          <button
            type="button"
            :disabled="!selectedSections.length"
            @click="confirmImport('append')"
          >
            Append
          </button>
          <button
            type="button"
            class="age-import-overwrite"
            :disabled="!selectedSections.length"
            @click="confirmImport('overwrite')"
          >
            Overwrite
          </button>
          <button type="button" class="age-import-cancel" @click="cancelImport">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Character Notes -->
  <Teleport to="body">
    <SidebarSection ref="sidebarRef" :className="'age-notes'">
      <h2>Character Notes</h2>
      <QuillEditor
        ref="quillEditor"
        contentType="html"
        toolbar=""
        :options="{ scrollingContainer: true }"
        v-model:content="meta.bio"
      />
    </SidebarSection>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";

import { useAgeSheetStore } from "./sheet/stores";
import PCView from "./views/PCView.vue";
import NPCView from "./views/NPCView.vue";
import { initValues } from "./relay/relay";
import { useMetaStore } from "@/sheet/stores/meta/metaStore";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import SettingsView from "./views/SettingsView.vue";
import SidebarSection from "./components/SidebarSection.vue";
import NewSplashView from "./views/NewSplashView.vue";
import { productLineStyle } from "@/utility/productLineStyle";
import { useThemeArgs } from "@/utility/useThemeArgs";
import { useCharacterStore } from "./sheet/stores/character/characterStore";
import ShipView from "./views/ShipView.vue";
import { useBioStore } from "./sheet/stores/bio/bioStore";
import CompendiumDropHandler from "./components/CompendiumDropHandler.vue";
import {
  loadLegacyAbilityScores,
  loadLegacyCharacterDetails,
  loadLegacyGroupings,
  importLegacyCharacter,
  IMPORT_SECTIONS,
} from "@/utility/legacyAdapter";
const showModal = ref(false);

const store = useAgeSheetStore();
const meta = useMetaStore();
const settings = useSettingsStore();
const char = useCharacterStore();
const bio = useBioStore();
const campaignId = store.meta.campaignId;
const colorTheme = initValues.settings.colorTheme;
const isGM = computed(() => meta.permissions.isGM);
const themeArgs = useThemeArgs();
if (settings.gameSystem)
  productLineStyle(settings.gameSystem, colorTheme, themeArgs.value);

function closeModal() {
  showModal.value = false;
}
const toggleSheetView = () => {
  meta.sheetView = !meta.sheetView;
};
// Reference to the SlidingSidebar component
const sidebarRef = ref(null);

// Method to open the sidebar by calling the component's method
const openSidebar = () => {
  sidebarRef.value?.openSidebar(); // Optional chaining ensures sidebarRef is defined
};

const setTheme = () => {
  const colorTheme = initValues.settings.colorTheme;
  productLineStyle(settings.gameSystem, colorTheme, themeArgs.value);
};
if (!settings.incomeMode) {
  if (settings.gameSystem === "fage1e" || settings.gameSystem === "fage2e") {
    settings.incomeMode = "currency";
  } else {
    settings.incomeMode = "recources";
  }
}

loadLegacyAbilityScores(initValues.character?.attributes);
loadLegacyCharacterDetails(initValues.character?.attributes);
loadLegacyGroupings(initValues.character?.attributes);

// Modern AGE / Expanse use a direct background-image icon; Fantasy AGE / Blue
// Rose use a mask-image icon tinted by the button color.
const importIconClass = computed(() =>
  settings.gameSystem === "mage" || settings.gameSystem === "expanse"
    ? "age-import-icon--bg"
    : "age-import-icon--mask"
);
const importSections = IMPORT_SECTIONS;
const importModalOpen = ref(false);
const selectedSections = ref(IMPORT_SECTIONS.map((s) => s.key));
const importCharacterName = computed(() =>
  initValues.character?.name ? `“${initValues.character.name}”` : "Character"
);

const importModalRef = ref(null);
// The element focused before the modal opened, so focus can be restored on close.
let importTrigger = null;

const openImportModal = () => {
  // Start with every section selected.
  selectedSections.value = IMPORT_SECTIONS.map((s) => s.key);
  importTrigger = document.activeElement;
  importModalOpen.value = true;
};
const confirmImport = (mode) => {
  importLegacyCharacter(
    initValues.character?.attributes,
    mode,
    selectedSections.value,
    initValues.character?.name
  );
  importModalOpen.value = false;
};
const cancelImport = () => {
  importModalOpen.value = false;
};

// Selector for the focusable controls inside the modal (used for the focus trap).
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const onImportKeydown = (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    cancelImport();
    return;
  }
  if (event.key !== "Tab") return;
  const modal = importModalRef.value;
  if (!modal) return;
  const focusable = Array.from(
    modal.querySelectorAll(FOCUSABLE_SELECTOR)
  ).filter((el) => el.offsetParent !== null || el === modal);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  // Wrap focus around the modal's edges so Tab never escapes to the page behind.
  if (event.shiftKey && (active === first || active === modal)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
};

// Move focus into the modal when it opens and restore it to the trigger on close.
watch(importModalOpen, async (open) => {
  if (open) {
    await nextTick();
    importModalRef.value?.focus();
  } else if (importTrigger && typeof importTrigger.focus === "function") {
    importTrigger.focus();
    importTrigger = null;
  }
});
</script>

<style scoped lang="scss">
.age-import-panel {
  position: fixed;
  right: 0;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  /* Mostly tucked off the right edge (thin grab sliver) so it doesn't block
     play; slides fully out on hover or keyboard focus (focus-within covers
     tabbing to any child). */
  transform: translateX(calc(100% - 12px));
  transition: transform 0.25s ease;

  &:hover,
  &:focus-within {
    transform: translateX(0);
  }
}
.age-import-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 9px;
  background: var(--theme-primary, #1e4e7a);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-right: none;
  border-radius: 6px 0 0 6px;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;

  &:hover {
    filter: brightness(1.08);
  }
}
.age-import-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
}
/* Fantasy AGE / Blue Rose: mask-image tinted by the button color. */
.age-import-icon--mask {
  background-color: #fff;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M373.563 18.406c-15.616-.167-27.91 4.622-32.563 14.75-22.778 49.605-48.743 87.14-79.094 117.28 3.047 1.015 6.046 2.29 8.938 3.783 12.987 6.708 25.268 17.78 35.312 30.843 10.044 13.062 17.85 28.114 20.78 43.5.746 3.908 1.16 7.885 1.158 11.843 38.97-24.36 85.058-41.223 140.875-51.312 14.91-2.697 23.652-28.632 21.405-58.656l-35.156-1 30.56-24.813c-4.148-14.507-11.013-28.754-21.155-40.72-15.528-18.314-36.43-31.376-56.72-38.686L381.94 40.812l2.812-21.5c-3.875-.55-7.61-.87-11.188-.907zM246.938 166.562c-1.063.052-2.06.226-3 .47-11.976 10.254-24.61 19.597-37.938 28.28.842.33 1.67.667 2.5 1.032 14.123 6.192 27.438 17.145 38.47 30.625 13.356 16.322 23.62 36.94 25.624 57.75 10.334-10.367 21.24-19.943 32.844-28.72 4.096-6.555 4.93-14.468 3.125-23.938-2.184-11.46-8.642-24.43-17.25-35.625-8.61-11.194-19.38-20.622-29.063-25.625-6.052-3.126-11.154-4.45-15.313-4.25zm-61.907 43.282c-1.385.053-2.69.27-3.968.562-37 20.762-79.088 37.985-127.312 56 .574.042 1.14.093 1.72.156 10.627 1.156 21.076 5.008 31.155 10.875L124.313 261 108.5 293.72c5.995 5.432 11.803 11.477 17.344 18 20.76 24.434 37.964 55.865 47.094 88.092.002.01-.003.022 0 .032 2.98 10.508 5.11 20.916 6.312 31 20.99-48.438 44.38-89.26 72.344-123 7.3-21.48-2.186-48.408-19.063-69.03-9.44-11.538-20.976-20.718-31.53-25.345-5.936-2.604-11.27-3.808-15.97-3.626zm141.626 54.844c-7.31 5.05-14.462 10.51-21.437 16.312 39.16 9.26 60.953 35.722 80.655 62.156 10.464 14.04 20.598 28.11 33.125 40.688 24.19 9.147 43.17 6.38 63.906-14.938-92.165-27.78-96.11-92.61-156.25-104.22zM48.594 284.906c-10.873.225-18.26 5.755-23.344 16.594-5.81 12.387-7.114 32.47.438 57.063 5.75 18.73 16.52 37.718 28.75 51.625 12.23 13.906 25.9 22.076 35.374 22.406h.032c3.717.13 6.553-.682 8.812-2.75l-.187-.188 2.093-2.094c.793-1.168 1.52-2.548 2.187-4.187 2.81-6.9 3.28-18.552-1.844-33-6.885-19.417-19.12-31.932-33.375-34.78l-22.968-4.564 19.813-12.5 38.47-24.186c-16.65-16.822-34.55-27.607-49.376-29.22-1.7-.184-3.323-.25-4.876-.218zm236.25 5.406l-24.53 25.375c100.442 17.878 55.45 141.005 159.31 176.188l-24.78-57.28c32.766 16.15 67.39 22.623 97.72 12.03-135.77-41.948-96.32-126.983-207.72-156.313zm-169.47 38.22l-25.968 16.343c13.18 8.5 23.21 22.565 29.125 39.25 2.57 7.244 4.133 14.205 4.75 20.78l23.44-23.374c-8.08-19.19-19.035-37.566-31.345-53zm38.376 72.374l-42.063 42-.156-.156c-4.255 3.942-9.456 6.765-15.186 7.938 23.268 14.873 44.644 19.346 56.812 9.562 4.26-3.426 7.043-8.36 8.47-14.406-.41-12.684-2.602-26.615-6.657-40.906-.382-1.346-.806-2.686-1.22-4.032z"/></svg>');
}
/* Modern AGE / Expanse: direct (white) background-image icon. */
.age-import-icon--bg {
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M394.8 30.88l-65 65.03 86.3 86.29 65.1-65-86.4-86.32zm-6.3 36.04l17 17-12.8 12.72-17-17 12.8-12.72zm-82.8 30.4l-11.3 11.28 109 108.9 11.3-11.2-109-108.98zM263.3 103L23.4 342.9v60.5l85.2 85.2h60.5l240-239.9L263.3 103zm164.9 3.6l16.9 17-12.8 12.6-16.9-17 12.8-12.6z"/></svg>');
}
.age-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.age-import-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
  margin-bottom: 18px;
}
.age-import-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #222;
  cursor: pointer;

  input {
    cursor: pointer;
  }
}
.age-import-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}
.age-import-modal {
  width: min(90vw, 380px);
  padding: 20px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  color: #222;

  h3 {
    margin: 0 0 8px;
  }
  p {
    margin: 0 0 18px;
    font-size: 14px;
    line-height: 1.4;
  }
}
.age-import-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    padding: 8px 16px;
    font-weight: 600;
    color: #fff;
    background: var(--theme-primary, #1e4e7a);
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      filter: brightness(1.08);
    }
    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: none;
    }
  }
  .age-import-overwrite {
    background: #a3341f;
  }
  .age-import-cancel {
    color: #333;
    background: #e2e2e2;
  }
}
.sys-logo {
  height: auto;
  margin-left: 10px;
}
.sys-logo--full {
  width: 100%;
}
.sys-logo--90 {
  width: 90%;
}

.header-icon {
  padding-right: 5px;
}
.menu-icon {
  padding-right: 5px;
  padding-top: 4px;
  padding-left: 1px;
}
.age-dropdown-right {
  text-align: right;
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
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
