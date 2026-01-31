# Magi-Knights Roll20 Beacon Sheet - Comprehensive Architectural Analysis

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Model Reference](#data-model-reference)
5. [Computed Properties & Formulas](#computed-properties--formulas)
6. [Roll System Reference](#roll-system-reference)
7. [Static Data Tables](#static-data-tables)
8. [Beacon SDK Integration](#beacon-sdk-integration)
9. [Vue Component Reference](#vue-component-reference)
10. [Dehydrate/Hydrate Reference](#dehydratehydrate-reference)
11. [Compendium Feature Map](#compendium-feature-map)
12. [Development & Build](#development--build)
13. [Known Technical Debt](#known-technical-debt)
14. [Appendix: Quick Reference Tables](#appendix-quick-reference-tables)

---

## Executive Summary

The Magi-Knights Awakening character sheet is a Vue 3 application built for the Roll20 Beacon SDK platform. It implements a tabletop RPG character sheet featuring dual-form characters (Student/Magi-Knight), a complex magic system with 11 spell paths, tactical combat mechanics including 10 combat forms and 8 combination maneuvers, and comprehensive NPC/Monster management with 5 ranks, 12 roles, and 6 size categories.

**Key Statistics:**
- ~3,940 lines in sheetStore.js
- 150+ reactive refs and computed properties
- 37 Vue components
- 18+ roll functions
- 9 repeating sections
- 11 spell paths with 6 tiers each
- 22 Release Magic cards
- 19 trackable conditions

---

## Technology Stack

### Core Framework
- **Vue 3.4.21** - Progressive JavaScript framework with Composition API
- **Vite 5.2.8** - Next-generation frontend build tool
- **Pinia 2.1.7** - Vue-native state management (Vuex successor)

### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| @roll20-official/beacon-sdk | ^0.0.12 | Roll20 VTT integration |
| vue-router | ^4.1.6 | Client-side routing |
| handlebars | ^4.7.8 | Roll template rendering |
| lodash | ^4.17.21 | Utility functions (debounce) |
| jsonpath | ^1.1.1 | Deep object access |
| uuid | ^9.0.1 | Unique ID generation |

### Development Tools
- **SASS** - CSS preprocessing for roll templates
- **Vue DevTools** - Development debugging
- **npm-run-all** - Parallel script execution

---

## Project Structure

```
magiknights/
├── src/
│   ├── main.js                 # Application entry point
│   ├── App.vue                 # Root component
│   ├── assets/                 # Static assets & CSS
│   │   ├── fonts.css           # @font-face declarations
│   │   ├── main.css            # Base styles, utility classes
│   │   └── variables.css       # CSS custom properties (theming)
│   ├── components/             # 37 reusable UI components
│   │   ├── AbilityScore.vue
│   │   ├── AbilityScoreSection.vue
│   │   ├── BackgroundItems.vue
│   │   ├── BaseSplit.vue
│   │   ├── Button.vue
│   │   ├── CloverDisplay.vue
│   │   ├── Collapsible.vue
│   │   ├── CombinationManeuvers.vue
│   │   ├── ConditionTracker.vue
│   │   ├── Crystal.vue
│   │   ├── EclipseChart.vue
│   │   ├── GoalTallies.vue
│   │   ├── GunQualitiesSelector.vue
│   │   ├── Header.vue
│   │   ├── HPContainer.vue
│   │   ├── ImageBackedLabel.vue
│   │   ├── ImplementQualitiesSelector.vue
│   │   ├── KnightNav.vue
│   │   ├── LabelStacked.vue
│   │   ├── MagiSquire.vue
│   │   ├── MasterHeader.vue
│   │   ├── Modal.vue
│   │   ├── NotchContainer.vue
│   │   ├── ReleaseMagic.vue
│   │   ├── RepeatingItem.vue
│   │   ├── RepeatingSection.vue
│   │   ├── RollModeToggle.vue
│   │   ├── ShardItem.vue
│   │   ├── Skill.vue
│   │   ├── SkillSection.vue
│   │   ├── SocialSection.vue
│   │   ├── SpellSection.vue
│   │   ├── SplitMods.vue
│   │   ├── SquadronFormations.vue
│   │   ├── TacticItem.vue
│   │   ├── TechniqueItem.vue
│   │   └── WeaponQualitiesSelector.vue
│   ├── views/                  # Page-level components
│   │   ├── PCView.vue          # Player character wrapper
│   │   ├── NPCView.vue         # Triple-view: NPC/Monster/Magi-Squire
│   │   └── PC/                 # PC sub-views
│   │       ├── BasicView.vue
│   │       ├── StudentView.vue
│   │       ├── KnightView.vue
│   │       ├── BackgroundView.vue
│   │       └── SettingsView.vue
│   ├── stores/                 # Pinia state stores
│   │   ├── index.js            # App store (orchestrator)
│   │   ├── metaStore.js        # Character metadata
│   │   ├── sheetStore.js       # Game-specific data (~3940 lines)
│   │   └── spellModal.js       # Modal state
│   ├── relay/                  # Beacon SDK integration
│   │   ├── index.js            # Relay configuration
│   │   └── handlers/           # SDK event handlers
│   │       ├── index.js
│   │       ├── onInit.js
│   │       ├── onChange.js
│   │       ├── onSettingsChange.js
│   │       ├── onSharedSettingsChange.js
│   │       ├── onTranslationsRequest.js
│   │       ├── onDragOver.js
│   │       └── computed.js     # Token bar linkage
│   ├── rollTemplates/          # Chat output templates
│   │   ├── index.js            # Handlebars setup
│   │   ├── templates/
│   │   │   ├── newRoll.hbs     # Base roll template
│   │   │   └── complex.hbs     # Extended template
│   │   ├── partials/
│   │   │   ├── header.hbs
│   │   │   ├── rollTotal.hbs
│   │   │   ├── rollComponents.hbs
│   │   │   ├── keyValues.hbs
│   │   │   ├── textContent.hbs
│   │   │   └── wrapper.hbs
│   │   ├── expressions/        # Handlebars helpers
│   │   │   ├── index.js
│   │   │   ├── sumComponents.js
│   │   │   ├── getDice.js
│   │   │   ├── isGreater.js
│   │   │   ├── isEqual.js
│   │   │   ├── isArray.js
│   │   │   ├── modifiers.js
│   │   │   └── capitalize.js
│   │   └── styles/
│   │       ├── host.scss
│   │       └── common.scss
│   ├── data/
│   │   └── spellPathData.js    # Spell path definitions
│   └── utility/                # Helper functions
│       ├── index.js
│       ├── objectify.js        # Array/Object conversion
│       ├── getRollResults.js   # Dice roll processing
│       └── rollToChat.js       # Chat posting
├── compendium/                 # Game data (JSON)
│   ├── classes.json
│   ├── spells.json
│   ├── techniques.json
│   ├── monsters.json
│   ├── rules.json
│   ├── lists.json
│   └── magi-knights-compendium.json
├── public/                     # Static files
├── sheet.json                  # Roll20 sheet manifest
├── vite.config.js              # Build configuration
└── package.json
```

---

## Data Model Reference

### 4.1 Character Core Data

| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `sheet_mode` | `ref(string)` | `'pc'` | Sheet type: 'pc' or 'npc' |
| `character_name` | `ref(string)` | `''` | Character's name |
| `level` | `ref(number)` | `1` | Character level (1-15+) |
| `reputation` | `ref(number)` | `0` | Reputation Level (0-5) |
| `player` | `ref(string)` | `''` | Player name |
| `inspiration` | `ref(number)` | `0` | Inspiration points |
| `isTransformed` | `ref(boolean)` | `false` | Currently in Magi-Knight form |
| `studentTokenImage` | `ref(string)` | `''` | Token URL for Student form |
| `knightTokenImage` | `ref(string)` | `''` | Token URL for Knight form |

### 4.2 Resource Pools

#### Hit Points (HP) - Magi-Knight Form
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `hp.current` | `ref(number)` | `10` | Current HP |
| `hp.temp` | `ref(number)` | `0` | Temporary HP |
| `hp.max` | `computed` | Auto | Max HP (see formula below) |
| `hp_max_override` | `ref(string)` | `''` | Manual override for max HP |

#### Magic Points (MP)
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `mp.current` | `ref(number)` | `10` | Current MP |
| `mp.max` | `computed` | Auto | Max MP (see formula below) |
| `mp_max_override` | `ref(string)` | `''` | Manual override for max MP |

#### Student HP (SHP)
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `shp.current` | `ref(number)` | `10` | Current SHP |
| `shp.max` | `computed` | Auto | Max SHP (see formula below) |
| `shp_max_override` | `ref(string)` | `''` | Manual override for max SHP |

#### Attrition Tracking
| Ref Name | Type | Default | Range | Purpose |
|----------|------|---------|-------|---------|
| `stress` | `ref(number)` | `0` | 0-6 | Mental attrition; affects INT/WIS/CHA |
| `exhaustion` | `ref(number)` | `0` | 0-6 | Physical attrition; affects STR/DEX/CON |
| `gloom` | `ref(number)` | `0` | 0+ | Gloom Gems currency |
| `unity` | `ref(number)` | `0` | 0-4 | Unity Points (unlocked at Rep II) |

#### Tally Systems
| Ref Name | Type | Default | Max | Purpose |
|----------|------|---------|-----|---------|
| `budgetTallies` | `ref(number)` | `0` | None | Currency for gear/services |
| `trainingTallies` | `ref(number)` | `0` | 8 | XP counter (8 = level up) |
| `clubTallies` | `ref(number)` | `0` | 8 | Club XP (8 = Resounding Growth) |
| `resoundingGrowths` | `ref(number)` | `0` | None | Total club milestones achieved |
| `detentionTickets` | `ref(number)` | `0` | None | Detention obligations |

#### Fortune Pool
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `fortunePool` | `ref(number)` | `0` | Current Fortune points |
| `fortunePoolEnabled` | `ref(boolean)` | `false` | Has Fortune Box crystal |
| `fortunePoolMax` | `computed` | 0-6 | Max based on proficiency bonus |

### 4.3 Ability Scores & Skills

#### Six Core Abilities
| Ref Name | Type | Default | Modifier |
|----------|------|---------|----------|
| `strength` | `ref(number)` | `10` | `strengthMod` computed |
| `dexterity` | `ref(number)` | `10` | `dexterityMod` computed |
| `constitution` | `ref(number)` | `10` | `constitutionMod` computed |
| `intelligence` | `ref(number)` | `10` | `intelligenceMod` computed |
| `wisdom` | `ref(number)` | `10` | `wisdomMod` computed |
| `charisma` | `ref(number)` | `10` | `charismaMod` computed |

#### Ability Modifier Formula
```javascript
const abilityMod = computed(() => {
  const raw = Math.floor((abilityScore.value - 10) / 2);
  // Capped at +5 until "Exceed a Mortal's Limits" at Reputation Level IV
  return exceededMortalLimits.value ? raw : Math.min(raw, 5);
});
```

#### 17 Skills
Each skill has: `proficiency` (bool), `ability` (string), `overrideValue` (string), `value` (computed)

| Skill | Linked Abilities |
|-------|------------------|
| academic_arts | INT, WIS |
| athletics | DEX, STR |
| coordination | DEX |
| creativity | INT, WIS |
| deception | INT, CHA |
| influence | STR, CHA |
| insight | WIS |
| investigation | INT, WIS |
| leadership | CHA |
| medicine | INT, WIS |
| mysticism | INT |
| perception | WIS |
| performance | STR, DEX, CON, INT, WIS, CHA |
| persuasion | INT, WIS, CHA |
| purity | WIS, CHA |
| stealth | DEX |
| stem | INT |

#### Skill Value Formula
```javascript
skill.value = computed(() =>
  abilityScores[skill.ability.value].mod.value +
  (skill.proficiency.value ? proficiency.value : 0)
);
```

#### Skill Mastery
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `masteredSkill` | `ref(string)` | `''` | Skill key that receives mastery bonus |

Mastery Bonus: `+max(1, reputation)` to all rolls with the mastered skill

### 4.4 Soul Armaments

#### Soul Weapon
```javascript
const soul_weapon = {
  name: ref(''),
  range: ref(''),
  damage: ref(''),
  damageType: ref('physical'),  // 'physical', 'magical', 'true'
  qualities: ref({
    accurate: false,      // -2/-4 dmg for +1/+2 atk
    coupled: false,       // Split + Bonus Action secondary
    ensnaring: false,     // 16+: Target Restrained
    forceful: false,      // 16+: +1d6 damage
    massive: false,       // -1/-2 atk for +2/+4 dmg
    staggeringBlow: false, // 16+: Knock 10ft
    twoHanded: false,     // Requires both hands
    veilPiercing: false   // 1/encounter auto-hit
  }),
  collapsed: ref(true)
};
```

#### Soul Gun
```javascript
const soul_gun = {
  name: ref(''),
  gunType: ref('hdg'),        // hdg, smg, asr, dmr, stg, lmg, sda
  gunStyle: ref(''),          // Varies by gun type
  aimed: ref(false),          // Bonus Action: +1 to one die
  hasReloaded: ref(true),     // Must reload after Mag Dump
  firingPoolBonus: ref(0),    // Additional pool modifiers
  attachments: ref([]),       // Array of {name, type, effect}
  collapsed: ref(true)
};
```

#### Magical Implement
```javascript
const magical_implement = {
  name: ref(''),
  description: ref(''),
  qualities: ref({
    cardConductor: false,     // Required for Divination/Release Magic
    embolden: false,          // +Level to spell damage
    light: false,             // One hand, no weapon limit
    manaAttunement: false,    // MP = MCO × 3 (not × 2)
    manaConduit: false,       // 1/Sleep: -1 Tier MP cost
    radiance: false,          // +1+Level to healing
    twoHanded: false,         // Requires both hands
    warding: false            // Reduce spell damage by ½Level
  }),
  collapsed: ref(true)
};
```

### 4.5 Magic System

#### Magic Configuration
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `elemental_affinity` | `ref(string)` | `''` | Primary element |
| `magic_style` | `ref(string)` | `''` | Magic style (Enchanter, etc.) |
| `element_name` | `ref(string)` | `''` | Custom element name |
| `mam` | `ref(string)` | `''` | Magic Ability Modifier (ability key) |
| `max_spell_tier` | `computed` | 1-6 | Highest unlocked spell tier |

#### Spell Tier Unlock by Level
```javascript
const levelSpellDict = [,1,1,2,2,3,3,4,4,4,4,5,5,5,6,6];
// Level:  1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
// Tier:   1 1 2 2 3 3 4 4 4  4  5  5  5  6  6
```

**Note:** Tier VI requires Herald Bond Level IV+

#### 11 Canonical Spell Paths
```javascript
const CANONICAL_SPELL_PATHS = [
  'Beam', 'Explosion', 'Curing', 'Restoration', 'Amplify', 'Manipulate',
  'Barrier', 'Transformation', 'Summoning', 'Divination', 'Chronomancy'
];
```

#### Spell Path Limits
```javascript
const maxSpellPaths = computed(() => {
  if (level.value < 4) return 2;  // Levels 1-3: 2 paths
  if (level.value < 8) return 3;  // Levels 4-7: 3 paths
  return 4;                        // Levels 8+: 4 paths
});
```

#### Herald Bond System
```javascript
const herald = {
  name: ref(''),
  bondLevel: ref(1),    // Bond Level I-V (stored as 1-5)
  notes: ref('')
};
const tierVIUnlocked = computed(() => herald.bondLevel.value >= 4);
```

#### Release Magic System
```javascript
// 22 Release Magic cards with Triumvirate groupings
const releaseMagicDeck = ref([]);  // Array of card objects
const signatureCard1 = ref('');    // Level 5+ signature card
const signatureCard2 = ref('');    // Level 10+ signature card
const scalingValue = computed(() => Math.max(reputation.value, mamMod));
const handLimit = computed(() => 3 + Math.max(1, reputation.value));
```

### 4.6 Combat System

#### Roll Mode
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `rollMode` | `ref(string)` | `'normal'` | 'normal', 'advantage', 'disadvantage' |
| `forcedDisadvantage` | `computed` | - | True if stress/exhaustion >= 6 |
| `effectiveRollMode` | `computed` | - | Final mode after forced disadvantage |

#### 19 Conditions (3 Categories)
```javascript
const conditions = ref({
  // Mental (3)
  distressed: false,    // Disadv on Skill Checks and Attacks
  horrified: false,     // +1 Stress, Move 0, can't damage enemies
  berserk: false,       // Must attack, double STR damage

  // Physical (8)
  bleeding: false,      // (N)-CON damage per Action
  burning: false,       // (N) damage per Action + turn start
  disoriented: false,   // Disadv on Attacks, Physical Resists, Skills
  exposed: false,       // Only one Free Action, Prone
  paralyzed: false,     // No Actions, auto-hit
  prone: false,         // Disadv on ranged, melee adv vs you
  restrained: false,    // Move 0, Disadv on attacks/DEX
  unconscious: false,   // Knocked out, Prone, revert to Student

  // Depletion (8)
  depleted: false,      // Move 0, Disadv Attacks, no spells, Armor=10
  drained: false,       // Move 0, Disadv Attacks, +1 Tier MP cost
  poisoned: false,      // Stress damage per Action
  silenced: false,      // Can't speak or cast verbal spells
  soulSiphoned1: false, // Soul Siphoned I
  soulSiphoned2: false, // Soul Siphoned II
  soulSiphoned3: false, // Soul Siphoned III
  soulSiphoned4: false, // Soul Siphoned IV (Paralyzed + 1 Trauma)
  soulTainted: false    // Disadv vs Invading Evil, halved damage
});
```

#### Condition Computed Effects
```javascript
// Conditions causing disadvantage on YOUR attacks
const conditionDisadvantageOnAttacks = computed(() =>
  conditions.value.depleted || conditions.value.drained ||
  conditions.value.distressed || conditions.value.disoriented
);

// Conditions causing disadvantage on skill checks
const conditionDisadvantageOnSkillChecks = computed(() =>
  conditions.value.distressed || conditions.value.disoriented
);
```

#### Resist Modifiers (4 Types)
```javascript
const resistModifiers = ref({
  physical: { advantage: false, disadvantage: false },  // STR/DEX/CON
  magic: { advantage: false, disadvantage: false },     // INT/WIS/CHA
  horror: { advantage: false, disadvantage: false },    // WIS/CHA
  purity: { advantage: false, disadvantage: false }     // WIS/CHA
});
```

#### Combat Forms (10 Forms)
```javascript
const combatFormData = {
  formI: { name: 'Form I - Adaptation', description: '...', mastery: '...' },
  formII: { name: 'Form II - Deflection', ... },
  formIII: { name: 'Form III - Vindication', ... },
  formIV: { name: 'Form IV - Purgation', ... },
  formV: { name: 'Form V - Refraction', ... },
  formVI: { name: 'Form VI - Reflection', ... },
  formVII: { name: 'Form VII - Vibration', ... },
  formVIII: { name: 'Form VIII - Constellation', ... },
  formIX: { name: 'Form IX - Cessation', ... },
  formX: { name: 'Form X - Regulation', ... }  // Grants Soul Gun access
};

const activeCombatForm = ref('');
const combatFormMastery = ref({
  formI: false, formII: false, formIII: false, formIV: false, formV: false,
  formVI: false, formVII: false, formVIII: false, formIX: false, formX: false
});
```

#### Level-Locked Abilities (10 Abilities)
```javascript
const levelAbilityData = {
  energySurge: { level: 4, description: '1/Sleep: Recover HP/MP/Exhaustion/Stress' },
  counterBlast: { level: 5, description: 'Reaction: Counter spell with MP' },
  swiftAttack1: { level: 5, description: 'Weapon Attack as Bonus Action 1/round' },
  perfectParry: { level: 6, description: 'Negate weapon damage received' },
  extricateAether: { level: 6, description: 'Recover MP from defeated Outsiders' },
  heroicResolve: { level: 9, description: 'Enhanced condition resistance' },
  knightsInsight: { level: 9, description: 'Tactical info about enemies' },
  knightsResolution: { level: 9, description: 'Enhanced attrition resistance' },
  swiftAttack2: { level: 10, description: 'Additional Bonus Action attack' },
  flight: { level: 10, description: 'Fly speed = Move speed' }
};
```

### 4.7 Social System

#### Heart Stage Progression
```javascript
const heartStageData = [
  { value: 'threatening', label: 'Threatening', min: -999, max: -16 },
  { value: 'hostile', label: 'Hostile', min: -15, max: -6 },
  { value: 'cold', label: 'Cold', min: -5, max: -1 },
  { value: 'neutral', label: 'Neutral', min: 0, max: 5 },
  { value: 'warm', label: 'Warm', min: 6, max: 11 },
  { value: 'friendly', label: 'Friendly', min: 12, max: 19 },
  { value: 'sympathetic', label: 'Sympathetic', min: 20, max: 999 }
];
```

#### Social Bond Template
```javascript
// Used by sections['npc-social'] and sections['squadron-social']
template: {
  name: '',
  points: 0,              // Social Points
  heartStage: 'neutral',
  bond_ability: '',
  collapsed: false
}
```

#### Club Position System
```javascript
const clubPosition = ref('member');
const clubPositionData = {
  member: { name: 'Member', bonus: '' },
  vicePresident: { name: 'Vice-President', bonus: '+5 Influence with Faculty, 1/Sleep: Auto-pass Student Body Influence' },
  president: { name: 'President', bonus: '+4 Persuasion with club members, Grant VP benefits to others' }
};
```

### 4.8 NPC/Monster Data

#### Triple-View Architecture
```javascript
const npc_sheet_type = ref('monster');  // 'monster', 'npc', 'squire'
```

#### NPC Core Stats
| Ref Name | Type | Default | Purpose |
|----------|------|---------|---------|
| `npc_name` | `ref(string)` | `''` | NPC name |
| `npc_type` | `ref(string)` | `'vassal'` | Rank (horde/vassal/adversary/nemesis/harbinger) |
| `npc_size` | `ref(string)` | `'Medium'` | Size category |
| `npc_creature_type` | `ref(string)` | `'Outsider'` | Outsider or Mortal |
| `npc_role` | `ref(string)` | `'none'` | Role (12 options) |
| `npc_armor` | `ref(number)` | `10` | Base AC |
| `npc_move` | `ref(number)` | `30` | Movement speed |
| `npc_invasion_level` | `ref(number)` | `0` | Invasion Level |
| `npc_horrific_rating` | `ref(string)` | `''` | Horrific Rating |
| `npc_physical_check` | `ref(number)` | `0` | Physical check modifier |
| `npc_magical_check` | `ref(number)` | `0` | Magical check modifier |
| `npc_whisper_rolls` | `ref(boolean)` | `false` | GM-only rolls |

#### NPC Social View Fields
```javascript
const npc_social_name = ref('');
const npc_social_role = ref('');
const npc_social_heart_stage = ref('neutral');
const npc_social_sp = ref(0);
const npc_social_personality = ref('');
const npc_social_abilities = ref('');
const npc_social_notes = ref('');
```

#### Horde HP System
```javascript
const npc_hp = ref({ current: 10, max: 10 });  // Single pool
const npc_horde_hp = ref([
  { current: 12, max: 12, defeated: false },
  { current: 12, max: 12, defeated: false },
  { current: 12, max: 12, defeated: false },
  { current: 12, max: 12, defeated: false }
]);
const npc_active_units = computed(() => {
  if (npc_type.value !== 'horde') return 1;
  return npc_horde_hp.value.filter(unit => !unit.defeated && unit.current > 0).length;
});
```

#### NPC Attack Structure
```javascript
const npc_primary_attack = ref({
  name: 'Primary Attack',
  attackBonus: 0,
  attackDC: [12, 9, 6, 3],       // DC by active units (4,3,2,1)
  range: '5ft',
  damage: '1d6',
  hordeDamage: ['7', '5', '3', '1'],  // Damage by active units
  damageType: 'physical',
  special: ''
});
```

### 4.9 Magi-Squire Companion

```javascript
const squire = {
  name: ref(''),
  level: ref(1),
  healthBlips: ref([true, true, true, true, true, true]),  // 6 blips
  manaBlips: ref([true, true, true]),                       // 3 blips
  studentArmor: ref(13),
  knightArmor: ref(15),    // +2 vs melee
  spellPath1: ref(''),     // From: Beam, Explosion, Curing, Restoration
  spellPath2: ref(''),
  skills: ref(''),
  notes: ref(''),
  collapsed: ref(true)
};

// Damage scaling by mentor level
const squireDamage = computed(() => {
  const lvl = level.value;
  if (lvl >= 13) return '4d6';
  if (lvl >= 10) return '3d6+4';
  if (lvl >= 7) return '2d6+4';
  if (lvl >= 4) return '2d6+3';
  return '1d6+3';
});
```

### 4.10 Repeating Sections

| Section Name | Template Fields |
|--------------|-----------------|
| `techniques` | name, description, type, category, levelRequired, frequency, maxUses, usesRemaining, actionType, associatedRoll, collapsed |
| `tactics` | name, description, prerequisites, effectType, automaticBonus, active, collapsed |
| `shards` | name, description, rarity, cost, collapsed |
| `gear` | name, description, collapsed |
| `relics` | name, description, collapsed |
| `forms` | name, description, collapsed |
| `runes` | name, description, slotCost, collapsed |
| `spells` | name, range, tier_I_name through tier_VI_dice, pathSelection |
| `npc-social` | name, points, heartStage, bond_ability, collapsed |
| `squadron-social` | name, points, heartStage, bond_ability, collapsed |
| `club-goalTallies` | name, description, collapsed |

---

## Computed Properties & Formulas

### 5.1 Character Progression Formulas

#### Proficiency Bonus
```javascript
const proficiencyMap = { 0: 2, 1: 3, 2: 3, 3: 4, 4: 5, 5: 6 };
const proficiency = computed(() => {
  if (reputation.value > 5) return 6;
  if (reputation.value < 0) return 0;
  if (customProficiency.value) return customProficiency.value;
  return proficiencyMap[reputation.value];
});
```

| Reputation | Proficiency |
|------------|-------------|
| 0 | +2 |
| I (1) | +3 |
| II (2) | +3 |
| III (3) | +4 |
| IV (4) | +5 |
| V (5) | +6 |

#### Ability Modifier Cap
```javascript
const exceededMortalLimits = computed(() => reputation.value >= 4);
// Before Rep IV: max modifier = +5
// At Rep IV+: no cap
```

#### Statistic Increase Tracking
```javascript
const statIncreaseLevels = [3, 6, 9, 12, 15];
const statIncreasesApplied = computed(() => statIncreases.value.length);
const statIncreasesAvailable = computed(() =>
  statIncreaseLevels.filter(l => l <= level.value).length
);
const statIncreasesMissing = computed(() =>
  statIncreasesAvailable.value - statIncreasesApplied.value
);
```

### 5.2 Combat Stat Calculations

#### Magi-Knight HP Maximum
```javascript
// Formula: 10 + CON Mod + (Level - 1) × (6 + CON Mod)
const hp_max = computed({
  get() {
    if (hp_max_override.value !== '') return Number(hp_max_override.value);
    const conMod = constitutionMod.value;
    let hp = 10 + conMod + (level.value - 1) * (6 + conMod);

    // Tough as Nails Tactic: +2 Student HP + 2 HP/Level
    if (hasTacticActive('Tough as Nails')) {
      hp += 2 + (level.value * 2);
    }
    return hp;
  }
});
```

#### Student HP Maximum
```javascript
// Formula: 10 + CON Modifier + Reputation Level
const shp_max = computed({
  get() {
    if (shp_max_override.value !== '') return Number(shp_max_override.value);
    return 10 + constitutionMod.value + reputation.value;
  }
});
```

#### Magic Points Maximum
```javascript
// MCO = Level + MAM Modifier + Reputation Level
// Standard: MCO × 2
// With Mana Attunement: MCO × 3
const mp_max = computed({
  get() {
    if (mp_max_override.value !== '') return Number(mp_max_override.value);
    const mamMod = abilityScores[mam.value]?.mod.value || 0;
    let repBonus = reputation.value;

    // Adept of Magic Tactic: +1 Rep for MCO calculation
    if (hasTacticActive('Adept of Magic')) repBonus += 1;

    const mco = level.value + mamMod + repBonus;
    const multiplier = hasManaAttunement.value ? 3 : 2;
    return mco * multiplier;
  }
});
```

#### Student Damage
```javascript
// Formula: 1d4 + STR Modifier + Reputation Level
const student_damage = computed({
  get() {
    if (student_damage_override.value !== '') return student_damage_override.value;
    const bonus = strengthMod.value + reputation.value;
    return bonus >= 0 ? `1d4+${bonus}` : `1d4${bonus}`;
  }
});
```

#### Student Armor
```javascript
// Formula: 10 + CON Modifier + DEX Modifier
const student_armor = computed({
  get() {
    if (student_armor_override.value !== '') return Number(student_armor_override.value);
    return 10 + constitutionMod.value + dexterityMod.value;
  }
});
```

#### Student Attack
```javascript
// Formula: Proficiency Bonus + max(STR, DEX) Modifier
const student_attack = computed({
  get() {
    if (student_attack_override.value !== '') return Number(student_attack_override.value);
    const bestMod = Math.max(strengthMod.value, dexterityMod.value);
    return proficiency.value + bestMod;
  }
});
```

#### Knight Armor Total
```javascript
// Formula: knight_armor + Soul Armament Armor Bonus
const knightArmorTotal = computed(() =>
  Number(knight_armor.value) + soulArmamentArmorBonus.value
);
```

#### Spell Attack
```javascript
// Formula: Proficiency + MAM Modifier
const spell_attack = computed({
  get() {
    if (spell_attack_override.value !== '') return spell_attack_override.value;
    return proficiency.value + (abilityScores[mam.value]?.mod.value || 0);
  }
});
```

#### Spell DC
```javascript
// Formula: 8 + Proficiency + MAM Modifier
const spell_dc = computed({
  get() {
    if (spell_dc_override.value !== '') return Number(spell_dc_override.value);
    return 8 + proficiency.value + (abilityScores[mam.value]?.mod.value || 0);
  }
});
```

#### Initiative
```javascript
const initiative = computed({
  get() {
    if (initiative_override.value !== '') return initiative_override.value;
    let init = dexterityMod.value;

    // Magical Foresight Tactic: +MAM to initiative
    if (hasTacticActive('Magical Foresight')) {
      init += abilityScores[mam.value]?.mod.value || 0;
    }
    return init;
  }
});
```

### 5.3 Magic Stat Calculations

#### Implement Bonuses
```javascript
// Embolden: +Level to spell damage
const emboldenDamageBonus = computed(() =>
  hasEmbolden.value ? level.value : 0
);

// Radiance: +1+Level to healing spells
const radianceHealBonus = computed(() =>
  magical_implement.qualities.value.radiance ? 1 + level.value : 0
);

// Warding: Reduce spell damage by ½Level (min 1)
const wardingReduction = computed(() =>
  magical_implement.qualities.value.warding ? Math.max(1, Math.floor(level.value / 2)) : 0
);
```

#### Release Magic Scaling
```javascript
// Scaling Value (X): Higher of Reputation or MAM Modifier
const scalingValue = computed(() => {
  const mamMod = abilityScores[mam.value]?.mod.value || 0;
  return Math.max(reputation.value, mamMod);
});

// Hand Limit: 3 + Reputation Level (min 1)
const handLimit = computed(() => 3 + Math.max(1, reputation.value));
```

### 5.4 Condition Effects

#### Roll Dice Expression
```javascript
const getRollDice = (forceDisadvantage = false, forceAdvantage = false) => {
  let mode;
  if (forceDisadvantage && forceAdvantage) {
    mode = 'normal';  // Cancel out
  } else if (forceDisadvantage) {
    mode = 'disadvantage';
  } else if (forceAdvantage) {
    mode = 'advantage';
  } else {
    mode = effectiveRollMode.value;
  }

  switch (mode) {
    case 'advantage':
      return { formula: '2d20kh1', display: 'Advantage', isAdvantage: true };
    case 'disadvantage':
      return { formula: '2d20kl1', display: 'Disadvantage', isDisadvantage: true };
    default:
      return { formula: '1d20', display: '1d20' };
  }
};
```

#### Forced Disadvantage
```javascript
const forcedDisadvantage = computed(() =>
  stress.value >= 6 || exhaustion.value >= 6
);

const effectiveRollMode = computed(() => {
  if (forcedDisadvantage.value) return 'disadvantage';
  return rollMode.value;
});
```

### 5.5 Resource Tracking

#### Unity Points
```javascript
// Unlocked at Rep II, max = Rep - 1
const unityMax = computed(() => {
  if (reputation.value < 2) return 0;
  return reputation.value - 1;
});

const unityAvailable = computed(() => reputation.value >= 2);
```

#### Fortune Pool Max
```javascript
const fortunePoolMax = computed(() => {
  if (!fortunePoolEnabled.value) return 0;
  const lvl = level.value;
  if (lvl >= 17) return 6;
  if (lvl >= 13) return 5;
  if (lvl >= 9) return 4;
  if (lvl >= 5) return 3;
  return 2;
});
```

#### Relic/Rune Capacity
```javascript
const relicCapacity = computed(() => reputation.value);  // 0-5
const relicsOverCapacity = computed(() =>
  sections.relics.rows.value.length > relicCapacity.value
);

const runeSlotCapacity = computed(() => Math.max(1, reputation.value));  // 1-5
const runeSlotsUsed = computed(() =>
  sections.runes.rows.value.reduce((sum, rune) => sum + (Number(rune.slotCost) || 1), 0)
);
const runesOverCapacity = computed(() => runeSlotsUsed.value > runeSlotCapacity.value);
```

#### Eclipse/Corruption Tracking
```javascript
// Trauma: Eclipse blips in state 1 (solid dot)
const trauma = computed(() => eclipse_blips.value.filter(blip => blip === 1).length);

// Corruption: Eclipse blips in state 2 (X marks)
const corruptionCount = computed(() => eclipse_blips.value.filter(blip => blip === 2).length);

// Burnout: Eclipse blips in state 3 (scratched)
const burnoutLines = computed(() => eclipse_blips.value.filter(blip => blip === 3).length);

// Heartless Knight: 3+ corruption
const heartlessKnight = computed(() => corruptionCount.value >= 3);

// Fallen Knight: 5+ corruption
const fallenKnight = computed(() => corruptionCount.value >= 5);
```

---

## Roll System Reference

### 6.1 Core Roll Mechanics

#### Roll Results Processing
```javascript
// getRollResults(components, dispatch)
// Processes dice expressions via Beacon SDK
// Returns: { total, components }

// Component structure:
{
  label: string,           // Display name
  formula?: string,        // Dice expression (e.g., '2d20kh1')
  value?: number,          // Static modifier
  sides?: number,          // Alternative: die sides
  count?: number,          // Alternative: number of dice
  rollFormula?: boolean,   // If true, expand complex expressions
  isAdvantage?: boolean,   // Mark as advantage roll
  isDisadvantage?: boolean,// Mark as disadvantage roll
  alwaysShowInBreakdown: boolean
}
```

#### Roll Template Posting
```javascript
// rollToChat({ rollObj, customDispatch, rollType, whisper })
// Posts formatted roll to chat

// rollObj structure:
{
  title: string,           // Roll name
  subtitle?: string,       // Secondary info
  characterName: string,   // Who's rolling
  components: array,       // Dice/modifiers
  keyValues?: object,      // Additional key-value pairs
  textContent?: string     // Description text
}
```

### 6.2 Ability & Skill Rolls

#### rollAbility(name)
```javascript
// Components:
// 1. d20 (with advantage/disadvantage based on conditions and resist modifiers)
// 2. Ability Modifier
// 3. Roll to Resist bonus (if proficiency matches)
// 4. Endurance Die (1d6) if stress/exhaustion 1-5

// Condition integration:
// - Distressed/Disoriented → Disadvantage on skill checks
// - Resist modifiers checked when rolling to resist
```

#### rollSkill(name)
```javascript
// Components:
// 1. d20 (with condition-based disadvantage)
// 2. Ability Modifier
// 3. Proficiency Bonus (if proficient)
// 4. Mastery Bonus (if masteredSkill matches)
// 5. Endurance Die (1d6) if applicable

// Override: If skill.overrideValue set, uses that instead of calculated value
```

### 6.3 Attack Rolls

#### rollStudentAttack()
```javascript
// Dice: d20 (with condition disadvantage)
// Components:
// 1. d20 roll
// 2. Student Attack value (Prof + max(STR, DEX))
// Subtitle: "Student Persona"
```

#### rollKnightAttack()
```javascript
// Dice: d20 (with condition disadvantage)
// Components:
// 1. d20 roll
// 2. Knight Attack value
// 3. Soul Armament Weapon Bonus (if any)
// 4. Weapon Quality Bonus (if any)
// Subtitle: "Magi-Knight Persona"
// Shows Veil-Piercing availability if equipped
```

#### rollSpell(item, tier)
```javascript
// Dice: d20 (with condition disadvantage)
// Components:
// 1. d20 roll
// 2. MAM modifier
// 3. Proficiency bonus
// Plus separate damage roll if tier has dice
// Title: tier_X_name or "SpellPath tier"
// KeyValues: Range, Spell Effect Roll, Special, etc.
```

#### rollWeapon(item, tier)
```javascript
// Dice: d20 (with condition disadvantage)
// Components (Attack):
// 1. d20 roll
// 2. Knight Attack modifier
// Plus damage roll from soul_weapon.damage
// Shows: Range, Damage Type, Active Qualities
```

### 6.4 Damage Rolls

#### rollStudentDamage(notation)
```javascript
// Uses student_damage or provided notation
// Validates dice expression exists
// Posts with subtitle: "Student Persona - Physical"
// Always Physical damage type
```

#### rollKnightDamage(notation)
```javascript
// Uses knight_damage or provided notation
// Components:
// 1. Damage dice
// 2. Weapon Quality damage bonus (if any)
// Damage type from soul_weapon.damageType
// Subtitle: "Magi-Knight Persona - {type}"
```

### 6.5 Gun Rolls

#### rollGunRapidFire()
```javascript
// Firing Pool: {RF}d8 + DEX + Proficiency vs Armor
// RF = gun type's RF stat + firingPoolBonus
// KeyValues: E-Range, Damage, Direct Hit info, Mode
// Consumes 'aimed' if active (+1 to one die)
```

#### rollGunMagDump()
```javascript
// Requires hasReloaded = true
// Firing Pool: {MD}d8 + DEX + Proficiency vs Armor
// MD = effectiveMD (gun type MD, +1 for Akimbo)
// Sets hasReloaded = false after use
// KeyValues include "Reload Required"
```

#### rollGunDamage()
```javascript
// Uses gunTypeStats.damage
// Always Physical damage type
```

### 6.6 NPC Rolls

#### rollNPCAttack(attackType = 'primary')
```javascript
// For non-Horde:
//   Components: d20 + attackBonus
// For Horde:
//   Shows O-Attack DC based on active units
//   DC scales: [12, 9, 6, 3] for [4, 3, 2, 1] units
// Respects npc_whisper_rolls setting
```

#### rollNPCDamage(attackType = 'primary')
```javascript
// For non-Horde: rolls attack.damage expression
// For Horde: uses scaled damage by active units
// Shows damage type from attack configuration
```

#### rollNPCCheck(checkType = 'physical')
```javascript
// d20 + physical_check or magical_check modifier
// Title: "Physical Check" or "Magical Check"
```

#### rollNPCGloomGems()
```javascript
// Rolls npc_inert_spectral_energy (default '1d4')
// Title: "Inert Spectral Energy"
// Subtitle: "Gloom Gems Yield"
```

### 6.7 Special Rolls

#### rollInitiative()
```javascript
// d20 + initiative (DEX mod, +MAM if Magical Foresight active)
// Uses effectiveRollMode for advantage/disadvantage
// Title: "Roll Initiative"
```

#### Formation Functions
```javascript
// activateFormation(formationKey)
// - Sets activeFormation
// - Posts formation info to chat with computed effects
// - Effects scale with reputation

// deactivateFormation()
// - Clears activeFormation
// - Posts end message
```

#### Combination Maneuver Functions
```javascript
// executeManeuver(maneuverKey)
// - Posts maneuver details with computed effects
// - Includes unity cost, participants, special rolls
// - Effects scale with reputation and MAM
```

#### Release Magic Functions
```javascript
// playReleaseCard(cardId)
// - Calls rollReleaseCard for the card effect
// - Moves card to discard (or removed if ephemeral)

// rollReleaseCard(card)
// - Handles all 22 card types with specific dice/effects
// - Uses scalingValue for X values
// - Fate Die cards roll 1d20 with result tiers
```

### 6.8 Roll Template System

#### Template Types
- `newRoll.hbs` - Base roll template
- `complex.hbs` - Extended template

#### Partials
- `header.hbs` - Title/subtitle
- `rollTotal.hbs` - Total display
- `rollComponents.hbs` - Dice breakdown
- `keyValues.hbs` - Property list
- `textContent.hbs` - Description
- `wrapper.hbs` - Container

#### Handlebars Helpers
| Helper | Purpose |
|--------|---------|
| `sumComponents` | Calculate total from components |
| `getDice` | Extract dice from results |
| `isGreater` | Comparison helper |
| `isEqual` | Equality check |
| `isArray` | Array detection |
| `modifiers` | Format modifier signs |
| `capitalize` | Title case text |

---

## Static Data Tables

### 7.1 Progression Tables

#### Spell Tier by Level
| Level | Max Tier | Notes |
|-------|----------|-------|
| 1-2 | I | - |
| 3-4 | II | - |
| 5-6 | III | - |
| 7-10 | IV | - |
| 11-13 | V | - |
| 14-15 | VI | Requires Herald Bond IV+ |

#### Proficiency by Reputation
| Reputation | Proficiency |
|------------|-------------|
| 0 | +2 |
| I | +3 |
| II | +3 |
| III | +4 |
| IV | +5 |
| V | +6 |

#### Soul Armament Bonuses
```javascript
const soulArmamentData = {
  0: { weapon: 0, armor: 0 },
  1: { weapon: 1, armor: 0 },
  2: { weapon: 1, armor: 1 },
  3: { weapon: 2, armor: 1 },
  4: { weapon: 2, armor: 2 },
  5: { weapon: 3, armor: 3 }
};
```

#### Squire Damage by Level
| Level | Damage |
|-------|--------|
| 1-3 | 1d6+3 |
| 4-6 | 2d6+3 |
| 7-9 | 2d6+4 |
| 10-12 | 3d6+4 |
| 13+ | 4d6 |

### 7.2 Formation Data

```javascript
const formationData = {
  arrow: {
    name: 'Arrow Formation',
    type: 'Attack',
    cost: 2,
    shortEffect: (rep) => `+${2 * rep} damage`
  },
  victory: {
    name: 'Victory Formation',
    type: 'Defense',
    cost: 2,
    shortEffect: (rep) => `-${2 * rep} damage taken`
  },
  barrage: {
    name: 'Barrage Formation',
    type: 'Destruction',
    cost: 3,
    shortEffect: () => 'Full damage on Rushed spells'
  },
  diamond: {
    name: 'Diamond Formation',
    type: 'Restoration',
    cost: 3,
    shortEffect: (rep) => `Heal ${3 * rep} HP/turn`
  }
};
```

### 7.3 Combination Maneuver Data

| Maneuver | Participants | Unity | Action | Effect |
|----------|-------------|-------|--------|--------|
| Avenging Flare | 2 | 1 | Immediate | True Damage counter on ally exposure |
| Planetary Aegis | 2 | 1 | Bonus | 6×Rep Temp HP + Resistance |
| Starstorm Restoration | 2 | 1 | Standard | 5×Rep damage, 10×Rep healing |
| Blueshift Collision | 3 | 2 | Full-Round | Extra turn with doubled actions |
| Envoys of Hope | 3 | 2 | Bonus | 2×Rep d4 pool for rolls |
| Ultimate Radiant Reflection | 4 | 2 | Reaction | Negate/reflect spell + 4×Rep damage |
| Ringshine Nova | 4 | 3 | Full-Round | Massive AoE True Damage |
| Ringshine Zenith | 4 | 3 | Full-Round | Single-target devastation |

### 7.4 Combat Form Data

| Form | Name | Effect | Mastery |
|------|------|--------|---------|
| I | Adaptation | +1 Attack | +2 Attack |
| II | Deflection | +1 Armor | +2 Armor |
| III | Vindication | +2 dmg/Rep (1H) | +4 dmg + Vicious |
| IV | Purgation | Bonus: STR/DEX×Rep to Horde (2H) | +Prof to damage |
| V | Refraction | Reaction: Xd6 redirect | Xd8 instead |
| VI | Reflection | Reaction: Disadv vs ally (Shield) | 10ft range |
| VII | Vibration | Free attack on double hit (Coupled) | +2 dmg + Vicious |
| VIII | Constellation | Bonus: +1 DC/Atk/healing/dmg | Full-Round: +3 |
| IX | Cessation | Bonus: +1 Atk, +2 dmg, OR ally move | Full-Round: +3/+6 |
| X | Regulation | Grants Soul Gun access | +Rep damage on hits |

### 7.5 Gun Type Data

```javascript
const gunTypeData = {
  hdg: { name: 'Handgun', eRange: 20, damage: '1d6', rf: 2, md: 3, special: 'Gun Style choice' },
  smg: { name: 'Submachine Gun', eRange: 30, damage: '1d6', rf: 2, md: 4, special: 'Gun Style choice' },
  asr: { name: 'Assault Rifle', eRange: 40, damage: '1d8', rf: 2, md: 4, special: 'Covering Fire' },
  dmr: { name: 'Designated Marksman Rifle', eRange: 80, damage: '1d10', rf: 2, md: 3, special: 'Sighted + Prone' },
  stg: { name: 'Shotgun', eRange: 15, damage: '1d12', rf: 2, md: 3, special: 'Firing Spread' },
  lmg: { name: 'Light Machine Gun', eRange: 50, damage: '1d10', rf: 2, md: 5, special: 'Collateral + Bulky' },
  sda: { name: 'Sidearm', eRange: 20, damage: '1d4', rf: 2, md: 0, special: 'Reactionary Shot' }
};
```

### 7.6 Gun Style Data

```javascript
const gunStyleData = {
  akimbo: { name: 'Akimbo', applies: 'hdg', effect: 'MD ROF +1, Two-Handed' },
  aegis: { name: 'Aegis/Musketeer', applies: 'hdg', effect: 'Shield/Light + Bonus attack' },
  fastReload: { name: 'Fast Reload', applies: 'hdg', effect: 'Reload as Bonus Action' },
  mobile: { name: 'Mobile', applies: 'smg', effect: 'Move 10ft, no Provoke after MD' },
  hailOfBullets: { name: 'Hail of Bullets', applies: 'smg', effect: 'MD at 15ft: reroll one die' }
};
```

### 7.7 Armor Weave Data

```javascript
const armorWeaveData = {
  lustrous: { name: 'Lustrous Gemstone Weave', rep: 'I', ... },
  reflecting: { name: 'Reflecting Stardust Weave', rep: 'I', ... },
  lightning: { name: 'Lightning Dust Weave', rep: 'II', ... },
  shimmering: { name: 'Shimmering Moon Weave', rep: 'II', ... },
  singing: { name: 'Singing Steel Weave', rep: 'III', ... },
  starLithium: { name: 'Star Lithium Weave', rep: 'III', ... },
  phoenix: { name: 'Phoenix Imbued Weave', rep: 'IV', ... },
  starCrystal: { name: 'Star Crystal Weave', rep: 'IV', ... },
  soulCrystal: { name: 'Soul Crystal Weave', rep: 'V', ... }
};
```

### 7.8 NPC Role Modifiers

```javascript
const roleModifiers = {
  none: { ac: 0, hpPct: 0, atkBonus: 0, dprPct: 0 },
  assassin: { ac: 0, hpPct: -25, atkBonus: 3, dprPct: 0 },
  brute: { ac: 0, hpPct: 33, atkBonus: -3, dprPct: 0 },
  defender: { ac: 0, hpPct: 33, atkBonus: 0, dprPct: -25 },
  heavy: { ac: -4, hpPct: 33, atkBonus: 0, dprPct: 0 },
  lithe: { ac: 3, hpPct: -25, atkBonus: 0, dprPct: 0 },
  merciless: { ac: 0, hpPct: 0, atkBonus: -3, dprPct: 33 },
  savage: { ac: -4, hpPct: 0, atkBonus: 0, dprPct: 33 },
  skirmisher: { ac: 0, hpPct: -25, atkBonus: 0, dprPct: 33 },
  striker: { ac: -4, hpPct: 0, atkBonus: 3, dprPct: 0 },
  tank: { ac: 3, hpPct: 0, atkBonus: -3, dprPct: 0 },
  vanguard: { ac: 3, hpPct: 0, atkBonus: 0, dprPct: -25 },
  watcher: { ac: 0, hpPct: 0, atkBonus: 3, dprPct: -25 }
};
```

### 7.9 NPC Size Modifiers

```javascript
const sizeModifiers = {
  Small: { ac: 1, hpPct: -10, atkBonus: 1, dprPct: -10 },
  Medium: { ac: 0, hpPct: 0, atkBonus: 0, dprPct: 0 },
  Large: { ac: -1, hpPct: 5, atkBonus: 0, dprPct: 5 },
  Huge: { ac: -1, hpPct: 10, atkBonus: -1, dprPct: 10 },
  Massive: { ac: -2, hpPct: 15, atkBonus: -2, dprPct: 15 },
  Colossal: { ac: -2, hpPct: 20, atkBonus: -2, dprPct: 20 }
};
```

### 7.10 Release Magic Cards

| Card | Triumvirate | Effect Summary |
|------|-------------|----------------|
| King | Era of Royalty | +X Leadership + Xd6 damage |
| Queen | Era of Royalty | +X Leadership + next attack +Xd6 |
| Knight | Era of Heroism | +X Leadership + reduce Xd8 damage |
| Dame | Era of Heroism | +X Leadership + heal Xd8 |
| Squire | Era of Potential | +Rep to another card's X |
| Damsel | Era of Potential | +Rep to another card's X |
| Light | The Chiaroscuro | All MKs 60ft: Xd4 Temp HP |
| Dark | The Chiaroscuro | +X HP, teleport 10+X ft, immune |
| Twilight | The Chiaroscuro | Exchange HP↔MP |
| Life | The Collective Cycle | Xd8 healing, -1 Stress |
| Death | The Collective Cycle | Xd12 Magical damage |
| Passage | The Collective Cycle | Teleport 10+(10×X) ft |
| Angel | The Endless Battle | Xd10 True vs Outsider |
| Demon | The Endless Battle | Xd10 Magical vs Cultist |
| Mortal | The Endless Battle | Reset hand, -1 Stress |
| Hope | The Eternal Phase | Fate Die: Fracture repair |
| Despair | The Eternal Phase | Fate Die: Debuff enemy |
| Fortune | The Eternal Phase | Fate Die: d20 bonuses |
| Justice | The Arduous Judgment | Spell Attack: Xd10 Magical |
| Mercy | The Arduous Judgment | Advantage on Convincing Argument |
| Reflection | The Arduous Judgment | Xd4 + Rep MP restore |
| Love | The Dynamic Tale | Fate Die (Ephemeral): Multi-play |

---

## Beacon SDK Integration

### 8.1 Relay Configuration

```javascript
const relayConfig = {
  handlers: {
    onInit,              // Character data initialization
    onChange,            // Firebase change detection
    onSettingsChange,    // Settings updates
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver           // Compendium drag-drop
  },
  actions: {
    transform: { ... }   // Token form switching
  },
  computed: {
    mkhp: { tokenBarValue: true, get: getMKHP, set: setMKHP },
    tempHp: { tokenBarValue: true, get: getTempHP, set: setTempHP },
    shp: { tokenBarValue: true, get: getSHP, set: setSHP },
    mp: { tokenBarValue: true, get: getMP, set: setMP }
  }
};
```

### 8.2 Handler Details

#### onInit
- Receives initial character attributes and profile
- Sets `initValues.character`, `initValues.settings`
- Triggers store hydration via `relayPinia`

#### onChange
- Triggered when Firebase data changes
- Increments `beaconPulse` to trigger re-render
- Store re-hydrates if `updateId` differs from local `sheetId`

#### onSettingsChange / onSharedSettingsChange
- Updates `initValues.settings`
- Handles color theme, ownership, GM status

#### onDragOver
- Processes compendium drag-drop data
- Sets `initValues.compendiumDrop`

### 8.3 Token Bar Computed Properties

#### getMKHP / setMKHP
```javascript
// Get: Returns { current, max } from hp attribute
// Set: Applies relative (+/-) or absolute change
// Updates: hp.current, preserves hp.temp and hp.max_override
```

#### getTempHP / setTempHP
```javascript
// Get: Returns { current } from hp.temp
// Set: Applies change to hp.temp only
```

#### getSHP / setSHP
```javascript
// Get: Returns { current, max } from shp attribute
// Set: Updates shp.current, preserves shp.max_override
```

#### getMP / setMP
```javascript
// Get: Returns { current, max } from mp attribute
// Set: Updates mp.current, preserves mp.max_override
```

### 8.4 Transform Action

```javascript
transform: {
  method: async ({ dispatch, character }) => {
    // Toggle isTransformed state
    const newTransformed = !character.attributes.isTransformed;

    // Update character attributes
    dispatch.update({
      character: {
        id: character.id,
        attributes: {
          updateId: 'TRANSFORM',
          isTransformed: newTransformed
        }
      }
    });

    // Update token image
    const newTokenImage = newTransformed ? knightImage : studentImage;
    if (newTokenImage) {
      await dispatch.updateTokensByCharacter({
        characterId: character.id,
        token: { imgsrc: newTokenImage }
      });
    }

    // Post transformation message
    dispatch.post({
      characterId: character.id,
      content: `${name} transforms into ${form} form!`,
      options: { whisper: false }
    });
  }
}
```

### 8.5 Event Flow Diagrams

#### Initial Load
```
1. main.js → createRelay()
2. initRelay(relayConfig) → Beacon SDK connection
3. onInit handler → Sets initValues
4. relayPinia middleware → Calls store.hydrateStore()
5. Vue components render with reactive data
```

#### User Edit Flow
```
1. User edits input → Vue reactivity updates store ref
2. Pinia $subscribe() triggers
3. debounceUpdate waits 800ms
4. doUpdate() → dispatch.updateCharacter()
5. Beacon SDK → Firebase
6. Other clients receive onChange
7. beaconPulse increments → Store re-hydrates
```

#### Dice Rolling Flow
```
1. User clicks roll button
2. rollToChat() called
3. getRollResults() → dispatch.roll()
4. Beacon processes dice expression
5. Results returned with individual dice
6. createRollTemplate() → Handlebars HTML
7. dispatch.post() → Chat message
```

### 8.6 Loop Prevention

```javascript
// Module-level state
const sheetId = ref(uuidv4());      // Unique ID for this instance
const blockUpdate = ref(false);     // Prevents update loops

// In doUpdate()
character.attributes.updateId = sheetId.value;

// In beaconPulse watcher
if (attributes.updateId === sheetId.value) {
  blockUpdate.value = false;
  return;  // Skip self-updates
}
```

---

## Vue Component Reference

### 9.1 Component Hierarchy

```
App.vue
├── PCView.vue (provides layout)
│   ├── MasterHeader.vue (character info)
│   ├── HPContainer.vue (health display)
│   ├── RollModeToggle.vue (adv/disadv selector)
│   ├── AbilityScoreSection.vue
│   │   └── AbilityScore.vue × 6
│   ├── SkillSection.vue
│   │   └── Skill.vue × 17
│   ├── ConditionTracker.vue
│   │
│   └── RouterView (nested routes)
│       ├── BasicView.vue
│       │   ├── EclipseChart.vue
│       │   ├── RepeatingSection.vue (techniques)
│       │   │   └── TechniqueItem.vue
│       │   └── RepeatingSection.vue (shards)
│       │       └── ShardItem.vue
│       │
│       ├── StudentView.vue
│       │   ├── SocialSection.vue
│       │   └── Crystal.vue
│       │
│       ├── KnightView.vue
│       │   ├── SpellSection.vue
│       │   ├── WeaponQualitiesSelector.vue
│       │   ├── GunQualitiesSelector.vue
│       │   ├── ImplementQualitiesSelector.vue
│       │   ├── SquadronFormations.vue
│       │   ├── CombinationManeuvers.vue
│       │   └── ReleaseMagic.vue
│       │
│       ├── BackgroundView.vue
│       │   └── BackgroundItems.vue
│       │
│       └── SettingsView.vue
│           └── GoalTallies.vue
│
└── NPCView.vue (Triple-view)
    ├── Monster mode (combat stats)
    ├── NPC mode (social stats)
    └── Magi-Squire mode
        └── MagiSquire.vue
```

### 9.2 Key Components by Function

#### Layout Components
| Component | Purpose |
|-----------|---------|
| `NotchContainer.vue` | Stylized bordered container |
| `Collapsible.vue` | Expandable/collapsible sections |
| `Header.vue` | Section headers |
| `BaseSplit.vue` | Two-column layout |
| `SplitMods.vue` | Modifier display with +/- |

#### Input Components
| Component | Purpose |
|-----------|---------|
| `Button.vue` | Styled button |
| `Modal.vue` | Popup dialogs |
| `LabelStacked.vue` | Label + input vertical stack |
| `ImageBackedLabel.vue` | Icon + value display |

#### Game-Specific Components
| Component | Purpose |
|-----------|---------|
| `AbilityScore.vue` | Single ability score with mod |
| `Skill.vue` | Single skill with roll button |
| `EclipseChart.vue` | Eclipse/trauma tracker |
| `Crystal.vue` | Crystalline fracture display |
| `CloverDisplay.vue` | Fortune pool clover |
| `ConditionTracker.vue` | 19 conditions checklist |

#### Repeating Section Components
| Component | Purpose |
|-----------|---------|
| `RepeatingSection.vue` | Container for dynamic lists |
| `RepeatingItem.vue` | Base item template |
| `TechniqueItem.vue` | Battle technique item |
| `TacticItem.vue` | Combat tactic item |
| `ShardItem.vue` | Power shard item |
| `SocialSection.vue` | NPC/Squadron bonds |
| `GoalTallies.vue` | Club goal tracking |

#### Equipment Components
| Component | Purpose |
|-----------|---------|
| `WeaponQualitiesSelector.vue` | Soul Weapon quality checkboxes |
| `GunQualitiesSelector.vue` | Soul Gun type/style selector |
| `ImplementQualitiesSelector.vue` | Magical Implement qualities |
| `SpellSection.vue` | Spell path management |

#### Squad Components
| Component | Purpose |
|-----------|---------|
| `SquadronFormations.vue` | Formation activation |
| `CombinationManeuvers.vue` | Combo execution |
| `ReleaseMagic.vue` | Card deck management |
| `MagiSquire.vue` | Companion stat block |

### 9.3 Data Binding Patterns

#### Store Access in Components
```vue
<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import { storeToRefs } from 'pinia';

const sheet = useSheetStore();
const { level, reputation, hp } = storeToRefs(sheet);

// Direct mutations
const onClick = () => {
  sheet.rollAbility('strength');
};
</script>
```

#### Computed with v-model
```vue
<template>
  <input v-model="hp.current" type="number" />
</template>
```

#### Section Iteration
```vue
<template>
  <RepeatingSection name="techniques">
    <TechniqueItem
      v-for="item in sections.techniques.rows.value"
      :key="item._id"
      :item="item"
    />
  </RepeatingSection>
</template>
```

---

## Dehydrate/Hydrate Reference

### 10.1 Firebase Serialization Overview

The `dehydrate()` function converts Vue reactive state to a plain object for Firebase storage. The `hydrate()` function restores state from Firebase data.

### 10.2 Top-Level Dehydration

```javascript
const dehydrate = () => {
  const obj = {
    // Simple refs - direct .value access
    sheet_mode: sheet_mode.value,
    isTransformed: isTransformed.value,
    level: level.value,
    reputation: reputation.value,
    // ... 100+ more simple refs

    // Arrays - spread to new array
    eclipse: [...eclipse.value],
    eclipse_blips: [...eclipse_blips.value],
    statIncreases: [...statIncreases.value],

    // Objects - spread to new object
    conditions: { ...conditions.value },
    visor: { type: visor.value.type },
    elementalSummon: { ...elementalSummon.value },

    // Complex objects - dedicated functions
    skills: dehydrateSkills(skills),
    abilityScores: dehydrateAbilityScores(abilityScores),
    hp: dehydrateHp(hp),
    mp: dehydrateMp(mp),
    shp: dehydrateShp(shp),
    crystal: dehydrateCrystal(crystal),
    student_ability: dehydrateStudentAbility(student_ability),
    fate: dehydrateFate(fate),
    armor_weave: dehydrateArmorWeave(armor_weave),
    soul_weapon: dehydrateSoulWeapon(soul_weapon),
    soul_gun: dehydrateSoulGun(soul_gun),
    magical_implement: dehydrateMagicalImplement(magical_implement),
    herald: dehydrateHerald(herald),
    squire: dehydrateSquire(squire),

    // NPC attack objects with nested arrays
    npc_primary_attack: { ...npc_primary_attack.value },
    npc_horde_hp: npc_horde_hp.value.map(unit => ({ ...unit })),
  };

  // Repeating sections - array to object conversion
  Object.entries(sections).forEach(([name, val]) => {
    obj[name] = arrayToObject(val.rows.value);
  });

  return obj;
};
```

### 10.3 Section Template Structures

#### Techniques Section
```javascript
template: {
  name: '',
  description: '',
  type: '',              // Battle, Combat, Social
  category: '',          // Physical Attacks, Defensive, Magical, Squad Support
  levelRequired: 0,
  frequency: 'At-Will',  // At-Will, 1/Round, 1/Encounter, 1/Rest, X/Encounter
  maxUses: 1,
  usesRemaining: 1,
  actionType: '',        // Standard, Bonus, Free, Immediate, Reaction, Full-Round
  associatedRoll: '',
  collapsed: true
}
```

#### Spells Section
```javascript
template: {
  name: '',
  range: '',
  tier_I_name: '', tier_I_description: '', tier_I_special: '', tier_I_action: '', tier_I_dice: '',
  tier_II_name: '', tier_II_description: '', tier_II_special: '', tier_II_action: '', tier_II_dice: '',
  tier_III_name: '', tier_III_description: '', tier_III_special: '', tier_III_action: '', tier_III_dice: '',
  tier_IV_name: '', tier_IV_description: '', tier_IV_special: '', tier_IV_action: '', tier_IV_dice: '',
  tier_V_name: '', tier_V_description: '', tier_V_special: '', tier_V_action: '', tier_V_dice: '',
  tier_VI_name: '', tier_VI_description: '', tier_VI_special: '', tier_VI_action: '', tier_VI_dice: '',
  pathSelection: 'Custom'
}
```

### 10.4 Array-to-Object Conversion

```javascript
// arrayToObject: For Firebase storage
// Input: [{ _id: 'abc', name: 'Spell', ... }, ...]
// Output: { 'abc': { name: 'Spell', arrayPosition: 0, ... }, ... }

export const arrayToObject = (array) => {
  const newObject = {};
  array.forEach((item, index) => {
    const { _id, ...rest } = item;
    newObject[_id] = { ...rest, arrayPosition: index };
  });
  return newObject;
};

// objectToArray: For Vue consumption
// Reverses the process, restoring array order via arrayPosition

export const objectToArray = (object) => {
  if (!object) return [];
  const newArray = [];
  Object.keys(object).forEach((key) => {
    if (object[key]) {
      const position = object[key].arrayPosition;
      newArray[position] = { _id: key, ...object[key], arrayPosition: undefined };
    }
  });
  return newArray.filter((x) => x);
};
```

### 10.5 Special Handling Cases

#### $__$ Prefix Handling
Firebase/Beacon SDK may serialize arrays with a `$__$` prefix:
```javascript
const safeHydrateArray = (incoming, defaultValue = []) => {
  if (typeof incoming === 'string' && incoming.startsWith('$__$')) {
    try {
      return JSON.parse(incoming.slice(4));
    } catch (e) {
      return defaultValue;
    }
  }
  if (Array.isArray(incoming)) return [...incoming];
  if (incoming && typeof incoming === 'object') return Object.values(incoming);
  return defaultValue;
};
```

#### Eclipse Blips Array
```javascript
const hydrateEclipseBlipsArray = (targetArray, sourceArray) => {
  const result = safeHydrateArray(sourceArray, [...targetArray]);
  targetArray.splice(0, targetArray.length, ...result);
};
```

#### Complete Object Replacement
To prevent data accumulation, some objects are replaced entirely rather than merged:
```javascript
// conditions
if (hydrateStore.conditions) {
  const defaultConditions = Object.keys(conditions.value).reduce((acc, key) => {
    acc[key] = hydrateStore.conditions[key] ?? false;
    return acc;
  }, {});
  conditions.value = defaultConditions;
}

// combatFormMastery
if (hydrateStore.combatFormMastery) {
  combatFormMastery.value = { ...hydrateStore.combatFormMastery };
}
```

---

## Compendium Feature Map

### 11.1 Classes & Progression

| Compendium Feature | Implementation | Status |
|--------------------|----------------|--------|
| Level progression (1-15+) | `level` ref | ✅ Complete |
| Reputation Levels (0-V) | `reputation` ref, `proficiencyMap` | ✅ Complete |
| Stat increases at 3,6,9,12,15 | `statIncreases`, `statIncreaseLevels` | ✅ Complete |
| Ability modifier cap +5 | `exceededMortalLimits` computed | ✅ Complete |
| HP/MP/SHP formulas | Computed properties with overrides | ✅ Complete |
| Student Type abilities | `student_type`, `student_ability` | ✅ Complete |
| Training Tallies (0-8) | `trainingTallies`, `trainingTalliesMax` | ✅ Complete |

### 11.2 Spell Paths

| Spell Path | Data File | Roll Function | Status |
|------------|-----------|---------------|--------|
| Beam | spellPathData.js | rollSpell() | ✅ Complete |
| Explosion | spellPathData.js | rollSpell() | ✅ Complete |
| Curing | spellPathData.js | rollSpell() | ✅ Complete |
| Restoration | spellPathData.js | rollSpell() | ✅ Complete |
| Amplify | spellPathData.js | rollSpell() | ✅ Complete |
| Manipulate | spellPathData.js | rollSpell() | ✅ Complete |
| Barrier | spellPathData.js | rollSpell() | ✅ Complete |
| Transformation | spellPathData.js | rollSpell() | ✅ Complete |
| Summoning | spellPathData.js | rollSpell() | ✅ Complete |
| Divination | spellPathData.js | rollSpell() | ✅ Complete |
| Chronomancy | spellPathData.js | rollSpell() | ✅ Complete |

### 11.3 Combat Systems

| Feature | Implementation | Status |
|---------|----------------|--------|
| 10 Combat Forms | `combatFormData`, `activeCombatForm` | ✅ Complete |
| Combat Form Mastery | `combatFormMastery` | ✅ Complete |
| 8 Soul Weapon Qualities | `soul_weapon.qualities` | ✅ Complete |
| 7 Soul Gun Types | `gunTypeData`, `soul_gun` | ✅ Complete |
| 5 Gun Styles | `gunStyleData` | ✅ Complete |
| 8 Implement Qualities | `magical_implement.qualities` | ✅ Complete |
| 4 Squadron Formations | `formationData`, `activateFormation()` | ✅ Complete |
| 8 Combination Maneuvers | `combinationManeuverData`, `executeManeuver()` | ✅ Complete |
| 19 Conditions | `conditions` ref | ✅ Complete |
| Advantage/Disadvantage | `rollMode`, `effectiveRollMode` | ✅ Complete |
| Resist Modifiers (4 types) | `resistModifiers`, `activeResistModifiers` | ✅ Complete |

### 11.4 Equipment Systems

| Feature | Implementation | Status |
|---------|----------------|--------|
| Soul Armament Progression | `soulArmamentData`, bonuses computed | ✅ Complete |
| 9 Armor Weaves | `armorWeaveData`, `armor_weave` | ✅ Complete |
| 3 Visor Types | `visorData`, `visor` | ✅ Complete |
| Relic Capacity | `relicCapacity`, `relicsOverCapacity` | ✅ Complete |
| Rune Slot Capacity | `runeSlotCapacity`, `runeSlotsUsed` | ✅ Complete |
| Elemental Summon | `elementalSummon` | ✅ Complete |
| Power Shards | `sections.shards` | ✅ Complete |
| Gear Section | `sections.gear` | ✅ Complete |

### 11.5 Social Systems

| Feature | Implementation | Status |
|---------|----------------|--------|
| 7 Heart Stages | `heartStageData`, `getHeartStageForSP()` | ✅ Complete |
| NPC Social Bonds | `sections['npc-social']` | ✅ Complete |
| Squadron Social Bonds | `sections['squadron-social']` | ✅ Complete |
| Club Position System | `clubPosition`, `clubPositionData` | ✅ Complete |
| Club Tallies | `clubTallies`, `resoundingGrowths` | ✅ Complete |
| Club Goal Tallies | `sections['club-goalTallies']` | ✅ Complete |
| Skill Mastery | `masteredSkill` | ✅ Complete |

### 11.6 NPC/Monster Systems

| Feature | Implementation | Status |
|---------|----------------|--------|
| 5 NPC Ranks | `npcTypes` | ✅ Complete |
| 12 NPC Roles | `roleModifiers` | ✅ Complete |
| 6 Size Categories | `sizeModifiers` | ✅ Complete |
| Horde HP System | `npc_horde_hp`, `npc_active_units` | ✅ Complete |
| NPC Attacks (Primary/Secondary) | `npc_primary_attack`, `npc_secondary_attack` | ✅ Complete |
| NPC Traits | `npc_traits` | ✅ Complete |
| NPC Social View | `npc_social_*` refs | ✅ Complete |
| Whisper Rolls | `npc_whisper_rolls` | ✅ Complete |

### 11.7 Release Magic System

| Feature | Implementation | Status |
|---------|----------------|--------|
| 22 Release Magic Cards | `releaseCardDefinitions` | ✅ Complete |
| 7 Triumvirates | Grouped in definitions | ✅ Complete |
| Deck/Hand/Discard | `releaseMagicDeck`, location tracking | ✅ Complete |
| Signature Cards (Lv 5+, 10+) | `signatureCard1`, `signatureCard2` | ✅ Complete |
| Scaling Value (X) | `scalingValue` computed | ✅ Complete |
| Hand Limit | `handLimit` computed | ✅ Complete |
| Fate Die Rolls | Integrated in `rollReleaseCard()` | ✅ Complete |
| Deck Cycling | `cycleReleaseSpellDeck()` | ✅ Complete |

### 11.8 Attrition Systems

| Feature | Implementation | Status |
|---------|----------------|--------|
| Stress (0-6) | `stress`, mental ability effects | ✅ Complete |
| Exhaustion (0-6) | `exhaustion`, physical ability effects | ✅ Complete |
| Endurance Die | `enduranceDieEnabled`, `getEnduranceDieInfo()` | ✅ Complete |
| Eclipse Chart | `eclipse`, `eclipse_blips` | ✅ Complete |
| Trauma Tracking | `trauma` computed | ✅ Complete |
| Corruption/Burnout | `corruptionCount`, `burnoutLines` | ✅ Complete |
| Heartless/Fallen Knight | `heartlessKnight`, `fallenKnight` | ✅ Complete |
| Sleep Effects | `sleepEffect`, `sleepEffectData` | ✅ Complete |

### 11.9 Magi-Squire System

| Feature | Implementation | Status |
|---------|----------------|--------|
| Squire Stats | `squire` object | ✅ Complete |
| 6 Health Blips | `squire.healthBlips` | ✅ Complete |
| 3 Mana Blips | `squire.manaBlips` | ✅ Complete |
| Damage Scaling | `squireDamage` computed | ✅ Complete |
| Spell Path Selection | `squireSpellPaths` (4 options) | ✅ Complete |

### 11.10 Level-Locked Abilities

| Ability | Level | Implementation | Status |
|---------|-------|----------------|--------|
| Energy Surge | 4 | `levelAbilities.energySurge`, `energySurgeUsed` | ✅ Complete |
| Counter Blast | 5 | `levelAbilities.counterBlast` | ✅ Complete |
| Swift Attack I | 5 | `levelAbilities.swiftAttack1` | ✅ Complete |
| Perfect Parry | 6 | `levelAbilities.perfectParry` | ✅ Complete |
| Extricate Aether | 6 | `levelAbilities.extricateAether` | ✅ Complete |
| Heroic Resolve | 9 | `levelAbilities.heroicResolve` | ✅ Complete |
| Knight's Insight | 9 | `levelAbilities.knightsInsight` | ✅ Complete |
| Knight's Resolution | 9 | `levelAbilities.knightsResolution` | ✅ Complete |
| Swift Attack II | 10 | `levelAbilities.swiftAttack2` | ✅ Complete |
| Flight | 10 | `levelAbilities.flight`, `isFlying` | ✅ Complete |

---

## Development & Build

### 12.1 Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development (port 5173) |
| `npm run sandbox` | Roll20 sandbox (port 7620) |
| `npm run build` | Production build |
| `npm run build-scss` | Compile roll template styles |

### 12.2 Build Configuration

```javascript
// vite.config.js
export default defineConfig(({ mode }) => ({
  plugins: [vue(), VueDevTools()],
  base: mode === "production"
    ? `${process.env.VITE_SHEET_PATH}/${process.env.VITE_SHEET_SHORT_NAME}/`
    : "/",
  build: {
    target: 'esnext',
    rollupOptions: {
      input: { sheet: "src/main.js" },
      output: {
        dir: "dist",
        entryFileNames: "sheet.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "sheet.css";
          return "assets/[name][extname]";
        }
      }
    }
  },
  assetsInclude: ["**/*.hbs"],
  resolve: {
    alias: { '@': './src' }
  }
}));
```

### 12.3 Build Outputs

```
dist/
├── sheet.js    # Bundled JavaScript
├── sheet.css   # Bundled styles
└── assets/     # Static assets (fonts, images)
```

### 12.4 Development Modes

1. **Offline (dev)** - Mock relay, no Firebase
   - Uses `devRelay()` for local testing
   - Sets default character data for rendering

2. **Sandbox (staging)** - Live Roll20 connection
   - Full Beacon SDK integration
   - Real-time Firebase sync

---

## Known Technical Debt

1. **Mixed ref/reactive patterns** - Some inconsistency in store
2. **Large monolithic sheetStore** (~3940 lines) - Could benefit from modularization
3. **No TypeScript** - Incomplete type safety
4. **CSS specificity issues** - Some `!important` usage
5. **No virtual scrolling** - Large spell/technique lists may lag
6. **Commented-out code** - Several unused code blocks remain

### Recommendations

#### Short-term
- Add TypeScript for type safety
- Split sheetStore into domain modules (combat, magic, social, npc)
- Add unit tests for computed properties
- Remove commented code blocks

#### Medium-term
- Implement virtual scrolling for long lists
- Add form validation
- Create reusable composition functions
- Document compendium JSON schema

#### Long-term
- Consider Nuxt.js for SSR benefits
- Add offline support with service workers
- Implement undo/redo for character edits
- Create sheet migration system for version updates

---

## Appendix: Quick Reference Tables

### A.1 All Exported Store Functions

| Function | Purpose |
|----------|---------|
| `rollAbility(name)` | Roll ability check |
| `rollSkill(name)` | Roll skill check |
| `rollInitiative()` | Roll initiative |
| `rollStudentAttack()` | Student attack roll |
| `rollKnightAttack()` | Knight attack roll |
| `rollStudentDamage(notation)` | Student damage roll |
| `rollKnightDamage(notation)` | Knight damage roll |
| `rollWeapon(item, tier)` | Soul weapon attack |
| `rollSpell(item, tier)` | Spell attack |
| `rollGunRapidFire()` | Gun Rapid Fire |
| `rollGunMagDump()` | Gun Mag Dump |
| `rollGunDamage()` | Gun damage roll |
| `rollNPCAttack(type)` | NPC attack roll |
| `rollNPCDamage(type)` | NPC damage roll |
| `rollNPCCheck(type)` | NPC check roll |
| `rollNPCGloomGems()` | NPC gloom gems roll |
| `activateFormation(key)` | Activate squadron formation |
| `deactivateFormation()` | End active formation |
| `executeManeuver(key)` | Execute combination maneuver |
| `toggleTransform()` | Toggle Student/Knight form |
| `addRow(section)` | Add item to repeating section |
| `removeRow(section, id)` | Remove item from section |
| `populateSpellPath(item, key)` | Fill spell from path data |
| `resetTechniqueUses(frequency)` | Reset technique uses |
| `useTechnique(id)` | Consume technique use |
| `hasTacticActive(name)` | Check if tactic is active |
| `drawReleaseCards(count)` | Draw Release Magic cards |
| `drawInitialHand()` | Draw starting hand |
| `playReleaseCard(cardId)` | Play card from hand |
| `resetReleaseDeck()` | Shuffle discard into deck |
| `cycleReleaseSpellDeck()` | Cycle empty deck (+2 Stress) |
| `dehydrate()` | Export state to Firebase |
| `hydrate(data)` | Import state from Firebase |

### A.2 All Condition Effects Summary

| Condition | Attack | Skill | Resist | Special |
|-----------|--------|-------|--------|---------|
| Distressed | Disadv | Disadv | - | - |
| Horrified | - | - | Disadv (except Horror) | +1 Stress, Move 0 |
| Berserk | Adv vs you | - | - | Must attack |
| Disoriented | Disadv | Disadv | Disadv (Physical) | - |
| Depleted | Disadv | - | - | Move 0, no spells |
| Drained | Disadv | - | - | Move 0, +1 Tier MP |
| Restrained | Disadv | - | Disadv (DEX) | Move 0 |
| Prone | Ranged Disadv | - | - | Melee Adv vs you |

### A.3 All Repeating Section Field Summary

| Section | Key Fields | UI Component |
|---------|------------|--------------|
| techniques | name, frequency, usesRemaining, actionType | TechniqueItem |
| tactics | name, active, automaticBonus | TacticItem |
| shards | name, rarity, cost | ShardItem |
| gear | name, description | RepeatingItem |
| relics | name, description | RepeatingItem |
| forms | name, description | RepeatingItem |
| runes | name, slotCost | RepeatingItem |
| spells | name, tier_I-VI_* | SpellSection |
| npc-social | name, points, heartStage | SocialSection |
| squadron-social | name, points, heartStage | SocialSection |
| club-goalTallies | name, description | GoalTallies |

---

## Conclusion

The Magi-Knights character sheet demonstrates a well-architected Vue 3 application with comprehensive coverage of the game system's mechanics. The Beacon SDK relay layer provides clean abstraction over Roll20's infrastructure, while the Pinia store effectively models the complex game data including dual-form characters, 11 spell paths, 10 combat forms, 22 Release Magic cards, and complete NPC/Monster support.

This document serves as a complete reference for:
- Verifying feature implementation against compendium rules
- Tracing calculations back to exact formulas
- Understanding data flow through the application
- Identifying when/how any value auto-updates
- Maintaining and extending the codebase

All major game systems from the compendium have been implemented and are documented above.
