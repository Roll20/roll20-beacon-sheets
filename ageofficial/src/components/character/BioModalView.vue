<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal">
            <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

            </div>
      <div class="modal-body">
        <div class="row" style="margin:0">
          <div class="mb-3 col" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Level</span>
          <div>
            <input type="number" class="form-control" aria-label="Character Name" v-model="charLevel"  aria-describedby="basic-addon1" @change="levelChange">
          </div>
        </div>
        <div class="mb-3 col-10" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Name</span>
          <div>
                   <input type="text" class="form-control" aria-label="Character Name" v-model="meta.name"  aria-describedby="basic-addon1">
   
          </div>
        </div>
        </div>
        
        <div class="input-group mb-3" v-if="isGM" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Type</span>
          <div>
            <select  id="bio.profession" v-model="bio.type" class="age-atk-select form-select">
            <option value="AniMon">Animal or Monster</option>
            <option value="Character">Character</option>
          </select>
          </div>          
          </div>
        <div class="input-group mb-3" v-if="bio.type === 'Character' && (settings.gameSystem !== 'mage' && settings.gameSystem !== 'expanse')" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Class</span>
          <div>
            <select  id="bio.profession" v-model="bio.profession" class="age-atk-select form-select" @change="classChange">
            <option v-for="ageClass in classes" :key="ageClass" :value="ageClass.profession">{{ageClass.profession}}</option>
          </select>
          </div>          
        </div>
        <div class="input-group mb-3" style="flex-direction: column;padding: 0 2px;" v-if="settings.gameSystem !== 'expanse'">
          <span id="basic-addon1" class="age-input-label">Ancestry</span>
          <div>
            <input type="text" class="form-control" aria-label="Ancestry" v-model="bio.ancestry"  aria-describedby="basic-addon1">
          </div>
        </div>
        <div class="input-group mb-3" v-if="settings.gameSystem === 'expanse'" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Origin</span>
          <div>
            <select  id="bio.profession" v-model="char.originFaction" class="age-atk-select form-select" @change="classChange">
              <option value="">None</option>
              <option v-for="expanseOrigin in expanseFactions" :key="expanseOrigin" :value="expanseOrigin.value">{{expanseOrigin.label}}</option>
          </select>
          </div>          
        </div>
        <div class="row" style="margin:0">
          <div class="mb-3 col" v-if="bio.type === 'Character'" style="flex-direction: column;padding: 0 2px;">
            <span id="basic-addon1" class="age-input-label">Social Class</span>
            <div>
              <input type="text" class="form-control" aria-label="Social Class" v-model="bio.socialClass"  aria-describedby="basic-addon1">
            </div>
          </div>
          <div class="mb-3 col" v-if="bio.type === 'Character'" style="flex-direction: column;padding: 0 2px;">
            <span id="basic-addon1" class="age-input-label">Background</span>
            <div>
              <input type="text" class="form-control" aria-label="Background" v-model="bio.background"  aria-describedby="basic-addon1">
            </div>
          </div>
        </div>
        <div class="row" style="margin:0" v-if="settings.gameSystem === 'mage' || settings.gameSystem === 'expanse'">
          <div class="mb-3 col" v-if="bio.type === 'Character'" style="flex-direction: column;padding: 0 2px;">
            <span id="basic-addon1" class="age-input-label">Drive</span>
            <div>
              <input type="text" class="form-control" aria-label="Drive" v-model="bio.drive"  aria-describedby="basic-addon1">
            </div>
          </div>
          <div class="mb-3 col" v-if="bio.type === 'Character'" style="flex-direction: column;padding: 0 2px;">
            <span id="basic-addon1" class="age-input-label">Profession</span>
            <div>
              <input type="text" class="form-control" aria-label="Profession" v-model="bio.profession"  aria-describedby="basic-addon1">
            </div>
          </div>
        </div>
        <div class="input-group mb-3" v-if="bio.type === 'AniMon'" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Also Known As</span>
          <div>
            <input type="text" class="form-control" aria-label="Character Name" v-model="bio.aliases"  aria-describedby="basic-addon1">
          </div>
        </div>
        <div class="input-group mb-3" v-if="bio.type === 'AniMon'" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Threat Level</span>
          <div>
            <select  id="bio.profession" v-model="bio.threat" class="age-atk-select form-select" @change="classChange">
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Major">Major</option>
          </select>
          </div>
          
        </div>
        <div class="row" style="margin:0">
          <div class="mb-3 col" style="flex-direction: column;padding: 0 2px;">
            <span id="basic-addon1" class="age-input-label" v-if="!settings.useFortune">Max Health</span>
            <span id="basic-addon1" class="age-input-label" v-if="settings.useFortune">Max Fortune</span>
            <div>
              <input type="number" class="form-control" aria-label="Character Name" v-model="char.healthMax"  aria-describedby="basic-addon1">

          </div>
        </div>
        <div class="mb-3 col"  v-if="settings.showArcana && !settings.userPowerFatigue" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Max {{settings.gameSystem === 'mage' ? 'Power' : 'Magic'}} Points</span>
          <div>
            <input type="number" class="form-control" aria-label="Character Name" v-model="char.magicMax"  aria-describedby="basic-addon1">
          </div>
        </div>
        <div class="mb-3 col" style="flex-direction: column;padding: 0 2px;">
          <span id="basic-addon1" class="age-input-label">Base Speed</span>
          <div>
            <input type="number" class="form-control" aria-label="Speed" v-model="char.speed"  aria-describedby="basic-addon1">
          </div>
        </div>
          
        </div>
      </div>
      <div class="modal-footer-actions">
          <slot name="footer">
            <button
              class="confirm-btn"
              @click="$emit('close')"
            >OK</button>
          </slot>
        </div>
    </div>
    </div>
    </Transition>
    
</template>
<script setup>
import { computed, ref } from 'vue';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useAttackStore } from '@/sheet/stores/attack/attackStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { blueroseClasses, fage1eClasses, fage2eClasses } from './classes';
const props = defineProps({
  show: Boolean
})
const meta = useMetaStore();
const bio = useBioStore();
const char = useCharacterStore();
const settings = useSettingsStore();
const isGM = computed(() => meta.permissions.isGM);
const classes = ref();
switch(settings.gameSystem){
  case 'fage2e':
    classes.value = fage2eClasses;
  break;
  case 'fage1e':
    classes.value = fage1eClasses;
  break;
  case 'blue rose':
    classes.value = blueroseClasses;
  break;
}
const expanseFactions = ref([
  {label: 'Earther', value:'earth'},
  {label: 'Belter', value:'belters'},
  {label: 'Martian', value:'mars'},
  {label: 'Transport Union', value:'transportUnion'},
  // {label: 'Outer', value:'outers'}
]);
const charLevel = ref(1)
charLevel.value = char.level;
const attack = useAttackStore();
const classChange = () => {
  // if(bio.profession === 'Mage'){
  //   attack.mageAttack()
  // } else {
  //   const blast = attack.attacks.find(atk => atk.name === 'Arcane Blast')
  //   const blastId = blast._id;
  //   attack.removeAttack(blastId);
  // }
}
const levelChange = () => {
  char.levelSet(charLevel.value);
}
</script>