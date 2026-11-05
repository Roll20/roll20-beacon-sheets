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
            
          <button class="link-btn age-icon-btn" @click="resetSpell(); showModal = true" style="background: none; font-weight: bold;border:none; font-size: 1.5rem;" v-tippy="{ content: 'Add ' + magicLabel }">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
          </button>
        </div>
      <div class="power-group-section" v-for="group in spellGroups" :key="group.id">
        <h3 class="age-bio-header" v-if="showGroupHeadings">{{ group.label }}</h3>
        <div class="accordion">
          <transition-group name="filtered-list" tag="div">
            <div class="accordion-item" v-for="spell in group.spells" :key="spell._id">
              <CharacterSpell
                :spell="spell"
                :index="rowIndex(spell)"
                :aim="aim"
                :aimValue="aimValue"
                :aimOption="aimOption"
              />
            </div>
          </transition-group>
        </div>
      </div>
      <div v-if="filteredSpells.length === 0 && spellStore.spells.length > 0" class="no-results">
        No results found.
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
import { sourcePluralLabel, sourceTypeList, spellSourceId } from '@/utility/powerSources';
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

const magicTypes = computed(() =>
  [
    ...new Set(
      settings.enabledPowerSources.flatMap((id) => sourceTypeList(id, settings))
    ),
  ].sort()
);
const magicLabel = computed(() =>
  settings.gameSystem === 'mage' ? 'Power' : 'Arcana'
);
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
// Spells of a disabled source stay saved but are hidden until it is turned back on.
const spellGroups = computed(() =>
  settings.enabledPowerSources
    .map((id) => ({
      id,
      label: sourcePluralLabel(id, settings.gameSystem),
      spells: filteredSpells.value.filter((spell) => spellSourceId(spell) === id),
    }))
    .filter((group) => group.spells.length > 0)
);
const showGroupHeadings = computed(() => settings.enabledPowerSources.length > 1);
// CharacterSpell builds its accordion ids from index, so it must be unique across sections.
const rowIndex = (spell) => filteredSpells.value.indexOf(spell);
const blankSpell = () => ({
  _id: '',
  name: '',
  sourceId: settings.enabledPowerSources[0] ?? 'arcana',
  arcanaType: '',
  requirements: '',
  shortDescription: '',
  description: '',
  ability: '',
  spellType: '',
  spellTypeBonus: 0,
  mpCost: 0,
  castingTime: '',
  targetNumber: 0,
  priceTN: 0,
  spellTest: '',
  extendable: false,
  damageHit: '',
  damageMiss: '',
});
let spellNew = ref(blankSpell());
function resetSpell() {
  spellNew.value = blankSpell();
}
</script>

<style scoped lang="scss">
.power-group-section {
  padding: 6px 0;
}
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
