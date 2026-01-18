# Phase 2 Implementation: Squadron Formations

**Completed:** January 2026

## Overview

Phase 2 implemented the Squadron Formations system for the Magi-Knights Awakening Roll20 character sheet. Formations are powerful group abilities that require 3+ Magi-Knights within 60ft and cost Inspiration to activate.

---

## Formation Rules (per compendium/lists.json)

### General Rules
- Requires 3+ Magi-Knights within 60ft
- Any participant may contribute Inspiration to pay the cost
- Formations provide scaling bonuses based on Reputation level

### Formation Types

| Formation | Type | Cost | Effect |
|-----------|------|------|--------|
| Arrow Formation | Attack | 2 Inspiration | +2× Reputation damage for all squadron members |
| Victory Formation | Defense | 2 Inspiration | +2× Reputation armor for all squadron members |
| Barrage Formation | Destruction | 3 Inspiration | Deal 3× Reputation damage to all enemies in 30ft |
| Diamond Formation | Restoration | 3 Inspiration | Heal all squadron members for 2× Reputation |

---

## Files Modified

### `src/stores/sheetStore.js`

Added formation data structure with all four formations:

```javascript
const formationData = {
  arrow: {
    name: 'Arrow Formation',
    type: 'Attack',
    cost: 2,
    description: 'All squadron members within 60ft gain bonus damage...',
    shortEffect: (rep) => `+${2 * rep} damage`
  },
  victory: {
    name: 'Victory Formation',
    type: 'Defense',
    cost: 2,
    description: 'All squadron members within 60ft gain bonus armor...',
    shortEffect: (rep) => `+${2 * rep} armor`
  },
  barrage: {
    name: 'Barrage Formation',
    type: 'Destruction',
    cost: 3,
    description: 'Deal massive damage to all enemies within 30ft...',
    shortEffect: (rep) => `${3 * rep} damage to all enemies`
  },
  diamond: {
    name: 'Diamond Formation',
    type: 'Restoration',
    cost: 3,
    description: 'Heal all squadron members within 60ft...',
    shortEffect: (rep) => `Heal ${3 * rep} HP/turn`
  }
};
```

Added active formation tracking and collapsed state:

```javascript
const activeFormation = ref(null);
const formationsCollapsed = ref(true);
```

Added computed formation effects (scales with reputation):

```javascript
const formationEffects = computed(() => ({
  arrow: { damageBonus: 2 * reputation.value },
  victory: { armorBonus: 2 * reputation.value },
  barrage: { damage: 3 * reputation.value },
  diamond: { healing: 3 * reputation.value }
}));
```

Added activation/deactivation functions with chat output:

```javascript
const activateFormation = (formationKey) => {
  const formation = formationData[formationKey];
  if (!formation) return;

  activeFormation.value = formationKey;

  rollToChat({
    templateType: 'formation',
    parameters: {
      charactername: name.value,
      formationName: formation.name,
      formationType: formation.type,
      cost: formation.cost,
      effect: formation.shortEffect(reputation.value),
      description: formation.description,
      action: 'activate'
    }
  });
};

const deactivateFormation = () => {
  if (!activeFormation.value) return;

  const formation = formationData[activeFormation.value];
  rollToChat({
    templateType: 'formation',
    parameters: {
      charactername: name.value,
      formationName: formation.name,
      action: 'deactivate'
    }
  });

  activeFormation.value = null;
};
```

Updated dehydrate/hydrate to persist state:

```javascript
// In dehydrate:
active_formation: activeFormation.value,
formations_collapsed: formationsCollapsed.value,

// In hydrate:
activeFormation.value = hydrateStore.active_formation ?? activeFormation.value;
formationsCollapsed.value = hydrateStore.formations_collapsed ?? formationsCollapsed.value;
```

Exported new properties:
- `formationData` - Static formation definitions
- `activeFormation` - Currently active formation (or null)
- `formationEffects` - Computed effects based on reputation
- `formationsCollapsed` - Collapsed state for the UI section
- `activateFormation` - Function to activate a formation
- `deactivateFormation` - Function to end active formation

---

### `src/components/SquadronFormations.vue` (NEW FILE)

Created new Vue component for displaying and managing formations.

**Features:**
- Collapsible section with header and summary
- Collapsed state shows active formation or "No formation active"
- Grid layout displaying all four formation cards when expanded
- Color-coded formation types (Attack=Red, Defense=Blue, Destruction=Purple, Restoration=Green)
- Each card shows:
  - Formation name and type
  - Inspiration cost
  - Current effect (scales with reputation)
  - Description
  - Activate/End Formation button
- Active formation gets highlighted border and glow effect
- Inactive affordable formations appear full opacity
- Formations user can't afford appear dimmed
- Active formation banner at bottom showing current effect

**Script Setup:**
```javascript
import { computed } from 'vue';
import { useSheetStore } from '@/stores/sheetStore';
import NotchContainer from '@/components/NotchContainer.vue';
import Collapsible from '@/components/Collapsible.vue';

const sheet = useSheetStore();

// Summary text for collapsed state
const collapsedSummary = computed(() => {
  if (sheet.activeFormation) {
    const formation = sheet.formationData[sheet.activeFormation];
    return `${formation.name} Active - ${formation.shortEffect(sheet.reputation)}`;
  }
  return 'No formation active';
});
```

**Template Structure:**
```vue
<NotchContainer class="formations-container" width="thick" notchType="curve">
  <h4>Squadron Formations</h4>
  <Collapsible
    class="formations-collapsible"
    :default="sheet.formationsCollapsed"
    @collapse="sheet.formationsCollapsed = !sheet.formationsCollapsed"
  >
    <template v-slot:collapsed>
      <div class="formations-summary">
        <span v-if="sheet.activeFormation" class="summary-icon">{{ icon }}</span>
        <span class="summary-text">{{ collapsedSummary }}</span>
      </div>
    </template>
    <template v-slot:expanded>
      <!-- Formation info and grid -->
      <!-- Active formation banner -->
    </template>
  </Collapsible>
</NotchContainer>
```

**Styles:**
- Collapsible summary with icon and text
- Responsive grid layout with `auto-fit` columns
- Formation cards with hover effects
- Color-coded headers and action buttons
- Active formation glow effect
- Dark mode support

---

### `src/views/PC/KnightView.vue`

Added import for SquadronFormations component:

```javascript
import SquadronFormations from '@/components/SquadronFormations.vue';
```

Added component to template above Spell Paths, spanning two columns:

```vue
<!-- Squadron Formations - Per compendium: requires 3+ Magi-Knights within 60ft -->
<div class="formations-section grid-span-all">
  <SquadronFormations />
</div>

<div class="spell-path-container grid-span-all">
  <!-- Spell Paths section -->
</div>
```

---

## Summary of All Changes

### Files Modified
1. `src/stores/sheetStore.js`
   - Added `formationData` static object with all four formations
   - Added `activeFormation` ref for tracking active formation
   - Added `formationsCollapsed` ref for UI collapsed state
   - Added `formationEffects` computed property
   - Added `activateFormation()` function with chat output
   - Added `deactivateFormation()` function with chat output
   - Updated `dehydrate()` to include activeFormation and formationsCollapsed
   - Updated `hydrate()` to restore activeFormation and formationsCollapsed
   - Updated return statement with new exports

2. `src/views/PC/KnightView.vue`
   - Added import for SquadronFormations component
   - Added component above Spell Paths with `grid-span-all` wrapper for two-column layout

### Files Created
1. `src/components/SquadronFormations.vue`
   - Complete formation management UI component
   - Collapsible with summary showing active formation
   - Displays all four formations in a grid when expanded
   - Handles activation/deactivation
   - Shows active formation banner

---

## UI Layout

The Squadron Formations section:
- Is positioned directly above Spell Paths
- Spans two columns (like Spell Paths and Relics)
- Collapses to header + summary by default
- Summary shows: "Arrow Formation Active - +6 damage" (if active) or "No formation active"

---

## Testing

- Build completes successfully with `npm run build`
- No TypeScript/JavaScript errors
- Active formation state properly persists via dehydrate/hydrate system
- Collapsed state properly persists via dehydrate/hydrate system
- Formation activation outputs to Roll20 chat via rollToChat
