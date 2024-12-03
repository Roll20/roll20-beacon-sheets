<template>
    <Transition name="modal">
      <div v-if="show" class="modal-mask">
          <div class="modal-container age-modal">
            <div class="age-modal-header">
              <slot name="header">default header</slot>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
  
              </div>
  
                <div class="modal-body age-wg-list">
                  <div v-for="(wg, index) in weaponGroups" :key="index" class="age-wg-item">
                    <input type="checkbox"
                    :value="wg" 
      :checked="wgs.includes(wg)" 
      @change="handleCheckboxChange(wg)" />
                    <span>{{ wg }}</span>
                  </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup>
import { computed, ref } from 'vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import {blueRoseWG, cthulhuWG, fage1eWG, fage2eWG, mageWG } from '@/components/attack/weaponGroups';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

const props = defineProps({
  show:Boolean,
})
const char = useCharacterStore();
const weaponGroups = ref(fage2eWG);
const wgs = ref(char.weaponGroups ? JSON.parse(char.weaponGroups) : [])

function handleCheckboxChange(wg) {  
  if(wgs.value.includes(wg)){
    wgs.value = wgs.value.filter(item => item !== wg);
  } else {
    wgs.value.push(wg)
  }
  char.weaponGroups = JSON.stringify(wgs.value);
}

switch(useSettingsStore().gameSystem){
  case 'fage2e':
    weaponGroups.value = fage2eWG;
  break;
  case 'mage':
    weaponGroups.value = mageWG;
  break;
  case 'fage1e':
    weaponGroups.value = fage1eWG;
  break;
  case 'bluerose':
    weaponGroups.value = blueRoseWG;
  break;
  case 'cthulhu':
    weaponGroups.value = cthulhuWG;
  break;
}
</script>