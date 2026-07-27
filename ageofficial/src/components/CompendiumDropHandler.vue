<template>
  <Teleport to="body">
    <!-- Confirm overwrite existing class -->
    <Transition name="modal">
      <div v-if="step === 'confirm'" class="modal-mask">
        <div class="modal-container age-modal">
          <div class="age-modal-header">
            <h3 class="age-attack-details-header">Replace Class?</h3>
            <button type="button" class="btn-close" @click="onCancel" aria-label="Close" />
          </div>
          <div class="modal-body">
            <p>
              This character already has the <strong>{{ bio.profession }}</strong> class.
              Replace it with <strong>{{ dropStore.pendingClass?.name }}</strong>?
            </p>
            <div class="age-modal-actions">
              <button class="age-btn" @click="onCancel">Cancel</button>
              <button class="age-btn" @click="onConfirm">Replace</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Weapon Group picker filtered to class choices -->
    <WeaponGroupsModal
      v-if="step === 'weaponGroups'"
      :show="true"
      :options="dropStore.pendingClass?.weaponGroupChoices"
      @close="onFinalize"
    >
      <template #header>
        <h3 class="age-attack-details-header">Weapon Group Training</h3>
      </template>
    </WeaponGroupsModal>

    <!-- Background focus picker -->
    <Transition name="modal">
      <div v-if="step === 'backgroundFocus'" class="modal-mask">
        <div class="modal-container age-modal">
          <div class="age-modal-header">
            <h3 class="age-attack-details-header">Choose a Focus</h3>
            <button type="button" class="btn-close" @click="dropStore.clearPendingBackground()" aria-label="Close" />
          </div>
          <div class="modal-body age-stack-gap-sm">
            <p>Select one focus from your <strong>{{ dropStore.pendingBackground?.name }}</strong> background:</p>
            <div class="age-stack-gap-sm">
              <button
                v-for="choice in dropStore.pendingBackground?.focusChoices"
                :key="choice"
                class="age-btn"
                @click="onFocusChosen(choice)"
              >
                {{ choice }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useCompendiumDropStore } from '@/sheet/stores/compendiumDropStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import WeaponGroupsModal from '@/components/attack/WeaponGroupsModal.vue';
import { parseParenthetical } from '@/utility/compendiumDrop';

const dropStore = useCompendiumDropStore();
const bio = useBioStore();
const char = useCharacterStore();
const itemStore = useItemStore();

// — Class flow —

const confirmedRef = ref(false);

function applyClass() {
  const pending = dropStore.pendingClass;
  if (!pending) return;
  bio.profession = pending.name;
  // Preserve current damage taken (rather than fully healing) when the new max
  // differs from the old one — matters for the "replace class" flow, where the
  // character may already have taken damage under the previous class's health pool.
  const damageTaken = Math.max(char.healthMax - char.health, 0);
  char.healthMax = pending.healthBase;
  char.health = Math.max(char.healthMax - damageTaken, 0);
  if (pending.magicBase != null) {
    char.magic = pending.magicBase;
    char.magicMax = pending.magicBase;
  }
}

watch(() => dropStore.pendingClass, (pending) => {
  confirmedRef.value = false;
  if (!pending) return;
  if (!pending.requiresConfirm) {
    applyClass();
    if (!pending.weaponGroupChoices.length) {
      dropStore.clearPendingClass();
    } else {
      confirmedRef.value = true;
    }
  }
});

function onConfirm() {
  applyClass();
  confirmedRef.value = true;
  if (!dropStore.pendingClass?.weaponGroupChoices.length) {
    dropStore.clearPendingClass();
  }
}

function onCancel() {
  dropStore.clearPendingClass();
}

function onFinalize() {
  dropStore.clearPendingClass();
}

// — Background flow —

// "Communication (Deception)" → { ability: "Communication", name: "Deception" }
function parseFocusString(str) {
  const { primary, secondary } = parseParenthetical(str);
  if (secondary) return { ability: primary, name: secondary };
  return { ability: '', name: primary };
}

function onFocusChosen(choice) {
  const { ability, name } = parseFocusString(choice);
  itemStore.addItem({
    type: 'Ability Focus',
    name,
    ability,
    description: '',
    focus: true,
    doubleFocus: false,
    modifiers: [],
  });
  dropStore.clearPendingBackground();
}


// — Shared step —

const step = computed(() => {
  if (dropStore.pendingClass) {
    if (dropStore.pendingClass.requiresConfirm && !confirmedRef.value) return 'confirm';
    if (dropStore.pendingClass.weaponGroupChoices.length > 0) return 'weaponGroups';
  }
  if (dropStore.pendingBackground?.focusChoices.length > 0) return 'backgroundFocus';
  return null;
});
</script>
