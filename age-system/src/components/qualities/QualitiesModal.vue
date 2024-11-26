<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal" :class="{ 'age-qualities-modal': feature.type }">
            <div class="age-modal-header">
              <slot name="header">default header</slot>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <div v-if="mode === 'create' && !feature.type" style="display: grid;grid-template-columns: repeat(2,1fr);grid-gap: 5px;">
                <button v-for="qty in qualityOptions" :key="qty" class="age-quality-select-btn" @click="feature.type = qty">
                  <div class="age-quality-section age-quality-class-icon" v-if="qty === 'Class'"></div>
                  <div class="age-quality-section age-quality-ancestry-icon" v-if="qty === 'Ancestry'"></div>
                  <div class="age-quality-section age-quality-focus-icon" v-if="qty === 'Ability Focus'"></div>
                  <div class="age-quality-section age-quality-talent-icon" v-if="qty === 'Talent'"></div>
                  <div class="age-quality-section age-quality-specialization-icon" v-if="qty === 'Specialization'"></div>
                  <div class="age-quality-section age-quality-stunt-icon" v-if="qty === 'Favored Stunt'"></div>
                  <div>
                    {{ qty }}
                  </div>
                </button>
                
              </div>
              <div>
              <div class="row" style="margin:0" v-if="feature.type === 'Ability Focus'">
                <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Ability</span>
                  <select
                    class="age-atk-select form-select"
                      data-testid="test-spell-weaponType-input"
                      :id="`weaponType-${feature._id}`"
                      v-model="feature.ability"
                  >
                    <option v-for="abl in abilities" :key="abl" :value="abl">{{ abl }}</option>
                  </select>
                </div>
                <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Focus Name</span>
                  <select class="age-atk-select form-select"
                          data-testid="test-spell-weaponType-input"
                          :id="`weaponType-${feature._id}`"
                          v-model="feature.name">
                    <option v-for="foci in filteredFocuses[feature.ability]" :key="foci" :value="foci">{{ foci }}</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div class="mb-3 col" v-if="feature.name === 'custom'">
                  <span class="age-input-label" id="basic-addon1">Custom Name</span>
                  <input type="text" v-model="feature.customName" />
                </div>
                <div class="age-focus-container">
                  <div class=" input-group">
                    <label class="age-checkbox-toggle" style="margin:1rem;">
                        <input type="checkbox"  v-model="feature.focus" />
                        <span class="slider round" ></span>
                    </label>
                    <span class="age-toggle-label">Focus</span>
                  </div>
                  <div class=" input-group">
                    <label class="age-checkbox-toggle" style="margin:1rem;" v-tippy="{ content: char.level < 10 ? 'Your character must be level 11 to double focus': ''}"  >
                        <input type="checkbox"  v-model="feature.doubleFocus" :disabled="char.level < 10"  />
                        <span class="slider round" ></span>
                    </label>
                    <span class="age-toggle-label" :class="{ 'age-toggle-label-disabled':char.level < 10}">Double Focus</span>
                  </div>     
                  <!-- <div>
                    Focus
                    <label class="age-checkbox-toggle">
                      <input type="checkbox" v-model="feature.focus" />
                      <span class="slider round"></span>
                    </label>
                  </div>  
                  <div>
                    Double Focus
                    <label class="age-checkbox-toggle">
                      <input type="checkbox" v-model="feature.doubleFocus" />
                      <span class="slider round" v-tippy="{ content: char.level < 10 ? 'Your character must be level 11 to double focus': ''}"></span>
                    </label>
                  </div>     -->
                </div>
                
              </div>
              <div class="row" style="margin:0" v-if="feature.type === 'Talent' || feature.type === 'Specialization'">
                <div class="mb-3 col">
                    <span class="age-input-label age-input-label" id="basic-addon1">Talent</span>          
                    <input type="text" class="form-control" placeholder="Talent" aria-label="Talent" v-model="feature.name"  aria-describedby="basic-addon1">
                </div>
                <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Talent Level</span>
                  <select
                    class="age-atk-select form-select"
                      data-testid="test-spell-weaponType-input"
                      v-model="feature.qualityLevel"
                  >
                    <option value="novice">Novice</option>
                    <option value="expert">Expert</option>
                    <option value="master">Master</option>
                  </select>
                </div>

                
              </div>
              <div class="row" style="margin:0" v-if="feature.type === 'Favored Stunt'">
                <div class="mb-3 col">
                    <span class="age-input-label age-input-label" id="basic-addon1">Stunt</span>          
                    <input type="text" class="form-control" placeholder="Stunt Name" aria-label="Talent" v-model="feature.name"  aria-describedby="basic-addon1">
                </div>
                <div class="mb-3 col-4">
                  <span class="age-input-label" id="basic-addon1">Stunt Type</span>
                  <select
                    class="age-atk-select form-select"
                      data-testid="test-spell-weaponType-input"
                      :id="`weaponType-${feature._id}`"
                      v-model="feature.stuntType"
                  >
                    <option value="Class">Class</option>
                    <option value="Ancestry">Ancestry</option>
                    <option value="Combat">Combat</option>
                    <option value="Social">Social</option>
                    <option value="Exploration">Exploration</option>
                    <option value="Spell">Spell</option>                        
                  </select>
                </div>
                <div class="mb-3 col-2">
                  <span class="age-input-label" id="basic-addon1" v-if="feature.type === 'Favored Stunt'">SP Cost</span>
                  <input type="number" class="form-control" placeholder="1" aria-label="Stunt Point Cost" v-model="feature.spCost"  aria-describedby="basic-addon1">
                </div>
              </div>
              <div class="row" style="margin:0" v-if="feature.type === 'Ancestry' || feature.type === 'Class'">
                <div class="mb-3 col">
                    <span class="age-input-label age-input-label" id="basic-addon1">Ability Name</span>          
                    <input type="text" class="form-control" placeholder="Ability Name" aria-label="Talent" v-model="feature.name"  aria-describedby="basic-addon1">
                </div>
                
              </div>
              <!-- Description -->
              <div class="row" style="margin:0">
                <div class="mb-5 col" v-if="feature.type">
                    <span class="age-input-label">Description</span>
                    <QuillEditor ref="quillEditor" contentType="html" toolbar="" :options="{
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
                      placeholder: feature.type + ' Description',scrollingContainer: true}" v-model:content="feature.description" />
                </div>
               </div>
              
              <!-- Quality Levels -->
              <div class="row" style="margin:0">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'novice' || feature.qualityLevel === 'expert' || feature.qualityLevel === 'master'" >
                      <span class="age-input-label">Novice</span>
                      <QuillEditor ref="quillEditor" contentType="html" toolbar="" :options="{
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
                        placeholder: 'Novice Level Details',scrollingContainer: true}" v-model:content="feature.qualityNovice" />
                </div>
              </div>
              <div class="row" style="margin:0">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'expert' || feature.qualityLevel === 'master'" >
                    <span class="age-input-label">Expert</span>
                    <QuillEditor ref="quillEditor2" contentType="html" toolbar="" :options="{
                      modules: {
                        keyboard: {
                            bindings: {
                                enter: {
                                    key: 13, // 'Enter' key
                                    handler: (range, context) => {
                                    // Default behavior of Quill (inserts a single paragraph)
                                    const quill = this.$refs.quillEditor2.quill;
                                    quill.formatLine(range.index, 1, 'block', true);
                                    },
                                },
                            },
                        },
                      },
                      placeholder: 'Expert Level Details',scrollingContainer: true}" v-model:content="feature.qualityExpert" />
                </div>
              </div>
              <div class="row" style="margin:0">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'master'" >
                    <span class="age-input-label">Master</span>
                    <QuillEditor ref="quillEditor3" contentType="html" toolbar="" :options="{
                      modules: {
                        keyboard: {
                            bindings: {
                                enter: {
                                    key: 13, // 'Enter' key
                                    handler: (range, context) => {
                                    // Default behavior of Quill (inserts a single paragraph)
                                    const quill = this.$refs.quillEditor3.quill;
                                    quill.formatLine(range.index, 1, 'block', true);
                                    },
                                },
                            },
                        },
                      },
                      placeholder: 'Master Level Details',scrollingContainer: true}" v-model:content="feature.qualityMaster" />
                </div>
              </div>
            </div>
              <!-- Modifiers -->
              <div class="age-quality-modifiers"  v-if="feature.type && feature.type !== 'Ability Focus'">
               <h3 style="display: flex;">
                  <span>Modifiers</span>                  
                  <button class="link-btn" @click="addModifier" 
                  style="background: none; font-weight: bold;border:none; font-size: 14px;" v-tippy="{ content: 'Add Modifier' }">
                  <font-awesome-icon :icon="['fa', 'plus']" />
                
                </button>

                </h3>
                <div v-for="(mod,index) in mods.parentItems(feature._id)" :key="index" style="display:flex;gap:10px;">
                  <BaseModView :mod="mod" :modOptions="modOptions" />
                </div>
                <div v-for="(mod,index) in feature.modifiers" :key="mod" style="display:flex;gap:10px;">
                  <div>
                    <select
                      class="age-atk-select form-select"
                        data-testid="test-spell-weaponType-input"
                        :id="`weaponType-${feature._id}`"
                        v-model="mod.option"
                    >
                      <option v-for="op in modOptions" :key="op" :value="op">{{ op }}</option>
                    </select>
                  </div>
                  <!-- <div v-if="mod.option === 'Damage'">
                    <label class="container">Permanent
                      <input type="radio" id="one" value="permanent" v-model="mod.conditional" />
                      <span class="checkmark"></span>
                    </label>
                    <label class="container">Optional
                      <input type="radio" id="one" value="optional" v-model="mod.conditional" />
                      <span class="checkmark"></span>
                    </label>
                  </div> -->
                  <div v-if="mod.option === 'Ability Reroll'">
                    <AbilityModView :mod="mod" />
                  </div>
                  <div v-else-if="mod.option === 'Spell'">
                    <SpellModView :mod="mod" />
                  </div>
                  <div v-else-if="mod.option === 'Custom Attack'">
                    <CustomAttackModView :mod="mod" />
                  </div>
                  <div v-else>
                    <input type="number"  class="form-control" placeholder="0"  v-model="mod.variable" v-if="mod.option && mod.option !== 'Damage'" />
                  </div>
                  <div>
                    <input type="text"  class="form-control" placeholder="1d6"  v-model="mod.roll" v-if="mod.option === 'Damage'" />
                  </div>
                  
                  <button class="link-btn" @click="removeModifier(index)" 
                  style="background: none; font-weight: bold;border:none;" v-tippy="{ content: 'Remove Modifier' }">
                  <font-awesome-icon :icon="['fa', 'minus']" />
                </button>
                </div>
              </div>
            </div>

        <div class="modal-footer-actions" v-if="mode === 'create'">
          <slot name="footer">
                <div >
                  <button v-if="mode === 'create' && feature.type"
                class="confirm-btn"
                @click="useItemStore().addItem(feature);$emit('close')"
              >Create</button>      
                </div>
            
             
            
            
          </slot>
        </div>
        <div class="modal-footer-actions"  v-else>
          <slot name="footer">
            <button 
              class="confirm-btn"
              @click="$emit('close')"
            >
              OK
            </button>
            <div class="delete-container">
              <button class="delete-icon-btn delete" title="Delete" @click="$emit('close');$emit('delete')" v-tippy="{ 'content': 'Delete Ability'}">
                <font-awesome-icon :icon="['fa', 'trash-alt']" />
              </button>
            </div>
          </slot>
          </div>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
// import { mageFocuses, fage2eFocuses, blueroseFocuses,fage1eFocuses, cthulhuFocuses } from '@/components/modifiers/qualities';
import { computed, ref } from 'vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { v4 as uuidv4 } from 'uuid';
import SpellModView from '@/components/modifiers/SpellModView.vue';
import AbilityModView from '@/components/modifiers/AbilityModView.vue';
import { bluerose, cthulhu, fage1e, fage2e, mage } from '../modifiers/focuses';
import CustomAttackModView from '../modifiers/CustomAttackModView.vue';
import {useModifiersStore} from '@/sheet/stores/modifiers/modifiersStore'
import BaseModView from '@/components/modifiers/BaseModView.vue';
// const qualityOptions = ['Ability Focus', 'Ancestry', 'Class', 'Favored Stunt', 'Specialization', 'Talent' ];
const props = defineProps({
  show: Boolean,
  feature: { type: Object },
  mode: String,
  qualityOptions: { type: Array}
})
// console.log(props.qualityOptions)
const char = useCharacterStore();
const mods = useModifiersStore();
const abilities = ['Accuracy', 'Communication','Constitution','Dexterity','Fighting','Intelligence','Perception','Strength','Willpower']
// const filteredFocuses = ref({
//   Accuracy: ['Arcane Blast', 'Black Powder', 'Bows', 'Brawling', 'Dueling', 'Grenades', 'Light Blades', 'Slings', 'Staves'],
//   Communication: ['Animal Handling', 'Bargaining', 'Deception','Disguise', 'Etiquette', 'Gambling', 'Investigation', 'Leadership','Performing', 'Persuasion', 'Seduction'],
//   Constitution: ['Rowing', 'Running', 'Stamina', 'Swimming','Tolerance'],
//   Dexterity: ['Acrobatics', 'Calligraphy', 'Crafting', 'Initiative', 'Legerdemain', 'Lock Picking', 'Riding', 'Sailing', 'Stealth', 'Traps'],
//   Fighting: ['Axes', 'Bludgeons', 'Heavy Blades', 'Lances','Polearms', 'Spears'],
//   Intelligence: ['Arcana', 'Arcane Lore', 'Brewing', 'Cartography','Cryptography', 'Cultural Lore', 'Engineering', 'Evaluation','Healing', 'Heraldry', 'Historical Lore', 'Military Lore', 'Musical Lore', 'Natural Lore', 'Navigation', 'Religious Lore', 'Research,Thieves’ Lore', 'Writing'],
//   Perception: ['Empathy', 'Hearing', 'Searching', 'Seeing', 'Smelling','Tasting', 'Touching', 'Tracking'],
//   Strength: ['Climbing', 'Driving', 'Intimidation', 'Jumping','Might', 'Smithing'],
//   Willpower: ['Courage', 'Faith', 'Morale', 'Self-Discipline']
// })
const filteredFocuses = ref(fage2e)

switch(useSettingsStore().gameSystem){
  case 'fage2e':
    filteredFocuses.value = fage2e;
  break;
  case 'mage':
    filteredFocuses.value = mage;
  break;
  case 'fage1e':
    filteredFocuses.value = fage1e;
  break;
  case 'bluerose':
    filteredFocuses.value = bluerose;
  break;
  case 'cthulhu':
    filteredFocuses.value = cthulhu;
  break;
}
const modOptions = ref(['Ability Reroll', 'Armor Penalty', 'Armor Rating', 'Custom Attack', 'Damage', 'Defense', 
// 'Health Points', 'Magic Points',
 'Speed', 'Spell', 
//  'Stunt Die'
])
// let filteredFocuses = []
// let focuses = [];
// function filteredItems() {
//       return focuses[props.feature.ability] || [];
//     }
// function setAbilityFocuses(ability) {
//   switch(props.feature.ability){
//     case 'Accuracy':
//     focuses = ['Arcane Blast', 'Black Powder', 'Bows', 'Brawling', 'Dueling', 'Grenades', 'Light Blades', 'Slings', 'Staves']
//     break;
//     case 'Willpower':
//       // debugger
//       setTimeout(()=>{
//     focuses = ['Courage', 'Faith', 'Morale', 'Self-Discipline']
//   },50)
//     break;
//   }

  
// }
// const setWeaponGroupAbility = () => {
//   // debugger
//   switch(props.spell.weaponGroup){
//     // ACCURACY
//     case('black powder'):
//     case('bows'):
//     case('brawling'):
//     case('dueling'):
//     case('light blades'):
//     case('slings'):
//     case('staves'):
//       props.spell.weaponGroupAbility = 'Accuracy';
//     break;
//     // FIGHTING
//     case('axes'):
//     case('bludgeons'):
//     case('heavy blades'):
//     case('lances'):
//     case('polearms'):
//     case('spears'):
//       props.spell.weaponGroupAbility = 'Fighting';
//     break;
//     default:
//       props.spell.weaponGroupAbility = ''
//     break;
//   }
// }
const addModifier = () => {
  mods.addModifier(props.feature)
  // if(props.feature._id){
  //   useItemStore().addModifier(props.feature)
  // } else {
  //   Object.assign(props.feature, {
  //     modifiers:[{
  //       _id:uuidv4(),
  //       option:''
  //     }]
  //   })
  // }
}
const removeModifier = (index) => {
  if(props.feature._id){
    useItemStore().removeModifier(props.feature._id,index)
  } else {
    props.feature.modifiers?.splice(index, 1)
  }
}
</script>
<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  min-width: 300px;
  width: 100%;
  max-width: 50%;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
.age-focus-container {
  display: flex;
  justify-content: space-between;
}
.age-atk-select {
    height: auto;
}
/* & .age-checkbox-toggle {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 18px;
      & input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      & .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
      }
      
      & .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
        border-radius: 50%;
      }
      & .slider.round {
        border-radius: 34px;
      }
      & input:checked + .slider {
        background-color: #2196F3;
      }
      
      & input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
      }
      
      & input:checked + .slider:before {
        -webkit-transform: translateX(18px);
        -ms-transform: translateX(18px);
        transform: translateX(18px);
      }
    } */
</style>