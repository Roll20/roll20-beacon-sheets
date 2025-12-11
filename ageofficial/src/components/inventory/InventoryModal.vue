<template>
    <Transition name="modal">
      <div v-if="show" class="modal-mask">
          <div class="modal-container age-modal">
            <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

            </div>
            
            <div class="modal-body" style="display: flex;max-width: fit-content;">
              <div style="flex:1;min-width: 300px;">
                <div class="row" style="margin:0">
                  <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Item Name</span>
                    <div>
                      <input type="text" class="form-control" aria-label="Item Name" v-model="item.name"  aria-describedby="basic-addon1">
                    </div>
                  </div>
                </div>
                <div class="row" style="margin:0">
                  <div class="mb-3 col">
                      <span class="age-input-label" id="basic-addon1">Type</span>
                      <div>
                        <select
                           class="age-atk-select form-select"
                              data-testid="test-inventory-weaponType-input"
                              :id="`item-${item._id}`"
                              v-model="item.type"
                              @change="setConfigurability"
                          >
                            <option value="armor">Armor</option>
                            <option value="consumable">Consumable</option>
                            <option value="item">Item</option>
                            <option value="shield">Shield</option>
                            <option value="weapon">Weapon</option>
                          </select>
                      </div>
                          
                  </div>
                  <div class="mb-3 col-4">
                    <span class="age-input-label" id="basic-addon1">Quantity</span>
                    <div>
                      <input type="number" class="form-control" aria-label="Quantity" v-model="item.quantity"  aria-describedby="basic-addon1">
                    </div>
                  </div>
                </div>
                <div class="row" style="margin:0">
                  <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Cost</span>
                    <div>
                      <input type="text" class="form-control" aria-label="Quantity" v-model="item.cost"  aria-describedby="basic-addon1">
                    </div>
                  </div>
                </div>
                <div class="row" style="margin:0" v-if="isArmor || isShield">

                  <div class="mb-3 col" v-if="isArmor">
                    <span class="age-input-label" id="basic-addon1">Armor Rating</span>
                    <div>
                    <input type="number" class="form-control" aria-label="Armor Rating" v-model="item.defenseMod"  aria-describedby="basic-addon1">

                    </div>
                    </div>
                  <div class="mb-3 col" v-if="isArmor">

                    <span class="age-input-label" id="basic-addon1">Armor Penalty</span>
                    <div>
                    <input type="number" class="form-control" aria-label="Armor Penalty" v-model="item.armorPenalty"  aria-describedby="basic-addon1">
                    </div>

                  </div>
                  <div class="mb-3 col" v-if="isArmor && settings.showArcana">
                    <span class="age-input-label" id="basic-addon1">Strain</span>
                    <div>
                    <input type="number" class="form-control" aria-label="Strain" v-model="item.strain"  aria-describedby="basic-addon1">
                    </div>
                  </div>
                  <div class="mb-3 col" v-if="isShield">
                    <span class="age-input-label" id="basic-addon1">Shield Bonus</span>
                    <div>
                      <input type="number" class="form-control" aria-label="Shield Bonus" v-model="item.defenseMod"  aria-describedby="basic-addon1">

                    </div>
                  </div>
                </div>
                <div class="row" style="margin:0">
                    <span class="age-input-label" style="min-width: 100px;">Description</span>
                    <div>
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
                      scrollingContainer: true}" v-model:content="item.description" />

                    </div>
                     </div>
              </div>
              <div v-if="item.type === 'weapon'" style="flex:1;min-width: 300px;">
                <div class="row" style="margin:0">

                <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Type</span>
                        <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponType-input"
                           v-model="item.weaponType"
                            
                        >
                          <option v-for="wt in weaponTypes" :key="wt" :value="wt">{{ wt }}</option>
                        </select>
                </div>
                </div>
                <div class="row" style="margin:0">

                  <div class="mb-3 col" v-if="settings.gameSystem === 'fage2e' || settings.gameSystem === 'blue rose'" >
                    <span class="age-input-label" id="basic-addon1">Weapon Group</span>
                      <select
                        class="age-atk-select form-select"
                          data-testid="test-attack-weaponGroup-input"
                          v-model="item.weaponGroup"  
                          @change="setWeaponGroupAbility">
                          <option v-for="wg in weaponGroups" :key="wg" :value="wg">{{ wg }}</option>
                      </select>
                  </div>
                  <div class="mb-3 col" v-else>
                    <span class="age-input-label" id="basic-addon1">Weapon Ability</span>
                      <select
                        class="age-atk-select form-select"
                          data-testid="test-attack-weaponGroup-input"
                          v-model="item.weaponGroupAbility">
                          <option value="Accuracy">Accuracy</option>
                          <option value="Communication">Communication</option>
                          <option value="Constitution">Constitution</option>
                          <option value="Dexterity">Dexterity</option>
                          <option value="Fighting">Fighting</option>
                          <option value="Intelligence">Intelligence</option>
                          <option value="Perception">Perception</option>
                          <option value="Strength">Strength</option>
                          <option value="Willpower">Willpower</option>
                      </select>
                  </div>
                  <div class="mb-3 col" v-if="settings.gameSystem !== 'fage2e' && settings.gameSystem !== 'blue rose'" >
                    <span class="age-input-label" id="basic-addon1">Weapon Focus</span>
                      <select
                        class="age-atk-select form-select"
                          data-testid="test-attack-weaponGroup-input"
                          v-model="item.weaponGroup" >
                          <option v-for="wg in weaponGroups" :key="wg" :value="wg">{{ wg }}</option>
                      </select>
                  </div>
                </div>
                <div class="row" style="margin:0">
                  <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Min Str</span>
                    <div>
                      <input type="number" class="form-control" aria-label="Min Str" v-model="item.minStr"  aria-describedby="basic-addon1">
                    </div>
                  </div>
               
                  <div class="mb-3 col">
                      <span class="age-input-label" id="basic-addon1">Damage</span>
                      <input type="text" class="form-control" aria-label="Weapon Damage" 
                        aria-describedby="basic-addon1" v-model="item.damage">
                  </div>
                </div>
                <div class="row" style="margin:0">
                  <div class="mb-3 col" v-if="settings.gameSystem === 'mage' || settings.gameSystem === 'expanse'">
                    <span class="age-input-label" id="basic-addon1">Damage Source</span>
                        <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponGroup-input"
                            v-model="item.damageSource"

                        >
                          <option value="I">Impact</option>
                          <option value="P">Penetrating</option>
                          <option value="B">Ballistic</option>
                        </select>
                  </div>
                  <div class="mb-3 col" v-if="settings.gameSystem === 'mage' || settings.gameSystem === 'expanse'">
                    <span class="age-input-label" id="basic-addon1">Damage Type</span>
                        <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponGroup-input"
                            v-model="item.damageType"

                        >
                          <option value="S">Stun</option>
                          <option value="W">Wound</option>
                        </select>
                  </div>
                </div>
                <div class="row" style="margin:0">

                    <div class="mb-3 col" v-if="item.weaponType === 'Ranged' && settings.gameSystem !== 'mage'">
                        <span class="age-input-label" id="basic-addon1">Short Range</span>
                        <div>
                          <input type="text" class="form-control" aria-label="Character Name" v-model="item.shortRange" aria-describedby="basic-addon1">
                        </div>
                    </div>
                    <div class="mb-3 col" v-if="item.weaponType === 'Ranged'">
                        <span class="age-input-label" id="basic-addon1" v-if="settings.gameSystem !== 'mage'">Long Range</span>
                        <span class="age-input-label" id="basic-addon1" v-if="settings.gameSystem === 'mage'">Range</span>
                        <div>
                          <input type="text" class="form-control" aria-label="Character Name" v-model="item.longRange" aria-describedby="basic-addon1">
                        </div>
                    </div>
                    <div class="mb-3 col" v-if="item.weaponType === 'Ranged'">
                    <span class="age-input-label" id="basic-addon1">Reload</span>
                    <div>
                      <select
                         class="age-atk-select form-select"
                            data-testid="test-attack-weaponType-input"
                            :id="`weaponType-${item._id}`"
                            v-model="item.reload"
                        >
                            <option value="Minor">Minor Action</option>
                            <option value="Major">Major Action</option>
                        </select>
                    </div>                        
                </div>
                </div>
                <div class="row" style="margin:0">
                  <div class="mb-3 col" v-if="item.weaponType === 'Ranged' && (settings.gameSystem === 'mage' || settings.gameSystem === 'expanse')">
                        <span class="age-input-label" id="basic-addon1">Capacity</span>
                        <div>
                          <input type="number" class="form-control" aria-label="Character Name" v-model="item.capacity" aria-describedby="basic-addon1">
                        </div>
                    </div>
                    <div class="mb-3 col" v-if="item.weaponType === 'Ranged' && (settings.gameSystem === 'mage' || settings.gameSystem === 'expanse')">
                    <span class="age-input-label" id="basic-addon1">Rate of Fire</span>
                    <div>
                          <input type="text" class="form-control" aria-label="Character Name" v-model="item.rateOfFire" aria-describedby="basic-addon1">
                    </div>                           
                    </div>
                </div>
                <div v-if="item.weaponType === 'Spell Ranged'">
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Range</span>
                        <input type="text" class="form-control" aria-label="Character Name" v-model="item.longRange"  aria-describedby="basic-addon1">
                    </div>
                </div>
                
                
            
              </div>
            </div>
              
          
  
            <div class="modal-footer-actions" v-if="mode === 'create'">
          <slot name="footer">
              <!-- <button class="btn" title="Delete" @click="$emit('close')">
                    Cancel
                </button> -->
            <button 
              class="confirm-btn"
              @click="useInventoryStore().addItem(item);$emit('close')"
            >Create</button>
             
            
            
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
              <button class="delete-icon-btn delete" title="Delete" @click="$emit('close');$emit('delete')" v-tippy="{ 'content': 'Delete Inventory Item'}">
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
  import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
  import { computed, ref } from 'vue';
  import { fage2eWG,mageWG, blueRoseWG, expanseWG } from '../attack/weaponGroups';
  import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

  const props = defineProps({
    show: Boolean,
    item: { type: Object },
    mode: String
  })

  const settings = useSettingsStore();
  const weaponGroups = ref(fage2eWG)
  switch(settings.gameSystem){
    case 'mage':
      weaponGroups.value = mageWG;
    break;
    case 'blue rose':
      weaponGroups.value = blueRoseWG;  
    break;
    case 'expanse':
      weaponGroups.value = expanseWG;
    break;
    default:
      weaponGroups.value = fage2eWG;
    break;
  }

  const isArmor = computed(() => {
  return props.item.type === 'armor';
  });
  const isShield = computed(() => {
  return props.item.type === 'shield';
  });
  const isWeapon = computed(() => {
    return props.item.type === 'weapon';
  });
  const setWeaponGroupAbility = () => {
    switch(props.item.weaponGroup){
      // ACCURACY
      case('Black Powder'):
      case('Bows'):
      case('Dueling'):
      case('Slings'):
      case('Staves'):
      case('Unarmed'):
      case('Assault Rifles'):
      case('Flexible'):
      case('Grenades'):
      case('Long Hafted'):
      case('Longarms'):
      case('Pistols'):
      case('SMGs'):
      case('Short Hafted'):
      case('Shotguns'):
      case('Thrown'):
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
      case('Brawling'):
      case('Light Blades'):
        props.item.weaponGroupAbility = settings.gameSystem === 'fage2e' || settings.gameSystem === 'blue rose' ? 'Accuracy' : 'Fighting';
      break;
      default:
        props.item.weaponGroupAbility = ''
      break;
    }
  }
  const setConfigurability = () => {
    if(isWeapon.value){
      props.item.configurable = true;
    }
  }
  const weaponTypes = computed(() => {
    if(settings.showArcana){
      return ['Melee','Ranged','Spell Melee','Spell Ranged','Natural']
    } else {
      return ['Melee','Ranged','Natural']
    }
  });

  </script>
  <style>
  
  </style>