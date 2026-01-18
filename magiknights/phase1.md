# Phase 1 Implementation: Core Resources & Herald System

**Completed:** January 2026

## Overview

Phase 1 implemented three new features for the Magi-Knights Awakening Roll20 character sheet:
1. Unity Points Resource System (Critical priority)
2. Gloom Gems Currency Tracking (High priority)
3. Herald Bond Level System (High priority)

---

## Feature 1: Unity Points Resource System

### Description
Unity Points are used by Magi-Knights to pay for Combination Maneuvers. They are unlocked at Reputation Level II and have a maximum based on reputation.

### Game Rules (per compendium)
- Unlocked at Reputation Level II (reputation >= 2)
- Maximum Unity Points = Reputation Level - 1
  - Rep II: max 1
  - Rep III: max 2
  - Rep IV: max 3
  - Rep V: max 4
- Restored during Sleep Phase

### Files Modified

#### `src/stores/sheetStore.js`
Added computed properties for Unity Points management:

```javascript
// Unity Points: Unlocked at Reputation Level II (rep >= 2), max = rep - 1
const unityMax = computed(() => {
  if (reputation.value < 2) return 0;
  return reputation.value - 1;
});

// Check if Unity Points are available (Rep II+ required)
const unityAvailable = computed(() => reputation.value >= 2);
```

Exported new properties:
- `unity_max` - Computed maximum Unity Points
- `unity_available` - Boolean indicating if Unity Points are unlocked

#### `src/components/BaseSplit.vue`
Updated the Unity Points display:

**Before:** Simple number input

**After:**
- Shows current/max display (e.g., "2/3") when unlocked
- Shows locked state with 🔒 icon when reputation < 2
- Input is clamped to max value

```vue
<CloverDisplay v-if="sheet.unity_available" class="unity-points">
  <template v-slot:content>
    <div class="unity-display">
      <input class="input-number unity-current" type="number"
             v-model="sheet.unity_points" :max="sheet.unity_max" min="0">
      <span class="unity-separator">/</span>
      <span class="unity-max">{{ sheet.unity_max }}</span>
    </div>
  </template>
</CloverDisplay>
<CloverDisplay v-else class="unity-points unity-locked">
  <template v-slot:content>
    <span class="locked-text" title="Unlocked at Reputation Level II">🔒</span>
  </template>
</CloverDisplay>
```

Added CSS styles for the new display format.

---

## Feature 2: Gloom Gems Currency Tracking

### Description
Gloom Gems are the currency that Magi-Knights receive from defeating enemies and use to purchase Shards, Runes, and Visors from their Herald.

### Status
**Already Implemented** - Gloom Gems was already present in the codebase:
- Store: `gloom` ref in `sheetStore.js`
- UI: CloverDisplay in `BaseSplit.vue`
- Persistence: Included in dehydrate/hydrate as `gloom_gems`

No changes were needed for this feature.

---

## Feature 3: Herald Bond Level System

### Description
The Herald is the supernatural entity that grants Magi-Knight powers. The bond level with the Herald affects spell tier access and other abilities.

### Game Rules (per compendium)
- Herald Bond Level ranges from I to V (1-5)
- Bond Level IV+ unlocks access to Spell Tier VI
- Herald cannot directly assist in combat

### Files Modified

#### `src/stores/sheetStore.js`
Added Herald data structure:

```javascript
// Herald Bond Level system (I-V, stored as 1-5)
const herald = {
  name: ref(''),
  bondLevel: ref(1),
  notes: ref('')
};

// Check if Tier VI spells are unlocked (requires Herald Bond Level IV+)
const tierVIUnlocked = computed(() => herald.bondLevel.value >= 4);
```

Added dehydrate/hydrate functions:

```javascript
function dehydrateHerald(herald) {
  return {
    name: herald.name.value,
    bondLevel: herald.bondLevel.value,
    notes: herald.notes.value
  };
}

function hydrateHerald(herald, hydrateData = {}) {
  herald.name.value = hydrateData.name ?? herald.name.value;
  herald.bondLevel.value = hydrateData.bondLevel ?? herald.bondLevel.value;
  herald.notes.value = hydrateData.notes ?? herald.notes.value;
}
```

Integrated into main dehydrate/hydrate functions and exported:
- `herald` - Herald data object
- `tierVIUnlocked` - Boolean for Tier VI access

#### `src/views/PC/StudentView.vue`
Added Herald Connection section at the bottom of the Student page (after Magi-Knight Bonds):

```vue
<NotchContainer class="herald-container" width="thick" notchType="curve">
  <h4>Herald Connection</h4>
  <div class="herald-content">
    <!-- Herald Name input -->
    <!-- Bond Level selector (I-V) -->
    <!-- Spell Tier Access visual indicator -->
    <!-- Notes textarea -->
  </div>
</NotchContainer>
```

Features:
- Herald Name text input
- Bond Level dropdown (I through V with descriptions)
- Visual tier access badges showing which spell tiers are unlocked
- Tier VI badge shows locked (🔒) until Bond Level IV+
- Notes textarea for additional information

Added comprehensive SCSS styles for the Herald section including:
- Grid layout for content
- Tier badge styling (unlocked/locked states)
- Dark mode support

---

## Summary of All Changes

### Files Modified
1. `src/stores/sheetStore.js`
   - Added `unityMax` computed property
   - Added `unityAvailable` computed property
   - Added `herald` object with name, bondLevel, notes
   - Added `tierVIUnlocked` computed property
   - Added `dehydrateHerald()` function
   - Added `hydrateHerald()` function
   - Updated main `dehydrate()` to include herald
   - Updated main `hydrate()` to include herald
   - Updated return statement with new exports

2. `src/components/BaseSplit.vue`
   - Updated Unity Points display to show current/max
   - Added locked state display for reputation < 2
   - Added CSS for unity-display, unity-current, unity-separator, unity-max, unity-locked, locked-text

3. `src/views/PC/StudentView.vue`
   - Added Herald Connection section template
   - Added Herald section SCSS styles

### Files Not Modified
- `src/components/CloverDisplay.vue` - Used as-is
- Compendium files - Referenced for rules, not modified

---

## Testing

- Build completes successfully with `npm run build`
- No TypeScript/JavaScript errors
- All new state properly persists via dehydrate/hydrate system
