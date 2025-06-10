<template>
    <div class="accordion-header age-spell-accordion-header">
        <div class="" style="font-size: 1rem; padding:0.5rem;">
            <div class="label" data-testid="test-spell-header" style="flex:1;">{{ spell.name }}<br />({{ spell.requirements }})</div>     
        </div>
        <div>
            <img v-if="spell.arcanaType && settings.gameSystem !== 'blue rose'" :src="'/src/assets/arcana/' + spell.arcanaType.toLowerCase() + '.png'" class="age-arcana-logo" v-tippy="{ content: '<span>'+spell.arcanaType+' '+ magicLabel+'</span>'}" />
        </div>   
        <!-- <div class="age-cost-tn-number" v-tippy="{ content: 'Magic Point Cost'}">
            <span>{{ spell.mpCost }}</span>
        </div>   
        <div class="age-cost-tn-number" v-tippy="{ content: 'Target Number'}">
            <span>{{ spell.targetNumber }}</span>
        </div>   -->
        <button type="button" 
                class="config-btn age-icon-btn" 
                data-bs-toggle="modal" 
                data-bs-target="#spellDetailsModal" 
                data-bs-dismiss="showModal = false" 
                data-bs-backdrop="static" 
                v-tippy="{ content: 'Cast '+magicLabel+' (' + spell.mpCost + ''+magicPoints+')' }"
                @click="handlePrint"
                :disabled="(char.magic < spell.mpCost)"
                :class="{ 'spell-btn-disabled':(char.magic < spell.mpCost)}">
            <div class="age-spell-cast"></div>
        </button>
        <div>
          <button type="button" 
                class="config-btn age-icon-btn" 
                v-if="spell.spellType === 'Attack' && spell.damageHit"
                data-bs-toggle="modal" 
                data-bs-target="#spellDetailsModal" 
                data-bs-dismiss="showModal = false" 
                data-bs-backdrop="static" 
                v-tippy="{ content: magicLabel+ ' Damage' }"
                @click="handleDamagePrint"
                :disabled="(char.magic < spell.mpCost)"
                :class="{ 'spell-btn-disabled':(char.magic < spell.mpCost)}">
            <div class="age-spell-damage"></div>
        </button>
        </div>
        
        <button type="button" class="config-btn age-icon-btn" @click="handlePrint" v-tippy="{ content: 'Share '+magicLabel+' in chat'}">
          <font-awesome-icon :icon="['fa', 'comment']" />
        </button> 
        <button type="button" class="config-btn age-icon-btn" @click="showModal = true" v-tippy="{ content: 'Edit '+magicLabel}">
            <font-awesome-icon :icon="['fa', 'gear']" />
        </button> 
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"  aria-expanded="true" aria-controls="collapseOne"></button>
      </div>
    <div :id="'collapse'+ index" class="accordion-collapse age-accordion-collapse collapsed collapse" data-bs-parent="#age-spell-accordion">
        <div class="accordion-body">

          <div class="age-spell-accordion">
            <div>
              <h3>Description</h3>
              <div v-html="spell.description"></div>
            </div>
            <div>
              <div class="age-spell-details">
              <span class="age-spell-details__label">Requirements</span>
                <span>{{  spell.arcanaType }} {{ magicLabel }} ({{ spell.requirements }})</span>
              <span class="age-spell-details__label">Spell Type</span>
                <span>{{ spell.spellType }}</span>
              <span class="age-spell-details__label">Casting Time</span>
                <span>{{ spell.castingTime + ' Action' }}</span>
              <span class="age-spell-details__label">{{ magicPoints }} Cost</span>
                <span>{{ spell.mpCost }}</span>
              <span class="age-spell-details__label">Target Number</span>
                <span>{{ spell.targetNumber }}</span>
              <span class="age-spell-details__label" v-if="spell.spellTest">Test</span>
                <span v-if="spell.spellTest">{{  spell.spellTest + ' vs. Spellpower' }}</span>
            </div>
            </div>
            
          </div>
      </div>
    </div>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <SpellModal :show="showModal" @close="showModal = false;" :spell="spell"
      :index="index" :magicLabel="magicLabel" @delete="handleDelete()">
      <template #header>
        <h3 class="age-spell-details-header">Spell Details</h3>
      </template>
    </SpellModal>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useSpellStore } from '@/sheet/stores/magic/magicStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore'
import SpellModal from './SpellModal.vue';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useAbilityFocusesStore } from '@/sheet/stores/abilityScores/abilityFocusStore';

const bio = useBioStore();
const char = useCharacterStore();
const settings = useSettingsStore();
const showModal = ref(false)
const open = ref(false)
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  spell: { type: Object },
  index: { type: Number },
  aim: { type: Boolean },
  aimValue: { type: Number },
  aimOption: String
});

const expanded = ref(false);

const magicLabel = ref('Arcana');
const magicPoints = ref('MP');
switch(settings.gameSystem){
  case 'mage':
    magicLabel.value = 'Power';
    magicPoints.value = 'PP';
  break;
  default:
    magicLabel.value = 'Arcana';
    magicPoints.value = 'MP';
  break;
}
const toggleExpand = () => {
  expanded.value = !expanded.value;
};
const modalClosed = () => {
  showModal.value = false;
};
let toAttackRoll = 0

const setAttackRoll = () => {
  if(useAbilityScoreStore().abilityScores[props.spell.ability]){
    toAttackRoll = useAbilityScoreStore().abilityScores[props.spell.ability].base;
  }
}
setAttackRoll()

const handleDelete = () => {
  const spellStore = useSpellStore();
  spellStore.removeSpell(props.spell._id);
};
const handlePrint = () => {
  const spellStore = useSpellStore();
  spellStore.printSpell(props.spell._id,toAttackRoll);
};
const handleDamagePrint = () => {
  const spellStore = useSpellStore();
  spellStore.printSpellDamage(props.spell);
};
const selectedAttack = () => {
  const spellStore = useSpellStore();
  spellStore.setCurrentAttack(props.spell._id);
  // selAttack = props.spell
};


</script>

<style scoped lang="scss">
.age-cost-tn-number {
    font-size: 1.25rem;
    font-weight: 500;
    text-transform: uppercase;
    // font-size: 0.75rem;
    // font-weight: bold;
    border-radius: 0.5rem;
    background-color: var(--examplesheet-primary);
    // padding: 0.25rem;
    color: white;
    text-align: center;
    margin: 0 5px;
    height:20px;
  }
.spell-btn-disabled .age-spell-cast {
  background-color: lightgray !important;
}

.spell {
  .label {
    font-weight: 600;
  }

  &__row {
    display: grid;
    align-items: center;
    gap: 1rem;
    padding: 2px;
    border: 1px solid #1e4e7a;
    margin: 6px;
    overflow: hidden;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 30px;
    border-radius: 8px;
  }
  & .age-cost-tn-number {
    font-size: 1.25rem;
    font-weight: 500;
    text-transform: uppercase;
    // font-size: 0.75rem;
    // font-weight: bold;
    border-radius: 0.5rem;
    background-color: var(--examplesheet-primary);
    // padding: 0.25rem;
    color: white;
    text-align: center;
    margin: 0 5px;
  }
  & .age-spell-cast {
    width:25px;
    height:25px;
    background-color: #1e4e7a;
    mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M335.656 19.53c-24.51.093-48.993 5.235-71.062 15.626-22.46 10.577-43.112 34.202-58.375 62.563-15.264 28.36-25.182 61.262-27.69 88.75-7.487 82.112-51.926 155.352-159.78 252.56l-.188 21.44C89.216 403.443 139.915 346.632 176.313 290l.063.03c-9.293 32.473-22.623 63.18-43.594 87.97-31.47 35.584-69.222 71.1-114.468 106.53l-.062 8.25 25 .064h.47l1.28-1.156c24.405-16.498 48.607-31.488 72.594-41.5l.187.187-46.436 42.5 28.937.063c48.372-41.685 94.714-90.58 129.626-137 33.587-44.658 56.02-87.312 60.688-116.844-1.268-2.32-2.552-4.628-3.656-7.094-18.833-42.06-4.273-96.424 40.218-116.063 32.73-14.45 74.854-3.165 90.438 31.344.15.333.324.634.47.97 13.302 24.062 6.175 49.48-9.345 61.97-7.866 6.328-18.442 9.528-28.75 6.56-10.31-2.966-19.043-11.772-24.5-25.124l17.28-7.062c3.992 9.764 8.667 13.15 12.375 14.22 3.708 1.066 7.767.148 11.875-3.158 8.216-6.61 14.282-21.91 4.406-39.03l-.28-.47-.22-.5c-10.7-24.82-41.96-33.333-66.22-22.625-34.063 15.037-45.594 58.052-30.686 91.345 20.527 45.846 77.97 61.177 122.375 40.875 60.157-27.5 80.13-103.328 53.094-161.813-24.737-53.503-81.41-82.484-138.908-83.843-1.633-.04-3.272-.07-4.906-.063zm-25.75 26.72c3.238.035 6.363.348 9.406.906 10.343 1.898 19.946 6.753 29.032 13.25-30.623-5.437-58.324 4.612-80.78 24.782-22.44 20.152-39.16 50.59-45.783 84.718-4.655-11.358-7.166-21.462-6.686-31.72.296-6.343 1.715-12.956 4.78-20.217 9.094-18.016 21.032-33.946 35.22-46.69 7.824-7.026 16.39-13.07 25.53-17.905 10.932-5.212 20.522-7.22 29.282-7.125zm122.938 62.313c22.583 13.167 34.365 41.86 32.937 70.656-.564 11.395-3.466 22.975-8.905 33.624-12.48 18.937-35.53 25.51-49.97 20.875l-.092-.25c27.943-10.365 39.18-32.377 40.312-55.19.124-2.5.115-4.994-.03-7.468 1.447-13.31-.412-28.793-5.47-43.437-2.244-6.496-5.15-12.89-8.844-18.72l.064-.093zm-135.563 1.312c-20.97 19.342-29.406 35.252-33.25 51.25-3.848 16.023-2.788 32.84-2.905 52.875-.14 23.79-2.56 51.542-18.438 85.688-.005.012-.025.018-.03.03-21.095 26.753-45.276 52.25-68.907 67.376l-.063-.03c64.195-71.545 68.527-114.792 68.75-153.19.112-19.197-1.253-37.594 3.438-57.124.57-2.37 1.233-4.742 2-7.125h.03c8.098-17.036 16.572-26.058 25.47-31.563 7.18-4.44 15.035-6.697 23.906-8.187z"/></svg>');
  }
  & .age-spell-damage {
    width:25px;
    height:25px;
    background-color: #1e4e7a;
    mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M218.4 24.72c-14.2 0-30.5 3.56-49.5 11.88 77.2 8.6 65.9 91.4 14.1 106.2-65.4 18.7-131.31-23.7-98.34-99.2-39.67 18.95-42.17 80.8-12.93 111.5C141.3 227.9 56.9 279 37.25 200.7-1.929 326.2 60.34 489.5 258.7 489.5c250.7 0 282-374.7 129.2-415.04 26.5 43.04-13.1 70.94-24.9 73.14-51.3 9.9-58.1-122.89-144.6-122.88zm37.5 118.08c4.5 0 9.4 1.1 12.8 2.9l115.9 67.1c7.4 4.1 7.4 10.9 0 15.2l-115.9 66.9c-7.2 4.3-18.5 4.3-25.7 0L126.8 228c-7.3-4.3-7.3-11.1 0-15.2L243 145.7c3.4-1.8 7.9-2.9 12.9-2.9zm-89 62.6c-21.6-.4-33.1 15-18.2 24.3 9.6 4.8 23.7 4.4 32.7-.8 8.8-5.3 9.5-13.7 1.5-19.4-4.3-2.5-10-4-16-4.1zm178.6.1c-20.8.4-31.3 15.5-16.3 24.5 9.6 4.9 23.9 4.6 33-.7 8.9-5.3 9.5-13.9 1.2-19.6-4.2-2.4-9.9-4-15.9-4.2h-2zm-89 0c-6.6-.1-13 1.5-17.7 4.2-10.2 5.6-10.4 15.1-.6 20.9 9.9 5.8 25.8 5.6 35.1-.6 15-9 4.6-24.3-16.8-24.5zm-141 41c1.5.1 3.4.5 5.6 1.6l111.5 64.5c7.2 4.1 12.9 14.2 12.9 22.5v119.7c0 8.3-5.7 11.7-12.9 7.6L121.2 398c-7.4-4.3-13.2-14.2-13.2-22.6V255.7c0-6.2 3-9.2 7.5-9.2zm281.3 0c4.2 0 7.2 3 7.2 9.2v119.7c0 8.4-6 18.3-13 22.6l-111.5 64.4c-7.2 4.1-12.9.7-12.9-7.6V335.1c0-8.3 5.7-18.4 12.9-22.5L391 248.1c2.1-1.1 4.2-1.5 5.8-1.6zm-185 65.5h-1.1c-5.3.4-8.5 4.8-8.5 11.6-.6 10.4 7.2 24.1 16.9 29.8 9.8 5.6 17.6 1.1 17.2-9.9.2-14.2-13.3-31.1-24.5-31.5zm130.9 21.8c-11.2.1-24.8 17.2-24.7 31.4.1 10.4 7.7 14.4 17.2 8.9 9.4-5.5 17-18.3 17.1-28.8 0-6.7-3.3-11.1-8.5-11.5h-1.1zm-216.9 22.5c-5.4.3-8.7 4.7-8.7 11.6-.5 10.5 7.3 24.1 17 29.8 9.8 5.5 17.6 1 17.2-10.1 0-14.5-14.1-31.8-25.5-31.3z"/></svg>');
  }
  &__buttons {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
    button {
      padding: 0 0.5rem;
      &.delete {
        font-size: 1.25rem;
      }
    }
  }

  &__level {
    font-weight: 600;
    width: 1rem;
  }

  &__toggle {
    font-weight: 600;
    display: inline-flex;
    gap: 1rem;
    align-spells: center;
    .caret {
      line-height: 1rem;
      transform: rotate(0deg);
      transition: transform 0.2s ease-in-out;
      &.expanded {
        transform: rotate(-90deg);
      }
    }
  }

  &__expansion {
    height: 0;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s linear;

    &.expanded {
      opacity: 1;
      height: 14rem;
      pointer-events: all;
      padding: 10px;
    }
    & .delete-container {
      display: flex;
      justify-content: flex-end;
      & .delete-btn {
      background: linear-gradient(
        120deg,
        #ff0000 0%,
        #f50800 28%,
        #eb1000 43%,
        #bd1000 51%,
        #db1600 57%,
        #d11800 61%,
        #c71b00 65%,
        #bd1c00 67%,
        #b81f00 70%,
        #ad1d00 74%,
        #a31e00 79%,
        #9e2000 87%,
        #941e00 100%
      );
      color: #FFF;
      padding: 4px 12px;
      border-radius: 5px;
      font-weight: bold;
      font-size: 12px;
    }
    }
    
  }

  &__top {
    padding: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  &__bottom {
    width: 100%;
    margin-bottom: 1rem;

    textarea {
      width: 100%;
      height: 5rem;
    }
  }
}
.age-arcana-logo {
  width:35px;
}
.age-spell-cast {
    width:30px;
    height:30px;
    background-color: #1e4e7a;
    mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M335.656 19.53c-24.51.093-48.993 5.235-71.062 15.626-22.46 10.577-43.112 34.202-58.375 62.563-15.264 28.36-25.182 61.262-27.69 88.75-7.487 82.112-51.926 155.352-159.78 252.56l-.188 21.44C89.216 403.443 139.915 346.632 176.313 290l.063.03c-9.293 32.473-22.623 63.18-43.594 87.97-31.47 35.584-69.222 71.1-114.468 106.53l-.062 8.25 25 .064h.47l1.28-1.156c24.405-16.498 48.607-31.488 72.594-41.5l.187.187-46.436 42.5 28.937.063c48.372-41.685 94.714-90.58 129.626-137 33.587-44.658 56.02-87.312 60.688-116.844-1.268-2.32-2.552-4.628-3.656-7.094-18.833-42.06-4.273-96.424 40.218-116.063 32.73-14.45 74.854-3.165 90.438 31.344.15.333.324.634.47.97 13.302 24.062 6.175 49.48-9.345 61.97-7.866 6.328-18.442 9.528-28.75 6.56-10.31-2.966-19.043-11.772-24.5-25.124l17.28-7.062c3.992 9.764 8.667 13.15 12.375 14.22 3.708 1.066 7.767.148 11.875-3.158 8.216-6.61 14.282-21.91 4.406-39.03l-.28-.47-.22-.5c-10.7-24.82-41.96-33.333-66.22-22.625-34.063 15.037-45.594 58.052-30.686 91.345 20.527 45.846 77.97 61.177 122.375 40.875 60.157-27.5 80.13-103.328 53.094-161.813-24.737-53.503-81.41-82.484-138.908-83.843-1.633-.04-3.272-.07-4.906-.063zm-25.75 26.72c3.238.035 6.363.348 9.406.906 10.343 1.898 19.946 6.753 29.032 13.25-30.623-5.437-58.324 4.612-80.78 24.782-22.44 20.152-39.16 50.59-45.783 84.718-4.655-11.358-7.166-21.462-6.686-31.72.296-6.343 1.715-12.956 4.78-20.217 9.094-18.016 21.032-33.946 35.22-46.69 7.824-7.026 16.39-13.07 25.53-17.905 10.932-5.212 20.522-7.22 29.282-7.125zm122.938 62.313c22.583 13.167 34.365 41.86 32.937 70.656-.564 11.395-3.466 22.975-8.905 33.624-12.48 18.937-35.53 25.51-49.97 20.875l-.092-.25c27.943-10.365 39.18-32.377 40.312-55.19.124-2.5.115-4.994-.03-7.468 1.447-13.31-.412-28.793-5.47-43.437-2.244-6.496-5.15-12.89-8.844-18.72l.064-.093zm-135.563 1.312c-20.97 19.342-29.406 35.252-33.25 51.25-3.848 16.023-2.788 32.84-2.905 52.875-.14 23.79-2.56 51.542-18.438 85.688-.005.012-.025.018-.03.03-21.095 26.753-45.276 52.25-68.907 67.376l-.063-.03c64.195-71.545 68.527-114.792 68.75-153.19.112-19.197-1.253-37.594 3.438-57.124.57-2.37 1.233-4.742 2-7.125h.03c8.098-17.036 16.572-26.058 25.47-31.563 7.18-4.44 15.035-6.697 23.906-8.187z"/></svg>');
  }
  .age-spell-damage {
    width:25px;
    height:25px;
    background-color: #1e4e7a;
    mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M218.4 24.72c-14.2 0-30.5 3.56-49.5 11.88 77.2 8.6 65.9 91.4 14.1 106.2-65.4 18.7-131.31-23.7-98.34-99.2-39.67 18.95-42.17 80.8-12.93 111.5C141.3 227.9 56.9 279 37.25 200.7-1.929 326.2 60.34 489.5 258.7 489.5c250.7 0 282-374.7 129.2-415.04 26.5 43.04-13.1 70.94-24.9 73.14-51.3 9.9-58.1-122.89-144.6-122.88zm37.5 118.08c4.5 0 9.4 1.1 12.8 2.9l115.9 67.1c7.4 4.1 7.4 10.9 0 15.2l-115.9 66.9c-7.2 4.3-18.5 4.3-25.7 0L126.8 228c-7.3-4.3-7.3-11.1 0-15.2L243 145.7c3.4-1.8 7.9-2.9 12.9-2.9zm-89 62.6c-21.6-.4-33.1 15-18.2 24.3 9.6 4.8 23.7 4.4 32.7-.8 8.8-5.3 9.5-13.7 1.5-19.4-4.3-2.5-10-4-16-4.1zm178.6.1c-20.8.4-31.3 15.5-16.3 24.5 9.6 4.9 23.9 4.6 33-.7 8.9-5.3 9.5-13.9 1.2-19.6-4.2-2.4-9.9-4-15.9-4.2h-2zm-89 0c-6.6-.1-13 1.5-17.7 4.2-10.2 5.6-10.4 15.1-.6 20.9 9.9 5.8 25.8 5.6 35.1-.6 15-9 4.6-24.3-16.8-24.5zm-141 41c1.5.1 3.4.5 5.6 1.6l111.5 64.5c7.2 4.1 12.9 14.2 12.9 22.5v119.7c0 8.3-5.7 11.7-12.9 7.6L121.2 398c-7.4-4.3-13.2-14.2-13.2-22.6V255.7c0-6.2 3-9.2 7.5-9.2zm281.3 0c4.2 0 7.2 3 7.2 9.2v119.7c0 8.4-6 18.3-13 22.6l-111.5 64.4c-7.2 4.1-12.9.7-12.9-7.6V335.1c0-8.3 5.7-18.4 12.9-22.5L391 248.1c2.1-1.1 4.2-1.5 5.8-1.6zm-185 65.5h-1.1c-5.3.4-8.5 4.8-8.5 11.6-.6 10.4 7.2 24.1 16.9 29.8 9.8 5.6 17.6 1.1 17.2-9.9.2-14.2-13.3-31.1-24.5-31.5zm130.9 21.8c-11.2.1-24.8 17.2-24.7 31.4.1 10.4 7.7 14.4 17.2 8.9 9.4-5.5 17-18.3 17.1-28.8 0-6.7-3.3-11.1-8.5-11.5h-1.1zm-216.9 22.5c-5.4.3-8.7 4.7-8.7 11.6-.5 10.5 7.3 24.1 17 29.8 9.8 5.5 17.6 1 17.2-10.1 0-14.5-14.1-31.8-25.5-31.3z"/></svg>');
  }
  .age-spell-accordion {
    display: grid;
    grid-template-columns: 2fr 200px;
    width: min-content;
    min-width: 100%;
    & .age-spell-details {
      background-color: #ecf6ff;
      border-radius: 4px;
      margin: 5px 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
          &__label {
            font-family:'Book Antiqua', monospace;
            font-size: 1.15rem;
          }
        }
  }
</style>
