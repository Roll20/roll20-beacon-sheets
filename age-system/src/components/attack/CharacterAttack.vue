<template>
      <div class="accordion-header age-combat-accordion-header">
        <div class="age-combat-icon" style="display: flex;">
          <div style="position: relative;overflow: hidden;height: 40px;width: 40px;" v-if="attack.weaponType !== 'Natural'">
          <div class="age-combat-section age-combat-axes-icon" v-if="attack.weaponGroup === 'Axes'"></div>
          <div class="age-combat-section age-combat-blackPowder-icon" v-if="attack.weaponGroup === 'Black Powder'"></div>
          <div class="age-combat-section age-combat-bludgeons-icon" v-if="attack.weaponGroup === 'Bludgeons'"></div>
          <div class="age-combat-section age-combat-bows-icon" v-if="attack.weaponGroup === 'Bows'"></div>
          <div class="age-combat-section age-combat-brawling-icon" v-if="attack.weaponGroup === 'Brawling'"></div>
          <div class="age-combat-section age-combat-dueling-icon" v-if="attack.weaponGroup === 'Dueling'"></div>
          <div class="age-combat-section age-combat-heavyBlades-icon" v-if="attack.weaponGroup === 'Heavy Blades'"></div>
          <div class="age-combat-section age-combat-lances-icon" v-if="attack.weaponGroup === 'Lances'"></div>
          <div class="age-combat-section age-combat-lightBlades-icon" v-if="attack.weaponGroup === 'Light Blades'"></div>
          <div class="age-combat-section age-combat-polearms-icon" v-if="attack.weaponGroup === 'Polearms'"></div>
          <div class="age-combat-section age-combat-slings-icon" v-if="attack.weaponGroup === 'Slings'"></div>
          <div class="age-combat-section age-combat-spears-icon" v-if="attack.weaponGroup === 'Spears'"></div>
          <div class="age-combat-section age-combat-staves-icon" v-if="attack.weaponGroup === 'Staves'"></div>
          <div class="age-combat-section age-combat-magic-icon" v-if="attack.weaponType === 'Spell Ranged'"></div>
          </div>        
          <div class="age-combat-section age-combat-natural-icon" v-if="attack.weaponType === 'Natural'"></div>
          </div>
          <div>
          <div class="label age-combat-name">
            <div class="age-weapon-name">{{ attack.name }}</div>
            <div class="age-weapon-type">{{ attack.weaponType }}</div>
          </div>        
        </div>
        
        <div class="age-weapon-range-reload age-combat-range">
          <div v-if="attack.weaponType === 'Ranged'">
            {{ attack.shortRange }} ~ {{ attack.longRange }} yds
          </div>
          <div class="age-weapon-reload" v-if="attack.reload">
            {{ attack.reload }} Action
          </div>
        </div>        
      <div class="age-weapon-btn-container age-combat-attack">
        <button class="age-btn" @click="handlePrint">
          {{ (attackHit > 0 ? `+` : '') + attackHit }}
          <!-- <span v-if="!aim && aimOption !== 'always'">
            <span v-if="(useAbilityScoreStore().abilityScores[props.attack.weaponGroupAbility]?.base >= 0) + Number(checkFocusBonus(useAbilityFocusesStore().abilityFocuses,props.attack))">+</span>
            {{ Number(useAbilityScoreStore().abilityScores[props.attack.weaponGroupAbility]?.base) + Number(checkFocusBonus(useAbilityFocusesStore().abilityFocuses,props.attack)) }}
          </span>
          <span v-if="aim || aimOption === 'always'">
            <span v-if="(useAbilityScoreStore().abilityScores[props.attack.weaponGroupAbility]?.base >= 0) + Number(checkFocusBonus(useAbilityFocusesStore().abilityFocuses,props.attack))">+</span>
            {{ Number(useAbilityScoreStore().abilityScores[props.attack.weaponGroupAbility]?.base) + Number(checkFocusBonus(useAbilityFocusesStore().abilityFocuses,props.attack)) + aimValue }}
          </span> -->
        </button>
      </div>
      <div class="age-weapon-btn-container age-combat-damage" v-if="filteredDamageMods.length === 0">  
        <button class="age-btn" @click="handlePrintDamage(modsBonus)">{{ modsBonus }}</button>
      </div>
      <div class="age-weapon-btn-container age-combat-damage" v-if="filteredDamageMods.length > 0">   
               
        <button class="age-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          Damage
        </button>
        <!-- {{ totalBonus }} <br /> -->
        <!-- {{ useModifiersStore().getDamageBonus() || 'X'}}
        {{ useModifiersStore().damageMod || 'X'}} -->
        <!-- {{ modsBonus }} -->
          <ul class="dropdown-menu">
            <div class="age-dmg-container">
              <span class="age-dmg-label">Basic Damage</span>
              <button class="age-btn" @click="handlePrintDamage(modsBonus)">{{ modsBonus }}</button>
            </div>
            <div class="age-dmg-container" v-for="(dm) in damageMods" :key="dm">
              <span class="age-dmg-label">

                <span>{{ dm.label }}</span>
                <span v-if="dm.spCost"> ({{ dm.spCost }} SP)</span>
                
              </span>
              <button class="age-btn" @click="handlePrintDamage(mergeDice([modsBonus,dm.roll ? dm.roll : dm.variable]),dm)">{{mergeDice([modsBonus,dm.roll ? dm.roll : dm.variable])}}</button>
            </div>
          </ul>
      </div>
      <button type="button" class="config-btn age-icon-btn age-combat-details" @click="printAttackDetails(attack)" v-tippy="{ content: 'Share Attack in chat'}">
          <font-awesome-icon :icon="['fa', 'comment']" />
      </button> 
      <div class="age-combat-config">
        <button type="button" v-if="attack.configurable" class="config-btn age-icon-btn" @click="showModal = true" v-tippy="{ content: 'Edit Attack'}">
          <font-awesome-icon :icon="['fa', 'gear']" />
        </button> 
      </div>      

        <button class="accordion-button collapsed age-combat-accordion" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"  aria-expanded="true" aria-controls="collapseOne"></button>
    </div>
    <div :id="'collapse'+ index" class="accordion-collapse age-accordion-collapse collapsed collapse" data-bs-parent="#age-spell-accordion">
      <div class="accordion-body">

<div class="age-spell-accordion">
  <div>
    <h3>Description</h3>
    <div v-html="attack.description"></div>
  </div>
</div>
</div>
    </div>
  <Teleport to="body">
    <AttackModal :show="showModal" @close="showModal = false;setAttackRoll()" :attack="attack"
    :index="index" @delete="handleDelete()">
      <template #header>
        <h3 class="age-attack-details-header">Attack Details</h3>
      </template>
    </AttackModal>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useAttackStore } from '@/sheet/stores/attack/attackStore';
import AttackModal from '@/components/attack/AttackModal.vue';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useAbilityFocusesStore } from '@/sheet/stores/abilityScores/abilityFocusStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import {  attackFocus, attackToHit, damageMod } from '@/sheet/stores/modifiersCheck/attackDamage';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { useCustomConditionsStore } from '@/sheet/stores/conditions/customConditionsStore';
const showModal = ref(false)
const open = ref(false)
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  attack: { type: Object },
  index: { type: Number },
  aim: { type: Boolean },
  aimValue: { type: Number },
  aimOption: String
});
const char = useCharacterStore();
const ability = useAbilityScoreStore();
const qualities = useItemStore();
const conditions = useCustomConditionsStore();
const damageMods = damageMod; 
const damage = ref(props.attack.damage);
const damageDie = ref('');
const attackHit = ref(attackToHit(props.attack))

const modsBonus = computed(() => {
  if(props.attack.minStr > ability.StrengthBase) return '1d6-1';
  const [base, mod] = props.attack.damage? props.attack.damage.split('+').map(part => part.trim()) : ['',''];
  // useModifiersStore().modifiers = []
  const modifiersStore = useModifiersStore().modifiers
    .filter(item => {
      return item.option === "Damage" && item.enabled
    });
  const baseModifier = Number(mod)  || 0; // Calculate mod / 2 only once
  const abilityBonus = ref(0);
  if (char.weaponGroups.includes(props.attack.weaponGroup)) {
    abilityBonus.value = Number(ability.abilityScores[props.attack.weaponGroupAbility === 'Fighting' ? 'Strength':'Perception']?.base) ;
  } else if(props.attack.weaponType === 'Spell Ranged'){
    abilityBonus.value = Number(ability.abilityScores[props.attack.weaponGroupAbility]?.base) ; 
  }
  const totalModifiers = modifiersStore.reduce((total, item) => {
    const value = item.bonus || item.penalty || 0; // Use bonus or penalty, default to 0 if neither
    return total + Number(value); // Add each bonus or penalty without reapplying mod/2 or abilityBonus/2
  }, 0);
  const modifier = totalModifiers + baseModifier + abilityBonus.value;
  const sign = modifier >= 0 ? "+" : "-";
  if (modifier === 0) {
    return base; // Just return the base value if the modifier is 0
  }
  return `${base}${sign}${Math.abs(modifier)}`;
});

const filteredDamageMods = computed(()=>{
  return damageMods.value.filter(mod => {
    // Filter out stunts with type 'Spell' if the attack is 'melee' or 'ranged'
    if (props.attack.weaponType === 'Melee' || props.attack.weaponType === 'Ranged') {
      return mod.stuntType !== 'Spell';
    }

    // Keep all stunts if it's a 'spell melee' or 'spell ranged' attack
    if (props.attack.weaponType === 'Spell Melee' || props.attack.weaponType === 'Spell Ranged') {
      return true; // Keep all
    }

    // Default case: keep the mod
    return true;
  });
});
let toAttackRoll = 0

const setAttackRoll = () => {
  if(useAbilityScoreStore().abilityScores[props.attack.weaponGroupAbility]){
    toAttackRoll = useAbilityScoreStore().abilityScores[props.attack.weaponGroupAbility].base
  }
}
setAttackRoll()

const focus = useAbilityFocusesStore();
let sfb = {}

const checkFocusBonus = (objectsArray, weapon) => {
  console.log(objectsArray)
  console.log(weapon)
  const obj = objectsArray.find(obj => {
    if (obj.name === 'custom') {
      return obj.customName.toLowerCase() === weapon.name.toLowerCase();
    } else {
      return (obj.name.toLowerCase() === weapon.weaponGroup.toLowerCase() && obj.weaponGroup === weapon.weaponGroup);
    }
  });
  if (obj) {
    if (obj.doubleFocus) {
      return 4; // Return 4 if doubleFocus is true
    } else if (obj.focus) {
      return 2; // Return 2 if only focus is true
    }
  }
  return 0; // Return 0 if no focus or doubleFocus is true, or if no match is found
}
const expanded = ref(false);

const toggleExpand = () => {
  expanded.value = !expanded.value;
};
const modalClosed = () => {
  showModal.value = false;
};
const handleDelete = () => {
  const attackStore = useAttackStore();
  attackStore.removeAttack(props.attack._id);
};
const handlePrint = () => {
  const attackStore = useAttackStore();
  attackStore.printAttack(props.attack,toAttackRoll,attackFocus(props.attack));
};
const handlePrintDamage = (damageRoll,attackDmgLabel) => {
  const attackStore = useAttackStore();
  const attackDamage = Object.assign({}, props.attack);
  attackDamage.damage = damageRoll;
  if(attackDmgLabel){
    attackDamage.damageLabel = attackDmgLabel.label;
    attackDamage.source = attackDmgLabel.source;
    attackDamage.spCost = Number(attackDmgLabel.spCost);
  }
  if(attackDamage.spCost){
    char.stunts = char.stunts - attackDamage.spCost;
  }
  attackStore.printAttackDamage(attackDamage); 
}
const selectedAttack = () => {
  const attackStore = useAttackStore();
  attackStore.setCurrentAttack(props.attack._id);
};


function mergeDice(rolls) {
  // console.log(rolls)
  // Create an object to track the number of each type of dice
  const diceMap = {};
  let totalModifier = 0; // To track any numeric modifiers (e.g., +5)

  // Helper function to process individual dice strings like '2d6+5' or '1d6'
  function processRoll(roll) {
    if(!roll) return;
    // Match dice roll with optional modifier, e.g., '2d6', '2d6+5', or '1d6-3'
    const regex = /^(\d*)d(\d+)([+-]\d+)?$/;
    const match = roll.match(regex);

    if (match) {
      const num = Number(match[1] || 1); // Number of dice (default 1 if empty)
      const sides = Number(match[2]);    // Number of sides on the dice
      const modifier = Number(match[3] || 0); // Modifier (default 0 if empty)

      // Accumulate the dice roll
      if (diceMap[sides]) {
        diceMap[sides] += num; // Add the number of dice if sides already exist
      } else {
        diceMap[sides] = num;  // Initialize new dice type
      }

      // Accumulate the modifier
      totalModifier += modifier;
    } else {
      // If the roll is just a number (e.g., '5'), treat it as a modifier
      totalModifier += Number(roll);
    }
  }

  // Iterate through all the rolls and process each one
  rolls.forEach(roll => processRoll(roll));

  // Convert the combined dice map back into an array of dice strings
  const combinedDice = Object.entries(diceMap).map(([sides, num]) => `${num}d${sides}`);

  // If there's a numeric modifier, include it in the final result
  if (totalModifier !== 0) {
    combinedDice.push(`${totalModifier}`);
  }

  return combinedDice.join('+');
}
const totalBonus = ref(0);
const count = ref(0);
const multiplier = ref(2);
const dynamicResult = computed(() => {
  return count.value * multiplier.value;
});

const printAttackDetails = (attack) => {
  const attackStore = useAttackStore();
  attackStore.printAttackDetails(props.attack,toAttackRoll,checkFocusBonus(useAbilityFocusesStore().abilityFocuses,props.attack));
}
</script>

<style scoped lang="scss">

.attack {
  .label {
    font-weight: 600;
    position: relative;
  }

  &__row {
    display:grid;
    // grid-template-columns:   3fr 1fr 50px 75px 25px 25px 40px;
    align-items: center;
    gap: 1rem;
    // grid-template-columns: 2fr 1fr 1fr 1fr 30px;
    border-radius: 8px;
    position: relative;
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
    align-attacks: center;
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
  & .age-weapon-name {
    font-size:12px;
  }
}
@media (max-width:1400px){
  .attack {
    &__row {
      
      // display: grid;
      // align-items: center;
      // gap: 1rem;
      // grid-template-columns: 2fr 1fr 50px 75px 25px 25px 40px;
      // border-radius: 8px;
      // position: relative;
    }
  }
}
</style>
