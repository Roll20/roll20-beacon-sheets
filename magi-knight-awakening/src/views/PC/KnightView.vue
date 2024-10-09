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

import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const knightAttributes = [
  {
    name: 'knight_armor',
    image: 'magi-knight-shield',
    crown: true,
    text: 'Armor',
    readonly: false
  },
  {
    name: 'knight_move',
    image: 'move',
    crown: false,
    text: 'Move',
    readonly: false
  },
  {
    name: 'knight_attack',
    image: 'attack',
    crown: false,
    text: 'Attack',
    readonly: false,
    click: () => sheet.rollKnightAttack()
  },
  {
    name: 'knight_damage',
    image: 'magi-knight-damage',
    crown: true,
    text: 'Damage',
    readonly: false
  }
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
  <SplitMods :attributes="knightAttributes" class="knight-split">
    <template v-slot:content>
      <ImageBackedLabel v-for="attr in ['Spell Attack']" :key="`${attr}-image-label`" image="bottle-left">
        <template v-slot:value>
          <span>{{ sheet[attr.replace(/\s+/g,'_').toLowerCase()] }}</span>
        </template>
        <template v-slot:text>
          <span>{{ attr }}</span>
        </template>
      </ImageBackedLabel>
      <ImageBackedLabel v-for="attr in ['Spell DC']" :key="`${attr}-image-label`" image="bottle-right">
        <template v-slot:value>
          <span>{{ sheet[attr.replace(/\s+/g,'_').toLowerCase()] }}</span>
        </template>
        <template v-slot:text>
          <span>{{ attr }}</span>
        </template>
      </ImageBackedLabel>
    </template>
  </SplitMods>
  <NotchContainer class="armor-weave-container basic-item" width="thick" notchType="curve">
    <h4>Soul Armor Weave</h4>
    <Collapsible class="basic-item" :default="sheet.armor_weave.collapsed" @collapse="sheet.armor_weave.collapsed = !sheet.armor_weave.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label :for="`armor-weave-name`">Name</label>
          <input class="underline" type="text" v-model="sheet.armor_weave.name" :id="`armor-weave-name`">
        </div>
        <div class="grid">
          <label :for="`armor-weave-description`">Description</label>
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
          <input type="text" v-model="sheet.soul_weapon.name" :id="`soul-weapon-name`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-weapon-range`">Range</label>
          <input type="text" v-model="sheet.soul_weapon.range" :id="`soul-weapon-range`">
        </div>
        <div class="flex-box half-gap grow-label">
          <label :for="`soul-weapon-damage`">Damage</label>
          <input type="text" v-model="sheet.soul_weapon.damage" :id="`soul-weapon-damage`">
        </div>
        <div class="grid">
          <label :for="`soul-weapon-qualities`">Qualities</label>
          <textarea :id="`soul-weapon-qualities`" v-model="sheet.soul_weapon.qualities"></textarea>
        </div>
      </template>
      <template v-slot:collapsed>
        <button @click="sheet.rollWeapon">{{ sheet.soul_weapon.name || 'New Weapon' }}</button>
        <span class="description-span">{{ sheet.soul_weapon.qualities }}</span>
      </template>
    </Collapsible>
    <!-- Static content here -->
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
            <label :for="`form-${item._id}-description`">Description</label>
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
              <label :for="`rune-${item._id}-description`">Description</label>
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
  width: 200px;
  height: 100px;
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

</style>