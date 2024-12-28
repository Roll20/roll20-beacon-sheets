<template>
  <div class="accordion-item" >
    <div class="accordion-header attack attack__row age-qualities-accordion-header">
        <div style="display: flex;position: relative;">
        <div class="age-quality-section age-quality-class-icon" v-if="feature.type === 'Class'"></div>
        <div class="age-quality-section age-quality-ancestry-icon" v-if="feature.type === 'Ancestry'"></div>
        <div class="age-quality-section age-quality-focus-icon" v-if="feature.type === 'Ability Focus'"></div>
        <div class="age-quality-section age-quality-talent-icon" v-if="feature.type === 'Talent'"></div>
        <div class="age-quality-section age-quality-specialization-icon" v-if="feature.type === 'Specialization'"></div>
        <div class="age-quality-section age-quality-stunt-icon" v-if="feature.type === 'Favored Stunt'"></div>
        </div>    
        <div class="label">
          <div v-if="feature.name !== 'custom'">{{ feature.name }}<br /></div>
          <div v-if="feature.name === 'custom'">{{ feature.customName }}<br /></div> 
          <span v-if="feature.ability">({{ feature.ability }})</span>
          <span v-if="feature.stuntType">({{ feature.stuntType }})</span>
        </div>        
       
        
        <div class="age-weapon-range-reload">
          <div v-if="feature.type === 'Ability Focus'" style="display: grid;align-items: center;height: 100%;">
            <div>
              <button class="age-btn"  @click="rollAbilityCheck(feature.ability, true, focusBonus(feature),feature);$emit('close')">
                <span v-if="feature.focus && !feature.doubleFocus">+{{ Number(useAbilityScoreStore().abilityScores[props.feature.ability]?.base) + focusBonus(feature) }}</span>
                <span v-if="feature.focus && feature.doubleFocus" >+{{ Number(useAbilityScoreStore().abilityScores[props.feature.ability]?.base) + focusBonus(feature) }}</span>
                <font-awesome-icon :icon="['fa', 'dice']" style="margin-left:3px;" />
              </button>
            </div>
        
          </div>   
          <div v-if="feature.type === 'Favored Stunt'"  style="display: grid;align-items: center;height: 100%;">
            <div v-tippy="{ content: (char.stunts < feature.spCost) ? 'Not enough stunt points' : '' }">
              <!-- <div v-if="!feature.modifiers || feature.modifiers.length === 0"> -->
              <button class="age-btn"
                      :disabled="(char.stunts < feature.spCost)"
                      :class="{ 'age-btn-disabled':(char.stunts < feature.spCost)}"
                      @click="printStunt"
                      >
                      <span>
                        {{ feature.spCost }} SP
                      </span>
              </button>
            </div>
            <!-- <div v-for="mod in feature.modifiers" :key="mod">
              <div v-if="mod.option === 'Damage'">
                <button class="age-btn">
                  {{ mod.roll }}
                    <font-awesome-icon :icon="['fa', 'dice']" style="padding:3px;" />
                </button> 
              </div>
            </div> -->
            <!-- <button class="age-btn">
              {{ feature.roll }}
                <font-awesome-icon :icon="['fa', 'dice']" style="padding:3px;" />
            </button> -->
          </div>
          <div v-else-if="feature.type === 'Ancestry'"  style="display: grid;align-items: center;height: 100%;">
            <div v-for="mod in feature.modifiers" :key="mod">
              <div v-if="mod.option === 'Spell'">
                <button class="age-btn"
                :disabled="(char.stunts < mod.variable)"
                      :class="{ 'age-btn-disabled':(char.stunts < mod.variable)}">
                  <span>{{ mod.customName }} - {{ mod.variable }} {{  mod.costType === 'Stunt Points' ? 'SP' : 'MP' }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="age-orb-container" v-if="feature.type !== 'Ability Focus' && feature.type !== 'Favored Stunt' && feature.type !== 'Ancestry' && feature.type !== 'Class'">
            <div class="age-orb" :class="{ 'age-orb-highlight': isNovice || isExpert || isMaster}" v-tippy="{ content: noviceTip }"></div>
            <div class="age-orb" :class="{ 'age-orb-highlight': isExpert || isMaster}" v-tippy="{ content: expertTip }"></div>
            <div class="age-orb" :class="{ 'age-orb-highlight': isMaster}" v-tippy="{ content: masterTip }"></div>
          </div>    
      </div>  
      <div class="age-weapon-btn-container">          
        
      </div>
      <button type="button" class="config-btn age-icon-btn" @click="handlePrint" v-tippy="{ content: 'Share ' + feature.type + ' in chat'}">
          <font-awesome-icon :icon="['fa', 'comment']" />
        </button>
      <div style="display: grid;align-items: center;grid-template-columns: 1fr;height: 100%;">
        <button type="button" class="config-btn age-icon-btn"  @click="showModal = true">
          <font-awesome-icon :icon="['fa', 'gear']" />
        </button> 
      </div>      

        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapseQuality'+ feature.type.replace(' ','') + index"  aria-expanded="true" aria-controls="collapseOne"></button>
    </div>
      <div :id="'collapseQuality'+ feature.type.replace(' ','') + index" class="accordion-collapse age-accordion-collapse collapsed collapse" data-bs-parent="#age-spell-accordion">
        <div class="accordion-body">

  <div class="age-quality-accordion">
    <div>
      <h3>Description</h3>
      <div v-html="feature.description"></div>
      <!-- {{ feature }} -->
    </div>
    <div v-html="feature.qualityNovice"></div>
    <div v-html="feature.qualityMaster"></div>
    <div v-html="feature.qualityExpert"></div>
  </div>
  </div>
      </div>
  </div>
  <!-- <div class="talents">
    <div class="talents__row">
      <div> -->
        <!-- {{ feature }} -->
        <!-- <div class="age-stunt-section age-stunt-combat-icon" v-if="feature.stuntType === 'combat'"></div> -->
        <!-- <div class="age-stunt-section age-item-item-icon" v-if="item.type === 'item'"></div>
        <div class="age-stunt-section age-item-weapon-icon" v-if="item.type === 'weapon'"></div>
        <div class="age-stunt-section age-item-consumable-icon" v-if="item.type === 'consumable'"></div> -->
        <!-- <div class="age-quality-section age-quality-class-icon" v-if="feature.type === 'Class'"></div>
        <div class="age-quality-section age-quality-ancestry-icon" v-if="feature.type === 'Ancestry'"></div>
        <div class="age-quality-section age-quality-talent-icon" v-if="feature.type === 'Ability Focus'"></div>
        <div class="age-quality-section age-quality-class-icon" v-if="feature.type === 'Talent'"></div>
        <div class="age-quality-section age-quality-class-icon" v-if="feature.type === 'Specialization'"></div>
        <div class="age-quality-section age-quality-class-icon" v-if="feature.type === 'Class'"></div>
      
      <div class="label" style="flex:1;" v-if="feature.type === 'Ability Focus'">
        <div v-if="feature.name !== 'custom'">{{ feature.name }}<br /></div>
        <div v-if="feature.name === 'custom'">{{ feature.customName }}<br /></div> 
      ({{ feature.ability }})</div>     
      <div class="label" style="flex:1;" v-if="feature.type === 'Talent'">{{ feature.name }}</div>     
      <div class="label" style="flex:1;" v-if="feature.type === 'Specialization'">{{ feature.name }}</div>     
      <div class="label" style="flex:1;" v-if="feature.type === 'Stunt'">
        <div v-if="feature.name !== 'custom'">{{ feature.name }}<br /></div>
        <div v-if="feature.name === 'custom'">{{ feature.customName }}<br /></div> 
        {{ feature.stuntType }} 
      </div>     
      <div class="label" style="flex:1;" v-if="feature.type === 'Ancestry' || feature.type === 'Class'">{{ feature.name }}</div>     
    </div>
      <div v-if="feature.type === 'Ability Focus'">
        <div>
          <button class="age-btn"  @click="rollAbilityCheck(feature.ability, true, focusBonus(feature),feature);$emit('close')">
          <span v-if="feature.focus && !feature.doubleFocus">+{{ 2 + focusBonus(feature) }}</span>
          <span v-if="feature.focus && feature.doubleFocus">+{{ 4 + focusBonus(feature) }}</span>
            <font-awesome-icon :icon="['fa', 'dice']" style="padding:3px;" />
        </button>
        </div>
        
      </div>   
      <div v-if="feature.type === 'stunt'">
        <button class="age-btn">
          {{ feature.stuntRoll }}
            <font-awesome-icon :icon="['fa', 'dice']" style="padding:3px;" />
        </button>
      </div>
      <div v-if="feature.type === 'acAbility'"></div>
      <div class="age-orb-container" v-if="feature.type !== 'Ability Focus' && feature.type !== 'Stunts' && feature.type !== 'Ancestry' && feature.type !== 'Class'">
        <div class="age-orb" :class="{ 'age-orb-highlight': isNovice || isExpert || isMaster}" v-tippy="{ content: noviceTip }"></div>
        <div class="age-orb" :class="{ 'age-orb-highlight': isExpert || isMaster}" v-tippy="{ content: expertTip }"></div>
        <div class="age-orb" :class="{ 'age-orb-highlight': isMaster}" v-tippy="{ content: masterTip }"></div>
      </div>   
      
    </div>
  </div> -->
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <QualitiesModal :show="showModal" @close="showModal = false;" :feature="feature"
      :index="index" @delete="handleDelete(feature.type)">
      <template #header>
        <h3 class="age-modal-details-header">{{ feature.type }} Details</h3>
      </template>
    </QualitiesModal>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useSpellStore } from '@/sheet/stores/magic/magicStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore'
import QualitiesModal from './QualitiesModal.vue';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useAttackStore } from '@/sheet/stores/attack/attackStore';
const { abilityScores, rollAbilityCheck } = useAbilityScoreStore();
const showModal = ref(false)
const open = ref(false)
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  feature: { type: Object },
  index: { type: Number },
  aim: { type: Boolean },
  aimValue: { type: Number },
});
const expanded = ref(false);
const char = useCharacterStore();
// Ability Focus
function focusBonus(obj){
  if (obj.doubleFocus) {
      return 4; // Return 4 if doubleFocus is true
    } else if (obj.focus) {
      return 2; // Return 2 if only focus is true
    } else {
      return 0;
    }
}

const isNovice = computed(() => {
  return props.feature.qualityLevel === 'novice';
});
const noviceTip = () => {
  if(isNovice.value || isExpert.value || isMaster.value){
    return `<p>Novice</p><p>`+props.feature.qualityNovice+`</p>`
  } else {
    return `Novice level not accquired`
  }
}
const isExpert = computed(() => {
  return props.feature.qualityLevel === 'expert';
});
const expertTip = () => {
  if(isExpert.value || isMaster.value){
    return `<p>Expert</p><p>`+props.feature.qualityExpert+`</p>`
  } else {
    return `Expert level not accquired`
  }
}
const isMaster = computed(() => {
  return props.feature.qualityLevel === 'master';
});
const masterTip = () => {
  if(isMaster.value){
    return `<p>Master</p><p>`+props.feature.qualityMaster+`</p>`
  } else {
    return `Master level not accquired`
  }
}
const toggleExpand = () => {
  expanded.value = !expanded.value;
};
const modalClosed = () => {
  showModal.value = false;
};
const handleDelete = (type) => {
  useItemStore().removeItem(props.feature._id)
  switch(type){
    case 'focus':
    focusStore.removeAbilityFocus(props.feature._id)
    break;
    case 'talent':
      talentStore.removeTalent(props.feature._id)
    break;
    case 'specialization':
      specialStore.removeSpecialization(props.feature._id)
    break;
    case 'stunt':
      stuntStore.removeStunt(props.feature._id)
    break;
    case 'acAbility':
    acAbility.removeACAbility(props.feature._id)
    break;
  }  
};
const handlePrint = () => {
  // debugger
  const spellStore = useSpellStore();
  useItemStore().printQuality(props.feature._id);
};
const selectedAttack = () => {
  const spellStore = useSpellStore();
  spellStore.setCurrentAttack(props.spell._id);
  // selAttack = props.spell
};

const printStunt = () => {
  char.stunts = char.stunts - props.feature.spCost;
  if(!props.feature.modifiers) return;
  props.feature.modifiers.forEach(mod => {
    if(mod.option === 'Damage'){
      const attackStore = useAttackStore();
      attackStore.printAttackDamage({name:props.feature.name,damage:mod.roll}); 
    }
  })
}
</script>

<style scoped lang="scss">
.age-modal-details-header {
  text-transform: capitalize;
}
.talents {
  .label {
    font-weight: 600;
    position: relative;
  }

  &__row {
    display: grid;
    align-items: center;
    gap: 1rem;
    padding: 2px;
    border: 1px solid #1e4e7a;
    margin: 6px;
    overflow: hidden;
    grid-template-columns: 2fr 1fr 30px;
    border-radius: 8px;
    position: relative;
  }

  &__buttons {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
    button {
      padding: 0 0.5rem;
      &.delete {
        font-size: 1.25rem;
      }
    }
  }

  &__level {
    font-weight: 600;
    width: 1rem;
  }

  &__toggle {
    font-weight: 600;
    display: inline-flex;
    gap: 1rem;
    align-spells: center;
    .caret {
      line-height: 1rem;
      transform: rotate(0deg);
      transition: transform 0.2s ease-in-out;
      &.expanded {
        transform: rotate(-90deg);
      }
    }
  }

  &__expansion {
    height: 0;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s linear;

    &.expanded {
      opacity: 1;
      height: 14rem;
      pointer-events: all;
      padding: 10px;
    }
    & .delete-container {
      display: flex;
      justify-content: flex-end;
      & .delete-btn {
      background: linear-gradient(
        120deg,
        #ff0000 0%,
        #f50800 28%,
        #eb1000 43%,
        #bd1000 51%,
        #db1600 57%,
        #d11800 61%,
        #c71b00 65%,
        #bd1c00 67%,
        #b81f00 70%,
        #ad1d00 74%,
        #a31e00 79%,
        #9e2000 87%,
        #941e00 100%
      );
      color: #FFF;
      padding: 4px 12px;
      border-radius: 5px;
      font-weight: bold;
      font-size: 12px;
    }
    }
    
  }

  &__top {
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  &__bottom {
    width: 100%;
    margin-bottom: 1rem;

    textarea {
      width: 100%;
      height: 5rem;
    }
  }
}

</style>
