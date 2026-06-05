<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal age-qualities-modal-container" :class="{ 'age-qualities-modal': feature.type }">
            <div class="age-modal-header">
              <slot name="header">default header</slot>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <div v-if="mode === 'create' && !feature.type" :style="`display: grid;grid-template-columns: repeat(${qualitiesLength}, minmax(min(100%, 30%), 1fr));gap: 1rem;`">
                <button v-for="qty in qualityOptions" :key="qty" class="age-quality-select-btn" @click="feature.type = qty;if(qty === 'Favored Stunt') feature.spCost = '1'">
                  <div class="age-quality-section age-quality-class-icon" v-if="qty === 'Class'"></div>
                  <div class="age-quality-section age-quality-ancestry-icon" v-if="qty === 'Ancestry'"></div>
                  <div class="age-quality-section age-quality-focus-icon" v-if="qty === 'Ability Focus'"></div>
                  <div class="age-quality-section age-quality-talent-icon" v-if="qty === 'Talent'"></div>
                  <div class="age-quality-section age-quality-specialization-icon" v-if="qty === 'Specialization'"></div>
                  <div class="age-quality-section age-quality-stunt-icon" v-if="qty === 'Favored Stunt'"></div>
                  <div class="age-quality-section age-quality-special-icon" v-if="qty === 'Special Feature'"></div>
                  <div>
                    {{ qty }}
                  </div>
                </button>
                
              </div>
              <div>
              <div class="row age-row" v-if="feature.type === 'Ability Focus'">
                <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Ability</span>
                  <select
                    class="age-atk-select form-select"
                      data-testid="test-spell-weaponType-input"
                      :id="`weaponType-${feature._id}`"
                      v-model="feature.ability"
                      @change="onAbilityChange()">
                    <option v-for="abl in abilities" :key="abl" :value="abl">{{ abl }}</option>
                  </select>
                </div>
                <div class="mb-3 col">
                <span class="age-input-label" id="basic-addon1">Focus Name</span>
                <div class="custom-select-wrapper">
                  <!-- Overlayed display for selected value -->
                  <div
                    class="age-atk-select form-select custom-select-overlay"
                    v-if="selected">
                    {{ selected }}
                  </div>
                  <!-- Native select dropdown -->
                  <select
                    class="age-atk-select form-select custom-select-native"
                    v-model="selected"
                    @change="setFocus(selected)">
                      <option disabled value="">Select an option</option>
                      <!-- Arcana group first -->
                      <optgroup label="Arcana" v-if="feature.ability === 'Intelligence' && settings.showArcana">
                        <option
                          v-for="option in arcanaFocuses"
                          :key="`Arcana-${option}`"
                          :value="`Arcana (${option})`">
                          {{ option }}
                        </option>
                      </optgroup>
                      <optgroup label="Psychic" v-if="feature.ability === 'Intelligence' && psychicFocuses.length">
                        <option
                          v-for="option in psychicFocuses"
                          :key="`Psychic-${option}`"
                          :value="`Psychic (${option})`">
                          {{ option }}
                        </option>
                      </optgroup>
                      <option v-for="foci in filteredFocuses[feature.ability]" :key="foci" :value="foci">{{ foci }}</option>
                      <option value="custom">Custom</option>
                  </select>
            </div>
    </div>
                <!-- <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Focus Name</span>
                  <select class="age-atk-select form-select"
                          data-testid="test-spell-weaponType-input"
                          :id="`weaponType-${feature._id}`"
                          v-model="feature.name">
                    <option v-for="foci in filteredFocuses[feature.ability]" :key="foci" :value="foci">{{ foci }}</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div> -->
                <div class="mb-3 col" v-if="feature.name === 'custom'">
                  <span class="age-input-label" id="basic-addon1">Custom Name</span>
                  <input class="form-control" type="text" v-model="feature.customName" />
                </div>
                <div class="age-focus-container">
                  <div class=" input-group">
                    <label class="age-checkbox-toggle qualities-toggle-label">
                        <input type="checkbox"  v-model="feature.focus" />
                        <span class="slider round" ></span>
                    </label>
                    <span class="age-toggle-label">Focus</span>
                  </div>
                  <div class=" input-group">
                    <label class="age-checkbox-toggle qualities-toggle-label" v-tippy="{ content: char.level < 10 ? 'Your character must be level 11 to double focus': ''}"  >
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
              <div class="row age-row" v-if="feature.type === 'Talent' || feature.type === 'Specialization'">
                <div class="mb-3 col">
                    <span class="age-input-label age-input-label" id="basic-addon1">Talent</span>          
                    <input type="text" class="form-control" placeholder="Talent" aria-label="Talent" v-model="feature.name"  aria-describedby="basic-addon1">
                </div>
                <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Talent Level</span>
                  <select
                    class="age-atk-select form-select capitalize"
                      data-testid="test-spell-weaponType-input"
                      v-model="feature.qualityLevel"
                  >
                    <option v-for="lvl in qualityLevels" :key="lvl" :value="lvl" class="capitalize">{{ lvl }}</option>
                  </select>
                </div>

                
              </div>
              <div class="row age-row" v-if="feature.type === 'Favored Stunt'">
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
                  <input type="text" class="form-control" placeholder="1" aria-label="Stunt Point Cost" v-model="feature.spCost" aria-describedby="basic-addon1">
                </div>
              </div>
              <div class="row age-row" v-if="feature.type === 'Ancestry' || feature.type === 'Class' || feature.type === 'Special Feature'">
                <div class="mb-3 col">
                    <span class="age-input-label age-input-label" id="basic-addon1">Ability Name</span>          
                    <input type="text" class="form-control" placeholder="Ability Name" aria-label="Talent" v-model="feature.name"  aria-describedby="basic-addon1">
                </div>
                
              </div>
              <!-- Description -->
              <div class="row age-row">
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
                      scrollingContainer: true}" v-model:content="feature.description" />
                </div>
               </div>
              
              <!-- Quality Levels -->
              <div class="row age-row">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'novice' || feature.qualityLevel === 'expert' || feature.qualityLevel === 'master' || feature.qualityLevel === 'gransmaster'  || feature.qualityLevel === 'apex'" >
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
                        scrollingContainer: true}" v-model:content="feature.qualityNovice" />
                </div>
              </div>
              <div class="row age-row">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'expert' || feature.qualityLevel === 'master' || feature.qualityLevel === 'gransmaster'  || feature.qualityLevel === 'apex'" >
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
                      scrollingContainer: true}" v-model:content="feature.qualityExpert" />
                </div>
              </div>
              <div class="row age-row">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'master' || feature.qualityLevel === 'gransmaster'  || feature.qualityLevel === 'apex'" >
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
                      scrollingContainer: true}" v-model:content="feature.qualityMaster" />
                </div>
              </div>
              <div class="row age-row">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'gransmaster' || feature.qualityLevel === 'apex'" >
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
                      scrollingContainer: true}" v-model:content="feature.qualityMaster" />
                </div>
              </div>
              <div class="row age-row">
                <div class="mb-5 col" v-if="feature.qualityLevel === 'apex'" >
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
                      scrollingContainer: true}" v-model:content="feature.qualityMaster" />
                </div>
              </div>
            </div>
              <div class="age-quality-modifiers"  v-if="(feature.type && feature.type !== 'Ability Focus' && feature.type !== 'Specialization')">
               <h3 class="age-flex">
                  <span>Modifiers</span>
                  <button class="link-btn" @click="addModifier"
                  v-tippy="{ content: 'Add Modifier' }">
                  <font-awesome-icon :icon="['fa', 'plus']" />
                
                </button>

                </h3>
                <div v-for="(mod) in mode === 'create' ? feature.modifiers : mods.parentItems(feature._id)" :key="mod" class="qualities-mod-row">
                  <BaseModView :mod="mod" :modOptions="modOptions" />
                </div>                
              </div>
            </div>
        <div class="modal-footer-actions" v-if="mode === 'create'">
          <slot name="footer">
                <div >
                  <button v-if="mode === 'create' && feature.type"
                class="confirm-btn"
                @click="createQuality();$emit('close')"
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
import { computed, ref } from 'vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { v4 as uuidv4 } from 'uuid';
import SpellModView from '@/components/modifiers/SpellModView.vue';
import AbilityModView from '@/components/modifiers/AbilityModView.vue';
import { arcaneFocusNames, sliceFocuses, SLICE_DEFS, resolveFocuses } from '../modifiers/focuses';
import CustomAttackModView from '../modifiers/CustomAttackModView.vue';
import {useModifiersStore} from '@/sheet/stores/modifiers/modifiersStore'
import BaseModView from '@/components/modifiers/BaseModView.vue';
import { brArcana, fageArcana, magePowers, magePsychicPowers } from '../magic/magicTypes';
// const qualityOptions = ['Ability Focus', 'Ancestry', 'Class', 'Favored Stunt', 'Specialization', 'Talent' ];
const props = defineProps({
  show: Boolean,
  feature: { type: Object },
  mode: String,
  qualityOptions: { type: Array}
});
const char = useCharacterStore();
const mods = useModifiersStore();
const settings = useSettingsStore()
const abilities = ['Accuracy', 'Communication','Constitution','Dexterity','Fighting','Intelligence','Perception','Strength','Willpower'];
// mods.modifiers = [];
// Genre slices that are currently toggled on (definitions/flags shared via SLICE_DEFS).
const activeSlices = () => SLICE_DEFS.filter((s) => settings[s.flag]);

const arcanaFocuses = computed(() => {
  let base;
  switch (settings.gameSystem) {
    case 'fage2e':
    case 'fage1e':
    case 'cthulhu': base = fageArcana; break;
    case 'mage':    base = magePowers; break;
    case 'blue rose': base = brArcana; break;
    default: base = []; break;
  }
  // Append Arcana focuses contributed by any active genre slice, kept alphabetical.
  const sliceArcana = activeSlices().flatMap((s) => sliceFocuses[s.key]?.Arcana || []);
  return [...base, ...sliceArcana].sort((a, b) => a.localeCompare(b));
});
const psychicFocuses = computed(() => {
  const base = settings.gameSystem === 'mage' ? magePsychicPowers : [];
  // Append Psychic focuses contributed by any active genre slice (e.g. Threefold, Powers).
  const slicePsychic = activeSlices().flatMap((s) => sliceFocuses[s.key]?.Psychic || []);
  return [...base, ...slicePsychic].sort((a, b) => a.localeCompare(b));
});
const filteredFocuses = computed(() => {
  // Base focuses for the system, with any active genre-slice focuses merged straight
  // into each ability's list (Arcana/Psychic slice focuses are handled by their own groups).
  const base = resolveFocuses(settings.gameSystem, settings);
  if (!settings.showArcana) {
    return Object.fromEntries(
      Object.entries(base).map(([ability, focuses]) => [
        ability,
        focuses.filter(f => !arcaneFocusNames.has(f))
      ])
    );
  }
  return base;
});
const setFocus = (selectedOption) => {
  const [group, option] = selected.value.split('(');
  if(option){
    props.feature.name = option.slice(0, -1).trim(); 
  } else {
    props.feature.name = group === 'custom' ? 'custom' : group;
  }
}
const selected = ref(arcanaFocuses.value.includes(props.feature.name) ? `Arcana (${props.feature.name})` : psychicFocuses.value.includes(props.feature.name) ? `Psychic (${props.feature.name})` : props.feature.name || '');

const modOptions = computed(() => {
  const base = useSettingsStore().showArcana
    ? ['Expertise', 'Ability Reroll', 'Armor Penalty', 'Armor Rating', 'Custom Attack', 'Damage', 'Defense', 'Speed', 'Spell']
    : ['Expertise', 'Ability Reroll', 'Armor Penalty', 'Armor Rating', 'Custom Attack', 'Damage', 'Defense', 'Speed', 'Toughness'];
  // Expertise is a Talent-only modifier.
  const filtered = props.feature?.type === 'Talent' ? base : base.filter((o) => o !== 'Expertise');
  return filtered.sort((a, b) => a.localeCompare(b));
})

const qualityLevels = computed(() => {
  if(useSettingsStore().showAfterMastery){
    return ['novice','expert','master','grandmaster','apex'];
  } else {
    return ['novice','expert','master'];
  }
})

const qualitiesLength = computed(() => {
  return props.qualityOptions.length % 2 === 0 ? 2 : 'auto-fit';
})

const createQuality = () => {
  useItemStore().addItem(props.feature);
}
const addModifier = () => {
  if(props.feature._id){
    mods.addModifier(props.feature)
  } else {
    Object.assign(props.feature, {
      modifiers:[{
        _id:uuidv4()
      }]
    })
  }
}
const removeModifier = (index) => {
  if(props.feature._id){
    useItemStore().removeModifier(props.feature._id,index)
  } else {
    props.feature.modifiers?.splice(index, 1)
  }
}
const onAbilityChange = () => {
  selected.value = null;
}


</script>
<style scoped>
.age-qualities-modal-container {
  min-width: 450px;
}

.custom-select-wrapper {
  position: relative;
}

.custom-select-overlay {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 99%;
  border: transparent;
  padding: 4px;
  pointer-events: none;
  background: white;
  z-index: 2;
  height: 92%;
  text-transform: capitalize;
}

.custom-select-native {
  position: relative;
  background: transparent;
}

.qualities-toggle-label {
  margin: 1rem;
}

.qualities-mod-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

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