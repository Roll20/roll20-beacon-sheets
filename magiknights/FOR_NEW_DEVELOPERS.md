# Welcome to the Magi-Knights Character Sheet Codebase

## A Complete Onboarding Guide for New Developers

Welcome! This guide will help you understand the Magi-Knights Roll20 character sheet codebase so you can start contributing. Whether you're an intern or a developer new to Vue/Roll20, this document will walk you through everything step by step.

---

## Table of Contents

1. [What Are We Building?](#1-what-are-we-building)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Understanding the Tech Stack](#3-understanding-the-tech-stack)
4. [Project Structure Explained](#4-project-structure-explained)
5. [How Data Flows Through the App](#5-how-data-flows-through-the-app)
6. [Your First Code Changes](#6-your-first-code-changes)
7. [Common Development Tasks](#7-common-development-tasks)
8. [The Store System (State Management)](#8-the-store-system-state-management)
9. [Creating New Components](#9-creating-new-components)
10. [Working with Dice Rolls](#10-working-with-dice-rolls)
11. [Debugging Tips](#11-debugging-tips)
12. [Code Style & Best Practices](#12-code-style--best-practices)
13. [Testing Your Changes](#13-testing-your-changes)
14. [Common Pitfalls & Solutions](#14-common-pitfalls--solutions)
15. [Glossary](#15-glossary)
16. [Getting Help](#16-getting-help)

---

## 1. What Are We Building?

### The Big Picture

This is a **character sheet** for a tabletop RPG called "Magi-Knights Awakening" that runs on Roll20 (a virtual tabletop platform). Think of it like a digital version of the paper character sheets you'd use playing Dungeons & Dragons.

### What the Sheet Does

- Displays and edits character stats (strength, intelligence, etc.)
- Tracks health points, magic points, and other resources
- Rolls dice and shows results in the Roll20 chat
- Syncs data in real-time with other players
- Supports two character "forms" (Student and Magi-Knight)
- Manages spells, equipment, and special abilities

### The Game System

Magi-Knights has some unique features you'll encounter in the code:

| Concept | What It Means |
|---------|---------------|
| **Dual Forms** | Characters switch between Student (weak) and Magi-Knight (powerful) forms |
| **Reputation** | A 0-5 scale that affects proficiency bonus and unlocks abilities |
| **Soul Weapons** | Magical weapons with quality modifiers |
| **Spell Tiers** | Magic spells have 6 power levels (I through VI) |
| **Conditions** | Status effects like "Bleeding" or "Distressed" |
| **Formations** | Team combat tactics requiring multiple players |

---

## 2. Prerequisites & Setup

### Required Knowledge

Don't worry if you're not an expert in these - you'll learn as you go:

- **JavaScript (ES6+)** - Variables, functions, async/await, destructuring
- **HTML/CSS** - Basic web markup and styling
- **Vue.js basics** - Components, reactivity (we'll explain more below)

### Nice to Have

- Git version control
- Browser DevTools experience
- Basic understanding of reactive programming

### Setting Up Your Environment

#### Step 1: Install Required Software

```bash
# Install Node.js (v18 or higher recommended)
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### Step 2: Get Access to the Beacon SDK

The Roll20 Beacon SDK is hosted on GitHub Packages. You need a GitHub Personal Access Token:

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with `read:packages` scope
3. Set the environment variable:

```bash
# Windows (PowerShell)
$env:GITHUB_TOKEN="your_token_here"

# Windows (Command Prompt)
set GITHUB_TOKEN=your_token_here

# Mac/Linux
export GITHUB_TOKEN="your_token_here"
```

**Tip:** Add this to your shell profile so you don't have to set it every time.

#### Step 3: Clone and Install

```bash
# Navigate to your projects folder
cd your-projects-folder

# Clone the repository (if not already done)
git clone <repository-url>

# Navigate to the project
cd roll20-beacon-sheets/magiknights

# Install dependencies
npm install
```

#### Step 4: Start the Development Server

```bash
# Start local development (offline mode)
npm run dev
```

Open your browser to `http://localhost:5173` - you should see the character sheet!

### Development Modes Explained

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run dev` | Runs locally with mock data | Building UI, doesn't need Roll20 |
| `npm run sandbox` | Connects to Roll20 sandbox | Testing with real Roll20 features |
| `npm run build` | Creates production bundle | Deploying to Roll20 |

---

## 3. Understanding the Tech Stack

### Vue 3 - The Foundation

Vue is a JavaScript framework that makes building UIs easier. Here's a quick primer:

```vue
<!-- A Vue Single File Component (.vue file) -->
<script setup>
// JavaScript goes here
import { ref, computed } from 'vue'

// ref() creates reactive data - when it changes, the UI updates
const playerName = ref('Hero')

// computed() creates derived values that auto-update
const greeting = computed(() => `Hello, ${playerName.value}!`)

// Regular functions work too
const sayHello = () => {
  console.log(greeting.value)
}
</script>

<template>
  <!-- HTML goes here, with Vue magic -->
  <div>
    <!-- v-model creates two-way binding -->
    <input v-model="playerName" />

    <!-- {{ }} displays reactive values -->
    <p>{{ greeting }}</p>

    <!-- @click handles events -->
    <button @click="sayHello">Say Hello</button>
  </div>
</template>

<style>
/* CSS goes here, scoped to this component */
</style>
```

**Key Vue Concepts You'll Use:**

| Concept | Syntax | Purpose |
|---------|--------|---------|
| Reactive Data | `ref(value)` | Data that updates the UI when changed |
| Computed | `computed(() => ...)` | Derived values that auto-recalculate |
| Two-way Binding | `v-model="data"` | Input ↔ data sync |
| Conditional | `v-if="condition"` | Show/hide elements |
| List Rendering | `v-for="item in list"` | Repeat elements |
| Event Handling | `@click="handler"` | Respond to user actions |

### Pinia - State Management

Pinia is where we keep all the character data. Think of it as the "single source of truth":

```javascript
// Simplified example of how stores work
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCharacterStore = defineStore('character', () => {
  // State
  const strength = ref(10)

  // Computed
  const strengthMod = computed(() => Math.floor((strength.value - 10) / 2))

  // Actions
  const increaseStrength = () => {
    strength.value++
  }

  return { strength, strengthMod, increaseStrength }
})
```

Using a store in a component:

```vue
<script setup>
import { useCharacterStore } from '@/stores/characterStore'

const character = useCharacterStore()
</script>

<template>
  <div>
    <p>Strength: {{ character.strength }}</p>
    <p>Modifier: {{ character.strengthMod }}</p>
    <button @click="character.increaseStrength">+1 STR</button>
  </div>
</template>
```

### Beacon SDK - Roll20 Integration

The Beacon SDK lets our sheet talk to Roll20:

```javascript
// Things the SDK can do:
dispatch.roll({ rolls: { attack: '1d20+5' } })  // Roll dice
dispatch.post({ content: 'Hello!' })            // Send chat message
dispatch.updateCharacter({ ... })               // Save to database
dispatch.updateTokensByCharacter({ ... })       // Change token on map
```

---

## 4. Project Structure Explained

Here's what each folder does, with the files you'll work with most often:

```
magiknights/
│
├── src/                          # All source code lives here
│   │
│   ├── main.js                   # 🚀 App starts here
│   │                             #    Sets up Vue, Pinia, Router, Relay
│   │
│   ├── App.vue                   # 🏠 Root component
│   │                             #    Decides: show PC or NPC view?
│   │
│   ├── assets/                   # 🎨 Styles and fonts
│   │   ├── main.css              #    Global styles, utility classes
│   │   └── variables.css         #    Theme colors, spacing values
│   │
│   ├── components/               # 🧩 Reusable UI pieces (40+ files)
│   │   ├── Button.vue            #    Example: generic button
│   │   ├── Collapsible.vue       #    Expandable sections
│   │   ├── NotchContainer.vue    #    Decorative box with notched corners
│   │   ├── RepeatingSection.vue  #    Container for lists of items
│   │   ├── SkillSection.vue      #    All 17 skills display
│   │   ├── HPContainer.vue       #    Health/mana display
│   │   └── ...                   #    Many more!
│   │
│   ├── views/                    # 📄 Full page layouts
│   │   ├── PCView.vue            #    Player character main layout
│   │   ├── NPCView.vue           #    Monster/NPC stat block
│   │   └── PC/                   #    Sub-pages for PC
│   │       ├── BasicView.vue     #    Base stats & abilities
│   │       ├── StudentView.vue   #    Student form details
│   │       ├── KnightView.vue    #    Magi-Knight equipment & spells
│   │       ├── BackgroundView.vue#    Character backstory
│   │       └── SettingsView.vue  #    Sheet configuration
│   │
│   ├── stores/                   # 💾 Data management
│   │   ├── index.js              #    AppStore - orchestrates everything
│   │   ├── metaStore.js          #    Character name, avatar, bio
│   │   ├── sheetStore.js         #    ⭐ THE BIG ONE - all game data
│   │   └── spellModal.js         #    Spell editor popup state
│   │
│   ├── relay/                    # 🔌 Roll20 connection
│   │   ├── index.js              #    Relay setup & configuration
│   │   └── handlers/             #    Event handlers
│   │       ├── onInit.js         #    When sheet first loads
│   │       ├── onChange.js       #    When data updates externally
│   │       └── computed.js       #    Token bar linkage (HP bars)
│   │
│   ├── rollTemplates/            # 🎲 Chat output formatting
│   │   ├── index.js              #    Template registration
│   │   ├── templates/            #    Handlebars HTML templates
│   │   ├── partials/             #    Reusable template pieces
│   │   └── styles/               #    Chat message CSS
│   │
│   ├── utility/                  # 🔧 Helper functions
│   │   ├── rollToChat.js         #    Execute roll & post to chat
│   │   └── getRollResults.js     #    Process dice roll results
│   │
│   └── router/                   # 🗺️ Page navigation
│       └── index.js              #    Route definitions
│
├── compendium/                   # 📚 Game reference data (JSON)
│   ├── spells.json               #    All spell definitions
│   ├── techniques.json           #    Battle technique data
│   └── ...                       #    Classes, monsters, equipment, etc.
│
├── public/                       # 📁 Static files (copied as-is)
│
├── package.json                  # 📦 Dependencies & scripts
├── vite.config.js                # ⚙️ Build configuration
└── sheet.json                    # 📋 Roll20 sheet metadata
```

### Files You'll Edit Most Often

| When you want to... | Edit this file |
|---------------------|----------------|
| Add a new character stat | `src/stores/sheetStore.js` |
| Create a new UI section | `src/components/NewComponent.vue` |
| Add it to a page | `src/views/PC/SomethingView.vue` |
| Change how rolls look | `src/rollTemplates/templates/*.hbs` |
| Add a new roll type | `src/stores/sheetStore.js` (roll function) |
| Change styling | Component's `<style>` or `src/assets/*.css` |

---

## 5. How Data Flows Through the App

Understanding data flow is crucial. Here's what happens when a user changes something:

### The Edit Flow (User → Database)

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER TYPES IN INPUT                                      │
│     <input v-model="sheet.strength" />                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. VUE REACTIVITY UPDATES STORE                            │
│     sheet.strength becomes 15                                │
│     strengthMod auto-recalculates to +2                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. PINIA SUBSCRIBER TRIGGERS                               │
│     The store notices a change happened                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. DEBOUNCE WAITS 800ms                                    │
│     Prevents saving after every keystroke                    │
│     If user keeps typing, timer resets                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. DEHYDRATE STORE                                         │
│     Convert Vue refs to plain JSON for Firebase              │
│     { strength: 15, strengthMod: 2, ... }                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. BEACON SDK SAVES TO FIREBASE                            │
│     dispatch.updateCharacter(characterData)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ☁️ Roll20 Database ☁️
```

### The Load Flow (Database → User)

When someone else edits the character (or the page reloads):

```
                     ☁️ Roll20 Database ☁️
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. onChange HANDLER FIRES                                  │
│     Beacon SDK notifies us of external changes               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. HYDRATE STORE                                           │
│     Convert plain JSON back to Vue refs                      │
│     sheet.strength.value = data.strength                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. VUE REACTIVITY UPDATES UI                               │
│     All computed values recalculate                          │
│     Components re-render with new data                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Terms

| Term | Meaning |
|------|---------|
| **Hydrate** | Load data from database into Vue store |
| **Dehydrate** | Convert Vue store data for database storage |
| **Debounce** | Wait for user to stop typing before saving |
| **Ref** | Vue's reactive wrapper (`ref(10)` → `{ value: 10 }`) |

---

## 6. Your First Code Changes

Let's make some real changes to get comfortable with the codebase.

### Exercise 1: Change a Label

**Goal:** Change "Strength" to display as "STR" somewhere.

1. Open `src/components/AbilityScore.vue`
2. Find where the ability name is displayed
3. You might see something like:
   ```vue
   <span>{{ ability.name }}</span>
   ```
4. You could change it to show an abbreviation:
   ```vue
   <span>{{ ability.name.substring(0, 3).toUpperCase() }}</span>
   ```
5. Save and check the browser - it should hot-reload!

### Exercise 2: Add a Tooltip

**Goal:** Add a hover tooltip to show what a stat does.

1. Find an element you want to add a tooltip to
2. Add a `title` attribute:
   ```vue
   <span title="Your physical power for melee attacks">
     Strength: {{ sheet.strength }}
   </span>
   ```

### Exercise 3: Add a New Simple Field

**Goal:** Add a "Nickname" field to the character sheet.

**Step 1: Add to the Store** (`src/stores/sheetStore.js`)

Find where other simple fields are defined (near the top):
```javascript
const character_name = ref('');
const level = ref(1);
// Add your new field here:
const nickname = ref('');
```

**Step 2: Add to Dehydrate** (same file, find the `dehydrate` function):
```javascript
const dehydrate = () => {
  const obj = {
    // ... existing fields ...
    nickname: nickname.value,  // Add this line
  };
  // ...
}
```

**Step 3: Add to Hydrate** (same file, find the `hydrate` function):
```javascript
const hydrate = (hydrateStore) => {
  // ... existing hydrations ...
  nickname.value = hydrateStore.nickname ?? nickname.value;  // Add this
}
```

**Step 4: Export the Field** (at the bottom of the store's return statement):
```javascript
return {
  // ... existing exports ...
  nickname,  // Add this
}
```

**Step 5: Use in a Component** (`src/views/PC/SettingsView.vue` or similar):
```vue
<script setup>
import { useSheetStore } from '@/stores/sheetStore';
const sheet = useSheetStore();
</script>

<template>
  <div>
    <label>Nickname:</label>
    <input v-model="sheet.nickname" type="text" />
  </div>
</template>
```

That's it! The field will now save automatically.

---

## 7. Common Development Tasks

### Task: Add a New Stat with Auto-Calculation

Let's add a "Luck" stat that equals (Charisma Mod + Reputation).

```javascript
// In sheetStore.js

// 1. Add the override (for manual entry)
const luck_override = ref('');

// 2. Add the computed property
const luck = computed({
  get() {
    // If manually overridden, use that value
    if (luck_override.value !== '' && !isNaN(Number(luck_override.value))) {
      return Number(luck_override.value);
    }
    // Otherwise, calculate automatically
    return charismaMod.value + reputation.value;
  },
  set(value) {
    // Allow manual override
    luck_override.value = value === '' ? '' : value;
  }
});

// 3. Don't forget to add to dehydrate/hydrate and return statement!
```

### Task: Add a New Repeating Section

Repeating sections are lists of items (like inventory or abilities).

```javascript
// In sheetStore.js, find the 'sections' object

const sections = {
  // ... existing sections ...

  // Add your new section
  companions: {
    template: {
      name: '',
      species: '',
      loyalty: 0,
      collapsed: true
    },
    addItem(item) {
      const newItem = { ...this.template, ...item };
      this.rows.value.push(newItem);
    },
    rows: ref([])
  }
};
```

Then create a component to display it:

```vue
<!-- src/components/CompanionSection.vue -->
<script setup>
import { useSheetStore } from '@/stores/sheetStore';
import RepeatingSection from './RepeatingSection.vue';
import Collapsible from './Collapsible.vue';

const sheet = useSheetStore();
</script>

<template>
  <RepeatingSection name="companions">
    <div v-for="companion in sheet.sections.companions.rows" :key="companion._id">
      <Collapsible :default="companion.collapsed" @collapse="companion.collapsed = !companion.collapsed">
        <template #collapsed>
          {{ companion.name || 'New Companion' }}
        </template>
        <template #expanded>
          <input v-model="companion.name" placeholder="Companion name" />
          <input v-model="companion.species" placeholder="Species" />
          <input v-model.number="companion.loyalty" type="number" min="0" max="10" />
        </template>
      </Collapsible>
      <button @click="sheet.removeRow('companions', companion._id)">Delete</button>
    </div>
  </RepeatingSection>
</template>
```

### Task: Add a New Roll Button

```javascript
// In sheetStore.js

const rollLuck = () => {
  const rollObj = {
    title: 'Luck Check',
    subtitle: 'May fortune favor you!',
    characterName: metaStore.name,
    components: [
      { label: '1d20', formula: '1d20', alwaysShowInBreakdown: true },
      { label: 'Luck', value: luck.value, alwaysShowInBreakdown: true }
    ]
  };
  rollToChat({ rollObj });
};

// Export it in the return statement
return {
  // ...
  rollLuck,
}
```

In a component:
```vue
<button @click="sheet.rollLuck()">Roll Luck</button>
```

---

## 8. The Store System (State Management)

### The Three Stores

```
┌─────────────────────────────────────────────────────────────┐
│                        AppStore                              │
│  "The Manager" - Coordinates the other stores               │
│  • Combines data for Firebase sync                          │
│  • Provides getValue/setValue for any data                  │
│  • Handles permissions                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐         ┌─────────────────────────┐    │
│  │   MetaStore     │         │      SheetStore         │    │
│  │                 │         │                         │    │
│  │ "The Basics"    │         │ "Everything Else"       │    │
│  │                 │         │                         │    │
│  │ • name          │         │ • Ability scores        │    │
│  │ • avatar        │         │ • Skills                │    │
│  │ • bio           │         │ • HP/MP/SHP             │    │
│  │ • gmNotes       │         │ • Equipment             │    │
│  │ • permissions   │         │ • Spells                │    │
│  │                 │         │ • Conditions            │    │
│  │                 │         │ • NPC data              │    │
│  │                 │         │ • Roll functions        │    │
│  └─────────────────┘         └─────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Using Stores in Components

```vue
<script setup>
// Import the stores you need
import { useSheetStore } from '@/stores/sheetStore';
import { useMetaStore } from '@/stores/metaStore';

// Create store instances
const sheet = useSheetStore();
const meta = useMetaStore();
</script>

<template>
  <h1>{{ meta.name }}</h1>
  <p>Level {{ sheet.level }} Character</p>
  <p>Strength: {{ sheet.strength }} ({{ sheet.strengthMod >= 0 ? '+' : '' }}{{ sheet.strengthMod }})</p>
</template>
```

### The Hydrate/Dehydrate Pattern

This is how data moves between Vue's reactive system and Firebase:

```javascript
// DEHYDRATE: Vue → Firebase
// Converts reactive refs to plain values
const dehydrate = () => {
  return {
    level: level.value,           // ref → number
    skills: dehydrateSkills(skills), // nested object handling
    hp: dehydrateHp(hp),          // complex object handling
  };
};

// HYDRATE: Firebase → Vue
// Converts plain values back to reactive refs
const hydrate = (data) => {
  level.value = data.level ?? level.value;  // Use ?? to keep current if missing
  hydrateSkills(skills, data.skills);
  hydrateHp(hp, data.hp);
};
```

**Important:** Every field you add needs both dehydrate and hydrate handling, or it won't save!

---

## 9. Creating New Components

### Component Template

Here's a template for creating new components:

```vue
<!-- src/components/MyNewComponent.vue -->
<script setup>
// 1. Imports
import { ref, computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';

// 2. Store access
const sheet = useSheetStore();

// 3. Props (if any)
const props = defineProps({
  title: {
    type: String,
    default: 'Default Title'
  },
  showDetails: {
    type: Boolean,
    default: false
  }
});

// 4. Emits (if any)
const emit = defineEmits(['update', 'delete']);

// 5. Local state
const isExpanded = ref(false);

// 6. Computed values
const displayValue = computed(() => {
  return `${props.title}: ${sheet.someValue}`;
});

// 7. Methods
const handleClick = () => {
  isExpanded.value = !isExpanded.value;
  emit('update', isExpanded.value);
};
</script>

<template>
  <div class="my-component">
    <h3 @click="handleClick">{{ displayValue }}</h3>

    <div v-if="isExpanded && props.showDetails" class="details">
      <!-- Detailed content here -->
    </div>
  </div>
</template>

<style lang="scss">
.my-component {
  padding: var(--half-gap);
  border: 1px solid var(--borderColor);

  h3 {
    cursor: pointer;
    color: var(--header-blue);
  }

  .details {
    margin-top: var(--tiny-gap);
  }
}
</style>
```

### Using Existing UI Components

We have many reusable components. Here are the most common:

#### NotchContainer - Decorative Box
```vue
<NotchContainer width="thick" :notch="20">
  <h3>Section Title</h3>
  <p>Content goes here</p>
</NotchContainer>
```

#### Collapsible - Expandable Section
```vue
<Collapsible :default="isCollapsed" @collapse="isCollapsed = !isCollapsed">
  <template #collapsed>
    <span>Click to expand: {{ item.name }}</span>
  </template>
  <template #expanded>
    <input v-model="item.name" />
    <textarea v-model="item.description"></textarea>
  </template>
</Collapsible>
```

#### RepeatingSection - Lists of Items
```vue
<RepeatingSection name="sectionName">
  <div v-for="item in sheet.sections.sectionName.rows" :key="item._id">
    <!-- Item template -->
    <button @click="sheet.removeRow('sectionName', item._id)">Delete</button>
  </div>
</RepeatingSection>
```

---

## 10. Working with Dice Rolls

### Basic Roll Structure

Every roll follows this pattern:

```javascript
const rollSomething = async () => {
  // 1. Build the roll object
  const rollObj = {
    title: 'Roll Name',                    // Main header
    subtitle: 'Additional info',           // Optional subheader
    characterName: metaStore.name,         // Who's rolling
    components: [
      // Dice to roll (formula) or static values (value)
      { label: '1d20', formula: '1d20', alwaysShowInBreakdown: true },
      { label: 'Modifier', value: 5, alwaysShowInBreakdown: true },
    ],
    keyValues: {                           // Extra info displayed
      'Damage Type': 'Fire',
      'Range': '30ft'
    },
    textContent: 'Optional description text'  // Shown at bottom
  };

  // 2. Execute the roll and post to chat
  rollToChat({ rollObj });
};
```

### Roll Mode (Advantage/Disadvantage)

The sheet supports advantage/disadvantage. Use `getRollDice()`:

```javascript
const rollWithMode = () => {
  const dice = getRollDice();  // Returns { formula, display } based on rollMode

  const rollObj = {
    title: 'Attack Roll',
    characterName: metaStore.name,
    components: [
      { label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true },
      { label: 'Attack Bonus', value: sheet.knight_attack, alwaysShowInBreakdown: true }
    ]
  };

  rollToChat({ rollObj });
};
```

`getRollDice()` returns:
- Normal: `{ formula: '1d20', display: '1d20' }`
- Advantage: `{ formula: '2d20kh1', display: '2d20kh' }`
- Disadvantage: `{ formula: '2d20kl1', display: '2d20kl' }`

### Roll with Damage

For attack + damage rolls:

```javascript
const rollWeaponAttack = async () => {
  const dice = getRollDice();

  // Roll attack and damage in parallel
  const attackPromise = getRollResults([
    { label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true },
    { label: 'Attack', value: attackBonus, alwaysShowInBreakdown: true }
  ]);

  const damagePromise = getRollResults([
    { label: 'Damage', formula: '2d6+3' }
  ]);

  const [attackResult, damageResult] = await Promise.all([attackPromise, damagePromise]);

  // Build output with both results
  const rollObj = {
    title: 'Weapon Attack',
    components: attackResult.components,
    keyValues: {
      'Damage': `${damageResult.total}`
    }
  };

  rollToChat({ rollObj });
};
```

---

## 11. Debugging Tips

### Vue DevTools

1. Install the Vue DevTools browser extension
2. Open browser DevTools → Vue tab
3. You can:
   - Inspect component hierarchy
   - View/edit store state in real-time
   - Track reactivity changes

### Console Logging

```javascript
// Add these for debugging
console.log('Current strength:', sheet.strength);
console.log('Full store state:', sheet.$state);

// For objects, use console.dir
console.dir(sheet.sections.spells.rows);
```

### Common Debug Locations

Add `console.log` in these places to trace issues:

```javascript
// In relay/index.js - see what's being saved/loaded
const doUpdate = (dispatch, update, logMode = false) => {
  console.log('Saving to Firebase:', update);  // Add this
  // ...
};

// In sheetStore.js hydrate - see incoming data
const hydrate = (hydrateStore) => {
  console.log('Hydrating from:', hydrateStore);  // Add this
  // ...
};
```

### Check If Data Is Saving

1. Make a change in the sheet
2. Wait 1 second (debounce)
3. Check browser console for: `dispatching character =>`
4. If you don't see it, the store subscription might not be triggering

### Reactivity Debugging

If a computed value isn't updating:

```javascript
// Check if the dependency is actually reactive
const myComputed = computed(() => {
  console.log('Recomputing! Value is:', someRef.value);
  return someRef.value * 2;
});

// Make sure you're using .value for refs
const badExample = ref(5);
console.log(badExample);        // Wrong! Shows the ref wrapper
console.log(badExample.value);  // Correct! Shows 5
```

---

## 12. Code Style & Best Practices

### Naming Conventions

```javascript
// Variables: camelCase
const playerName = ref('');
const maxHitPoints = computed(() => ...);

// Constants: SCREAMING_SNAKE_CASE
const MAX_LEVEL = 16;
const DEFAULT_REPUTATION = 0;

// Components: PascalCase
// SkillSection.vue, NotchContainer.vue

// CSS classes: kebab-case
// .skill-container, .hp-display
```

### Vue Component Structure

Keep this order in components:
1. `<script setup>` - imports, props, store, computed, methods
2. `<template>` - HTML structure
3. `<style>` - CSS (use `lang="scss"` for SCSS features)

### Store Organization

When adding to the store:
1. Declare refs/state at the top of their section
2. Add computed properties after related refs
3. Add methods after computed
4. Update dehydrate/hydrate
5. Add to return statement

### CSS Guidelines

```scss
// Use CSS variables for colors and spacing
.my-component {
  padding: var(--half-gap);      // Not: padding: 8px;
  color: var(--color);           // Not: color: #333;
  background: var(--masterBack);
}

// Use existing utility classes
<div class="flex-box half-gap">  // Flexbox with gap
<div class="grid-span-all">       // Span full width in grid
<span class="bold capitalize">    // Bold and capitalized
```

### Avoid These Patterns

```javascript
// ❌ DON'T: Mutate props
props.value = newValue;

// ✅ DO: Emit events to parent
emit('update', newValue);

// ❌ DON'T: Use var
var oldStyle = true;

// ✅ DO: Use const/let
const newStyle = true;

// ❌ DON'T: Forget .value for refs in script
if (myRef) { ... }

// ✅ DO: Access .value
if (myRef.value) { ... }

// ❌ DON'T: Hardcode colors
color: #1565c0;

// ✅ DO: Use CSS variables
color: var(--header-blue);
```

---

## 13. Testing Your Changes

### Manual Testing Checklist

Before submitting your changes, test:

- [ ] **UI displays correctly** - Does it look right?
- [ ] **Data saves** - Change a value, refresh, is it still there?
- [ ] **Computed values update** - Change a dependency, does the computed update?
- [ ] **Rolls work** - Click roll buttons, do they post to chat?
- [ ] **Edge cases** - Empty values, very large numbers, special characters

### Testing in Different Modes

```bash
# Test in offline mode (fast iteration)
npm run dev

# Test with Roll20 sandbox (real functionality)
npm run sandbox
```

### Browser Testing

Test in:
- Chrome (primary)
- Firefox (secondary)
- Edge (if time allows)

### Things to Watch For

1. **Console errors** - Red errors in DevTools console
2. **Broken layouts** - Elements overlapping or misaligned
3. **Infinite loops** - Browser freezing or high CPU usage
4. **Data loss** - Values not persisting after refresh

---

## 14. Common Pitfalls & Solutions

### Problem: "My new field doesn't save!"

**Cause:** Missing dehydrate or hydrate handling.

**Solution:**
1. Check `dehydrate()` - is the field included?
2. Check `hydrate()` - is the field being loaded?
3. Check the return statement - is it exported?

```javascript
// All three must include your field:
const myField = ref('');

const dehydrate = () => ({
  // ...
  myField: myField.value,  // 1. Add here
});

const hydrate = (data) => {
  // ...
  myField.value = data.myField ?? myField.value;  // 2. Add here
};

return {
  // ...
  myField,  // 3. Add here
};
```

### Problem: "Computed value doesn't update!"

**Cause:** The dependency isn't reactive or you're not accessing `.value`.

**Solution:**
```javascript
// ❌ Wrong - not using .value
const total = computed(() => baseValue + modifier);

// ✅ Correct
const total = computed(() => baseValue.value + modifier.value);
```

### Problem: "Changes trigger infinite loop!"

**Cause:** An update triggers another update in a cycle.

**Solution:**
- Check if you're updating a value inside its own watcher
- Use the `blockUpdate` flag pattern from the relay

### Problem: "Style not applying!"

**Cause:** CSS specificity issues or missing lang="scss".

**Solution:**
```vue
<!-- Make sure to include lang="scss" if using SCSS -->
<style lang="scss">
.my-class {
  // Use more specific selectors if needed
  .parent & {
    color: red;
  }
}
</style>
```

### Problem: "Component not showing!"

**Causes & Solutions:**
1. **Not imported** - Add the import statement
2. **Not registered** - With `<script setup>`, imports are auto-registered
3. **v-if hiding it** - Check conditional rendering
4. **Permission check** - Are you owner/GM?

```vue
<script setup>
// Make sure to import!
import MyComponent from './MyComponent.vue';
</script>

<template>
  <!-- Check that conditions allow display -->
  <MyComponent v-if="shouldShow" />
</template>
```

### Problem: "Roll not posting to chat!"

**Cause:** Running in dev mode (no Roll20 connection).

**Solution:**
- In dev mode, rolls log to console instead
- Use `npm run sandbox` for real chat posting
- Or check console for "devRelay" messages

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **Beacon SDK** | Roll20's official library for building character sheets |
| **Component** | A reusable Vue UI piece (`.vue` file) |
| **Computed** | A derived value that auto-updates when dependencies change |
| **Dehydrate** | Convert Vue reactive data to plain JSON for storage |
| **Dispatch** | The Beacon SDK object for Roll20 communication |
| **Firebase** | Roll20's backend database (you don't access directly) |
| **Handlebars** | Template language used for roll output HTML |
| **Hot Module Replacement (HMR)** | Auto-refresh when you save files |
| **Hydrate** | Load plain JSON data into Vue reactive refs |
| **Pinia** | Vue's state management library (stores) |
| **Ref** | Vue's reactive wrapper: `ref(5)` → `{ value: 5 }` |
| **Relay** | Our bridge between Vue and the Beacon SDK |
| **Repeating Section** | A dynamic list of items (techniques, spells, etc.) |
| **Sandbox** | Roll20's test environment for sheet development |
| **Store** | A Pinia module containing related state and logic |
| **VTT** | Virtual Tabletop (Roll20, Foundry, etc.) |

---

## 16. Getting Help

### Documentation Resources

- **Vue 3 Docs:** https://vuejs.org/guide/introduction.html
- **Pinia Docs:** https://pinia.vuejs.org/
- **Roll20 Beacon SDK:** (internal Roll20 documentation)
- **This Project's Architecture:** See `ARCHITECTURAL_ANALYSIS.md`

### When You're Stuck

1. **Check the console** - Error messages often tell you exactly what's wrong
2. **Search the codebase** - How did we do something similar elsewhere?
3. **Read the architecture doc** - `ARCHITECTURAL_ANALYSIS.md` explains the "why"
4. **Ask for help** - Don't struggle for hours on something a teammate knows

### Code Search Tips

```bash
# Find where something is defined
grep -r "const myFunction" src/

# Find where something is used
grep -r "myFunction" src/

# Find all TODO comments
grep -r "TODO" src/
```

Or use your IDE's search (Ctrl+Shift+F in VS Code).

### Asking Good Questions

When asking for help, include:
1. What you're trying to do
2. What you expected to happen
3. What actually happened
4. Error messages (if any)
5. What you've already tried

---

## Quick Reference Card

### Starting Development
```bash
npm install          # First time setup
npm run dev          # Start local dev server
npm run sandbox      # Connect to Roll20 sandbox
```

### Adding a New Field
1. Add `const myField = ref('')` in sheetStore.js
2. Add to `dehydrate()`: `myField: myField.value`
3. Add to `hydrate()`: `myField.value = data.myField ?? myField.value`
4. Add to return statement
5. Use in component: `<input v-model="sheet.myField" />`

### Creating a Roll
```javascript
const rollObj = {
  title: 'Roll Name',
  characterName: metaStore.name,
  components: [
    { label: '1d20', formula: '1d20', alwaysShowInBreakdown: true },
    { label: 'Bonus', value: 5, alwaysShowInBreakdown: true }
  ]
};
rollToChat({ rollObj });
```

### Common Components
```vue
<NotchContainer>Content</NotchContainer>
<Collapsible :default="collapsed" @collapse="toggle"><template #expanded>...</template></Collapsible>
<RepeatingSection name="items">...</RepeatingSection>
```

### CSS Variables
```scss
var(--masterBack)    // Background color
var(--color)         // Text color
var(--borderColor)   // Border color
var(--header-blue)   // Accent color
var(--gap)           // 16px spacing
var(--half-gap)      // 8px spacing
var(--tiny-gap)      // 4px spacing
```

---

## Welcome to the Team!

You now have everything you need to start contributing to the Magi-Knights character sheet. Remember:

- **Start small** - Make small changes first to build confidence
- **Read the code** - Existing code is your best teacher
- **Ask questions** - Everyone was new once
- **Have fun** - You're building tools for people to play games!

Good luck, and happy coding!
