<template>
    <Transition name="modal">
      <div v-if="show" class="modal-mask">
          <div class="modal-container age-modal" style="width: 70%;">
            <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

            </div>
  
              <div class="modal-body" style="padding: 0 0 10px;">                
                    <div class="accordion" id="accordionExample" style="width: 100%;">
                    <div class="accordion-item" v-for="(condition, i) in coreConditions" :key="condition">
                        <div class="accordion-header" style="display:grid;grid-template-columns: 1fr 40px 1fr 40px 40px;">
                            <div class="" style="font-size: 1rem; padding:1rem;">
                                {{ condition.name }}
                            </div>
                            
                              <button type="button" class="age-icon-btn" @click="showCondition(condition,i);condition.show = !condition.show">
                                <span v-if="condition.show">
                                  <font-awesome-icon :icon="['fa', 'eye']" />                              

                                </span>
                                <span v-if="!condition.show">
                                  <font-awesome-icon :icon="['fa', 'eye-slash']" />                              

                                </span>
                            </button>
                            
                            <label class="age-checkbox-toggle" style="margin:1rem;">
                                <input type="checkbox"  v-model="condition.enabled" @change="toggleCondition(condition, i)" />
                                <span class="slider round" ></span>
                            </label>
                            
                              <div></div>
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#conditionCollapse' + i"  aria-expanded="true" aria-controls="collapseOne"></button>
                        </div>
                        <div :id="'conditionCollapse'+ i" class="accordion-collapse collapsed collapse" data-bs-parent="#accordionExample">
                        <div class="accordion-body" v-html="condition.description"></div>
                        <!-- {{ condition.modifiers }} -->

                        </div>
                    </div>                    
                </div>
                <div class="accordion" id="accordionExample" >
                    <div class="accordion-item" v-for="(condition, i) in customStore.customConditions" :key="condition">
                        <div class="accordion-header" style="display:grid;grid-template-columns: 1fr 40px 1fr 40px 40px;">
                            <div class="" style="font-size: 1rem; padding:1rem;">
                                {{ condition.name }}
                            </div>
                            <button type="button" class="age-icon-btn" @click="customStore.showCondition(condition._id)">
                                <span v-if="condition.show">
                                  <font-awesome-icon :icon="['fa', 'eye']" />                              

                                </span>
                                <span v-if="!condition.show">
                                  <font-awesome-icon :icon="['fa', 'eye-slash']" />                              

                                </span>
                            </button>
                            <label class="age-checkbox-toggle" style="margin:1rem;">
                                <input type="checkbox"  v-model="condition.enabled" @change="toggleCustomCondition(condition, i)"/>
                                <span class="slider round" ></span>
                            </label>
                            <button type="button" class="age-icon-btn" data-bs-toggle="collapse" :data-bs-target="'#conditionEditCollapse' + i"  aria-expanded="true" aria-controls="collapseOne">
                              <font-awesome-icon :icon="['fa', 'pen']" />                              
                            </button>
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#conditionCollapse' + i"  aria-expanded="true" aria-controls="collapseOne"></button>
                        </div>
                        <div :id="'conditionEditCollapse'+ i" class="accordion-collapse collapsed collapse" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                          <div class="input-group mb-3">
                            <span class="input-group-text" id="basic-addon1">Condition Name</span>
                            <input type="text" class="form-control" placeholder="0" aria-label="Character Name" v-model="condition.name"  aria-describedby="basic-addon1">
                          </div>
                          <div class="input-group" style="display: grid;grid-template-columns: 1fr 2fr;">
                              <span class="input-group-text">Description</span>
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
                                scrollingContainer: true}" v-model:content="condition.description" />
                          </div>
                          <div class="age-quality-modifiers">

               <h3 style="display: flex;">
                  <span>Modifiers</span>                  
                  <button class="link-btn" @click="mods.addModifier({_id:condition._id,enabled:condition.enabled,type:'Condition'})" 
                    style="background: none; font-weight: bold;border:none; font-size: 14px;" v-tippy="{ content: 'Add Modifier' }">
                    <font-awesome-icon :icon="['fa', 'plus']" />                  
                  </button>
                </h3>
                  <div class="mb-2" v-for="(mod,index) in mods.parentItems(condition._id)" :key="index" style="display:flex;gap:10px;">
                  <BaseModView :mod="mod" :modOptions="['Ability', 'Damage', 'Defense', 'Speed']" />
                </div>
                
                <!-- <div v-for="(mod,index) in condition.modifiers" :key="mod" style="display:flex;gap:10px;">
                  <div>
                    <select
                      class="age-atk-select form-select"
                        data-testid="test-spell-weaponType-input"
                        :id="`weaponType-${condition._id}`"
                        v-model="mod.modifiedType"
                    >
                      <option value="Ability">Ability</option>
                      <option value="Defense">Defense</option>
                      <option value="Speed">Speed</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </div>
                  <div v-if="mod.modifiedType === 'Ability'">
                    <AbilityModView :mod="mod" />
                  </div>
                  <div v-else-if="mod.modifiedType === 'Spell'">
                    <SpellModView :mod="mod" />
                  </div>
                  <div v-if="mod.option === 'Ability'">
                    <AbilityModView :mod="mod" />
                  </div>
                  <div v-if="mod.option === 'Ability Penaltyy'">
                    <AbilityModView :mod="mod" :type="'penalty'" />
                  </div>
                  <div v-else>
                    <select class="age-atk-select form-select"
                        data-testid="test-spell-weaponType-input"
                        v-model="mod.modifiedOption"
                      > 
                        <option value="Bonus">Bonus</option>
                        <option value="Penalty">Penalty</option>
                        <option value="Roll">Roll</option>
                      </select>
                      
                    <input type="number"  class="form-control" placeholder="0"  v-model="mod.variable" v-if="mod.option && mod.option !== 'Damage'" />
                  </div>
                  <div v-if="mod.modifiedType === 'Damage' || mod.modifiedType === 'Defense'">
                    <div v-if="mod.modifiedOption === 'Bonus'">
                        <input type="number"  class="form-control" placeholder="0" min="0" v-model="mod.bonus" />
                      </div>
                      <div v-if="mod.modifiedOption === 'Penalty'">
                        <input type="number"  class="form-control" placeholder="0" max="0"  v-model="mod.penalty" />
                      </div>
                      <input type="text"  class="form-control" placeholder="1d6"  v-model="mod.roll" v-if="mod.modifiedOption === 'Roll'" />
                  </div>
                  <div>
                    <input type="text"  class="form-control" placeholder="1d6"  v-model="mod.roll" v-if="mod.option === 'Damage'" />
                  </div>
                  
                  <button class="link-btn" @click="customStore.removeModifier(condition._id,index)" 
                  style="background: none; font-weight: bold;border:none;" v-tippy="{ content: 'Remove Modifier' }">
                  <font-awesome-icon :icon="['fa', 'minus']" />
                </button>
                </div> -->

              </div>
                          <button class="delete-btn delete" title="Delete" @click="customStore.removeCondition(condition._id)">
                              ✕ Delete Condition
                          </button>
                        </div>
                          

                        </div>
                        <div :id="'conditionCollapse'+ i" class="accordion-collapse collapsed collapse" data-bs-parent="#accordionExample">
                        <div class="accordion-body" v-html="condition.description"></div>
                        {{ condition.modifiers }}
                        </div>
                    </div>                    
                </div>
              </div>
          
  
          <div class="modal-footer-actions">
            <slot name="footer">              
              <button
                class="confirm-btn"
                @click="$emit('close')"
              >
                OK
              </button>
              <button class="btn" @click="customStore.addCondition()">Add custom</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
</template>
<script setup>
import { useConditionsStore } from '@/sheet/stores/conditions/conditionsStore';
import { useCustomConditionsStore } from '@/sheet/stores/conditions/customConditionsStore';
import AbilityModView from '@/components/modifiers/AbilityModView.vue';
import {useModifiersStore} from '@/sheet/stores/modifiers/modifiersStore'
import BaseModView from '@/components/modifiers/BaseModView.vue';
const props = defineProps({
  show: Boolean,
})
import { basicConditions } from './basicConditions';
import { ref } from 'vue';

const coreConditions = ref(basicConditions)
const conditionsStore = useConditionsStore();
const customStore = useCustomConditionsStore();
const mods = useModifiersStore();

const loadConditions = () => {
    if(conditionsStore.conditions.length > 0){
        conditionsStore.conditions.forEach((condition)=>{
            const i = basicConditions.findIndex(bc => bc.name === condition.name)
            if(i >= 0){
                basicConditions[i].enabled = true;
                Object.assign(basicConditions[i],{
                    _id:condition._id
                })
            }
        })
    }
}
loadConditions()
const toggleCondition = (selectedCondition,i) => {
    const conditionsStore = useConditionsStore();
    if(selectedCondition.enabled){
        const addedCondition = conditionsStore.addCondition(selectedCondition);
        Object.assign(basicConditions[i],{
            _id:addedCondition._id
        })
    } else {
        conditionsStore.removeCondition(selectedCondition._id)
    }
}
const toggleCustomCondition = (selectedCondition,i) => {
  mods.toggleMod(selectedCondition._id,selectedCondition.enabled);
  if(selectedCondition.enabled)selectedCondition.show = selectedCondition.enabled;
  
}
const showCondition = (selectedCondition,i) => {
    const conditionsStore = useConditionsStore();
    if(!selectedCondition.show){
        const addedCondition = conditionsStore.addCondition(selectedCondition);
        Object.assign(basicConditions[i],{
            _id:addedCondition._id
        })
    } else {
        conditionsStore.removeCondition(selectedCondition._id)
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
  .age-atk-select {
      height: auto;
  }
  </style>