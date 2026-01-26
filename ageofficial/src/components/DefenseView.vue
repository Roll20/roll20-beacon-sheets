<template>
    <div class="section-card" style="display: block; position: relative;">    
      <div class="config-container">
    <button type="button" class="config-btn age-icon-btn" @click="openSidebar">
      <font-awesome-icon :icon="['fa', 'circle-info']" />
    </button>
    </div>    
        <h1 class="age-section-header">
            Defense
        </h1>
        <div class="age-actions-section">
          
          <div class="age-defense" :class="{ 
                  'age-actions-magic-fage': settings.showArcana && settings.gameSystem === 'fage2e',
                  'age-actions-magic-mage': settings.showArcana && settings.gameSystem === 'mage',
                  'age-actions-magic-br': settings.showArcana && settings.gameSystem === 'blue rose',
                  }">
            <!-- <div class="age-actions" :class="{ 'age-actions-mage': settings.gameSystem === 'mage' || bio.profession === 'Mage', 'age-actions-fage': settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e'}"> -->
        
        <div class="age-container-content">      
          <div class="age-container-heading">
            Defense
          </div>
            <span class="age-num-value">{{ defense }}</span>
            <!-- Additional corner elements -->
            <div class="age-container-content-corner-top-right"></div>
            <div class="age-container-content-corner-bottom-left"></div>
        </div>  
        <div class="age-container-content" v-if="settings.gameSystem === 'mage' || settings.gameSystem === 'expanse'">      
          <div class="age-container-heading">
            Toughness
          </div>
            <span class="age-num-value">{{ toughnessMod }}</span>
            <!-- Additional corner elements -->
            <div class="age-container-content-corner-top-right"></div>
            <div class="age-container-content-corner-bottom-left"></div>
        </div>  
        <div class="age-container-content" v-if="settings.showArcana">      
          <div class="age-container-heading">
            <span v-if="settings.gameSystem === 'fage2e' || settings.gameSystem === 'blue rose'">Spellpower</span>
            <span v-if="settings.gameSystem === 'mage'">Force</span>
          </div>
            <span class="age-num-value">{{ 10 + Number(ability.WillpowerBase) }}</span> 
            <!-- Additional corner elements -->
            <div class="age-container-content-corner-top-right"></div>
            <div class="age-container-content-corner-bottom-left"></div>
        </div>    
        <div class="age-container-content age-armor-stats">      
          <div class="age-container-heading">
            Armor Rating | Penalty
          </div>
            <div style="display: flex;">
              <span class="age-num-value">{{ armorRatingSet !== null && armorRatingSet !== 0 ? armorRatingSet : armorRatingMod}}</span>
              <span style="font-size: 20px;">|</span>
              <span class="age-num-value">{{ armorPenaltySet !== null && armorPenaltySet !== 0 ? armorPenaltySet : armorPenaltyMod}}</span>
            </div>
            
            <!-- Additional corner elements -->
            <div class="age-container-content-corner-top-right"></div>
            <div class="age-container-content-corner-bottom-left"></div>
        </div> 
        
        
          </div>
  
          
        </div>
        
                </div>


                <Teleport to="body">
    <SidebarSection ref="sidebarRef" :className="'age-side-info'">
      <h2>Actions Info</h2>
      <ul class="age-sidebar-list">
        <li v-for="(act,index) in filteredSections" :key="index"><span class="age-sidebar-list__title">{{ act.label }}</span><span v-html="act.description"></span></li>        
      </ul>
    </SidebarSection>
    </Teleport>
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { computed, ref, watch } from 'vue';
import { useConditionsStore } from '@/sheet/stores/conditions/conditionsStore';
import { objectToArray } from '@/utility/objectify';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { armorRatingMod, armorRatingSet } from '@/sheet/stores/modifiersCheck/armorRating';
import { defenseMod, toughnessMod } from '@/sheet/stores/modifiersCheck/defense';
import { speedMod } from '@/sheet/stores/modifiersCheck/speed';
import SidebarSection from '@/components/SidebarSection.vue';
import { actionsList, defenseList } from '@/system/actions';
import { armorPenaltyMod, armorPenaltySet } from '@/sheet/stores/modifiersCheck/armorPenalty';

const props = defineProps({
  guard: { type: Boolean },
  guardValue: { type: Number },
  guardOption: String
});
const { rollAbilityInitiative } = useAbilityScoreStore();
const char = useCharacterStore();
const ability = useAbilityScoreStore();
const inventory = useInventoryStore();
const bio = useBioStore();
const settings = useSettingsStore();
// const armorMod = ref(0);
// armorMod.value = armorRatingMod();

const armorRating = armorRatingMod;
const defenseMods = defenseMod;
const speedMods = speedMod
char.gameModeBonus();

const defenseModifiers = computed(() => {
  const conditions = useConditionsStore().conditions;
  let values = []
  conditions.forEach((con)=>{
    if(!con.modifiers) return;
    if(typeof con.modifiers === 'string'){
      JSON.parse(con.modifiers.replace('$__$','')).forEach((cm)=>{
        if(cm.modifiedValue === 'Defense'){
          if(typeof cm.penalty === 'number'){
            values.push(cm.penalty)
          } else {
            const pVal = ability[cm.penalty+'Base']
            values.push(-pVal)
          }
        }
      })
    } else {
      con.modifiers.forEach((cm)=>{
      if(cm.modifiedValue === 'Defense'){
        if(typeof cm.penalty === 'number'){
          values.push(cm.penalty)
        } else {
          const pVal = ability[cm.penalty+'Base']
          values.push(-pVal)
        }
      }
    })
    }
  })
  if(values.length > 0){
    return values.reduce(function(a,b){return a+b;})
  } else {
    return 0
  }
});
const speedModifiers = computed(() => {
  const conditions = useConditionsStore().conditions;
  let values = []
  conditions.forEach((con)=>{
    if(!con.modifiers) return
    if(typeof con.modifiers === 'string'){
      JSON.parse(con.modifiers.replace('$__$','')).forEach((cm)=>{
        if(cm.modifiedValue === 'Speed'){
          if(typeof cm.penalty === 'number'){
            values.push(cm.penalty)
          } else {
            const pVal = ability[cm.penalty+'Base']
            values.push(-pVal)
          }
        }
      })
    } else {
      con.modifiers.forEach((cm)=>{
      if(cm.modifiedValue === 'Speed'){
        if(typeof cm.penalty === 'number'){
          values.push(cm.penalty)
        } else {
          const pVal = ability[cm.penalty+'Base']
          values.push(-pVal)
        }
      }
    })
    }
  })
  if(values.length > 0){
    return values.reduce(function(a,b){return a+b;})
  } else {
    return 0
  }
});
const onRest = (type) => {
  switch(type){
    case 'Breather':
      char.health = Math.min(char.health + 5 + ability.ConstitutionBase + char.level, char.healthMax);
    break;
    case 'Total Rest':
    char.health = Math.min(char.health + 10 + ability.ConstitutionBase + char.level, char.healthMax);
      if(bio.profession === 'Mage'){
        char.magic = char.magicMax;
      }
    break;
  }
}
// Reference to the SlidingSidebar component
const sidebarRef = ref(null);

// Method to open the sidebar by calling the component's method
const openSidebar = () => {
  sidebarRef.value?.openSidebar(); // Optional chaining ensures sidebarRef is defined
};
const gameSystem = ref('fage')
switch(settings.gameSystem){
  case 'fage1e':
  case 'fage2e':
    gameSystem.value = 'fage';
  break;
  case 'mage':
    gameSystem.value = 'mage';
  break;
}
const filteredSections = computed(() => {
  return defenseList.filter(section => {
    if (gameSystem.value === 'fage') {
      return ['Defense', 'Armor Rating', 'Armor Penalty'].includes(section.label);
    } else if (gameSystem.value === 'mage') {
      return ['Defense', 'Toughness', 'Armor Rating', 'Armor Penalty'].includes(section.label);
    }
    return false;
  });
});
const defense = computed(() => {
  return 10 + Number(ability.DexterityBase) + ((props.guard || props.guardOption === 'always') ? props.guardValue : 0) + Number(defenseMods.value) + char.defenseLevelMod;
});
</script>