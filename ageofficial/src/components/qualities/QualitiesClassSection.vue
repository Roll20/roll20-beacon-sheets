<template>   
  <div class="age-content">
    <div style="width: 100%;display: flex;justify-content: flex-end;">
      <button class="link-btn age-icon-btn" @click="showModal = true" style="background: none; font-weight: bold;border:none; font-size: 1.5rem;margin-bottom: -32px;" v-tippy="{ content: 'Add Skill' }">
        <font-awesome-icon :icon="['fa', 'circle-plus']" />
      </button>
    </div>
    <div v-for="quality in qualitiesArray" :key="quality" >
      <h5 class="mt-3">{{ quality }}</h5>
      <div class="accordion age-accordion">        
        <CharacterQualitiesView
          v-for="(qty, index) in item.items.filter(item => getQuality(quality).includes(item.type))"
          :type="quality"
          :key="qty._id"
          :feature="qty"
          :id="qty._id"
          :index="index"
        />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <QualitiesModal :show="showModal" @close="showModal = false;resetFeature()" :feature="featureNew" :mode="'create'" :qualityOptions="qualitOptions">
      <template #header>
        <h3 class="age-modal-details-header">Create Character Quality</h3>
      </template>
    </QualitiesModal>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import QualitiesModal from './QualitiesModal.vue';
import CharacterQualitiesView from './CharacterQualitiesView.vue';
const props = defineProps({
  aim: { type: Boolean },
  aimValue: { type: Number },
});
const settings = useSettingsStore();
const qualitiesArray = ref(['Ancestry & Class','Ability Focus','Favored Stunt']);
const qualitOptions = ref(['Ability Focus','Ancestry','Class','Favored Stunt', 'Special Feature']);
if(settings.gameSystem === 'mage'){
  qualitiesArray.value = ['Ancestry','Ability Focus','Favored Stunt', 'Special Feature'];
  qualitOptions.value = ['Ancestry','Ability Focus','Favored Stunt', 'Special Feature'];
}
if(settings.gameSystem === 'expanse'){
  qualitiesArray.value = ['Ability Focus','Favored Stunt','Special Feature'];
  qualitOptions.value = ['Ability Focus','Favored Stunt', 'Special Feature'];
}
const emit = defineEmits(['update:modelValue'])
const showModal = ref(false)
let featureNew = ref({
  type: '',
  _id: '',
  name: '',
  quality:'',
  description: '',
  customName:'',
  focus:false,
  doubleFocus:false,
  qualityLevel:'',
  qualityNovice:'',
  qualityExpert:'',
  qualityMaster:'',
  roll:'',
  modifiers:[]
  })
const item = useItemStore();
function resetFeature(){
  featureNew.value = {
  type: '',
  _id: '',
  name: '',
  quality:'',
  description: '',
  customName:'',
  focus:false,
  doubleFocus:false,
  qualityLevel:'',
  qualityNovice:'',
  qualityExpert:'',
  qualityMaster:'',
  roll:'',
  modifiers:[]
  }
};
function getItemType(type){
  let filteredType = [];
  switch(type){
    case 'Favored Stunts':
      // debugger
      filteredType.push('Stunt');
    break;
    case 'Talent':
      filteredType.push('Talent');
    break;
    case 'Ability Focus':
      filteredType.push('Ability Focus');
    break;
    
    case 'Class':
      filteredType.push('Class');
    break;
    case 'Ancestry':
      filteredType.push('Ancestry || Class');
    break;
    case 'Ancestry & Class':
      filteredType.push('Class','Ancestry');
    break;
    case 'Specializations':
      filteredType.push('Specializations');
    break;
    default:
      
    break;
  }
  return filteredType
}
function getQuality(quality) {
  if (quality === 'Ancestry & Class') {    
    return ['Ancestry', 'Class'];
  } else {
    return [quality];  // Return as an array to simplify the filter logic
  }
}
</script>

<style scoped lang="scss">
.traits {
  &__body {
  }

  &__top {
    text-align: right;
    padding-right: 1rem;
    margin-bottom: 1rem;
  }

  &__group {
    height: 12rem;
    padding: 0 1rem;
    overflow: scroll;
    display: flex;
    flex-direction: column;
  }
}
.attacks {
  & .age-content {
    padding-bottom: 10px;
  }
}
.age-talent-add {
  background: none; 
  font-weight: bold;
  border:none;
}
</style>
