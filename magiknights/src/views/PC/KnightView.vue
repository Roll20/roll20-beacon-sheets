<script setup>

function capitalize(str) {
  if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
}

import { ref, computed, watch } from 'vue';
import SplitMods from '@/components/SplitMods.vue';
import NotchContainer from '@/components/NotchContainer.vue';
import ImageBackedLabel from '@/components/ImageBackedLabel.vue';
import LabelStacked from '@/components/LabelStacked.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import SpellSection from '@/components/SpellSection.vue';
import WeaponQualitiesSelector from '@/components/WeaponQualitiesSelector.vue';
import GunQualitiesSelector from '@/components/GunQualitiesSelector.vue';
import ImplementQualitiesSelector from '@/components/ImplementQualitiesSelector.vue';
import SquadronFormations from '@/components/SquadronFormations.vue';
import CombinationManeuvers from '@/components/CombinationManeuvers.vue';

import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const knightAttributes = [
  {
    name: 'spell_dc',
    image: 'bottle-right',
    text: 'Spell DC',
    readonly: false
  },
  {
    name: 'knight_attack',
    image: 'attack',
    text: 'Attack',
    readonly: false,
    click: () => sheet.rollKnightAttack()
  },
  {
    name: 'knight_armor',
    image: 'magi-knight-shield',
    text: 'Armor',
    readonly: false
  },
  {
    name: 'knight_damage',
    image: 'magi-knight-damage',
    text: 'Damage',
    readonly: false,
    click: () => sheet.rollKnightDamage()
  },
  {
    name: 'spell_attack',
    image: 'bottle-left',
    text: 'Spell Attack',
    readonly: false
  },
  {
    name: 'knight_move',
    image: 'move',
    text: 'Move',
    readonly: false
  },
];
// Elements with enhancements and resist proficiencies
const elements = [
  {
    name: 'earth',
    description: 'solid',
    enhancements: [
      { description: "+1 HP per Level", attribute: "hpPerLevel" },
      { description: "+1 to Athletics and Medicine", attribute: "athleticsMedicine" },
      { description: "+1 Armor", attribute: "armor" },
      { description: "Reduce Armor by 1, Gain 10 Move (Select Additional Enhancement)", attribute: "armorMove" }
    ],
    resistProficiency: ['Strength', 'Constitution']
  },
  {
    name: 'fire',
    description: 'destructive',
    enhancements: [
      { description: "+1 HP per Level", attribute: "hpPerLevel" },
      { description: "+10 to Move", attribute: "move" },
      { description: "+1 to Athletics and Performance", attribute: "athleticsPerformance" },
      { description: "Gain +1 per Reputation Level to all weapon and spell damage", attribute: "repDamage" }
    ],
    resistProficiency: ['Strength', 'Dexterity']
  },
  {
    name: 'air',
    description: 'incorporeal',
    enhancements: [
      { description: "+1 HP per Level", attribute: "hpPerLevel" },
      { description: "+10 to Move", attribute: "move" },
      { description: "+1 Armor", attribute: "armor" },
      { description: "+1 to Athletics and Stealth", attribute: "athleticsStealth" }
    ],
    resistProficiency: ['Dexterity', 'Constitution']
  },
  {
    name: 'water',
    description: 'shifting',
    enhancements: [
      { description: "+1 MP per Level", attribute: "mpPerLevel" },
      { description: "+10 to Move", attribute: "move" },
      { description: "+1 Armor", attribute: "armor" },
      { description: "+1 to Coordination and Creativity", attribute: "coordinationCreativity" }
    ],
    resistProficiency: ['Using your Magic Ability Modifier']
  },
  {
    name: 'void',
    description: 'energy',
    enhancements: [
      { description: "+2 HP per Level", attribute: "hpPerLevel" },
      { description: "+2 MP per Level", attribute: "mpPerLevel" },
      { description: "+15 ft Move", attribute: "move" },
      { description: "+2 Armor", attribute: "armor" },
      { description: "+1 to Insight and Mysticism", attribute: "insightMysticism" }
    ],
    resistProficiency: ['Using your Magic Ability Modifier']
  }
];

// Compute the available enhancements based on the selected element
const availableEnhancements = computed(() => {
  const element = elements.find(el => el.name === sheet.elemental_affinity);
  return element ? element.enhancements : [];
});

// Compute the available roll resist proficiency based on the selected element
const availableResistProficiency = computed(() => {
  const element = elements.find(el => el.name === sheet.elemental_affinity);
  return element ? element.resistProficiency : [];
});

// Watch for changes in elemental affinity and reset enhancements and roll to resist proficiency
watch(() => sheet.elemental_affinity, (newAffinity) => {
    sheet.elemental_enhancement_1 = '';
    sheet.elemental_enhancement_2 = '';
    sheet.roll_resist_proficiency = '';
});

</script>

<template>
  <div class="knight-view">
    <div class="invisible-div">
      <input
        type="checkbox"
        id="customCheckbox"
        class="floating-checkbox"
        v-model="sheet.knight_hasShield"
      />
      <label for="customCheckbox"></label>
    </div>
  <SplitMods :attributes="knightAttributes" class="knight-split"/>

  <NotchContainer class="armor-weave-container basic-item" width="thick" notchType="curve">
    <h4>Soul Armor Weave</h4>
    <Collapsible class="basic-item" :default="sheet.armor_weave.collapsed" @collapse="sheet.armor_weave.collapsed = !sheet.armor_weave.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label :for="`armor-weave-name`">Name</label>
          <input class="underline" type="text" v-model="sheet.armor_weave.name" :id="`armor-weave-name`">
        </div>
        <div class="grid">
          <label class="properties-header" :for="`armor-weave-description`">Description</label>
          <textarea class="underline" :id="`armor-weave-description`" v-model="sheet.armor_weave.description"></textarea>
        </div>
      </template>
      <template v-slot:collapsed>
        <span>{{ sheet.armor_weave.name || 'New Weave' }}</span>
      </template>
    </Collapsible>
    
    <!-- static content data here -->
  </NotchContainer>

  <NotchContainer class="soul-weapon-container basic-item" width="thick" notchType="curve">
    <h4>Soul Weapon</h4>
    <Collapsible class="basic-item" :default="sheet.soul_weapon.collapsed" @collapse="sheet.soul_weapon.collapsed = !sheet.soul_weapon.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-weapon-name`">Name</label>
          <input class="input-field" type="text" v-model="sheet.soul_weapon.name" :id="`soul-weapon-name`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-weapon-range`">Range</label>
          <input class="input-field" type="text" v-model="sheet.soul_weapon.range" :id="`soul-weapon-range`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-weapon-damage`">Damage</label>
          <input class="input-field" type="text" v-model="sheet.soul_weapon.damage" :id="`soul-weapon-damage`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-weapon-damage-type`">Damage Type</label>
          <select class="input-field" v-model="sheet.soul_weapon.damageType" :id="`soul-weapon-damage-type`">
            <option value="physical">Physical</option>
            <option value="magical">Magical</option>
            <option value="true">True Damage</option>
          </select>
        </div>
        <div class="grid">
          <label class="properties-header">Qualities</label>
          <WeaponQualitiesSelector />
        </div>
      </template>
      <template v-slot:collapsed>
        <button @click="sheet.rollWeapon">{{ sheet.soul_weapon.name || 'New Weapon' }}</button>
        <span class="damage-type-tag" :class="sheet.soul_weapon.damageType">
          {{ sheet.damageTypeLabels[sheet.soul_weapon.damageType] || 'Physical' }}
        </span>
        <span v-if="sheet.activeWeaponQualities.length > 0" class="qualities-summary">
          {{ sheet.activeWeaponQualities.join(', ') }}
        </span>
      </template>
    </Collapsible>
    <!-- Static content here -->
  </NotchContainer>

  <NotchContainer class="magical-implement-container basic-item" width="thick" notchType="curve">
    <h4>Magical Implement</h4>
    <Collapsible class="basic-item" :default="sheet.magical_implement.collapsed" @collapse="sheet.magical_implement.collapsed = !sheet.magical_implement.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label :for="`magical-implement-name`">Name</label>
          <input class="input-field" type="text" v-model="sheet.magical_implement.name" :id="`magical-implement-name`">
        </div>
        <div class="grid">
          <label class="properties-header" :for="`magical-implement-description`">Description</label>
          <textarea class="input-field" v-model="sheet.magical_implement.description" :id="`magical-implement-description`"></textarea>
        </div>
        <div class="grid">
          <label class="properties-header">Qualities</label>
          <ImplementQualitiesSelector />
        </div>
      </template>
      <template v-slot:collapsed>
        <span class="implement-name">{{ sheet.magical_implement.name || 'New Implement' }}</span>
        <span v-if="sheet.hasManaAttunement" class="mana-attunement-badge">
          Mana Attunement
        </span>
        <span v-if="sheet.activeImplementQualities.length > 0" class="qualities-summary">
          {{ sheet.activeImplementQualities.join(', ') }}
        </span>
      </template>
    </Collapsible>
  </NotchContainer>

  <NotchContainer class="soul-gun-container basic-item" width="thick" notchType="curve">
    <h4>Soul Gun</h4>
    <Collapsible class="basic-item" :default="sheet.soul_gun.collapsed" @collapse="sheet.soul_gun.collapsed = !sheet.soul_gun.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-gun-name`">Name</label>
          <input class="input-field" type="text" v-model="sheet.soul_gun.name" :id="`soul-gun-name`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-gun-range`">Range</label>
          <input class="input-field" type="text" v-model="sheet.soul_gun.range" :id="`soul-gun-range`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-gun-damage`">Damage</label>
          <input class="input-field" type="text" v-model="sheet.soul_gun.damage" :id="`soul-gun-damage`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-gun-damage-type`">Damage Type</label>
          <select class="input-field" v-model="sheet.soul_gun.damageType" :id="`soul-gun-damage-type`">
            <option value="physical">Physical</option>
            <option value="magical">Magical</option>
            <option value="true">True Damage</option>
          </select>
        </div>
        <div class="grid">
          <label class="properties-header">Qualities</label>
          <GunQualitiesSelector />
        </div>
      </template>
      <template v-slot:collapsed>
        <div class="collapsed-gun-actions">
          <button class="gun-roll-btn" @click="sheet.rollGunAttack">Attack</button>
          <button class="gun-roll-btn" @click="sheet.rollGunDamage">Damage</button>
          <span class="gun-name">{{ sheet.soul_gun.name || 'New Gun' }}</span>
        </div>
        <span class="damage-type-tag" :class="sheet.soul_gun.damageType">
          {{ sheet.damageTypeLabels[sheet.soul_gun.damageType] || 'Physical' }}
        </span>
        <span v-if="sheet.activeGunQualities.length > 0" class="qualities-summary">
          {{ sheet.activeGunQualities.join(', ') }}
        </span>
      </template>
    </Collapsible>
  </NotchContainer>

<NotchContainer class="combat-form-container basic-item" width="thick" notchType="curve">
  <h4>Combat Forms</h4>
  <RepeatingSection name="forms">
    <RepeatingItem name="forms" v-for="item in sheet.sections.forms.rows" :key="item._id" :row="item">
      <Collapsible class="form-item basic-item" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
        <template v-slot:expanded>
          <div class="flex-box half-gap grow-label">
            <label :for="`form-${item._id}-name`">Name</label>
            <input type="text" class="underline" v-model="item.name" :id="`form-${item._id}-name`">
          </div>
          <div class="grid">
            <label class="properties-header" :for="`form-${item._id}-description`">Description</label>
            <textarea class="underline" v-model="item.description" :id="`form-${item._id}-description`"></textarea>
          </div>
        </template>
        <template v-slot:collapsed>
          <span>{{ item.name || 'New Form' }}</span>
        </template>
        <!-- Delete button -->
        <div class="repcontrol">
          <button class="delete-button material-symbols-outlined" @click="sheet.removeRow('forms', item._id)">delete_forever</button>
        </div>
      </Collapsible>
    </RepeatingItem>
  </RepeatingSection>
</NotchContainer>
  <NotchContainer class="arm-rune-container basic-item" width="thick" notchType="curve">
    <h4>Soul Armament Runes</h4>
    <RepeatingSection name="runes">
      <RepeatingItem name="runes" v-for="item in sheet.sections.runes.rows" :key="item._id" :row="item">
        <Collapsible class="form-item basic-item" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
          <template v-slot:expanded>
            <div class="flex-box half-gap grow-label">
              <label :for="`form-${item._id}-name`">Name</label>
              <input class="underline" type="text" v-model="item.name" :id="`rune-${item._id}-name`">
            </div>
            <div class="grid">
              <label class="properties-header" :for="`rune-${item._id}-description`">Description</label>
              <textarea class="underline" :id="`rune-${item._id}-description`" v-model="item.description"></textarea>
            </div>
          </template>
          <template v-slot:collapsed>
            <span>{{ item.name || 'New Rune' }}</span>
          </template>
          <!-- Delete button -->
          <div class="repcontrol">
            <button class="delete-button material-symbols-outlined" @click="sheet.removeRow('forms', item._id)">delete_forever</button>
          </div>
        </Collapsible>
      </RepeatingItem>
    </RepeatingSection>
    <!-- repeating section here -->
  </NotchContainer>

  <!-- Squadron Formations - Per compendium: requires 3+ Magi-Knights within 60ft -->
  <div class="formations-section grid-span-all">
    <SquadronFormations />
  </div>

  <!-- Combination Maneuvers - Per compendium: requires 2+ Magi-Knights and Unity Points (Rep II+) -->
  <div class="combos-section grid-span-all">
    <CombinationManeuvers />
  </div>

  <div class="spell-path-container grid-span-all">
  <NotchContainer class="spell-container" width="thick" notchType="curve">
    <h3>Spell Paths</h3>
    <div class="spell-path-layout">
      <div class="spell-tier-headers">
        <h4>I</h4>
        <h4>II</h4>
        <h4>III</h4>
        <h4>IV</h4>
        <h4>V</h4>
        <h4>VI</h4>
      </div>
      <SpellSection/>
    </div>
  </NotchContainer>
  </div>
  <div class="relics-section">
    <NotchContainer>
      <h4>relics</h4>
      <RepeatingSection name="relics">
        <RepeatingItem v-for="item in sheet.sections.relics.rows" :key="item._id" :row="item" name="relics"
          class="relics-item">
          <NotchContainer notchType="none">
          <Collapsible class="relic-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
            <template v-slot:collapsed>
              <span>{{ item.name }}</span>
            </template>
            <template v-slot:expanded>
              <input class="underline" type="text" v-model="item.name" placeholder=" Relic name">
              <textarea class="underline" v-model="item.description" placeholder=" Relic description"></textarea>
            </template>
          </Collapsible>
          </NotchContainer>
        </RepeatingItem>
      </RepeatingSection>
    </NotchContainer>
  </div>
  </div>

  <NotchContainer>
      <div class="flex-box half-gap flex-wrap grid-span-all justify-space-between">
      <LabelStacked>
        <template v-slot:number>
          <select class="underline" v-model="sheet.elemental_affinity">
            <option selected value="">Select Element</option>
            <option v-for="element in elements" :value="element.name" :key="element.name">{{ capitalize(element.name) }}</option>
          </select>
        </template>
        <template v-slot:label>
          <span class="elemental_label">Elemental Affinity</span>
        </template>
      </LabelStacked>
      <LabelStacked>
        <template v-slot:number>
          <input type="text" class="underline element-name-underline" v-model="sheet.element_name">
        </template>
        <template v-slot:label>
          <span class="elemental_label">Element Name</span>
        </template>
      </LabelStacked>
      </div>
      <!-- Elemental Enhancements Dropdown (filtered by selected element) -->
      <div>
      <NotchContainer class=elemental_enhancements notch="5">
        <select v-model="sheet.elemental_enhancement_1">
          <option selected value="">Select Enhancement</option>
          <option v-for="enhancement in availableEnhancements" :key="enhancement.description" :value="enhancement.attribute">{{ enhancement.description }}</option>
        </select>
      </NotchContainer>
      </div>
      <div>
      
      <NotchContainer class=elemental_enhancements notch="5">
        <select v-model="sheet.elemental_enhancement_2">
          <option selected value="">Select Enhancement</option>
          <option v-for="enhancement in availableEnhancements" :key="enhancement.description" :value="enhancement.attribute">{{ enhancement.description }}</option>
        </select>
      </NotchContainer>
      </div>
      <span class="elemental_label">Roll to Resist Proficiency</span>
      <NotchContainer class=elemental_enhancements notch="5">
                <select v-model="sheet.roll_resist_proficiency">
                  <option selected value="">Select Roll to Resist Proficiency</option>
                  <option v-for="proficiency in availableResistProficiency" :value="proficiency" :key="proficiency">{{ proficiency }}</option>
                </select>
              </NotchContainer>
  </NotchContainer>
  <NotchContainer>
    <div class="flex-box half-gap flex-wrap grid-span-all justify-space-between">
      <LabelStacked>
        <template v-slot:number>
          <input type="text" class="underline element-name-underline" v-model="sheet.magic_style">
        </template>
        <template v-slot:label>
          <span class="elemental_label">Magic Style</span>
        </template>
      </LabelStacked>
      <LabelStacked>
        <template v-slot:number>
          <select class="underline" v-model="sheet.mam">
            <option selected value="">Select Ability</option>
            <option v-for="(o,ability) in sheet.abilityScores" :key="ability.name" :value="ability">{{ capitalize(ability) }}</option>
          </select>
        </template>
        <template v-slot:label>
          <span class="elemental_label">Magic Ability Modifier</span>
        </template>
      </LabelStacked>
      </div>
  </NotchContainer>

</template>

<style lang="scss">
.knight-view {
  position: relative;
  display: grid;
  gap: var(--half-gap);
  grid-auto-flow: dense;
  > .split-display{
    grid-column: 1 / -1;
    max-width: 90cap;
    grid-template-rows: auto;
  }

  @container (500px < width <=650px) {
    grid-template-columns: 1fr 1fr;
  }

  .skill-container {
    grid-column: 1;
  }
  .spell-path-container{
    display: grid;
    gap: var(--half-gap);
  }
  .spell-path-layout{
    display: grid;
    gap: var(--tiny-gap);
    grid-template-rows: repeat(7, auto);
    grid-template-columns: auto 1fr;
    grid-template-areas:
      ".      rep"
      "header rep"
      "header rep"
      "header rep"
      "header rep"
      "header rep"
      "header rep"
      "add    edit";
    grid-auto-flow: column;
  }
  .spell-tier-headers{
    grid-area: header;
    display: grid;
    grid-template-rows: subgrid;
  }

  .relics-section {
  grid-column: 1 / -1;
  
  .repcontainer {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-column: 1 / -1;
  }
  }
}
.elemental_enhancements {
    display: grid;
    grid-column: span;
    margin-top: 0.5cap;
  }
  .element-name-underline{
    text-align: center;
  }
  .elemental_label {
    font-weight: bold;
  }

/* Invisible div */
.invisible-div {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1%;
  z-index: 9999;
}

/* Hide the default checkbox appearance */
.floating-checkbox {
  position: absolute;
  opacity: 1; /* Hide the default checkbox */
  z-index: 9999;
}

/* Custom checkbox label */
.floating-checkbox + label {
  display: inline-block;
  width: 27px;  /* Set appropriate width */
  height: 27px;  /* Set appropriate height */
  background-color: transparent; /* No background initially */
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  cursor: pointer;
  transform: translate(325%, 155%);
  z-index: 9999;
}

/* Unchecked state (no image) */
.floating-checkbox + label {
  background-image: none; /* Unchecked image */
  z-index: 9998;
}

/* Checked state (image displayed) */
.floating-checkbox:checked + label {
  background-image: var(--blipCheckedImage); /* Checked image */
  z-index: 9998;
}

label.properties-header{
  color: var(--header-blue);
}

h4{
  color: var(--header-blue);
}

.grow-label{
  color: var(--header-blue);
}

.input-field{
  color: var(--color);
}

input{
  color: var(--lm-color);
}

.damage-type-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  margin-left: 4px;

  &.physical {
    background: #666;
    color: white;
  }

  &.magical {
    background: #6a1b9a;
    color: white;
  }

  &.true {
    background: #c62828;
    color: white;
  }
}

.qualities-summary {
  font-size: 0.7rem;
  color: #666;
  font-style: italic;
  margin-left: 4px;
}

.soul-gun-container {
  .collapsed-gun-actions {
    display: flex;
    align-items: center;
    gap: 4px;

    .gun-roll-btn {
      padding: 2px 8px;
      font-size: 0.75rem;
      background: var(--header-blue);
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }

    .gun-name {
      font-weight: bold;
      margin-left: 4px;
    }
  }
}

html.dark {
  .qualities-summary {
    color: #aaa;
  }
}

.magical-implement-container {
  .implement-name {
    font-weight: bold;
  }

  .mana-attunement-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
    background: #1565c0;
    color: white;
    margin-left: 4px;
  }
}

</style>