<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal age-magic-modal">
          <div class="age-modal-header">
              <slot name="header">default header</slot>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
            </div>
        <div class="modal-body">
          <div >
            <div class="row"> 
              <div class="mb-3 col">
                <span class="age-input-label" id="basic-addon1">{{ magicLabel }} Name</span>
                <input type="text" class="form-control" placeholder="Name" aria-label="Character Name" v-model="spell.name"  aria-describedby="basic-addon1">
              </div>
              <div class="mb-3 col">
              <span class="age-input-label" id="basic-addon1">{{ magicLabel }}</span>
                          <select
                              class="age-atk-select form-select"
                              data-testid="test-spell-weaponType-input"
                              :id="`weaponType-${spell._id}`"
                              v-model="spell.arcanaType"
                              @change="setArcanaAbility"
                          >
                              <option v-for="mt in magicTypes" :key="mt" :value="mt">{{ mt }}</option>
                          </select>
              </div>
              </div>
              <div class="row">
                <div v-if="spell.arcanaType === 'custom'" class="mb-3 col">
                          <span class="age-input-label" id="basic-addon1">MP Cost</span>
                          <input type="number" class="form-control" placeholder="Name" aria-label="Character Name" v-model="spell.mpCost"  aria-describedby="basic-addon1">
                      </div>
                  <div class="mb-3 col">
                      <span class="age-input-label" id="basic-addon1">{{ magicLabel }} Req.</span>
                          <select
                          class="age-atk-select form-select"
                              data-testid="test-spell-weaponType-input"
                              :id="`weaponType-${spell._id}`"
                              v-model="spell.requirements"
                          >
                              <option value="Novice">Novice</option>
                              <option value="Expert">Expert</option>
                              <option value="Master">Master</option>
                          </select>
                  </div>
                  <div class="mb-3 col">
                      <span class="age-input-label" id="basic-addon1">Spell Type</span>
                          <select
                          class="age-atk-select form-select"
                              data-testid="test-spell-weaponType-input"
                              v-model="spell.spellType"
                          >
                              <option value="Attack">Attack</option>
                              <option value="Defense">Defense</option>
                              <option value="Enhancement">Enhancement</option>
                              <option value="Utility">Utility</option>
                          </select>
                  </div>
                  <div class="mb-3 col">
                          <span class="age-input-label" id="basic-addon1">Target Number</span>
                          <input type="number" class="form-control" placeholder="0" aria-label="Target Number" v-model="spell.targetNumber"  aria-describedby="basic-addon1">
                  </div>
                  <div class="mb-3 col" v-if="settings.gameSystem !== 'blue rose'">
                          <span class="age-input-label" id="basic-addon1">MP Cost</span>
                          <input type="number" class="form-control" placeholder="0" aria-label="Magic Point Cost" v-model="spell.mpCost"  aria-describedby="basic-addon1">
                  </div>
                  <div class="mb-3 col" v-if="settings.gameSystem === 'blue rose'">
                      <span class="age-input-label" id="basic-addon1">Fatigue</span>
                      <input type="text" class="form-control" aria-label="Fatigue" :id="`damage-${spell._id}`"
                      v-model="spell.damageMiss"  aria-describedby="basic-addon1">
                  </div>
            </div>
            <div class="row">
              
                      
              <!-- <div class="mb-3 col">
                          <span class="age-input-label" id="basic-addon1">Expandable</span>
                          <input type="checkbox" class="form-control" placeholder="Name" aria-label="Character Name" v-model="spell.expandable"  aria-describedby="basic-addon1">
                      </div> -->
                  <div class="mb-3 col">
                      <span class="age-input-label" id="basic-addon1">Casting Time</span>
                          <select
                          class="age-atk-select form-select"
                              data-testid="test-spell-weaponType-input"
                              v-model="spell.castingTime"
                          >
                              <option value="Minor">Minor Action</option>
                              <option value="Major">Major Action</option>
                          </select>
                  </div>
                  <div class="mb-3 col" v-if="settings.gameSystem !== 'blue rose'">
                      <span class="age-input-label" id="basic-addon1">Test</span>
                      <input type="text" class="form-control" placeholder="ex. Strength(Might)" aria-label="Spell Test" v-model="spell.spellTest"  aria-describedby="basic-addon1">
                  </div>
                  <div class="mb-3 col" v-if="settings.gameSystem === 'blue rose'">
                      <span class="age-input-label" id="basic-addon1">Test</span>
                      <select
                        class="age-atk-select form-select"
                          data-testid="test-spell-weaponType-input"
                          v-model="spell.ability"
                          @change="onAbilityChange()">
                        <option v-for="abl in abilities" :key="abl" :value="abl">{{ abl }}</option>
                      </select>
                      </div>
                  <div class="mb-3 col align-content-end" v-if="settings.gameSystem === 'blue rose'">
                      <span class="age-input-label" id="basic-addon1"></span>
                        <select class="age-atk-select form-select"
                                data-testid="test-spell-weaponType-input"
                                v-model="spell.abilityFocus">
                          <option v-for="mt in magicTypes" :key="mt" :value="mt">{{ mt }}</option>

                          <!-- <option v-for="foci in filteredFocuses[spell.ability]" :key="foci" :value="foci">{{ foci }}</option> -->
                          <!-- <option value="custom">Custom</option> -->
                        </select>
                      </div>
                      <!-- <select class="age-atk-select form-select" name="Spell Test" id="spellTest">
                        <optgroup v-for="(options, group) in bluerose"
                                  :key="group"
                                  :label="group">
                          <option v-for="option in options"
                                  :key="option"
                                  :value="option">
                            {{ option }}
                          </option>
                        </optgroup>
                      </select>
                      <div class="custom-select-wrapper" style="position: relative;"> -->
    <!-- Overlayed display when selected -->

                      <!-- <div
                         class="age-atk-select form-select" 
                        v-if="selected"
                        style="position: absolute; top: 2px; left: 1px; width:99%; border:transparent; padding: 4px; pointer-events: none; background: white;z-index: 2;"
                      >
                         {{ selected }}
                      </div> -->
                        <!-- Actual select dropdown -->
                        <!-- <select class="age-atk-select form-select" v-model="selected" style="position: relative; background: transparent;"
                        @change="setBRSpellTest(selected)">
                          <option disabled value="">Select an option</option>
                          <optgroup
                            v-for="(options, group) in bluerose"
                            :key="group"
                            :label="group"
                          >
                            <option
                              v-for="option in options"
                              :key="option"
                              :value="`${group} (${option})`"
                            >
                            {{ option }}
                            </option>
                          </optgroup>
                        </select> -->
                      <!-- </div> -->
                      <!-- <select class="age-atk-select form-select" name="Spell Test" id="spellTest">
                        <optgroup v-for="(options, group) in bluerose"
                                  :key="group"
                                  :label="group">
                          <option v-for="option in options"
                                  :key="option"
                                  :value="option">
                            {{ option }}
                          </option>
                        </optgroup>
                      </select> -->
                  <!-- </div> -->
                  <div class="mb-3 col" v-if="settings.gameSystem === 'blue rose'">
                      <span class="age-input-label" id="basic-addon1">Resistance</span>
                      <input type="text" class="form-control" placeholder="ex. Willpower(Self-Discipline)" aria-label="Spell Resistance" v-model="spell.spellTest"  aria-describedby="basic-addon1">
                  </div>
                  <div class="mb-3 col"  v-if="spell.weaponType === 'ranged' || spell.weaponType === 'melee'">
                      <span class="age-input-label" id="basic-addon1">Weapon Group</span>
                          <select
                          class="age-atk-select form-select"
                              data-testid="test-spell-weaponGroup-input"
                              :id="`weaponGroup-${spell._id}`"
                              v-model="spell.weaponGroup"
                              @change="setWeaponGroupAbility"
                          >
                              <option value="axes">Axes</option>
                              <option value="black powder">Black Powder</option>
                              <option value="bludgeons">Bludgeons</option>
                              <option value="bows">Bows</option>
                              <option value="brawling">Brawling</option>
                              <option value="dueling">Dueling</option>
                              <option value="heavy blades">Heavy Blades</option>
                              <option value="lances">Lances</option>
                              <option value="light blades">Light Blades</option>
                              <option value="polearms">Polearms</option>
                              <option value="slings">Slings</option>
                              <option value="staves">Staves</option>
                          </select>
                  </div>
                  <div class="mb-3 col" v-if="spell.spellType === 'Attack'">
                      <span class="age-input-label" id="basic-addon1">Damage (Success)</span>
                      <input type="text" class="form-control" placeholder="ex. 1d6" aria-label="Damage (Success)" :id="`damage-${spell._id}`"
                      v-model="spell.damageHit"  aria-describedby="basic-addon1">
                  </div>
                  <div class="mb-3 col" v-if="spell.spellType === 'Attack'">
                      <span class="age-input-label" id="basic-addon1">Damage (Failure)</span>
                      <input type="text" class="form-control" placeholder="ex. 1d6" aria-label="Damage (Failure)" :id="`damage-${spell._id}`"
                      v-model="spell.damageMiss"  aria-describedby="basic-addon1">
                  </div>                  
                  <div v-if="spell.weaponType === 'ranged'">
                      <div class="mb-3 col">
                          <span class="age-input-label" id="basic-addon1">Short Range</span>
                          <input type="text" class="form-control" placeholder="Name" aria-label="Character Name" v-model="spell.shortRange"  aria-describedby="basic-addon1">
                      </div>
                      <div class="mb-3 col">
                          <span class="age-input-label" id="basic-addon1">Long Range</span>
                          <input type="text" class="form-control" placeholder="Name" aria-label="Character Name" v-model="spell.shortRange"  aria-describedby="basic-addon1">
                      </div>
                      <div class="mb-3 col">
                      <span class="age-input-label" id="basic-addon1">Reload</span>
                          <select
                          class="age-atk-select form-select"
                              data-testid="test-spell-weaponType-input"
                              :id="`weaponType-${spell._id}`"
                              v-model="spell.reload"
                          >
                              <option value="minor">Minor Action</option>
                              <option value="ranged">Major Action</option>
                          </select>
                  </div>
                  </div>
                  <div v-if="spell.weaponType === 'spell ranged'">
                      <div class="mb-3 col">
                          <span class="age-input-label" id="basic-addon1">Range</span>
                          <input type="text" class="form-control" placeholder="0" aria-label="Character Name" v-model="spell.longRange"  aria-describedby="basic-addon1">
                      </div>
                  </div>
            </div>

          </div>

          <div class="row">  
                <div class="mb-3 col">
                  <span class="age-input-label" style="min-width: 100px;">Description</span>
                  <div>
                    <div class="age-bio-quill">
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
                      scrollingContainer: true}" v-model:content="spell.description" />
                    </div>
                    </div>
                </div>
                </div>
            </div>
        
            <div class="modal-footer-actions" v-if="mode === 'create'">
          <slot name="footer">
              <button 
                class="confirm-btn"
                @click="spellStore.addSpell(spell);$emit('close')"
              >
                Create
              </button>
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
                <button class="delete-icon-btn delete" title="Delete" @click="$emit('close');$emit('delete')" v-tippy="{ 'content': 'Delete Spell'}">
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
import { useSpellStore } from '@/sheet/stores/magic/magicStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { brArcana, fageArcana, magePowers } from './magicTypes';
import { computed, ref } from 'vue';
import { bluerose, cthulhu, fage1e, fage2e, mage } from '../modifiers/focuses';

const props = defineProps({
  show: Boolean,
  spell: { type: Object },
  mode: String,
  magicLabel:String
})

const settings = useSettingsStore();
const magicTypes = ref();
switch(settings.gameSystem){
  case 'fage2e':
    magicTypes.value = fageArcana;
  break;
  case 'mage':
    magicTypes.value = magePowers;
  break;
  case 'blue rose':
    magicTypes.value = brArcana
  break;
}
const selected = ref(props.spell.ability ? `${props.spell.ability} (${props.spell.abilityFocus})` : '');
const abilityFocuses = ref(bluerose)
const spellStore = useSpellStore();
const abilities = ['Accuracy', 'Communication','Constitution','Dexterity','Fighting','Intelligence','Perception','Strength','Willpower'];
const filteredFocuses = ref(fage2e)
const arcanaFocuses = ref([]);
switch(useSettingsStore().gameSystem){
  case 'fage2e':
    filteredFocuses.value = fage2e;
    arcanaFocuses.value = fageArcana;
  break;
  case 'mage':
    filteredFocuses.value = mage;
    arcanaFocuses.value = magePowers;

  break;
  case 'fage1e':
    filteredFocuses.value = fage1e;
  break;
  case 'blue rose':
    filteredFocuses.value = bluerose;
    arcanaFocuses.value = brArcana;
  break;
  case 'cthulhu':
    filteredFocuses.value = cthulhu;
  break;
}
const setArcanaAbility = () => {
  switch(props.spell.arcanaType){
    // WILLPOWER For Psychic
    case('Apportation'):
    case('Astral'):
    case('Cryokinesis'):
    case('Cyberkinesis'):
    case('Dreaming'):
    case('Electrokinesis'):
    case('Empathy'):
    case('Exrtasensory Perception'):
    case('Nature Empathy'):
    case('Photokinesis'):
    case('Psychic Drain'):
    case('Psychic Projection'):    
    case('Pyrokinesis'):
    case('Serendipity'):
    case('Shielding'):
    case('Somatic'):
    case('Telekinesis'):
    case('Telepathy'):
      props.spell.ability = 'Willpower';
    break;
    default:
      props.spell.ability = 'Intelligence';
    break;
  }
}
const setBRSpellTest = (selectedOption) => {
  const [group, option] = selected.value.split('(')
  props.spell.ability = group.trim();
  props.spell.abilityFocus = option.slice(0, -1);
}
const selectedOptionDisplay = computed(() => {
  if (!selected.value) return ''
  const [group, option] = selected.value.split('|')
  return `${group} (${option})`
})
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
.age-atk-select {
    height: auto;
}
</style>