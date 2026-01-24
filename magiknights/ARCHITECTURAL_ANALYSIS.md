# Magi-Knights Roll20 Beacon Sheet - Architectural Analysis

## Executive Summary

The Magi-Knights Awakening character sheet is a Vue 3 application built for the Roll20 Beacon SDK platform. It implements a tabletop RPG character sheet featuring dual-form characters (Student/Magi-Knight), a complex magic system, tactical combat mechanics, and NPC management. The architecture follows a modern reactive pattern with centralized state management and real-time synchronization with Roll20's Firebase backend.

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
│   │   ├── fonts.css
│   │   ├── main.css
│   │   └── variables.css
│   ├── components/             # Reusable UI components (40+)
│   ├── views/                  # Page-level components
│   │   ├── PCView.vue          # Player character wrapper
│   │   ├── NPCView.vue         # NPC/Monster sheet
│   │   └── PC/                 # PC sub-views
│   │       ├── BasicView.vue
│   │       ├── StudentView.vue
│   │       ├── KnightView.vue
│   │       ├── BackgroundView.vue
│   │       └── SettingsView.vue
│   ├── stores/                 # Pinia state stores
│   │   ├── index.js            # App store (orchestrator)
│   │   ├── metaStore.js        # Character metadata
│   │   ├── sheetStore.js       # Game-specific data (~2000 lines)
│   │   └── spellModal.js       # Modal state
│   ├── relay/                  # Beacon SDK integration
│   │   ├── index.js            # Relay configuration
│   │   └── handlers/           # SDK event handlers
│   │       ├── onInit.js
│   │       ├── onChange.js
│   │       ├── computed.js     # Token bar linkage
│   │       └── ...
│   ├── rollTemplates/          # Chat output templates
│   │   ├── index.js
│   │   ├── templates/          # Handlebars templates
│   │   ├── partials/           # Template fragments
│   │   ├── expressions/        # Helper functions
│   │   └── styles/             # SCSS for chat
│   ├── rollFuncs/              # Dice rolling logic
│   └── utility/                # Helper functions
├── compendium/                 # Game data (JSON)
│   ├── classes.json            # Character classes
│   ├── spells.json             # Spell definitions
│   ├── techniques.json         # Battle techniques
│   ├── monsters.json           # NPC stat blocks
│   └── ...
├── public/                     # Static files
├── sheet.json                  # Roll20 sheet manifest
├── vite.config.js              # Build configuration
└── package.json
```

---

## Architecture Patterns

### 1. State Management Architecture

The application uses a **hierarchical store pattern** with Pinia:

```
┌─────────────────────────────────────────────────────────┐
│                      AppStore                           │
│  (Orchestrator - combines stores, manages sync)         │
├─────────────────────────────────────────────────────────┤
│     MetaStore          │          SheetStore            │
│  ┌─────────────────┐   │   ┌───────────────────────┐    │
│  │ • id            │   │   │ • Character Stats     │    │
│  │ • name          │   │   │ • Skills/Abilities    │    │
│  │ • avatar        │   │   │ • HP/MP/SHP           │    │
│  │ • bio           │   │   │ • Equipment           │    │
│  │ • permissions   │   │   │ • Spells/Techniques   │    │
│  │ • campaignId    │   │   │ • NPC Data            │    │
│  └─────────────────┘   │   │ • Conditions          │    │
│                        │   │ • Formations          │    │
│                        │   └───────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Key Patterns:**

- **Hydration/Dehydration** - Bidirectional data transformation between Vue reactivity and Firebase storage
- **Computed Properties** - Auto-calculated values (modifiers, HP max, spell DC)
- **Override System** - Manual overrides for auto-calculated values

### 2. Beacon SDK Integration

The Relay system bridges Vue with Roll20:

```
┌──────────────────────────────────────────────────────────────┐
│                        Vue Application                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                     Pinia Stores                      │    │
│  │         (Reactive state with watchers)                │    │
│  └──────────────────────────────────────────────────────┘    │
│                            │                                  │
│                   $subscribe() watcher                        │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   Relay Layer                         │    │
│  │  • debounceUpdate (800ms)                             │    │
│  │  • blockUpdate flag (prevents loops)                  │    │
│  │  • sheetId tracking                                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                            │                                  │
└────────────────────────────│──────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     Beacon SDK                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Handlers:                    │  Actions:               │  │
│  │  • onInit                     │  • transform            │  │
│  │  • onChange                   │                         │  │
│  │  • onSettingsChange           │  Computed:              │  │
│  │  • onDragOver                 │  • mkhp (HP bar)        │  │
│  │  • onTranslationsRequest      │  • mp (MP bar)          │  │
│  │                               │  • shp (Student HP)     │  │
│  │                               │  • tempHp               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    Roll20 Firebase Backend
```

### 3. Component Architecture

The UI follows a **container/presentational** pattern:

**Container Components (Views):**
- `PCView.vue` - Main layout, permission checks, router outlet
- `KnightView.vue` - Magi-Knight form with equipment/spells
- `NPCView.vue` - Monster/NPC stat block

**Presentational Components:**
- `NotchContainer.vue` - Stylized bordered container
- `Collapsible.vue` - Expandable sections
- `RepeatingSection.vue` - Dynamic item lists
- `ImageBackedLabel.vue` - Icon + value display

**Component Communication:**
```
PCView (provides layout)
    │
    ├── MasterHeader (character info)
    ├── HPContainer (health display)
    ├── SkillSection (skill rolls)
    ├── ConditionTracker (status effects)
    │
    └── RouterView (nested routes)
            │
            ├── BasicView (base stats)
            ├── StudentView (student form)
            ├── KnightView (magi-knight form)
            │       ├── SpellSection
            │       ├── WeaponQualitiesSelector
            │       ├── SquadronFormations
            │       └── CombinationManeuvers
            ├── BackgroundView (roleplay)
            └── SettingsView (config)
```

---

## Game System Implementation

### Character Dual-Form System

Characters have two forms: **Student** and **Magi-Knight**

```javascript
// Transformation state in sheetStore
const isTransformed = ref(false);
const studentTokenImage = ref('');
const knightTokenImage = ref('');

// Action registered with token bar
actions: {
  transform: {
    method: async ({ dispatch, character }) => {
      // Toggle form
      // Update token image
      // Post transformation message
    }
  }
}
```

**Stat Differences:**
| Stat | Student | Magi-Knight |
|------|---------|-------------|
| HP | SHP (10 + CON + Rep) | MKHP (10 + CON + Level scaling) |
| Damage | 1d4 + STR + Rep | Soul Weapon/Gun |
| Armor | 10 + CON + DEX | Armor Weave |
| Magic | None | Full spell access |

### Attribute System

**6 Core Abilities:** STR, DEX, CON, INT, WIS, CHA

```javascript
const strengthMod = computed(() => {
  const raw = Math.floor((strength.value - 10) / 2);
  // Capped at +5 until "Exceed a Mortal's Limits" at Rep IV
  return exceededMortalLimits.value ? raw : Math.min(raw, 5);
});
```

**17 Skills:** Each linked to 1-6 abilities with proficiency toggle

**Skill Mastery:** One skill can be designated as "Mastered" via the `masteredSkill` ref (string, skill key or ''). The mastered skill receives a +Reputation Level (min 1) bonus on all rolls. In the UI, the mastered skill's proficiency diamond is highlighted in accent color and the skill name is bolded. The mastery selector dropdown is shown at the bottom of the skills section. The mastery bonus is added as a separate 'Mastery' component in the roll breakdown.

### Magic System

**Two Magic Styles:**

1. **Traditional Spell Paths** - 6-tier spell progression
   ```javascript
   spells: {
     template: {
       name: '',
       range: '',
       tier_I_name: '', tier_I_description: '', tier_I_dice: '',
       tier_II_name: '', tier_II_description: '', tier_II_dice: '',
       // ... through tier_VI
     }
   }
   ```

**Spell Paths Known:** Tracks which of the 11 spell paths the character has chosen.
```javascript
availableSpellPaths = ['Beam', 'Explosion', 'Ward', 'Curing', 'Restoration', 'Augmentation', 'Summoning', 'Chronomancy', 'Divination', 'Psionics', 'Necromancy']
spellPathsKnown: ref([])           // Array of selected path strings
maxSpellPaths: computed(() => ...)  // 2 at level 1-3, 3 at level 4-7, 4 at level 8+
```
UI shows checkboxes for all 11 paths with a count indicator (e.g., "2/2 Paths") and a warning when over max. Each Magic Style (Enchanter, Shaper, Occultist, Cleric) has access to 7 of the 11 paths; characters choose 2 at level 1, gaining +1 at levels 4 and 8.

2. **Release Magic** - Card-based spell system (Bakugan/Magic: The Gathering inspired)
   - Deck of 6 cards
   - 2 signature cards
   - Draw/discard mechanics

### Combat Systems

**Conditions Tracking (19 conditions in 3 categories):**
```javascript
conditions: ref({
  // Mental
  distressed: false,    // Disadvantage on Skill Checks and Attack Actions
  horrified: false,     // +1 Stress, Move 0, can't damage enemies, auto-hit vs you
  berserk: false,       // Must attack, double STR damage, attacks have Advantage vs you
  // Physical
  bleeding: false,      // (N)-CON damage per Action (min 1). Medicine or healing to remove
  burning: false,       // (N) damage per Action + at start of turn. Athletics/Mysticism to end
  disoriented: false,   // Disadvantage on Attacks, Physical Resists, Skill Checks
  exposed: false,       // Only one Free Action, Prone
  paralyzed: false,     // No Actions, auto-hit
  prone: false,         // Disadvantage on ranged, melee have adv vs you
  restrained: false,    // Move 0, Disadvantage on attacks/DEX
  unconscious: false,   // Knocked out, Prone, revert to Student Persona
  // Depletion
  depleted: false,      // Move 0, Disadvantage on Attacks, can't cast Spells, Armor = 10
  drained: false,       // Move 0, Disadvantage on Attacks, spells cost +1 Tier MP
  poisoned: false,      // Stress damage per Action, +1 Stress per Action
  silenced: false,      // Can't speak or cast verbal spells
  soulSiphoned1-4: false, // Progressive soul drain (IV = Paralyzed + 1 Trauma)
  soulTainted: false    // Disadvantage vs Invading Evil, damage halved vs them
})
```

**Condition Mechanics Computeds:**
```javascript
// Conditions that cause Disadvantage on YOUR attacks:
// Depleted, Drained, Distressed, Disoriented
conditionDisadvantageOnAttacks: computed(() => depleted || drained || distressed || disoriented)

// Conditions that cause Disadvantage on skill checks:
// Distressed ("Disadvantage on Skill Checks and Attack Actions")
// Disoriented ("Disadvantage on Attacks, Physical Resists, Skill Checks")
conditionDisadvantageOnSkillChecks: computed(() => distressed || disoriented)

// These computeds are integrated into getRollDice() to force disadvantage
// on attack rolls and skill/ability check rolls respectively.
// No flat penalties are used - all condition effects use the Disadvantage mechanic.
```

**Rolls to Resist Advantage/Disadvantage:**
```javascript
// Four resist types: Physical (STR/DEX/CON), Magic (INT/WIS/CHA), Horror (WIS/CHA), Purity (WIS/CHA)
resistModifiers: ref({
  physical: { advantage: false, disadvantage: false },
  magic: { advantage: false, disadvantage: false },
  horror: { advantage: false, disadvantage: false },
  purity: { advantage: false, disadvantage: false }
})

// Condition-based resist disadvantage (auto-computed from conditions)
// Disoriented → Disadvantage on Physical Resists
conditionResistDisadvantage: computed(() => ({
  physical: conditions.disoriented,
  magic: false, horror: false, purity: false
}))

// Combined active modifiers (manual toggles + condition effects, adv/disadv cancel)
activeResistModifiers: computed(() => per-type 'normal'|'advantage'|'disadvantage')

// getResistRollMode(abilityName) → returns the roll mode for that ability's resist type
// Integrated into rollAbility(): when rollToResist > 0, applies resist-specific adv/disadv
// getRollDice() updated to accept (forceDisadvantage, forceAdvantage) parameters
```

**Endurance Die & Attrition System:**
```javascript
// Endurance Die: roll 1d6 alongside d20 when affected by Stress or Exhaustion.
// If d6 >= current level, negate the penalty for that roll.
// Level 6 Disadvantage cannot be negated (already handled by forcedDisadvantage computed).
enduranceDieEnabled: ref(true)      // Whether 1d6 Endurance Die system is active
freakingOutToday: ref(false)        // Tracks if Oppressive Stress occurred today

// Stress affects mental ability rolls (INT, WIS, CHA)
// Exhaustion affects physical ability rolls (STR, DEX, CON)
// getEnduranceDieInfo(abilityName) returns { type, level } or null

// Eclipse Blip states: 0=empty, 1=Trauma, 2=Corruption, 3=Burnout
corruptionCount: computed(() => eclipse_blips with state === 2)
burnoutLines: computed(() => eclipse_blips with state === 3)
heartlessKnight: computed(() => corruptionCount >= 3)  // -1 SP, no Catharsis, lose Comforting Comrade
fallenKnight: computed(() => corruptionCount >= 5)     // 1/2 Trauma, Refreshing->Average, Risk of Relapse
```

**Squadron Formations:**
- Arrow (Attack), Victory (Defense), Barrage (Destruction), Diamond (Restoration)
- Require 3+ Magi-Knights within 60ft
- Unity Point cost

**Combination Maneuvers:**
- 8 maneuvers requiring 2-4 participants
- Unity Point cost (unlocked at Rep II)
- Effects scale with Reputation

**Combat Forms (10 structured forms):**
```javascript
// The 10 Combat Forms from the compendium, with selection and mastery tracking
combatFormData: {
  formI: { name: 'Form I - Adaptation', description: '...', mastery: '...' },
  formII: { name: 'Form II - Deflection', ... },
  formIII: { name: 'Form III - Vindication', ... },
  formIV: { name: 'Form IV - Purgation', ... },
  formV: { name: 'Form V - Refraction', ... },
  formVI: { name: 'Form VI - Reflection', ... },
  formVII: { name: 'Form VII - Vibration', ... },
  formVIII: { name: 'Form VIII - Constellation', ... },
  formIX: { name: 'Form IX - Cessation', ... },
  formX: { name: 'Form X - Regulation', ... }  // Required for Soul Gun access
}

activeCombatForm: ref('')           // Currently active form key
combatFormMastery: ref({...})       // Boolean per form for mastery unlock
hasFormX: computed(() => combatFormMastery.formX)  // Soul Gun prerequisite
```
- UI: Active Form dropdown selector with description display
- Mastery checkboxes (I-X) with roman numeral labels
- Mastery effect shown when active form is mastered
- Custom form notes preserved via sections.forms repeating section

**Level-Locked Abilities:**
```javascript
// Special abilities that all Magi-Knights gain at specific levels
levelAbilityData: {
  counterBlast: { name: 'Counter Blast', level: 5, description: 'Reaction: When hit by spell, spend MP to counter' },
  perfectParry: { name: 'Perfect Parry', level: 6, description: 'Immediate: Negate weapon damage received' },
  extricateAether: { name: 'Extricate Aether', level: 6, description: 'Recover MP from defeated Outsiders' },
  heroicResolve: { name: 'Heroic Resolve', level: 9, description: 'Resist conditions with enhanced willpower' },
  knightsInsight: { name: "Knight's Insight", level: 9, description: 'Gain tactical information about enemies' },
  knightsResolution: { name: "Knight's Resolution", level: 9, description: 'Enhanced resistance to attrition effects' }
}

levelAbilities: computed  // Returns { counterBlast: bool, perfectParry: bool, ... } based on level
```
- UI: Listed in KnightView.vue with locked/unlocked visual states
- Level badge shows required level for each ability
- Unlocked abilities have full opacity; locked abilities are dimmed

**Budget & Training Tallies:**
```javascript
budgetTallies: ref(0)       // Currency for purchasing gear/services (no max)
trainingTallies: ref(0)     // XP counter, 0-8, resets on level-up
trainingTalliesMax: 8       // Tallies needed to gain a level
```
- UI: Numeric inputs in BasicView.vue showing Budget Tallies and Training Tallies (current/8)
- Budget Tallies: earned from part-time jobs (+1-2/session), quest rewards, downtime
- Training Tallies: earned from Grinding, missions; accumulate 8 to level up (4 for New Rice Squires)
- Both persist via dehydrate/hydrate cycle

**Sleep Phase & Daily Limits:**
```javascript
// Sleep Phase effect tracking
sleepEffect: ref('average')  // 'average', 'feverish', 'refreshing'
sleepEffectData: {
  average: { name: 'Average Sleep', stressRecovery: 1, exhaustionRecovery: 1, hpRecovery: 'none', fractureRecovery: 0 },
  feverish: { name: 'Feverish Dreams', stressRecovery: 0, exhaustionRecovery: 0, hpRecovery: 'none', fractureRecovery: 0, note: 'Nightmares, no recovery' },
  refreshing: { name: 'Refreshing Sleep', stressRecovery: 2, exhaustionRecovery: 2, hpRecovery: 'full', fractureRecovery: 1, note: 'Full HP, -1 Fracture' }
}

// Daily/per-session limit tracking
sealImplantGiven: ref(false)       // 1/day: given a Crystalline Seal to another
sealImplantReceived: ref(false)    // 1/day: received a Crystalline Seal from another
manaConduitUsed: ref(false)        // 1/Sleep Phase: Bonus Action next spell -1 Tier MP
soulSacrificeCount: ref(0)         // Uses count toward career max
soulSacrificeMax: computed          // Max = Reputation Level (career total)
```
- UI: Sleep Effect radio buttons in KnightView.vue (Average/Feverish/Refreshing)
- Daily Limits section with checkboxes for Seal Implant (given/received) and Mana Conduit
- Soul Sacrifice counter with career max display
- All values persist via dehydrate/hydrate cycle

### Social Bonds & Heart Stages

**Heart Stage Progression (7 stages):**
```javascript
heartStageData = [
  { value: 'threatening', label: 'Threatening' },
  { value: 'hostile', label: 'Hostile' },
  { value: 'cold', label: 'Cold' },
  { value: 'neutral', label: 'Neutral' },   // default
  { value: 'warm', label: 'Warm' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'sympathetic', label: 'Sympathetic' }
]
```

**Social Bond Data Model (repeating sections: npc-social, squadron-social):**
```javascript
template: {
  name: '',
  points: 0,              // Social Points
  heartStage: 'neutral',  // Heart Stage progression
  bond_ability: '',        // Bond ability text
  collapsed: false
}
```
- UI: SocialSection.vue displays 4-column grid (Name, Heart Stage, SP, Bond Ability)
- Collapsed view shows stage label; expanded view shows stage dropdown selector
- Heart Stages represent NPC relationship progression per compendium
- Persisted automatically via generic section serialization (arrayToObject/objectToArray)

### Magi-Squire Companion

**Squire Data Model:**
```javascript
squire: {
  name: ref(''),
  level: ref(1),
  healthBlips: ref([true x6]),   // 6 Health Blips (no Crystalline Fractures)
  manaBlips: ref([true x3]),     // 3 Mana Blips (fixed)
  studentArmor: ref(13),         // Armor in Student form
  knightArmor: ref(15),          // Armor in Knight form (+2 vs melee)
  spellPath1: ref(''),           // From: Beam, Explosion, Curing, Restoration
  spellPath2: ref(''),
  skills: ref(''),               // +2 assist on Squire Skills
  notes: ref(''),
  collapsed: ref(true)
}
```

**Squire Damage Scaling (computed from mentor level):**
- Levels 1-3: 1d6+3
- Levels 4-6: 2d6+3
- Levels 7-9: 2d6+4
- Levels 10-12: 3d6+4
- Levels 13-15: 4d6

**Component:** `MagiSquire.vue` - collapsible panel in StudentView.vue after Herald section
- Shows name, damage, armor stats, health/mana blip checkboxes, spell path selectors, skills, notes
- Collapsed summary shows squire name and damage badge

### Relic Capacity

```javascript
relicCapacity: computed(() => reputation.value)    // Max relics = Reputation Level (0-5)
relicsOverCapacity: computed(() => relicCount > relicCapacity)
relicCount: computed(() => sections.relics.rows.length)
```
- UI shows current/max relic count in header (e.g., "2/3")
- Warning displayed when over capacity
- Relics are stored in `sections.relics` repeating section with name + description fields

### Equipment System

**Soul Weapon Qualities (8 qualities in 3 categories):**
```javascript
soul_weapon: {
  qualities: ref({
    accurate: false,      // Trade-off: -2 dmg for +1 atk, OR -4 dmg for +2 atk
    coupled: false,       // Free Action: Split Primary + Secondary, Bonus Action secondary attack
    ensnaring: false,     // On Roll 16+: Target Restrained (not Large+/Adversary+)
    forceful: false,      // On Roll 16+: Add extra 1d6 damage
    massive: false,       // Trade-off: -1 atk for +2 dmg, OR -2 atk for +4 dmg
    staggeringBlow: false, // On Roll 16+: Knock target 10ft (not Large+/Adversary+)
    twoHanded: false,     // Requires both hands
    veilPiercing: false   // 1/Combat Encounter: Auto-hit instead of rolling
  })
}
// Trade-off qualities (Accurate/Massive) are per-roll player choices, NOT persistent bonuses
// Trigger qualities (Forceful/Ensnaring/Staggering Blow) activate on natural 16+
// veilPiercingUsed ref tracks 1/encounter usage
```

**Soul Gun** uses a Firing Pool system (not d20-based):
```javascript
// Soul Gun data structure
const soul_gun = {
  name: ref(''),
  gunType: ref('hdg'),        // 7 types: hdg, smg, asr, dmr, stg, lmg, sda
  gunStyle: ref(''),          // HDG: akimbo/aegis/fastReload; SMG: mobile/hailOfBullets
  aimed: ref(false),          // Bonus Action: +1 to one Firing Pool die
  hasReloaded: ref(true),     // Must reload after Mag Dump
  firingPoolBonus: ref(0),    // Additional pool modifiers
  attachments: ref([]),       // Array of {name, type, effect}
  collapsed: ref(true)
}
// Firing Pool: Roll Nd8 + DEX + Proficiency vs Armor
// RF = Rapid Fire (standard), MD = Mag Dump (full burst, needs reload)
// Each "8" rolled = Direct Hit (+Proficiency damage)
// gunTypeData provides stats: eRange, damage, rf, md, special per type
// gunStyleData provides style options for HDG/SMG only
```

**Magical Implement** uses a quality-based system with 8 qualities from the compendium:

```javascript
// Implement Qualities (per compendium):
// Card Conductor - Required for Divination Spell Path or Release Magic Style
// Embolden - Spell damage +MK Level (multi-target: choose one)
// Light - One hand, does not count toward weapon limit
// Mana Attunement - MP = Mana Coefficient × 3 (instead of × 2)
// Mana Conduit - 1/Sleep Phase, Bonus Action: Next spell costs -1 Tier MP
// Radiance - Healing spells: +1+Level HP (AoE: halved, min 1)
// Two-Handed - Requires two hands, cannot use Shield or Light items
// Warding - Reduce spell damage taken by 1/2 Level (min 1)

// Computed bonuses:
// emboldenDamageBonus = level when Embolden active
// radianceHealBonus = 1 + level when Radiance active
// wardingReduction = max(1, floor(level/2)) when Warding active
// manaConduitUsed tracks 1/Sleep Phase usage
```

**4 Implement Types** (from compendium):
- Witch's Force Wand (1d4): Mana Attunement, Mana Conduit, Radiance, Warding
- Wizard's Magic Staff (1d6): Embolden, Mana Attunement, Mana Conduit, Two-Handed, Warding
- Master's Instrument (1d4): Embolden, Mana Attunement, Mana Conduit, Radiance, Two-Handed
- Collector's Spell Deck (no damage): Card Conductor, Light

### NPC/Monster System

**5 NPC Types (Ranks):**
- **Horde** - 4 HP pools, scaling attack DC/damage
- **Vassal** - Minion tier (50% DPR)
- **Adversary** - Standard enemy (55% DPR)
- **Nemesis** - Boss tier (60% DPR)
- **Harbinger** - Major threat (70% DPR)

**2 Creature Types:**
- **Outsider** - Extraplanar entities
- **Mortal** - Human/mortal creatures

**6 Size Categories (with stat modifiers: AC, HP%, Atk, DPR%):**
- **Small** - +1 AC, -10% HP, +1 Atk, -10% DPR
- **Medium** - No modifiers (baseline)
- **Large** - -1 AC, +5% HP, +0 Atk, +5% DPR
- **Huge** - -1 AC, +10% HP, -1 Atk, +10% DPR
- **Massive** - -2 AC, +15% HP, -2 Atk, +15% DPR
- **Colossal** - -2 AC, +20% HP, -2 Atk, +20% DPR

**12 NPC Roles (stat modifiers: AC, HP%, Atk, DPR%):**
- **Assassin** - 0 AC, -25% HP, +3 Atk, 0% DPR
- **Brute** - 0 AC, +33% HP, -3 Atk, 0% DPR
- **Defender** - 0 AC, +33% HP, 0 Atk, -25% DPR
- **Heavy** - -4 AC, +33% HP, 0 Atk, 0% DPR
- **Lithe** - +3 AC, -25% HP, 0 Atk, 0% DPR
- **Merciless** - 0 AC, 0% HP, -3 Atk, +33% DPR
- **Savage** - -4 AC, 0% HP, 0 Atk, +33% DPR
- **Skirmisher** - 0 AC, -25% HP, 0 Atk, +33% DPR
- **Striker** - -4 AC, 0% HP, +3 Atk, 0% DPR
- **Tank** - +3 AC, 0% HP, -3 Atk, 0% DPR
- **Vanguard** - +3 AC, 0% HP, 0 Atk, -25% DPR
- **Watcher** - 0 AC, 0% HP, +3 Atk, -25% DPR

```javascript
// Horde scaling
const npc_active_units = computed(() => {
  if (npc_type.value !== 'horde') return 1;
  return npc_horde_hp.value.filter(unit => !unit.defeated).length;
});

// Role/Size modifiers applied as computeds
const npc_role_modifiers = computed(() => roleModifiers[npc_role.value]);
const npc_size_modifiers = computed(() => sizeModifiers[npc_size.value]);
```

---

## Data Flow

### 1. Initial Load Sequence

```
1. main.js initializes Vue app
2. createRelay() called
   └── If devMode: use mock relay
   └── If staging/production: initRelay(relayConfig)
3. onInit handler fires
   └── Sets initValues (character, settings, compendiumDrop)
   └── Registers Transform action to token bar
4. relayPinia middleware hydrates stores
   └── Calls store.hydrateStore(attributes, profile)
5. Vue components render with reactive data
```

### 2. User Edit Flow

```
1. User edits input field
2. Vue reactivity updates store ref
3. Pinia $subscribe() triggers
4. debounceUpdate waits 800ms
5. doUpdate() calls dispatch.updateCharacter()
6. Beacon SDK syncs to Firebase
7. Other clients receive onChange
8. beaconPulse increments
9. Store re-hydrates (if updateId differs)
```

### 3. Dice Rolling Flow

```
1. User clicks roll button (e.g., rollSkill)
2. rollToChat utility called
3. getRollResults() builds roll expression
4. dispatch.roll() sends to Beacon
5. Results returned with individual dice
6. createRollTemplate() generates HTML
7. dispatch.post() sends to chat
```

---

## Roll Template System

### Template Architecture

```
rollTemplates/
├── index.js              # Handlebars setup
├── templates/
│   ├── newRoll.hbs       # Base roll template
│   └── complex.hbs       # Extended template
├── partials/
│   ├── header.hbs        # Title/subtitle
│   ├── rollTotal.hbs     # Total display
│   ├── rollComponents.hbs # Breakdown
│   ├── keyValues.hbs     # Properties
│   └── textContent.hbs   # Description
└── expressions/
    ├── sumComponents.js  # Math helper
    ├── getDice.js        # Extract dice
    ├── isGreater.js      # Comparison
    └── capitalize.js     # Text helper
```

### Template Data Structure

```javascript
const rollObj = {
  title: 'Roll Initiative',
  subtitle: '(Advantage)',
  characterName: 'Hero Name',
  components: [
    { label: '2d20kh', formula: '2d20kh1', alwaysShowInBreakdown: true },
    { label: 'DEX', value: 3, alwaysShowInBreakdown: true }
  ],
  keyValues: { 'Modifier': '+3' },
  textContent: 'Optional description'
}
```

---

## Computed Properties (Token Bar Linkage)

The sheet exposes computed properties for token bar integration:

```javascript
computed: {
  mkhp: { tokenBarValue: true, get: getMKHP, set: setMKHP },
  tempHp: { tokenBarValue: true, get: getTempHP, set: setTempHP },
  shp: { tokenBarValue: true, get: getSHP, set: setSHP },
  mp: { tokenBarValue: true, get: getMP, set: setMP },
}
```

**Features:**
- Bidirectional sync with token bars
- Supports relative changes (`+5`, `-3`)
- Max values computed automatically

---

## Styling Architecture

### CSS Organization

```
assets/
├── fonts.css     # @font-face declarations
├── variables.css # CSS custom properties (theming)
└── main.css      # Base styles, utility classes

components/
└── *.vue         # Scoped component styles
```

### Theme System

```css
/* variables.css pattern */
:root {
  --masterBack: #fff;
  --color: #333;
  --borderColor: #ccc;
  --header-blue: #1565c0;
  --gap: 16px;
  --half-gap: 8px;
  --tiny-gap: 4px;
}

html.dark {
  --masterBack: #1a1a1a;
  --color: #eee;
  /* ... */
}
```

### Layout System

- **CSS Grid** primary layout
- **Container Queries** for responsive sections
- **Subgrid** for aligned nested grids
- **CSS Custom Properties** for theming

---

## Build Configuration

### Vite Configuration

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
  assetsInclude: ["**/*.hbs"],  // Handlebars templates
  resolve: {
    alias: { '@': './src' }
  }
}));
```

### Build Outputs

```
dist/
├── sheet.js    # Bundled JavaScript
├── sheet.css   # Bundled styles
└── assets/     # Static assets
```

---

## Development Workflow

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development (port 5173) |
| `npm run sandbox` | Roll20 sandbox (port 7620) |
| `npm run build` | Production build |
| `npm run build-scss` | Compile roll template styles |

### Development Modes

1. **Offline (dev)** - Mock relay, no Firebase
2. **Sandbox (staging)** - Live Roll20 connection

```javascript
const env = import.meta.env.MODE || '';
const isDevEnvironment = ['development', 'test'].includes(env);
```

---

## Compendium Integration

### Data Files

| File | Contents | Size |
|------|----------|------|
| classes.json | Character classes | 31 KB |
| spells.json | Spell definitions | 29 KB |
| techniques.json | Battle techniques | 27 KB |
| monsters.json | NPC stat blocks | 64 KB |
| rules.json | Game rules | 163 KB |
| magi-knights-compendium.json | Full compendium | 381 KB |

### Drag-and-Drop Support

```javascript
// onDragOver handler
export const onDragOver = async ({ compendiumDropData }) => {
  if (compendiumDropData) {
    // Process compendium item drop
    initValues.compendiumDrop = compendiumDropData;
  }
}
```

---

## Performance Considerations

### Optimizations

1. **Debounced Updates** - 800ms delay prevents excessive Firebase writes
2. **Block Update Flag** - Prevents infinite update loops
3. **updateId Tracking** - Identifies update source, skips self-updates
4. **Lazy Loading** - Sub-views loaded via router

### Potential Bottlenecks

1. **Large sheetStore** (~2000 lines) - Consider splitting
2. **Hydration complexity** - Deep object traversal
3. **No virtual scrolling** - Large spell/technique lists

---

## Security Considerations

1. **Permission Checking** - `permissions.isOwner || permissions.isGM` guards
2. **Input Validation** - Type coercion on number inputs
3. **No Direct Firebase Access** - All writes through Beacon SDK
4. **Whisper Support** - GM-only roll visibility

---

## Extension Points

### Adding New Game Systems

1. **New Store Section:**
   ```javascript
   // In sheetStore.js
   const newSystem = {
     template: { /* defaults */ },
     rows: ref([])
   };
   ```

2. **Dehydrate/Hydrate Methods:**
   ```javascript
   function dehydrateNewSystem(data) { /* ... */ }
   function hydrateNewSystem(target, source) { /* ... */ }
   ```

3. **View Component:**
   ```vue
   <!-- NewSystemSection.vue -->
   <template>
     <RepeatingSection name="newSystem">
       <!-- items -->
     </RepeatingSection>
   </template>
   ```

### Adding New Roll Types

1. **Roll Function:**
   ```javascript
   const rollNewType = async () => {
     const rollObj = { /* ... */ };
     rollToChat({ rollObj });
   };
   ```

2. **Export from Store**

3. **Wire to UI Component**

---

## Known Technical Debt

1. **Mixed ref/reactive patterns** - Some inconsistency in store
2. **Large monolithic sheetStore** - Could benefit from modularization
3. **Commented-out code** - Several unused code blocks
4. **Incomplete type safety** - No TypeScript
5. **CSS specificity issues** - Some `!important` usage

---

## Recommendations

### Short-term
- Add TypeScript for type safety
- Split sheetStore into domain modules
- Add unit tests for computed properties
- Remove commented code blocks

### Medium-term
- Implement virtual scrolling for long lists
- Add form validation
- Create reusable composition functions
- Document compendium JSON schema

### Long-term
- Consider Nuxt.js for SSR benefits
- Add offline support with service workers
- Implement undo/redo for character edits
- Create sheet migration system for version updates

---

## Conclusion

The Magi-Knights character sheet demonstrates a well-architected Vue 3 application with clear separation of concerns between state management, UI components, and platform integration. The Beacon SDK relay layer provides a clean abstraction over Roll20's infrastructure, while the Pinia stores effectively model the complex game system data.

The primary areas for improvement are TypeScript adoption, store modularization, and test coverage. The current architecture is extensible and follows modern Vue best practices, making it a solid foundation for continued development.
