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

2. **Release Magic** - Card-based spell system (Bakugan/Magic: The Gathering inspired)
   - Deck of 6 cards
   - 2 signature cards
   - Draw/discard mechanics

### Combat Systems

**Conditions Tracking (25+ conditions):**
```javascript
conditions: ref({
  distressed: false,    // -1 to checks
  horrified: false,     // Mental
  berserk: false,
  bleeding: false,      // Physical
  burning: false,
  exposed: false,
  // ... etc
})
```

**Squadron Formations:**
- Arrow (Attack), Victory (Defense), Barrage (Destruction), Diamond (Restoration)
- Require 3+ Magi-Knights within 60ft
- Unity Point cost

**Combination Maneuvers:**
- 8 maneuvers requiring 2-4 participants
- Unity Point cost (unlocked at Rep II)
- Effects scale with Reputation

### Equipment System

**Soul Weapon Qualities:**
```javascript
soul_weapon: {
  qualities: ref({
    accurate: false,      // +1 attack
    coupled: false,       // Dual-wield
    finesse: false,       // DEX for attack/damage
    massive: false,       // -2 attack, +4 damage
    veilPiercing: false,  // Crit on 16+
    vicious: false        // Max crit dice
    // ... etc
  })
}
```

**Soul Gun** and **Magical Implement** follow similar patterns with unique qualities.

### NPC/Monster System

**5 NPC Types:**
- **Horde** - 4 HP pools, scaling attack DC/damage
- **Vassal** - Minion tier
- **Adversary** - Standard enemy
- **Nemesis** - Boss tier
- **Harbinger** - Major threat

```javascript
// Horde scaling
const npc_active_units = computed(() => {
  if (npc_type.value !== 'horde') return 1;
  return npc_horde_hp.value.filter(unit => !unit.defeated).length;
});
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
