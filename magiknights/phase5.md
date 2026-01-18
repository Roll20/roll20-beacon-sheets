# Phase 5: Battle Techniques & Combat Tactics - Implementation Summary

**Implementation Date:** 2026-01-18
**Phase Priority:** High + Medium
**Estimated Complexity:** Medium-High
**Status:** ✅ Completed

---

## Overview

Phase 5 enhances the Battle Techniques and Combat Tactics systems for the Magi-Knights Awakening Roll20 Beacon character sheet. This implementation adds comprehensive tracking, validation, and automatic bonus application for techniques and tactics.

---

## Features Implemented

### Part 1: Battle Technique Enhancements

#### 1.1 Enhanced Data Structure
**Location:** `src/stores/sheetStore.js` - techniques section template

Added the following fields to technique tracking:
- `category` - Classification (Physical Attacks, Defensive, Magical, Squad Support)
- `levelRequired` - Minimum character level to use the technique
- `frequency` - Usage limitation (At-Will, 1/Round, 1/Encounter, 1/Rest, 1/Phase, X/Encounter)
- `maxUses` - Maximum uses per frequency period
- `usesRemaining` - Current uses available
- `actionType` - Action economy (Standard, Bonus, Free, Immediate, Reaction, Full-Round)
- `associatedRoll` - Optional dice expression for technique effects

#### 1.2 Usage Tracking System
**Location:** `src/stores/sheetStore.js` - Helper methods

Implemented methods:
- `resetTechniqueUses(frequency)` - Reset uses for specific frequency or all techniques
- `useTechnique(techniqueId)` - Consume a technique use and return success/failure
- `isTechniqueAvailable(technique)` - Check level requirements and remaining uses

#### 1.3 Enhanced UI Component
**Location:** `src/components/TechniqueItem.vue`

Features:
- Collapsed header shows technique name, level requirement, frequency, and uses
- Visual indicators:
  - Level requirement badge (red if unmet, blue if met)
  - Frequency badge (green for At-Will, gray for limited)
  - Uses counter (X/Y format)
- Expanded view includes:
  - Full technique form with all new fields
  - Usage tracker with increment/decrement/reset buttons
  - Category and action type selectors
  - Associated roll field for dice expressions
- Automatic validation:
  - Red border if level requirement not met
  - Grayed out if no uses remaining

#### 1.4 Reset Controls
**Location:** `src/views/sections/TechniquesTactics.vue`

Added quick reset buttons:
- Reset Round (1/Round techniques)
- Reset Encounter (1/Encounter techniques)
- Reset Rest (1/Rest and 1/Phase techniques)
- Reset All (all limited techniques)

---

### Part 2: Combat Tactics Library

#### 2.1 Tactics Data Structure
**Location:** `src/stores/sheetStore.js` - tactics section template

New tactics section with fields:
- `name` - Tactic name
- `description` - Full effect description
- `prerequisites` - Requirements (e.g., "Level 9+, Combat Form Drills")
- `effectType` - Classification (Passive, Active, Reaction)
- `automaticBonus` - Summary of bonus provided
- `active` - Toggle for whether tactic is equipped/active

#### 2.2 Prerequisite Validation
**Location:** `src/stores/sheetStore.js` - Helper methods

Implemented methods:
- `checkTacticPrerequisites(tactic)` - Parse and validate prerequisites
  - Checks level requirements (supports "9th+", "Level 9+", etc.)
  - Extensible for future prerequisite types
- `hasTacticActive(tacticName)` - Check if specific tactic is active

#### 2.3 Automatic Bonus Integration

##### HP Calculation (Tough as Nails)
**Location:** `src/stores/sheetStore.js:279-295`

Modified `hp_max` computed property:
```javascript
// Add Tough as Nails bonus if tactic is active
if (hasTacticActive('Tough as Nails')) {
  hp += 2 + (level.value * 2); // +2 Student HP + 2 HP/Level
}
```

##### MP Calculation (Adept of Magic)
**Location:** `src/stores/sheetStore.js:298-321`

Modified `mp_max` computed property to include Rep Level bonus:
```javascript
// Add Adept of Magic bonus if tactic is active
if (hasTacticActive('Adept of Magic')) {
  repBonus += 1;
}
const mco = level.value + mamMod + repBonus;
```

##### Initiative Calculation (Magical Foresight)
**Location:** `src/stores/sheetStore.js:251-270`

Modified `initiative` computed property:
```javascript
// Add Magical Foresight bonus if tactic is active
if (hasTacticActive('Magical Foresight')) {
  const mamMod = abilityScores[mam.value]?.mod.value || 0;
  init += mamMod;
}
```

#### 2.4 Tactic UI Component
**Location:** `src/components/TacticItem.vue`

Features:
- Active/inactive checkbox in collapsed and expanded views
- Visual indicators:
  - Effect type badge (Passive, Active, Reaction)
  - Automatic bonus badge (green highlight)
  - Prerequisites warning (red if unmet, yellow border on container)
- Prerequisite status display with checkmark/X icon
- Full editing form with all tactic fields

#### 2.5 Common Tactics Library
**Location:** `src/views/sections/TechniquesTactics.vue`

Implemented quick-add library with 12 common tactics:
1. **Adept of Magic** - +1 Rep for MCO
2. **Tough as Nails** - +2 Student HP, +2 HP/Level
3. **Magical Foresight** - +MAM to Initiative
4. **Combat Form Drills** - +1 Combat Form
5. **Combat Form Mastery** - Enhanced Forms
6. **Disciplined Agility** - +1 Reaction/Round
7. **Elemental Bulwark** - -3 Physical Damage
8. **Implement Mastery** - +MAM to Implement Attacks
9. **Martial Artist** - 1d6 Unarmed, Bonus Unarmed Attack
10. **Quicksword Technique** - No Provoke, +10ft Move
11. **Resilient Soul Crystal** - +1 Stat or Magic Resist
12. **Shield of the Guardian** - Protect Ally (Reaction)

Each tactic button includes:
- Tactic name
- Automatic bonus summary
- Tooltip with full description
- One-click add to character

---

## UI/UX Improvements

### Collapsible Sections
Both techniques and tactics are organized in collapsible sections:
- Collapsed view shows count/status
- Expanded view shows full management interface

### Visual Feedback
- Color-coded badges for status
- Red highlighting for unmet requirements
- Green for available/active items
- Gray/opacity for unavailable items

### Quick Actions
- Usage increment/decrement buttons
- Batch reset controls
- One-click tactic library additions
- Active/inactive toggles

---

## Technical Implementation Details

### Data Persistence
- All technique and tactic data automatically saved via existing dehydrate/hydrate system
- Uses generic section handling (`arrayToObject`/`objectToArray`)
- No special serialization required

### Computed Properties
- HP, MP, and Initiative are reactive computed values
- Automatically update when tactics are activated/deactivated
- Bonuses apply in real-time without manual recalculation

### Validation
- Level requirements checked against current character level
- Uses remaining validated before allowing technique use
- Prerequisites parsed and validated dynamically

---

## File Changes

### Modified Files
1. `src/stores/sheetStore.js` - Enhanced techniques section, added tactics section, helper methods, auto-calculations
2. `src/components/TechniqueItem.vue` - Complete redesign with all new fields and usage tracking
3. `src/views/sections/TechniquesTactics.vue` - Split into two sections, added library and controls

### New Files
1. `src/components/TacticItem.vue` - New component for combat tactics display and editing

### Documentation
1. `phase5.md` - This implementation summary

---

## Testing Recommendations

When testing this implementation:

1. **Technique Usage Tracking**
   - Create techniques with different frequencies
   - Use techniques and verify uses decrement
   - Test reset buttons for each frequency type
   - Verify level-locked techniques show warnings

2. **Tactic Auto-Calculations**
   - Add "Tough as Nails" and verify HP increases
   - Add "Adept of Magic" and verify MP increases
   - Add "Magical Foresight" and verify Initiative includes MAM
   - Toggle tactics on/off and verify values update

3. **Prerequisite Validation**
   - Test level requirements (e.g., Combat Form Mastery requires 9+)
   - Verify warning displays for unmet prerequisites

4. **Data Persistence**
   - Add techniques and tactics
   - Save character
   - Reload and verify all data persists
   - Check usage counters maintain state

5. **UI Interaction**
   - Test collapsible sections
   - Use common tactics library
   - Modify technique/tactic fields
   - Test all buttons and controls

---

## Integration with Existing Systems

### Compendium Reference
All techniques and tactics follow the structure defined in:
- `compendium/techniques.json` - Battle Technique definitions
- Phase implementation allows manual entry or future compendium integration

### Roll System
- Associated roll field prepared for future roll integration
- Can be connected to existing `rollToChat` system

### Character Sheet Views
- Techniques & Tactics accessible from Student view
- Compatible with existing sheet navigation

---

## Future Enhancements

Potential improvements for later phases:
1. Compendium drag-and-drop for techniques
2. Automatic roll buttons for techniques with associated rolls
3. More sophisticated prerequisite checking (specific forms, paths, etc.)
4. Technique categories filtering/sorting
5. Tactic conflict detection (mutually exclusive tactics)
6. Import from compendium JSON

---

## Success Criteria

✅ Level requirements enforce technique availability
✅ Frequency tracking with usage counters implemented
✅ Technique categories for organization
✅ Combat Tactics section with prerequisite validation
✅ Auto-calculation for Tough as Nails, Adept of Magic, Magical Foresight
✅ Common tactics library for quick access
✅ Reset controls for encounter/rest/phase
✅ Visual indicators for status and availability
✅ Data persistence via dehydrate/hydrate
✅ Backward compatible with existing data

---

## Notes

- Dehydrate/hydrate works automatically due to generic section architecture
- Helper methods exported for potential use in other components
- Prerequisite parsing extensible for future requirements
- UI designed to match existing sheet aesthetics
- Follows established patterns (RepeatingSection, Collapsible, NotchContainer)

---

**Phase 5 Status: Complete**
Ready for integration testing and user feedback.
