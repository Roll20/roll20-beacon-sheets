<template>  
  <div class="age-content">
    <div style="padding: 6px;" >
      <div style="width: 100%;display: flex;justify-content: space-between;padding:5px 0;">
        <div style="padding: 15px 6px 6px;width: 100%;" v-if="spellStore.spells.length === 0">
          Your {{ magicLabel }} is empty. 
        </div>
          <div style="display: flex;gap: 5px;">
            <div class="age-search-input"  v-if="spellStore.spells.length > 0">
              <input class="form-control " v-model="spellFilter" placeholder="Search by Spell Name" />
              <button class="age-icon-btn age-search-input-clear-btn" v-if="spellFilter" @click="spellFilter = ''">
                <font-awesome-icon :icon="['fa', 'circle-xmark']"/>
              </button>    
          </div>
          <div class="age-search-select"  v-if="spellStore.spells.length > 0">
            <select class="form-select" placeholder="Filter by Item Type" v-model="spellSourceFilter">
                <option value="" disabled hidden>Filter by {{ magicLabel }} Type</option>
                <option value="" v-if="spellSourceFilter">None</option>
                <option v-for="mt in magicTypes" :key="mt" :value="mt">{{ mt }}</option>
              </select>
          </div>   
          </div>
            
          <button class="link-btn age-icon-btn" @click="showModal = true" style="background: none; font-weight: bold;border:none; font-size: 1.5rem;" v-tippy="{ content: 'Add ' + magicLabel }">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
          </button>
        </div>
      <div class="accordion">
        <transition-group name="filtered-list" tag="div">
        <div class="accordion-item" v-for="(spell, index) in filteredSpells" :key="spell._id">
          <CharacterSpell
            :key="spell._id"
            :spell="spell"
            :index="index"
            :aim="aim"
            :aimValue="aimValue"
            :aimOption="aimOption"
          />
        </div>
        </transition-group>
        <div v-if="filteredSpells.length === 0 && spellStore.spells.length > 0" class="no-results">
            No results found.
          </div> 
      </div>                    
    </div>
  </div>
  <Teleport to="body">
      <!-- use the modal component, pass in the prop -->
      <SpellModal :show="showModal" @close="showModal = false;resetSpell()" :spell="spellNew" :mode="'create'" :magicLabel="magicLabel">
        <template #header>
          <h3 class="age-modal-details-header">Add {{ magicLabel }}</h3>
        </template>
      </SpellModal>
    </Teleport>
</template>

<script setup>
import { useSpellStore } from '@/sheet/stores/magic/magicStore';
import CharacterSpell from '@/components/magic/CharacterSpell.vue';
import SpellModal from './SpellModal.vue';
import { computed, ref, watch } from 'vue';
import { fageArcana, magePowers } from './magicTypes';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
const props = defineProps({
  aim: { type: Boolean },
  aimValue: { type: Number },
  aimOption: String
});
const emit = defineEmits(['update:modelValue'])
const showModal = ref(false)
const settings = useSettingsStore();
const spellFilter = ref('');
const spellSourceFilter = ref('');
const spellStore = useSpellStore();
const debouncedSearchQuery = ref('');
const debouncedItemSource = ref('');

const magicTypes = ref();
switch(settings.gameSystem){
  case 'fage2e':
  case 'blue rose':
    magicTypes.value = fageArcana;
  break;
  case 'mage':
    magicTypes.value = magePowers;
}
const magicLabel = ref('Arcana');
switch(settings.gameSystem){
  case 'mage':
    magicLabel.value = 'Power';
  break;
  default:
    magicLabel.value = 'Arcana';
  break;
}
// Debounce delay (in milliseconds)
const debounceDelay = 600;
let debounceTimer;
watch([spellFilter,spellSourceFilter], ([newQuery,newSource]) => {
  // Clear the previous timeout if the user is still typing
  clearTimeout(debounceTimer);

  // Set up a new timeout to update debouncedSearchQuery after the delay
  debounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = newQuery;
    debouncedItemSource.value = newSource;
  }, debounceDelay);
});
const filteredSpells = computed(() => {
  return spellStore.spells.filter(spell => {
    // Split the search query into words, and check each word against the item name
    const queryWords = debouncedSearchQuery.value.toLowerCase().split(' ');
    const spellName = spell.name.toLowerCase();
    
    const matchesQuery = queryWords.every(word => spellName.includes(word));
    const matchesType = !debouncedItemSource.value || spell.arcanaType === debouncedItemSource.value;

    return matchesQuery && matchesType;
  });
});
let spellNew = ref({
  _id: '',
  name: '',
  arcanaType: '',
  requirements:'',
  shortDescription: '',
  description: '',
  ability:'',
  spellType:'',
  spellTypeBonus:0,
  mpCost:0,
  castingTime:'',
  targetNumber:0,
  spellTest:'',
  extendable:false,
  damageHit:'',
  damageMiss:'',
  })
  function resetSpell(){
    spellNew.value = {
      _id: '',
      name: '',
      arcanaType: '',
      requirements:'',
      shortDescription: '',
      description: '',
      ability:'',
      spellType:'',
      spellTypeBonus:0,
      mpCost:0,
      castingTime:'',
      targetNumber:0,
      spellTest:'',
      extendable:false,
      damageHit:'',
      damageMiss:'',
    }
  };
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
