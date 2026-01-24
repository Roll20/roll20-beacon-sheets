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
import ReleaseMagic from '@/components/ReleaseMagic.vue';
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

// Watch for changes in elemental affinity and reset enhancements, resist proficiency, and branching element
watch(() => sheet.elemental_affinity, (newAffinity) => {
    sheet.elemental_enhancement_1 = '';
    sheet.elemental_enhancement_2 = '';
    sheet.roll_resist_proficiency = '';
    sheet.branchingElement = '';
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
  <div v-if="sheet.soulArmamentWeaponBonus || sheet.soulArmamentArmorBonus" class="armament-tier-info">
    <span v-if="sheet.soulArmamentWeaponBonus">Weapon +{{ sheet.soulArmamentWeaponBonus }}</span>
    <span v-if="sheet.soulArmamentArmorBonus">Armor +{{ sheet.soulArmamentArmorBonus }}</span>
    <span class="armament-label">Soul Armament (Rep {{ sheet.reputation }})</span>
  </div>

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

  <NotchContainer class="visor-container basic-item" width="thick" notchType="curve">
    <h4>Visor</h4>
    <div class="visor-selector">
      <select class="underline" v-model="sheet.visor.type">
        <option v-for="(data, key) in sheet.visorData" :key="key" :value="key">{{ data.name }}</option>
      </select>
      <p v-if="sheet.activeVisorEffect" class="visor-effect">{{ sheet.activeVisorEffect }}</p>
    </div>
  </NotchContainer>

  <NotchContainer class="soul-gun-container basic-item" width="thick" notchType="curve">
    <h4>Soul Gun</h4>
    <Collapsible class="basic-item" :default="sheet.soul_gun.collapsed" @collapse="sheet.soul_gun.collapsed = !sheet.soul_gun.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label for="soul-gun-name">Name</label>
          <input class="input-field" type="text" v-model="sheet.soul_gun.name" id="soul-gun-name">
        </div>
        <GunQualitiesSelector />
      </template>
      <template v-slot:collapsed>
        <div class="collapsed-gun-actions">
          <button class="gun-roll-btn" @click="sheet.rollGunRapidFire">RF</button>
          <button class="gun-roll-btn" @click="sheet.rollGunMagDump" :disabled="!sheet.soul_gun.hasReloaded || sheet.gunTypeStats.md === 0">MD</button>
          <button class="gun-roll-btn" @click="sheet.rollGunDamage">Dmg</button>
          <span class="gun-name">{{ sheet.soul_gun.name || sheet.gunTypeStats.name }}</span>
        </div>
        <span class="gun-type-tag">{{ sheet.gunTypeStats.abbr }}</span>
        <span class="gun-range-tag">{{ sheet.gunTypeStats.eRange }}ft</span>
        <span v-if="!sheet.soul_gun.hasReloaded" class="reload-warning">Needs Reload</span>
      </template>
    </Collapsible>
  </NotchContainer>

<NotchContainer class="combat-form-container basic-item" width="thick" notchType="curve">
  <h4>Combat Forms</h4>
  <div class="combat-form-active">
    <label for="active-combat-form">Active Form</label>
    <select id="active-combat-form" v-model="sheet.activeCombatForm" class="underline">
      <option value="">None</option>
      <option v-for="(form, key) in sheet.combatFormData" :key="key" :value="key">
        {{ form.name }}
      </option>
    </select>
  </div>
  <div v-if="sheet.activeCombatForm && sheet.combatFormData[sheet.activeCombatForm]" class="combat-form-detail">
    <p class="form-effect">{{ sheet.combatFormData[sheet.activeCombatForm].description }}</p>
    <p v-if="sheet.combatFormMastery[sheet.activeCombatForm]" class="form-mastery-effect">Mastery: {{ sheet.combatFormData[sheet.activeCombatForm].mastery }}</p>
  </div>
  <div class="combat-form-mastery-list">
    <label class="properties-header">Mastery</label>
    <div class="form-mastery-grid">
      <label v-for="(form, key) in sheet.combatFormData" :key="key" class="form-mastery-item" :title="form.name">
        <input type="checkbox" v-model="sheet.combatFormMastery[key]">
        <span class="form-numeral">{{ key.replace('form', '') }}</span>
      </label>
    </div>
  </div>
  <Collapsible class="form-notes-section basic-item" :default="true">
    <template v-slot:expanded>
      <label class="properties-header">Custom Form Notes</label>
      <RepeatingSection name="forms">
        <RepeatingItem name="forms" v-for="item in sheet.sections.forms.rows" :key="item._id" :row="item">
          <div class="form-note-item">
            <input type="text" class="underline" v-model="item.name" placeholder="Form name">
            <textarea class="underline" v-model="item.description" placeholder="Notes"></textarea>
            <button class="delete-button material-symbols-outlined" @click="sheet.removeRow('forms', item._id)">delete_forever</button>
          </div>
        </RepeatingItem>
      </RepeatingSection>
    </template>
    <template v-slot:collapsed>
      <span>Custom Notes ({{ sheet.sections.forms.rows.length }})</span>
    </template>
  </Collapsible>
</NotchContainer>

<NotchContainer class="level-abilities-container basic-item" width="thick" notchType="curve">
  <h4>Level Abilities</h4>
  <div class="level-abilities-list">
    <div
      v-for="(ability, key) in sheet.levelAbilityData"
      :key="key"
      class="level-ability-item"
      :class="{ unlocked: sheet.levelAbilities[key], locked: !sheet.levelAbilities[key] }"
    >
      <span class="ability-level-badge">{{ ability.level }}</span>
      <span class="ability-name">{{ ability.name }}</span>
      <span class="ability-desc">{{ ability.description }}</span>
      <label v-if="key === 'energySurge' && sheet.levelAbilities[key]" class="ability-toggle">
        <input type="checkbox" v-model="sheet.energySurgeUsed" />
        <span>Used</span>
      </label>
      <label v-if="key === 'flight' && sheet.levelAbilities[key]" class="ability-toggle">
        <input type="checkbox" v-model="sheet.isFlying" />
        <span>Active</span>
      </label>
    </div>
  </div>
</NotchContainer>


  <NotchContainer class="arm-rune-container basic-item" width="thick" notchType="curve">
    <div class="rune-header-row">
      <h4>Soul Armament Runes</h4>
      <span class="rune-capacity" :class="{ 'over-capacity': sheet.runesOverCapacity }">
        Slots: {{ sheet.runeSlotsUsed }}/{{ sheet.runeSlotCapacity }}
      </span>
    </div>
    <div v-if="sheet.runesOverCapacity" class="rune-warning">Over capacity! Max slots = Reputation Level</div>
    <RepeatingSection name="runes">
      <RepeatingItem name="runes" v-for="item in sheet.sections.runes.rows" :key="item._id" :row="item">
        <Collapsible class="form-item basic-item" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
          <template v-slot:expanded>
            <div class="flex-box half-gap grow-label">
              <label :for="`rune-${item._id}-name`">Name</label>
              <input class="underline" type="text" v-model="item.name" :id="`rune-${item._id}-name`">
            </div>
            <div class="flex-box half-gap grow-label">
              <label :for="`rune-${item._id}-slots`">Slots</label>
              <select class="underline" v-model="item.slotCost" :id="`rune-${item._id}-slots`">
                <option :value="1">1</option>
                <option :value="2">2</option>
                <option :value="3">3</option>
              </select>
            </div>
            <div class="grid">
              <label class="properties-header" :for="`rune-${item._id}-description`">Description</label>
              <textarea class="underline" :id="`rune-${item._id}-description`" v-model="item.description"></textarea>
            </div>
          </template>
          <template v-slot:collapsed>
            <span>{{ item.name || 'New Rune' }} <span class="rune-slot-badge">({{ item.slotCost || 1 }})</span></span>
          </template>
          <!-- Delete button -->
          <div class="repcontrol">
            <button class="delete-button material-symbols-outlined" @click="sheet.removeRow('runes', item._id)">delete_forever</button>
          </div>
        </Collapsible>
      </RepeatingItem>
    </RepeatingSection>
  </NotchContainer>

  <NotchContainer class="summon-container basic-item" width="thick" notchType="curve">
    <div class="summon-header-row">
      <h4>Elemental Summon</h4>
      <label class="summon-active-toggle">
        <input type="checkbox" v-model="sheet.elementalSummon.active" />
        <span>Active</span>
      </label>
    </div>
    <Collapsible class="basic-item" :default="sheet.elementalSummon.collapsed" @collapse="sheet.elementalSummon.collapsed = !sheet.elementalSummon.collapsed">
      <template v-slot:expanded>
        <div class="flex-box half-gap grow-label">
          <label for="summon-name">Name</label>
          <input class="underline" type="text" v-model="sheet.elementalSummon.name" id="summon-name">
        </div>
        <div class="summon-stats-grid">
          <label>HP</label>
          <input type="number" class="underline" v-model.number="sheet.elementalSummon.hp">
          <span>/</span>
          <input type="number" class="underline" v-model.number="sheet.elementalSummon.hpMax">
          <label>Armor</label>
          <input type="number" class="underline" v-model.number="sheet.elementalSummon.armor">
          <label>Attack</label>
          <input type="number" class="underline" v-model.number="sheet.elementalSummon.attack">
          <label>Damage</label>
          <input type="text" class="underline" v-model="sheet.elementalSummon.damage">
          <label>Move</label>
          <input type="number" class="underline" v-model.number="sheet.elementalSummon.move">
        </div>
        <div class="grid">
          <label class="properties-header" for="summon-description">Notes</label>
          <textarea class="underline" id="summon-description" v-model="sheet.elementalSummon.description"></textarea>
        </div>
      </template>
      <template v-slot:collapsed>
        <span>{{ sheet.elementalSummon.name || 'No Summon' }}
          <span v-if="sheet.elementalSummon.active" class="summon-active-badge">Active</span>
        </span>
      </template>
    </Collapsible>
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
  <!-- Release Magic System (shown when magic_style is 'Release') -->
  <ReleaseMagic v-if="sheet.magic_style === 'Release'" />

  <!-- Traditional Spell Paths (shown for all other magic styles) -->
  <NotchContainer v-else class="spell-container" width="thick" notchType="curve">
    <h3>Spell Paths</h3>
    <div class="spell-paths-known">
      <label class="paths-known-label">Paths Known
        <span class="paths-count" :class="{ 'over-max': sheet.spellPathsOverMax }">
          {{ sheet.spellPathsCount }}/{{ sheet.maxSpellPaths }}
        </span>
      </label>
      <div v-if="sheet.spellPathsOverMax" class="paths-warning">
        Over max! {{ sheet.maxSpellPaths }} paths allowed at level {{ sheet.level }}
      </div>
    </div>
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
      <div class="relic-header-row">
        <h4>relics</h4>
        <span class="relic-capacity" :class="{ 'over-capacity': sheet.relicsOverCapacity }">
          {{ sheet.relicCount }}/{{ sheet.relicCapacity }}
        </span>
      </div>
      <div v-if="sheet.relicsOverCapacity" class="relic-warning">Over capacity! Max relics = Reputation Level</div>
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
      <LabelStacked v-if="sheet.availableBranches.length > 0">
        <template v-slot:number>
          <select class="underline" v-model="sheet.branchingElement">
            <option value="">Select Branch</option>
            <option v-for="branch in sheet.availableBranches" :key="branch" :value="branch">{{ branch }}</option>
          </select>
        </template>
        <template v-slot:label>
          <span class="elemental_label">Branching Element</span>
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
      <div class="resist-modifiers">
        <span class="elemental_label">Resist Advantage / Disadvantage</span>
        <div class="resist-grid">
          <div v-for="type in ['physical', 'magic', 'horror', 'purity']" :key="type" class="resist-row">
            <span class="resist-type-label">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</span>
            <label class="resist-toggle" :class="{ active: sheet.resistModifiers[type].advantage }">
              <input type="checkbox" v-model="sheet.resistModifiers[type].advantage" />
              Adv
            </label>
            <label class="resist-toggle disadv" :class="{ active: sheet.resistModifiers[type].disadvantage || sheet.conditionResistDisadvantage[type] }">
              <input type="checkbox" v-model="sheet.resistModifiers[type].disadvantage" :disabled="sheet.conditionResistDisadvantage[type]" />
              Dis
            </label>
            <span v-if="sheet.conditionResistDisadvantage[type]" class="resist-condition-note">(Condition)</span>
          </div>
        </div>
      </div>
  </NotchContainer>
  <NotchContainer>
    <div class="flex-box half-gap flex-wrap grid-span-all justify-space-between">
      <LabelStacked>
        <template v-slot:number>
          <select class="underline element-name-underline" v-model="sheet.magic_style">
            <option value="">Select Magic Style</option>
            <option value="Ethereal">Ethereal</option>
            <option value="Memento">Memento</option>
            <option value="Shaper">Shaper</option>
            <option value="Soul">Soul</option>
            <option value="Verse">Verse</option>
            <option value="Release">Release</option>
          </select>
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
.armament-tier-info {
  display: flex;
  gap: var(--half-gap);
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  padding: 2px var(--half-gap);
  opacity: 0.85;
  span {
    padding: 1px 5px;
    background: rgba(100, 150, 200, 0.12);
    border-radius: 3px;
  }
  .armament-label {
    font-style: italic;
    background: none;
    opacity: 0.7;
  }
}
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
  .spell-paths-known {
    margin-bottom: var(--half-gap);
    padding: var(--half-gap);
    border: 1px solid var(--border);
    border-radius: 4px;
    .paths-known-label {
      font-weight: bold;
      font-size: 0.9em;
      display: flex;
      align-items: center;
      gap: var(--half-gap);
      margin-bottom: var(--tiny-gap);
    }
    .paths-count {
      font-size: 0.85em;
      padding: 1px 6px;
      border-radius: 3px;
      background: rgba(100, 200, 100, 0.15);
      &.over-max {
        background: rgba(200, 50, 50, 0.15);
        color: var(--error, #c33);
      }
    }
    .paths-warning {
      margin-top: var(--tiny-gap);
      font-size: 0.8em;
      color: var(--error, #c33);
    }
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

  .relic-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h4 { margin: 0; }
  }

  .relic-capacity {
    font-size: 0.85em;
    font-weight: bold;
    padding: 1px 6px;
    border-radius: 3px;
    background: rgba(100, 200, 100, 0.15);
    &.over-capacity {
      background: rgba(200, 80, 80, 0.2);
      color: #e55;
    }
  }

  .relic-warning {
    font-size: 0.8em;
    color: #e55;
    font-style: italic;
    padding: 2px 0;
  }

  .repcontainer {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-column: 1 / -1;
  }
  }
}
.rune-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  h4 { margin: 0; }
}
.rune-capacity {
  font-size: 0.85em;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(100, 200, 100, 0.15);
  &.over-capacity {
    background: rgba(200, 80, 80, 0.2);
    color: #e55;
  }
}
.rune-warning {
  font-size: 0.8em;
  color: #e55;
  font-style: italic;
  padding: 2px 0;
}
.rune-slot-badge {
  font-size: 0.8em;
  opacity: 0.7;
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

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .gun-name {
      font-weight: bold;
      margin-left: 4px;
    }
  }

  .gun-type-tag {
    font-size: 0.7rem;
    font-weight: bold;
    padding: 1px 5px;
    background: var(--header-blue);
    color: white;
    border-radius: 3px;
  }

  .gun-range-tag {
    font-size: 0.7rem;
    padding: 1px 5px;
    background: rgba(74, 74, 138, 0.15);
    border-radius: 3px;
  }

  .reload-warning {
    font-size: 0.7rem;
    font-weight: bold;
    color: #c62828;
  }
}

html.dark {
  .qualities-summary {
    color: #aaa;
  }
}

.summon-container {
  .summon-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h4 { margin: 0; }
  }
  .summon-active-toggle {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.85em;
    cursor: pointer;
    input[type="checkbox"] { margin: 0; }
  }
  .summon-stats-grid {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    gap: 4px var(--half-gap);
    align-items: center;
    font-size: 0.9em;
    label { font-weight: 600; }
    input { max-width: 60px; }
  }
  .summon-active-badge {
    font-size: 0.75em;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(100, 200, 100, 0.3);
  }
}

.visor-container {
  .visor-selector {
    select { width: 100%; }
  }
  .visor-effect {
    font-size: 0.8em;
    margin: 4px 0 0;
    opacity: 0.8;
    font-style: italic;
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

.combat-form-container {
  .combat-form-active {
    display: flex;
    align-items: center;
    gap: var(--half-gap);
    margin-bottom: 4px;

    label {
      font-weight: bold;
      white-space: nowrap;
    }

    select {
      flex: 1;
    }
  }

  .combat-form-detail {
    padding: 4px 8px;
    margin-bottom: 6px;
    background: rgba(74, 74, 138, 0.08);
    border-radius: 4px;
    font-size: 0.85rem;

    .form-effect {
      margin: 2px 0;
    }

    .form-mastery-effect {
      margin: 2px 0;
      font-style: italic;
      color: #1565c0;
    }
  }

  .combat-form-mastery-list {
    margin-bottom: 6px;

    .form-mastery-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
    }

    .form-mastery-item {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 0.8rem;
      cursor: pointer;

      .form-numeral {
        font-weight: bold;
      }
    }
  }

  .form-notes-section {
    margin-top: 4px;
  }

  .form-note-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px;
    margin-bottom: 4px;

    input {
      grid-column: 1;
    }

    textarea {
      grid-column: 1;
      min-height: 2em;
    }

    .delete-button {
      grid-column: 2;
      grid-row: 1 / -1;
      align-self: center;
    }
  }
}

html.dark {
  .combat-form-detail {
    background: rgba(100, 100, 200, 0.15);

    .form-mastery-effect {
      color: #64b5f6;
    }
  }
}

.level-abilities-container {
  .level-abilities-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .level-ability-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.85em;

    &.locked {
      opacity: 0.4;
    }

    &.unlocked {
      opacity: 1;
    }
  }

  .ability-level-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(100, 100, 200, 0.3);
    font-size: 0.75em;
    font-weight: bold;
    flex-shrink: 0;
  }

  .ability-name {
    font-weight: 600;
    white-space: nowrap;
  }

  .ability-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85em;
  }

  .unlocked .ability-level-badge {
    background: rgba(100, 200, 100, 0.4);
  }

  .ability-toggle {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.85em;
    cursor: pointer;
    flex-shrink: 0;
    input[type="checkbox"] { margin: 0; }
  }
}


.resist-modifiers {
  margin-top: 4px;
}

.resist-grid {
  display: grid;
  gap: 2px;
  margin-top: 2px;
}

.resist-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85em;
}

.resist-type-label {
  min-width: 60px;
  font-weight: bold;
  font-size: 0.9em;
}

.resist-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.85em;
  opacity: 0.6;
  input {
    width: 12px;
    height: 12px;
  }
  &.active {
    opacity: 1;
    background: rgba(100, 200, 100, 0.2);
  }
  &.disadv.active {
    background: rgba(200, 100, 100, 0.2);
  }
}

.resist-condition-note {
  font-size: 0.75em;
  color: rgba(255, 100, 100, 0.8);
  font-style: italic;
}

</style>