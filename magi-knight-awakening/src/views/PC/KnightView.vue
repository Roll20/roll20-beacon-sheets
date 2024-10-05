<script setup>

function capitalize(str) {
  if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
}

import { ref, computed } from 'vue';
import SplitMods from '@/components/SplitMods.vue';
import NotchContainer from '@/components/NotchContainer.vue';
import ImageBackedLabel from '@/components/ImageBackedLabel.vue';
import LabelStacked from '@/components/LabelStacked.vue';
import RepeatingSection from '@/components/RepeatingSection.vue';
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import SpellSection from '@/components/SpellSection.vue';
import KnightViewBackgroundItems from '@/components/KnightViewBackgroundItems.vue';

import { useSheetStore } from '@/stores/sheetStore';

const sheet = useSheetStore();
const knightAttributes = [
  {
    name: 'knight_armor',
    image: 'shield',
    crown: true,
    text: 'armor',
    readonly: false
  },
  {
    name: 'knight_move',
    image: 'complex-hex',
    crown: false,
    text: 'move',
    readonly: false
  },
  {
    name: 'knight_attack',
    image: 'target',
    crown: false,
    text: 'attack',
    readonly: false
  },
  {
    name: 'knight_damage',
    image: 'thorns',
    crown: false,
    text: 'damage',
    readonly: false
  }
];
// Elements with enhancements
const elements = [
  {
    name: 'earth',
    description: 'solid',
    enhancements: [
      { description: "+1 HP per Level", attribute: "hpPerLevel" },
      { description: "+1 to Athletics and Medicine", attribute: "athleticsMedicine" },
      { description: "+1 Armor", attribute: "armor" },
      { description: "Reduce Armor by 1, Gain 10 Move (Select Additional Enhancement)", attribute: "armorMove" }
    ]
  },
  {
    name: 'fire',
    description: 'destructive',
    enhancements: [
      { description: "+1 HP per Level", attribute: "hpPerLevel" },
      { description: "+10 to Move", attribute: "move" },
      { description: "+1 to Athletics and Performance", attribute: "athleticsPerformance" },
      { description: "Gain +1 per Reputation Level to all weapon and spell damage", attribute: "repDamage" }
    ]
  },
  {
    name: 'air',
    description: 'incorporeal',
    enhancements: [
      { description: "+1 HP per Level", attribute: "hpPerLevel" },
      { description: "+10 to Move", attribute: "move" },
      { description: "+1 Armor", attribute: "armor" },
      { description: "+1 to Athletics and Stealth", attribute: "athleticsStealth" }
    ]
  },
  {
    name: 'water',
    description: 'shifting',
    enhancements: [
      { description: "+1 MP per Level", attribute: "mpPerLevel" },
      { description: "+10 to Move", attribute: "move" },
      { description: "+1 Armor", attribute: "armor" },
      { description: "+1 to Coordination and Creativity", attribute: "coordinationCreativity" }
    ]
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
    ]
  }
];

// Compute the available enhancements based on the selected element
const availableEnhancements = computed(() => {
  const element = elements.find(el => el.name === sheet.elemental_affinity);
  return element ? element.enhancements : [];
});

</script>

<template>
<div class="knight-view">

  <SplitMods :attributes="knightAttributes" class="knight-split">
    <template v-slot:content>
      <ImageBackedLabel v-for="attr in ['Spell Attack','Spell DC']" :key="`${attr}-image-label`" image="bottle">
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
  <div class="KnightViewBackgroundItems-view">
    <KnightViewBackgroundItems />
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
          <span>Elemental Affinity</span>
        </template>
      </LabelStacked>
      <LabelStacked>
        <template v-slot:number>
          <input type="text" class="underline right-align" v-model="sheet.element_name">
        </template>
        <template v-slot:label>
          <span>Element Name</span>
        </template>
      </LabelStacked>
      <!-- Elemental Enhancements Dropdown (filtered by selected element) -->
    <div class="elemental_enhancements">
      <NotchContainer notchType="none" width="500px">
        <select class="enhancements" v-model="sheet.elemental_enhancement_1">
          <option selected value="">Select Enhancement</option>
          <option v-for="enhancement in availableEnhancements" :key="enhancement.description" :value="enhancement.attribute">{{ enhancement.description }}</option>
        </select>
      </NotchContainer>
      <NotchContainer notchType="none" width="500px">
        <select class="elemental_enhancements" v-model="sheet.elemental_enhancement_2">
          <option selected value="">Select Enhancement</option>
          <option v-for="enhancement in availableEnhancements" :key="enhancement.description" :value="enhancement.attribute">{{ enhancement.description }}</option>
        </select>
      </NotchContainer>
    </div>
      <LabelStacked>
        <template v-slot:number>
          <input type="text" class="underline" v-model="sheet.magic_style">
        </template>
        <template v-slot:label>
          <span>Magic Style</span>
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
          <span>Magic Ability Modifier</span>
        </template>
      </LabelStacked>

    </div>
  </NotchContainer>
</template>

<style lang="scss">
.knight-view {
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
  .elemental_enhancements {
    min-width: 800px;
    grid-column: 1;
    align-items: stretch; 
    width: 100%; /* This makes the NotchContainer span the full width */
  }
}
</style>