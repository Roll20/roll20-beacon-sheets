# Phase 1 Implementation Summary

## Task 1.1: Advantage/Disadvantage System

**sheetStore.js:**
- Added `rollMode` ref with values: `'normal'`, `'advantage'`, `'disadvantage'`
- Added `forcedDisadvantage` computed - returns true when stress or exhaustion >= 6
- Added `effectiveRollMode` computed - returns forced disadvantage if applicable, otherwise manual selection
- Added `getRollDice()` function that returns:
  - Advantage: `2d20kh1` (roll 2, keep highest)
  - Disadvantage: `2d20kl1` (roll 2, keep lowest)
  - Normal: `1d20`
- Updated all roll functions to use `getRollDice()`: `rollAbility`, `rollSkill`, `rollWeapon`, `rollSpell`, `rollInitiative`, `rollKnightAttack`, `rollStudentAttack`
- Added rollMode to dehydrate/hydrate for persistence

**New component - RollModeToggle.vue:**
- Dropdown select for Normal/Advantage/Disadvantage (full words)
- Color-coded background: white (normal), green (advantage), red (disadvantage)
- Dropdown disabled when forced disadvantage is active (stress/exhaustion >= 6)
- Shows warning message when forced disadvantage is active
- Uses NotchContainer for consistent styling with other sections
- Added to PCView.vue below SkillSection

---

## Task 1.2: Condition Tracking System

**sheetStore.js:**
- Added `conditions` ref object with 23 conditions across 4 categories:
  - Mental: distressed, horrified, berserk
  - Physical: bleeding, burning, exposed, paralyzed, prone, restrained
  - Depletion: depleted, drained, silenced, soulSiphoned1/2/3, soulTainted
  - Other: blinded, charmed, frightened, incapacitated, invisible, poisoned, stunned
- Added `activeConditions` computed - returns list of active condition keys
- Added `conditionDisadvantageOnAttacks` computed - checks if any condition grants disadvantage
- Added `distressedPenalty` computed - returns -1 if distressed, 0 otherwise
- Integrated distressed penalty into `rollAbility` and `rollSkill` functions
- Added conditions to dehydrate/hydrate for persistence

**New component - ConditionTracker.vue:**
- Uses NotchContainer for consistent styling with other sections
- Collapsible panel with expand/collapse icon in header
- Shows active condition count badge
- Collapsed view shows active conditions as clickable tags (click to remove)
- Expanded view shows all conditions organized by category with checkboxes
- Tooltips show condition effects on hover
- "Clear All" button when conditions are active
- Added to PCView.vue below SkillSection (after RollModeToggle)

---

## Task 1.3: Trauma Points Tracking

**sheetStore.js:**
- Added `trauma` as a computed property derived from the Soul Eclipse Chart's eclipse_blips array
- Counts only blips in state 1 (solid dot/filled) as Trauma points:
  ```javascript
  const trauma = computed(() => eclipse_blips.value.filter(blip => blip === 1).length);
  ```
- Eclipse blip states documented:
  - State 0: Empty (no trauma)
  - State 1: Solid dot (Trauma point) - **counted as trauma**
  - State 2: X mark (Corruption point) - not counted
  - State 3: Scratched (Burnout line) - not counted
- Trauma is NOT persisted separately - it's derived from eclipse_blips which is already persisted

**Note:** Per the rulebook, the Soul Eclipse Chart tracks Trauma via filled Lunar Blips. Corruption (X marks) and Burnout Lines (scratched) are separate mechanics and not counted as active Trauma.

---

## Task 1.4: Damage Type System

**sheetStore.js:**
- Added `damageType` ref to `soul_weapon` object with values: `'physical'`, `'magical'`, `'true'`
- Added `damageTypeLabels` object for display names
- Updated `rollWeapon` to include damage type in chat output
- Updated `rollKnightDamage` to include damage type in roll subtitle
- Student damage always displays as "Physical"
- Added damageType to `dehydrateSoulWeapon` and `hydrateSoulWeapon` for persistence

**KnightView.vue:**
- Added damage type dropdown selector in soul weapon section (when expanded)
- Added color-coded damage type tag in collapsed view:
  - Physical: gray
  - Magical: purple
  - True Damage: gold
