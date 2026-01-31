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

// Watch for changes in elemental affinity and reset enhancements and resist proficiency
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
  <div v-if="sheet.soulArmamentWeaponBonus || sheet.soulArmamentArmorBonus" class="armament-tier-info">
    <span v-if="sheet.soulArmamentWeaponBonus">Weapon +{{ sheet.soulArmamentWeaponBonus }}</span>
    <span v-if="sheet.soulArmamentArmorBonus">Armor +{{ sheet.soulArmamentArmorBonus }}</span>
    <span class="armament-label">Soul Armament (Rep {{ sheet.reputation }})</span>
  </div>

  <div class="soul-armament-group grid-span-all">
    <h3 class="group-header">Soul Armament</h3>
    <div class="soul-armament-grid">
      <div class="soul-armament-left">
        <NotchContainer class="armor-weave-container basic-item" width="thick" notchType="curve">
          <h4>Soul Armor Weave</h4>
          <Collapsible class="basic-item" :default="sheet.armor_weave.collapsed" @collapse="sheet.armor_weave.collapsed = !sheet.armor_weave.collapsed">
            <template v-slot:expanded>
              <div class="flex-box half-gap grow-label">
                <label for="armor-weave-select">Weave</label>
                <select class="underline" id="armor-weave-select" v-model="sheet.armor_weave.selected">
                  <option value="">-- None --</option>
                  <option v-for="(data, key) in sheet.armorWeaveData" :key="key" :value="key">{{ data.name }} (Rep {{ data.rep }})</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <p v-if="sheet.armor_weave.selected && sheet.armor_weave.selected !== 'custom' && sheet.armorWeaveData[sheet.armor_weave.selected]" class="weave-effect-display">
                {{ sheet.armorWeaveData[sheet.armor_weave.selected].description }}
              </p>
              <template v-if="sheet.armor_weave.selected === 'custom'">
                <div class="flex-box half-gap grow-label">
                  <label for="armor-weave-name">Name</label>
                  <input class="underline" type="text" v-model="sheet.armor_weave.name" id="armor-weave-name">
                </div>
                <div class="grid">
                  <label class="properties-header" for="armor-weave-description">Description</label>
                  <textarea class="underline" id="armor-weave-description" v-model="sheet.armor_weave.description"></textarea>
                </div>
              </template>
            </template>
            <template v-slot:collapsed>
              <span>{{ sheet.armor_weave.selected && sheet.armor_weave.selected !== 'custom' && sheet.armorWeaveData[sheet.armor_weave.selected] ? sheet.armorWeaveData[sheet.armor_weave.selected].name : (sheet.armor_weave.name || 'No Weave') }}</span>
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
                <div class="repcontrol">
                  <button class="delete-button material-symbols-outlined" @click="sheet.removeRow('runes', item._id)">delete_forever</button>
                </div>
              </Collapsible>
            </RepeatingItem>
          </RepeatingSection>
        </NotchContainer>

        <NotchContainer class="combat-form-container basic-item" width="thick" notchType="curve">
          <h4>Combat Forms</h4>
          <Collapsible class="basic-item" :default="sheet.combatFormsCollapsed" @collapse="sheet.combatFormsCollapsed = !sheet.combatFormsCollapsed">
            <template v-slot:collapsed>
              <div class="combat-form-summary">
                <span v-if="sheet.activeCombatForm && sheet.combatFormData[sheet.activeCombatForm]" class="form-badge active-badge">Active</span>
                <span v-if="sheet.activeCombatForm && sheet.combatFormData[sheet.activeCombatForm]" class="form-badge form-name-badge">{{ sheet.combatFormData[sheet.activeCombatForm].name.split(' - ')[1] }}</span>
                <span v-if="sheet.activeCombatForm && sheet.combatFormMastery[sheet.activeCombatForm]" class="form-badge mastery-badge">Mastered</span>
                <span v-if="!sheet.activeCombatForm" class="form-badge inactive-badge">No Active Form</span>
              </div>
            </template>
            <template v-slot:expanded>
              <div v-if="sheet.activeCombatForm && sheet.combatFormData[sheet.activeCombatForm]" class="active-form-banner">
                <div class="banner-header">
                  <strong>{{ sheet.combatFormData[sheet.activeCombatForm].name }}</strong>
                  <button class="form-deactivate-btn" @click="sheet.activeCombatForm = ''" title="Deactivate form">&times;</button>
                </div>
                <p class="banner-description">{{ sheet.combatFormData[sheet.activeCombatForm].description }}</p>
                <p v-if="sheet.combatFormMastery[sheet.activeCombatForm]" class="banner-mastery">Mastery: {{ sheet.combatFormData[sheet.activeCombatForm].mastery }}</p>
              </div>
              <div class="combat-form-list">
                <div v-for="(form, key) in sheet.combatFormData" :key="key" class="form-row" :class="{ active: sheet.activeCombatForm === key }">
                  <button
                    class="form-activate-btn"
                    :class="{ active: sheet.activeCombatForm === key }"
                    @click="sheet.activeCombatForm = sheet.activeCombatForm === key ? '' : key"
                    :title="form.name"
                  >{{ key.replace('form', '') }}</button>
                  <span class="form-short-name">{{ form.name.split(' - ')[1] }}</span>
                  <label class="form-mastery-toggle" :title="'Mastery: ' + form.mastery">
                    <input type="checkbox" v-model="sheet.combatFormMastery[key]">
                    <span class="star-icon material-symbols-outlined" :class="{ mastered: sheet.combatFormMastery[key] }">star</span>
                  </label>
                </div>
              </div>
            </template>
          </Collapsible>
        </NotchContainer>
      </div>

      <div class="soul-armament-right">
        <NotchContainer class="soul-armament-mode-container basic-item" width="thick" notchType="curve">
          <div class="armament-mode-header">
            <select class="armament-mode-select" v-model="sheet.soulArmamentMode">
              <option value="weapon">Soul Weapon</option>
              <option value="gun">Soul Gun</option>
            </select>
          </div>

          <!-- SOUL WEAPON MODE -->
          <template v-if="sheet.soulArmamentMode === 'weapon'">
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
          </template>

          <!-- SOUL GUN MODE -->
          <template v-if="sheet.soulArmamentMode === 'gun'">
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
          </template>
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

        <NotchContainer class="magic-settings-container basic-item" width="thick" notchType="curve">
          <h4>Magic Settings</h4>
          <div class="flex-box half-gap grow-label">
            <label>Roll to Resist</label>
            <select class="underline" v-model="sheet.roll_resist_proficiency">
              <option selected value="">Select Proficiency</option>
              <option v-for="proficiency in availableResistProficiency" :value="proficiency" :key="proficiency">{{ proficiency }}</option>
            </select>
          </div>
          <div class="flex-box half-gap grow-label">
            <label>Magic Style</label>
            <select class="underline" v-model="sheet.magic_style">
              <option value="">Select Style</option>
              <option value="Ethereal">Ethereal</option>
              <option value="Memento">Memento</option>
              <option value="Shaper">Shaper</option>
              <option value="Soul">Soul</option>
              <option value="Verse">Verse</option>
              <option value="Release">Release</option>
            </select>
          </div>
          <div class="flex-box half-gap grow-label">
            <label>Magic Ability</label>
            <select class="underline" v-model="sheet.mam">
              <option selected value="">Select Ability</option>
              <option v-for="(o,ability) in sheet.abilityScores" :key="ability.name" :value="ability">{{ capitalize(ability) }}</option>
            </select>
          </div>
        </NotchContainer>

      </div>
    </div>
  </div>

  <div class="elemental-magic-group grid-span-all">
    <h3 class="group-header">Elemental &amp; Magic</h3>
    <div class="elemental-magic-grid">
      <div class="elemental-magic-left">
        <div class="flex-box half-gap flex-wrap grow-label">
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
        <NotchContainer class="elemental_enhancements" notch="5">
          <select v-model="sheet.elemental_enhancement_1">
            <option selected value="">Select Enhancement</option>
            <option v-for="enhancement in availableEnhancements" :key="enhancement.description" :value="enhancement.attribute">{{ enhancement.description }}</option>
          </select>
        </NotchContainer>
        <NotchContainer class="elemental_enhancements" notch="5">
          <select v-model="sheet.elemental_enhancement_2">
            <option selected value="">Select Enhancement</option>
            <option v-for="enhancement in availableEnhancements" :key="enhancement.description" :value="enhancement.attribute">{{ enhancement.description }}</option>
          </select>
        </NotchContainer>
      </div>
    </div>
  </div>

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

</template>

<style lang="scss">
.armament-tier-info {
  display: flex;
  gap: var(--half-gap);
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 600;
  padding: 4px var(--half-gap);
  grid-column: 1 / -1;
  span {
    padding: 2px 8px;
    background: rgba(100, 150, 200, 0.18);
    border-radius: 4px;
    color: var(--header-blue);
  }
  .armament-label {
    font-style: italic;
    font-weight: normal;
    background: none;
    opacity: 0.7;
    color: var(--color);
  }
}
.knight-view {
  position: relative;
  display: grid;
  gap: var(--gap, 8px);
  grid-auto-flow: dense;

  > .split-display{
    grid-column: 1 / -1;
    max-width: 90cap;
    grid-template-rows: auto;
  }

  .grid-span-all {
    grid-column: 1 / -1;
  }

  @container (width > 650px) {
    grid-template-columns: 1fr 1fr;
  }

  @container (500px < width <= 650px) {
    grid-template-columns: 1fr 1fr;
  }

  @container (width <= 500px) {
    grid-template-columns: 1fr;
    .soul-armament-grid,
    .elemental-magic-grid {
      grid-template-columns: 1fr;
    }
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

.group-header {
  color: var(--header-blue);
  font-size: 1.1em;
  font-weight: bold;
  margin: 0 0 var(--half-gap, 4px);
  padding-bottom: 2px;
  border-bottom: 1px solid var(--border, rgba(100, 100, 200, 0.2));
  display: flex;
  align-items: center;
  gap: 6px;
  &::before,
  &::after {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    background-image: var(--starImage);
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.6;
  }
}

.soul-armament-group {
  display: grid;
  gap: var(--half-gap, 4px);

  .soul-armament-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--half-gap, 4px);
  }

  .soul-armament-left,
  .soul-armament-right {
    display: grid;
    gap: var(--half-gap, 4px);
    align-content: start;
  }
}

.elemental-magic-group {
  display: grid;
  gap: var(--half-gap, 4px);

  .elemental-magic-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap, 8px);
  }

  .elemental-magic-left {
    display: grid;
    gap: var(--half-gap, 4px);
    align-content: start;
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
  color: var(--color);
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

.soul-armament-mode-container {
  .armament-mode-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--half-gap, 4px);
  }

  .armament-mode-select {
    font-size: 0.85rem;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--masterBack);
    border: 1px solid var(--borderColor);
    color: var(--color);
    cursor: pointer;
    width: 100%;
  }

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

.weave-effect-display {
  font-size: 0.8em;
  margin: 4px 0 0;
  padding: 4px 8px;
  border-left: 3px solid var(--theme-color, #666);
  opacity: 0.85;
  font-style: italic;
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
  .combat-form-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;

    .form-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .active-badge {
      background: var(--header-blue, #1565c0);
      color: white;
    }

    .form-name-badge {
      background: rgba(74, 74, 138, 0.12);
      color: var(--color, #333);
    }

    .mastery-badge {
      background: rgba(218, 165, 32, 0.15);
      color: #b8860b;
    }

    .inactive-badge {
      background: rgba(120, 120, 120, 0.12);
      color: #777;
    }
  }

  .active-form-banner {
    border-left: 3px solid var(--header-blue, #1565c0);
    padding: 6px 10px;
    margin-bottom: 8px;
    background: rgba(74, 74, 138, 0.06);
    border-radius: 0 4px 4px 0;

    .banner-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .form-deactivate-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #999;
      padding: 0 4px;
      line-height: 1;

      &:hover {
        color: #c62828;
      }
    }

    .banner-description {
      margin: 2px 0;
      font-size: 0.85rem;
    }

    .banner-mastery {
      margin: 2px 0;
      font-size: 0.85rem;
      font-style: italic;
      color: #1565c0;
    }
  }

  .combat-form-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
    padding-right: 24px;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
      background: rgba(74, 74, 138, 0.06);
    }

    &.active {
      background: rgba(21, 101, 192, 0.08);
    }
  }

  .form-activate-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid #aaa;
    background: transparent;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.15s;
    color: var(--color, #555);
    flex-shrink: 0;

    &:hover {
      border-color: var(--header-blue, #1565c0);
    }

    &.active {
      background: var(--header-blue, #1565c0);
      border-color: var(--header-blue, #1565c0);
      color: white;
    }
  }

  .form-short-name {
    flex: 1;
    font-size: 0.85rem;
  }

  .form-mastery-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;

    input {
      display: none;
    }

    .star-icon {
      font-size: 1.2rem;
      color: #ccc;
      transition: color 0.15s;

      &.mastered {
        color: #daa520;
      }
    }

    &:hover .star-icon {
      color: #daa520;
      opacity: 0.7;
    }

    &:hover .star-icon.mastered {
      opacity: 1;
    }
  }

}

html.dark {
  .combat-form-container {
    .active-form-banner {
      background: rgba(100, 100, 200, 0.12);

      .banner-mastery {
        color: #64b5f6;
      }
    }

    .form-badge.form-name-badge {
      background: rgba(100, 100, 200, 0.2);
      color: #ccc;
    }

    .form-badge.mastery-badge {
      background: rgba(218, 165, 32, 0.2);
      color: #daa520;
    }

    .form-badge.inactive-badge {
      background: rgba(150, 150, 150, 0.2);
      color: #aaa;
    }

    .form-row:hover {
      background: rgba(100, 100, 200, 0.1);
    }

    .form-row.active {
      background: rgba(100, 149, 237, 0.15);
    }

    .form-activate-btn {
      border-color: #666;

      &:hover {
        border-color: #64b5f6;
      }

      &.active {
        background: #1976d2;
        border-color: #1976d2;
      }
    }

    .form-mastery-toggle .star-icon {
      color: #555;

      &.mastered {
        color: #ffd54f;
      }
    }
  }
}

</style>