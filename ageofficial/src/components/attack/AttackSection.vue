<template>
  <div class="age-content">
    <div style="padding: 15px 6px 6px;width: min-content;min-width: 100%;" v-if="allAttacks.length === 0">
      No Attacks Available. To add attacks equip weapons in the Inventory tab.
    </div>
    <div style="padding: 15px 6px 6px;width: min-content;min-width: 100%;" v-if="allAttacks.length > 0">
      <div style="width: 100%;display: flex;justify-content: space-between;padding:5px 0;">
        
          <div class="age-search-input">
            
              <input class="form-control " v-model="attackFilter" placeholder="Search by Attack Name" />
              <button class="age-icon-btn age-search-input-clear-btn" v-if="attackFilter" @click="attackFilter = ''">
                <font-awesome-icon :icon="['fa', 'circle-xmark']"/>
              </button>    
          </div>
        </div>
        
      <div class="accordion age-accordion">
        <transition-group name="filtered-list" tag="div">
          <div class="accordion-item" v-for="(attack, index) in filteredAttacks" :key="attack._id">
            <CharacterAttack          
              :attack="attack"
              :index="index"
              :aim="aim"
              :aimValue="aimValue"
              :aimOption="aimOption"
            />
          </div>
        </transition-group>           
      </div>   
      <div v-if="filteredAttacks.length === 0" class="no-results">
        No results found.
      </div>             
    </div>
    <div class="age-combat-footer" v-if="settings.gameSystem === 'fage2e' || settings.gameSystem === 'blue rose'">
      <button class="age-label-black" @click="showWeaponGroupModal = true">
          <div class="age-label-side-heading-black">Weapon Groups</div>
          <div class="age-combat-wg">
            <div v-for="(wg, index) in char?.weaponGroups ? JSON.parse(char.weaponGroups).sort(): []" :key="wg" >
            {{wg}}<span v-if="index != JSON.parse(char.weaponGroups).length - 1" style="margin-right: 5px;">, </span> 
          </div>
          </div>          
      </button>
      <div class="age-combat-unarmed">
        <span style="display: flex;" v-tippy="{ content: (showUnarmed ? 'Hide' : 'Show') + ' Unarmed Attack' }">
          <div class="age-combat-unarmed__toggle"></div>  
          <div class="age-checkbox-toggle">
            <label>
              <input type="checkbox" v-model="showUnarmed" @change="attackStore.handleShowUnarmed()" />
              <span class="slider round" ></span>
            </label>
          </div>
        </span>        
      </div>
    </div>
      
  </div>



  <Teleport to="body">
    <WeaponGroupsModal :show="showWeaponGroupModal" @close="showWeaponGroupModal = false;">
      <template #header>
        <h3 class="age-attack-details-header">Weapon Group Training</h3>
      </template>
    </WeaponGroupsModal>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useAttackStore } from '@/sheet/stores/attack/attackStore';
import CharacterAttack from '@/components/attack/CharacterAttack.vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useSettingsStore} from '@/sheet/stores/settings/settingsStore';
import WeaponGroupsModal from '@/components/attack/WeaponGroupsModal.vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';
const props = defineProps({
  aim: { type: Boolean },
  aimValue: { type: Number },
  aimOption: String
});
const emit = defineEmits(['update:modelValue'])

const attackStore = useAttackStore();
const inventoryStore = useInventoryStore();
const qualities = useItemStore();
const settings = useSettingsStore();
const char = useCharacterStore();
const mods = useModifiersStore();
const weaponGroups = ref(char?.weaponGroups ? JSON.parse(char.weaponGroups) : []);
const showUnarmed = attackStore.attacks.some(atk => atk.name === 'Fist (Unarmed)')
const attackFilter = ref('');
let availableAttacks = ref([...attackStore.attacks,...useInventoryStore().items.filter(item => (item.type === 'weapon' && item.equipped))]);
const showWeaponGroupModal = ref(false);
const allAttacks = computed(()=>{
  return [
          ...attackStore.attacks,
          ...inventoryStore.items.filter(item => (item.type === 'weapon' && item.equipped)),
          ...qualities.items.flatMap(item => (item.modifiers || []).filter(modifier => modifier.option === 'Custom Attack').map(modifier => ({ ...modifier, description: item?.description }))),
          ...mods.modifiers.filter(mod => mod.option === 'Custom Attack').map(modifier => ({ ...modifier, description:qualities.items.filter(itm => itm._id === modifier.parentId)[0]?.description }))]
})
const modsBonus = computed(()=>{
  return useModifiersStore().modifiers
    .filter(item => item.option === "Damage")
    .reduce((total, item) => {
      const value = item.bonus || item.penalty || 0; // Use bonus or penalty, default to 0 if neither
      return total + value;
    }, 0);
})
const debouncedSearchQuery = ref('');

// Debounce delay (in milliseconds)
const debounceDelay = 600;
let debounceTimer;
watch(attackFilter, (newQuery) => {
  // Clear the previous timeout if the user is still typing
  clearTimeout(debounceTimer);

  // Set up a new timeout to update debouncedSearchQuery after the delay
  debounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newQuery;
  }, debounceDelay);
});
const filteredAttacks = computed(() => {
  return allAttacks.value.filter(attack => {
    // Split the search query into words, and check each word against the item name
    const queryWords = debouncedSearchQuery.value ? debouncedSearchQuery.value.toLowerCase().split(' ') : [];
    const attackName = attack.name ? attack.name.toLowerCase() : '';
    
    // Only include items where every word in searchQuery matches part of the name
    return queryWords.every(word => attackName.includes(word));
  });
});
</script>

<style scoped lang="scss">
.traits {
  &__body {
  }

  &__top {
    text-align: right;
    padding-right: 1rem;
    margin-bottom: 1rem;
  }

  &__group {
    height: 12rem;
    padding: 0 1rem;
    overflow: scroll;
    display: flex;
    flex-direction: column;
  }
}
.attacks {
  & .age-content {
    padding-bottom: 10px;
  }
}
</style>
