<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal">
          <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

            </div>

            <div class="modal-body">
              <div class="row">
                <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Name</span>
                    <input type="text" class="form-control" aria-label="Character Name" v-model="attack.name"  aria-describedby="basic-addon1">
                </div>
                <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Type</span>
                        <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponType-input"
                            :id="`weaponType-${attack._id}`"
                            v-model="attack.weaponType"
                        >
                        <option v-for="wt in weaponTypes" :key="wt" :value="wt">{{ wt }}</option>
                        </select>
                </div>
              </div>
             
              <div class="row">
                
                <div class="mb-3 col"  v-if="attack.weaponType === 'Ranged' || attack.weaponType === 'Melee'">
                    <span class="age-input-label" id="basic-addon1">Weapon Group</span>
                        <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponGroup-input"
                            :id="`weaponGroup-${attack._id}`"
                            v-model="attack.weaponGroup"
                            @change="setWeaponGroupAbility"
                        >
                            <option v-for="wg in weaponGroups" :key="wg" :value="wg">{{ wg }}</option>
                        </select>
                </div>
                <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Damage</span>
                    <input type="text" class="form-control" aria-label="Character Name" :id="`damage-${attack._id}`"
                    v-model="attack.damage"  aria-describedby="basic-addon1">
                </div>
              </div>
              <div class="row" v-if="attack.weaponType === 'Ranged'">
                    <div class="mb-3 col">
                        <span class="age-input-label" id="basic-addon1">Short Range</span>
                        <input type="text" class="form-control" aria-label="Character Name" v-model="attack.shortRange"  aria-describedby="basic-addon1">
                    </div>
                    <div class="mb-3 col">
                        <span class="age-input-label" id="basic-addon1">Long Range</span>
                        <input type="text" class="form-control" aria-label="Character Name" v-model="attack.longRange"  aria-describedby="basic-addon1">
                    </div>
                    <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Reload</span>
                        <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponType-input"
                            :id="`weaponType-${attack._id}`"
                            v-model="attack.reload"
                        >
                            <option value="Minor">Minor Action</option>
                            <option value="Major">Major Action</option>
                        </select>
                </div>
                </div>
                <div class="row" v-if="attack.weaponType === 'Spell Ranged'">
                    <div class="mb-3 col">
                        <span class="age-input-label" id="basic-addon1">Range</span>
                        <input type="text" class="form-control" placeholder="0" aria-label="Character Name" v-model="attack.longRange"  aria-describedby="basic-addon1">
                    </div>
                </div>
                <div class="row">
                 <div class="col" style="min-height: 100px;padding-bottom: 20px;">
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
                      scrollingContainer: true}" v-model:content="attack.description" />
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
            <div class="delete-container">
              <button class="delete-icon-btn delete" title="Delete" @click="$emit('close');$emit('delete')" v-tippy="{ 'content': 'Delete Attack'}">
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
import { ref } from 'vue';
import { fage2eWG, mageWG } from './weaponGroups';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore'

const props = defineProps({
  show: Boolean,
  attack: { type: Object },
})
const settings = useSettingsStore();

const weaponGroups = ref(fage2eWG);
switch(settings.gameSystem){
  case 'mage':
    weaponGroups.value = mageWG;
  break;
  default:
    weaponGroups.value = fage2eWG;
  break;
};
const setWeaponGroupAbility = () => {
    switch(props.item.weaponGroup){
      // ACCURACY
      case('Black Powder'):
      case('Bows'):
      case('Brawling'):
      case('Dueling'):
      case('Light Blades'):
      case('Slings'):
      case('Staves'):
        props.item.weaponGroupAbility = 'Accuracy';
      break;
      // FIGHTING
      case('Axes'):
      case('Bludgeons'):
      case('Heavy Blades'):
      case('Lances'):
      case('Polearms'):
      case('Spears'):
        props.item.weaponGroupAbility = 'Fighting';
      break;
      default:
        props.item.weaponGroupAbility = ''
      break;
    }
  }
const weaponTypes = ['Melee','Natural','Ranged','Spell Melee','Spell Ranged']

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