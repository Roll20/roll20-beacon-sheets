<template>
  <div class="config-container">
    <button type="button" class="config-btn age-icon-btn" @click="openSidebar">
      <font-awesome-icon :icon="['fa', 'circle-info']" />
    </button>
    <button type="button" class="config-btn age-icon-btn" @click="showModal = true">
      <font-awesome-icon :icon="['fa', 'gear']" />
    </button> 
  </div>                    
  <h1 class="age-section-header">
      Abilities
  </h1>
  <div class="age-ability-scores-container" :class="{ 'age-ability-scores-container-npc':!settings?.sheetView }">
    <button  @click="rollCheck(score.label, true)" class="age-abilities-btn"  v-for="score in abilityScoresArray" :key="score.label">
      <div class="age-container-content">      
        <div class="age-container-heading">
          {{ score.label }}
        </div>        
        <span class="age-num-value">
          {{ score.base }}
          <div class="age-ability-primary"
            v-if="(bio.profession === 'Envoy' && (score.label === 'Communication' || score.label === 'Fighting' || score.label === 'Intelligence' || score.label === 'Willpower')) ||
                  (bio.profession === 'Mage' && (score.label === 'Accuracy' || score.label === 'Intelligence' || score.label === 'Perception' || score.label === 'Willpower')) ||
                  (bio.profession === 'Rogue' && (score.label === 'Accuracy' || score.label === 'Communication' || score.label === 'Dexterity' || score.label === 'Perception')) ||
                  (bio.profession === 'Warrior' && (score.label === 'Constitution' || score.label === 'Dexterity' || score.label === 'Fighting' || score.label === 'Strength'))"
          ></div>
        </span> 
          <!-- Additional corner elements -->
          <div class="age-container-content-corner-top-right"></div>
          <div class="age-container-content-corner-bottom-left"></div>
      </div>   
    </button>   
  </div>
  <Teleport to="body">
    <AbilitiesModal v-if="showModal" :show="showModal" @close="closeModal">
      <template #header>
        <h3 class="age-attack-details-header">Abilities</h3>
      </template>
    </AbilitiesModal>
  </Teleport>

  <Teleport to="body">
    <AbilityCheckModal v-if="showAbilityCheckModal" :show="showAbilityCheckModal" :ability="selectedAbility" @close="closeCheckModal" @rerollCheck="onShowRerollModal">
      <template #header>
        <h3 class="age-attack-details-header">{{ selectedAbility }}</h3>
      </template>
    </AbilityCheckModal>
  </Teleport>
  <Teleport to="body">
    <Transition name="modal">
    <div v-if="showRerollModal" class="snackbar-mask" :class="{ 'show':showRerollModal,'hide':!showRerollModal}">
        <div class="snackbar-container">
            <div class="snackbar-content">
              <p>You have a Talent or Specialization allowing you to reroll a failed test. You must accept the result of the second roll. </p>
              <div><button class="ability-check-btn btn btn-danger" @click="showRerollModal = false;">Cancel</button></div>
              <div><button class="ability-check-btn btn btn-success" @click="rollAbilityCheck(selectedAbility, true);showRerollModal = false;">Reroll</button></div>
            </div>
        </div>
            
    
    </div>
    </Transition>
  </Teleport>
  <Teleport to="body">
    <SidebarSection ref="sidebarRef">
      <h2>Ability Info</h2>
      <ul class="age-sidebar-list">
        <li><span class="age-sidebar-list__title">Accuracy</span> represents your character’s physical precision and skill with finesse and ranged weapons, such as bows and rapiers.</li>
        <li><span class="age-sidebar-list__title">Communication</span> covers your character’s social skills, personal interactions, and ability to deal with others.</li>
        <li><span class="age-sidebar-list__title">Constitution</span> is your character’s fortitude and resistance to harm.</li>
        <li><span class="age-sidebar-list__title">Dexterity</span> encompasses your character’s agility, hand-eye coordination, and quickness.</li>
        <li><span class="age-sidebar-list__title">Fighting</span> is your character’s skill at combat with heavier weapons, such as axes and spears.</li>
        <li><span class="age-sidebar-list__title">Intelligence</span> is a measure of your character’s smarts, knowledge, and education.</li>
        <li><span class="age-sidebar-list__title">Perception</span> covers all the senses and the ability to interpret sensory information.</li>
        <li><span class="age-sidebar-list__title">Strength</span> is your character’s ability to generate raw physical force.</li>
        <li><span class="age-sidebar-list__title">Willpower</span> encompasses mental toughness, discipline, and confidence</li>
        
      </ul>
    </SidebarSection>
    </Teleport>
  
</template>
<script setup>
import { ref } from 'vue';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import AbilitiesModal from '@/components/abilities/AbilitiesModal.vue';
import AbilityCheckModal from '@/components/abilities/AbilityCheckModal.vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useAbilityFocusesStore } from '@/sheet/stores/abilityScores/abilityFocusStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import SidebarSection from '@/components/SidebarSection.vue';
import { abilityMods } from '@/sheet/stores/modifiersCheck/abilities';
const { abilityScores, rollAbilityCheck } = useAbilityScoreStore();

// const abilityScoresArray = ref(
//   Object.entries(abilityScores).map(([label, abilityScore]) => ({ ...abilityScore, label })),
// );

const showModal = ref(false);
const showRerollModal = ref(false);
const showAbilityCheckModal = ref(false);
const selectedAbility = ref('');
const abilityScoresArray = ref([]);
const settings = useSettingsStore();
const focus = useAbilityFocusesStore();
const quality = useItemStore();
const abilityMod = abilityMods;
// Function to generate the abilityScoresArray
function generateAbilityScoresArray() {
  return Object.entries(useAbilityScoreStore().abilityScores).map(([label, abilityScore]) => ({
    ...abilityScore,
    label,
  }));
}

// Initialize the abilityScoresArray
abilityScoresArray.value = generateAbilityScoresArray();

// Function to handle modal close and refresh abilityScoresArray
function closeModal() {
  showModal.value = false;
  abilityScoresArray.value = generateAbilityScoresArray();
}
function closeCheckModal() {
  showAbilityCheckModal.value = false;
}

const bio = useBioStore();

const rollCheck = (label, val) => {
if(checkIfFocus(label) || abilityMod.value.filter(am => am.ability === label && am.name).length > 0){
  selectedAbility.value=label
  showAbilityCheckModal.value = true;
} else {
  selectedAbility.value=label
  rollAbilityCheck(label, false)
  if(checkIfReRoll(label,val)) showRerollModal.value = true;
}
}
const checkIfFocus = (ability) => {
  return quality.items.some(foc => foc.ability === ability)
}
const checkIfReRoll = (ability,focus) => {
  return quality.items.some(foc => foc.ability === ability && foc.modifiedOption === 'Reroll');
}
// Reference to the SlidingSidebar component
const sidebarRef = ref(null);

// Method to open the sidebar by calling the component's method
const openSidebar = () => {
  sidebarRef.value?.openSidebar(); // Optional chaining ensures sidebarRef is defined
};

const onShowRerollModal = (focus) => {
  showRerollModal.value = true;
}
</script>