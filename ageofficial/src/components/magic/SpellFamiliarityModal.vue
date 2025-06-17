<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal age-familiarity-modal">
          <div class="age-modal-header">
              <slot name="header">default header</slot>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
            </div>
        <div class="modal-body">
            <div class="age-spell-familiarity-modal">
        <div class="age-spell-familiarity-header">
            <select class="age-atk-select form-select"
                    data-testid="test-spell-weaponGroup-input"
                    v-model="familiarity">
            <option v-for="op in familiarityOptions" :key="op.value" :value="op.value">{{op.label}}</option>
            </select>
        </div>
      
        
      </div>
        </div>          
        <div class="modal-footer-actions">
          <slot name="footer">
              <button 
                class="confirm-btn"
                @click="handlePrint();$emit('close')"
              >
                OK
              </button>   
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
import { ref } from 'vue';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore'

const props = defineProps({
  show: Boolean,
  spell: { type: Object },
  mode: String,
  magicLabel:String
})
const familiarity = ref(0);
const familiarityOptions = ref([
  { value: 0, label: 'Present (+0)' },
  { value: 2, label: 'Very Familiar (+2)' },
  { value: 4, label: 'Familiar (+4)' },
  { value: 6, label: 'Somewhat Familiar (+6)' },
  { value: 8, label: 'Casually Familiar (+8)' },
  { value: 10, label: 'Slightly Familiar (+10)' }
]);
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
let toAttackRoll = 0

const setAttackRoll = () => {
  if(useAbilityScoreStore().abilityScores[props.spell.ability]){
    toAttackRoll = useAbilityScoreStore().abilityScores[props.spell.ability].base;
  }
}
setAttackRoll();

const handlePrint = () => {
    const spellStore = useSpellStore();
    spellStore.printSpell(props.spell._id,toAttackRoll, familiarity.value);
    familiarity.value = 0; // Reset familiarity after printing
};
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