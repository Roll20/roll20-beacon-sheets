<template>
    <div class="section-card" style="display: block; position: relative;">    
      <div class="config-container">
    <button type="button" class="config-btn age-icon-btn" @click="openSidebar">
      <font-awesome-icon :icon="['fa', 'circle-info']" />
    </button>
    </div>    
        <h1 class="age-section-header">
            Actions
        </h1>
        <div class="age-actions-section">
          <div class="age-roll-initiative">
            <button class="age-roll-initiative-btn age-btn" @click="rollAbilityInitiative('Dexterity', true)">
                <font-awesome-icon style="margin-right: 5px;" :icon="['fa', 'dice']" /> Roll for Initiative
            </button>
          </div>  
          <div style="display: grid;grid-template-columns: repeat(2,1fr);gap:5px;padding: 6px 0;">
            <button class="age-btn" @click="onRest('Breather')">
              <font-awesome-icon style="margin-right: 5px;" :icon="['fa', 'kit-medical']" />
              <span>
                Breather
              </span>
            </button>
            <button class="age-btn" @click="onRest('Total Rest')">
              <font-awesome-icon style="margin-right: 5px;" :icon="['fa', 'bed']" />
              <span>
                Total Rest
              </span>                
            </button>
          </div>
          
        </div>
        
                </div>


                <Teleport to="body">
    <SidebarSection ref="sidebarRef" :className="'age-side-info'">
      <h2>Actions Info</h2>
      <ul class="age-sidebar-list">
        <li v-for="(act,index) in actionsList" :key="index"><span class="age-sidebar-list__title">{{ act.label }}</span><span v-html="act.description"></span></li>        
      </ul>
    </SidebarSection>
    </Teleport>
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { computed, ref } from 'vue';
import { useConditionsStore } from '@/sheet/stores/conditions/conditionsStore';
import { objectToArray } from '@/utility/objectify';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { armorRatingMod } from '@/sheet/stores/modifiersCheck/armorRating';
import { defenseMod } from '@/sheet/stores/modifiersCheck/defense';
import { speedMod } from '@/sheet/stores/modifiersCheck/speed';
import SidebarSection from '@/components/SidebarSection.vue';
import { actionsList } from '@/system/actions';

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
      if(settings.showArcana){
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
</script>