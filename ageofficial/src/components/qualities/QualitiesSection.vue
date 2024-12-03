<template>   
  <div class="age-content">
    <button data-testid="test-add-trait-btn" class="link-btn" @click="showModal = true" style="background: none; font-weight: bold;border:none;">
        + Add Quality
      </button>
    <div style="padding: 6px;" v-for="quality in qualitiesArray" :key="quality" >
      <!-- {{ item.items }} -->
      <h3 class="age-bio-header">{{ quality }}</h3>
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
      <!-- <h3 class="age-bio-header">
        Ancestry & Class Abilities <button data-testid="test-add-trait-btn" class="link-btn age-talent-add" @click="acAbility.addACAbility()">+</button>
      </h3>
      
      <CharacterFTS v-for="ac in acAbility.acAbilities" :type="'focus'" :key="ac" :feature="ac" :id="ac._id"/>
    </div> 
    <hr />    
    <div style="padding: 6px;" >
      <h3 class="age-bio-header">
        Ability Focuses <button data-testid="test-add-trait-btn" class="link-btn age-talent-add" @click="focus.addAbilityFocus()">+</button>
      </h3>
      
      <CharacterFTS v-for="foci in focus.abilityFocuses" :type="'focus'" :key="foci" :feature="foci" :id="foci._id" :aim="aim" :aimValue="aimValue" />
    </div> 
    <hr />    
    <div style="padding: 6px;" >
      <h3 class="age-bio-header">
        Talents<button data-testid="test-add-trait-btn" class="link-btn age-talent-add" @click="talent.addTalent()">+</button>
      </h3>
      
      <CharacterFTS v-for="talent in talent.talents" :type="'talent'" :key="talent" :feature="talent" :id="talent._id" :aim="aim" :aimValue="aimValue" />

    </div> 
    <hr />
    <div style="padding: 6px;" >
      <h3 class="age-bio-header">
        Specializations <button data-testid="test-add-trait-btn" class="link-btn age-talent-add" @click="special.addSpecialization()">+</button>
      </h3>
      
      <CharacterFTS v-for="special in special.specializations" :type="'specialization'" :key="special" :feature="special" :id="special._id" :aim="aim" :aimValue="aimValue" />
    </div> 
    <hr />
    <div style="padding: 6px;" >
      <h3 class="age-bio-header">
        Stunts <button data-testid="test-add-trait-btn" class="link-btn age-talent-add" @click="stunts.addStunt()">+</button>
      </h3>
      
      <CharacterFTS v-for="stunt in stunts.stunts" :type="'stunts'" :key="stunt" :feature="stunt" :id="stunt._id" :aim="aim" :aimValue="aimValue" />
    </div> 
    </div> -->

    <Teleport to="body">
      <!-- use the modal component, pass in the prop -->
      <QualitiesModal :show="showModal" @close="showModal = false;resetFeature()" :feature="featureNew" :mode="'create'">
        <template #header>
          <h3 class="age-modal-details-header">Create Character Quality</h3>
        </template>
      </QualitiesModal>
    </Teleport>
</template>

<script setup>
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { computed, reactive, ref } from 'vue';
import QualitiesModal from './QualitiesModal.vue';
import CharacterQualitiesView from './CharacterQualitiesView.vue';
const props = defineProps({
  aim: { type: Boolean },
  aimValue: { type: Number },
});
const qualitiesArray = ['Ancestry & Class','Ability Focus',
// 'Talent','Specialization',
'Favored Stunt'];
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
