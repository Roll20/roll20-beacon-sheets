# Activity Log

## Status
- **Tasks Completed:** 37/37
- **Current Task:** ALL COMPLETE
- **Last Updated:** 2026-01-23

---

## Sessions

### 2026-01-23 - Task 1: Remove fabricated D&D 5e conditions and add missing Magi-Knights conditions

**Changes Made:**
- Removed the entire `other` category from `ConditionTracker.vue` (contained 6 fabricated D&D 5e conditions: blinded, charmed, frightened, incapacitated, invisible, stunned)
- Moved `poisoned` from `other` to `depletion` category with corrected effect: "Stress damage per Action, +1 Stress per Action"
- Added `disoriented` to `physical` category: "Disadvantage on Attacks, Physical Resists, Skill Checks"
- Added `unconscious` to `physical` category: "Knocked out, Prone, revert to Student Persona"
- Added `soulSiphoned4` to `depletion` category: "Paralyzed + 1 Trauma"
- Updated `conditions` ref in `sheetStore.js` to match: removed blinded, charmed, frightened, incapacitated, invisible, stunned; added disoriented, unconscious, soulSiphoned4
- Updated mental condition effects for distressed, horrified, berserk to match compendium (partial - full fix in Task 2)
- Updated `ARCHITECTURAL_ANALYSIS.md` conditions section to reflect 19 conditions in 3 categories

**Files Modified:**
- `src/components/ConditionTracker.vue`
- `src/stores/sheetStore.js`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`

### 2026-01-23 - Task 2: Fix incorrect condition descriptions to match compendium

**Changes Made:**
- Fixed `bleeding` effect from "-2 HP/round until Medicine DC 12" to "(N)-CON damage per Action (min 1). Medicine or healing to remove"
- Fixed `burning` effect from "-5 HP/round, DEX DC 12 to end" to "(N) damage per Action + at start of turn. Athletics/Mysticism to end"
- Fixed `depleted` effect from "-1 spell DC/attack, no Bonus Actions" to "Move 0, Disadvantage on Attacks, can't cast Spells, Armor = 10"
- Fixed `drained` effect from "Can't regain HP/MP, Disadvantage on checks" to "Move 0, Disadvantage on Attacks, spells cost +1 Tier MP"
- Fixed `soulTainted` effect from "Disadvantage on all rolls" to "Disadvantage vs Invading Evil, damage halved vs them"
- Confirmed `berserk`, `distressed`, and `horrified` were already correct from Task 1
- Updated ARCHITECTURAL_ANALYSIS.md condition effects comments

**Files Modified:**
- `src/components/ConditionTracker.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 3: Fix condition mechanics computeds in sheetStore.js

**Changes Made:**
- Fixed `conditionDisadvantageOnAttacks` computed: replaced incorrect conditions (`prone`, `restrained`, `blinded`, `frightened`, `poisoned`) with correct compendium conditions (`depleted`, `drained`, `distressed`, `disoriented`)
- Removed `distressedPenalty` computed (flat -1 penalty) and replaced with `conditionDisadvantageOnSkillChecks` computed that triggers Disadvantage dice (2d20kl) instead
- Updated `getRollDice()` to accept a `forceDisadvantage` parameter for condition-driven disadvantage
- Updated `rollAbility` to use `conditionDisadvantageOnSkillChecks` for disadvantage on ability checks
- Updated `rollSkill` to use `conditionDisadvantageOnSkillChecks` for disadvantage on skill checks
- Updated `rollWeapon`, `rollSpell`, `rollKnightAttack`, `rollStudentAttack`, `rollGunAttack` to use `conditionDisadvantageOnAttacks` for disadvantage on attack rolls
- Removed all flat -1 "Distressed" penalty components from roll objects
- Roll subtitles now show "Disadv - Condition" when disadvantage is from conditions
- Updated store exports: replaced `distressedPenalty` with `conditionDisadvantageOnSkillChecks`
- Updated ARCHITECTURAL_ANALYSIS.md with condition mechanics computeds documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 4: Fix weapon quality definitions and computed effects to match compendium

**Changes Made:**
- Removed fabricated qualities from `soul_weapon.qualities` ref: `finesse` (DEX for attack/damage doesn't exist), `vicious` (maximize crit dice doesn't exist)
- Updated `accurate` quality: from flat +1 attack to trade-off choice per roll (-2 dmg/+1 atk OR -4 dmg/+2 atk)
- Updated `forceful` quality: from flat +1 damage to triggered effect on Attack Roll 16+ (add 1d6 damage)
- Updated `massive` quality: from flat -2 atk/+4 dmg to trade-off choice per roll (-1 atk/+2 dmg OR -2 atk/+4 dmg)
- Updated `veilPiercing` quality: from crit on 16+ to 1/Combat Encounter auto-hit
- Updated `ensnaring` quality: from generic "grapple on hit" to "On Roll 16+: Target Restrained (not Large+/Adversary+)"
- Updated `staggeringBlow` quality: from generic "knockback" to "On Roll 16+: Knock target 10ft (not Large+/Adversary+)"
- Updated `coupled` quality: from generic "dual-wield" to "Free Action: Split Primary + Secondary, Bonus Action secondary attack"
- Set `weaponQualityAttackBonus` computed to always return 0 (trade-offs are per-roll choices)
- Set `weaponQualityDamageBonus` computed to always return 0 (same reason)
- Removed `weaponCritRange` computed entirely (no crit range mechanic in Magi-Knights)
- Added `veilPiercingUsed` ref (boolean) for tracking 1/encounter usage
- Added `veilPiercingUsed` to dehydrate/hydrate cycle for persistence
- Updated store exports: replaced `weaponCritRange` with `veilPiercingUsed`
- Updated `rollKnightAttack`: replaced crit range display with Veil-Piercing availability note
- Updated `WeaponQualitiesSelector.vue`: reorganized categories to trade/trigger/special, removed old modifier badges, added Veil-Piercing usage indicator
- Updated `weaponQualityDefs` object with all correct compendium descriptions and new categories
- Updated ARCHITECTURAL_ANALYSIS.md weapon quality section

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/WeaponQualitiesSelector.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 5: Replace fabricated gun quality system with correct Soul Gun mechanics

**Changes Made:**
- Replaced entire `soul_gun` object: removed `range`, `damage`, `damageType`, `qualities` refs; added `gunType` (string, default 'hdg'), `gunStyle` (string), `aimed` (boolean), `hasReloaded` (boolean), `firingPoolBonus` (number), `attachments` (array)
- Added `gunTypeData` constant with all 7 gun types from compendium: HDG, SMG, ASR, DMR, STG, LMG, SDA with correct E-Range, damage, RF, MD, and special ability for each
- Added `gunStyleData` constant with 5 styles: Akimbo, Aegis/Musketeer, Fast Reload (HDG); Mobile, Hail of Bullets (SMG)
- Added `gunTypeStats` computed (returns stats for current gun type)
- Added `availableGunStyles` computed (filters styles by current gun type)
- Added `effectiveMD` computed (accounts for Akimbo +1 MD)
- Removed fabricated computeds: `gunQualityDefs`, `gunQualityAttackBonus`, `gunQualityDamageBonus`, `gunCritRange`, `activeGunQualities`
- Replaced `rollGunAttack` with `rollGunRapidFire` (rolls RF d8s + DEX + Prof) and `rollGunMagDump` (rolls MD d8s + DEX + Prof, sets hasReloaded=false)
- Rewrote `rollGunDamage` to use gun type's damage die automatically
- Updated `dehydrateSoulGun`/`hydrateSoulGun` for new field structure
- Rewrote `GunQualitiesSelector.vue`: now shows Gun Type dropdown, stats display, Gun Style selector (HDG/SMG only), Aimed/Reloaded state toggles, and Attachments repeating section
- Updated `KnightView.vue` gun section: collapsed view shows RF/MD/Dmg buttons with gun type tag and reload warning; expanded view shows name input + GunQualitiesSelector
- Updated store exports: removed old gun quality exports, added gunTypeData, gunStyleData, gunTypeStats, availableGunStyles, effectiveMD, rollGunRapidFire, rollGunMagDump
- Updated ARCHITECTURAL_ANALYSIS.md Soul Gun section with Firing Pool documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/GunQualitiesSelector.vue`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 6: Fix implement quality system to match compendium

**Changes Made:**
- Replaced fabricated qualities (`spellFocus`, `channeling`, `quickCast`, `wardingFocus`) with correct compendium qualities: `cardConductor`, `embolden`, `light`, `manaAttunement`, `manaConduit`, `radiance`, `twoHanded`, `warding`
- Replaced `implementQualityDefs` with correct definitions and categories (special, damage, handling, mana, healing, defense)
- Removed fabricated `implementSpellAttackBonus` computed (+1 spell attack from spellFocus doesn't exist)
- Removed fabricated `implementSpellDCBonus` computed (+1 spell DC from channeling doesn't exist)
- Kept `hasManaAttunement` computed (correct)
- Added `hasEmbolden` computed (returns true when Embolden quality active)
- Added `emboldenDamageBonus` computed (returns MK Level when Embolden active, 0 otherwise)
- Added `radianceHealBonus` computed (returns 1+Level when Radiance active, 0 otherwise)
- Added `wardingReduction` computed (returns max(1, floor(level/2)) when Warding active, 0 otherwise)
- Added `manaConduitUsed` ref (boolean) for tracking 1/Sleep Phase usage
- Added `manaConduitUsed` to dehydrate/hydrate cycle for persistence
- Rewrote `ImplementQualitiesSelector.vue`: new categories (Mana, Damage/Healing, Defense, Handling, Special), modifier badges show computed bonuses, Mana Conduit usage tracker with visual feedback
- Updated store exports: removed `implementSpellAttackBonus`/`implementSpellDCBonus`, added `hasEmbolden`, `emboldenDamageBonus`, `radianceHealBonus`, `wardingReduction`, `manaConduitUsed`
- Updated ARCHITECTURAL_ANALYSIS.md implement section with full quality documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/ImplementQualitiesSelector.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 7: Fix NPC creature types, sizes, and add Role system

**Changes Made:**
- Replaced `creatureTypes` array in NPCView.vue: removed Construct, Undead, Beast, Aberration; kept only Outsider and Mortal (the only two creature types in Magi-Knights)
- Replaced `sizeOptions` array in NPCView.vue: removed Tiny and Gargantuan; replaced with correct sizes Small, Medium, Large, Huge, Massive, Colossal
- Added `roleOptions` array in NPCView.vue with 12 roles + None option: Assassin, Brute, Defender, Heavy, Lithe, Merciless, Savage, Skirmisher, Striker, Tank, Vanguard, Watcher
- Added `npc_role` ref (string, default 'none') to sheetStore.js
- Added `roleModifiers` data object with stat adjustments (AC, HP%, Atk Bonus, DPR%) for each of the 12 roles
- Added `sizeModifiers` data object with stat adjustments for each of the 6 sizes
- Added `rankDamagePct` data object with damage percentages per rank (Vassal 50%, Adversary 55%, Nemesis 60%, Harbinger 70%)
- Added `npc_role_modifiers` computed (returns modifiers for current role)
- Added `npc_size_modifiers` computed (returns modifiers for current size)
- Added Role selector dropdown in NPCView.vue template type-row section after creature type
- Added `npc_role` to dehydrate/hydrate cycle for persistence
- Added new exports: roleModifiers, sizeModifiers, rankDamagePct, npc_role, npc_role_modifiers, npc_size_modifiers
- Updated ARCHITECTURAL_ANALYSIS.md NPC section with creature types, sizes, roles, and rank damage documentation

**Files Modified:**
- `src/views/NPCView.vue`
- `src/stores/sheetStore.js`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 8: Remove empty stub components

**Changes Made:**
- Confirmed `BurstDisplay.vue` and `DiamondDisplay.vue` are empty stubs (empty script/template/style blocks, no functionality)
- Searched all `.vue` files and `ARCHITECTURAL_ANALYSIS.md` for any imports or references — none found
- Deleted `src/components/BurstDisplay.vue`
- Deleted `src/components/DiamondDisplay.vue`
- No updates needed to `ARCHITECTURAL_ANALYSIS.md` (no references to these files existed)
- Build verified successfully

**Files Modified:**
- `src/components/BurstDisplay.vue` (deleted)
- `src/components/DiamondDisplay.vue` (deleted)
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 9: Implement Endurance Die and attrition mechanics

**Changes Made:**
- Added `enduranceDieEnabled` ref (boolean, default true) to control whether the 1d6 Endurance Die system is active
- Added `freakingOutToday` ref (boolean, default false) to track if Oppressive Stress occurred today
- Added `mentalAbilities` and `physicalAbilities` constants classifying abilities for Stress/Exhaustion targeting
- Added `getEnduranceDieInfo(abilityName)` function that returns `{type, level}` when Endurance Die applies (Stress for INT/WIS/CHA, Exhaustion for STR/DEX/CON, only at levels 1-5)
- Added `corruptionCount` computed (eclipse_blips with state === 2)
- Added `burnoutLines` computed (eclipse_blips with state === 3)
- Added `heartlessKnight` computed (true when corruptionCount >= 3): -1 SP gained, no Catharsis, lose Comforting Comrade
- Added `fallenKnight` computed (true when corruptionCount >= 5): 1/2 Trauma received, Refreshing->Average Sleep, Risk of Relapse
- Updated `rollAbility` to include Endurance Die (1d6) in roll components and subtitle note when applicable
- Updated `rollSkill` to include Endurance Die (1d6) in roll components and subtitle note based on the skill's linked ability
- Added `enduranceDieEnabled` and `freakingOutToday` to dehydrate/hydrate cycle for persistence
- Added all new computeds and refs to store exports
- Updated ARCHITECTURAL_ANALYSIS.md with Endurance Die & Attrition System documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 10: Implement Combat Form selection and tracking

**Changes Made:**
- Added `combatFormData` constant with all 10 Combat Forms (I-X) including name, description, and mastery description for each
- Added `activeCombatForm` ref (string, default '') for tracking which form is currently selected
- Added `combatFormMastery` ref (object with formI-formX booleans) for tracking mastery unlocks
- Added `hasFormX` computed (returns combatFormMastery.formX) for determining Soul Gun access
- Added `activeCombatForm` and `combatFormMastery` to dehydrate/hydrate cycle for persistence
- Added Combat Form exports: combatFormData, activeCombatForm, combatFormMastery, hasFormX
- Rewrote Combat Forms section in KnightView.vue: Active Form dropdown selector, description display (with mastery effect when mastered), mastery checkbox grid (I-X), custom form notes preserved via collapsible repeating section
- Added CSS styling for combat form UI (active form selector, detail panel, mastery grid, notes section)
- Updated ARCHITECTURAL_ANALYSIS.md with Combat Forms documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 11: Implement level-locked ability tracking

**Changes Made:**
- Added `levelAbilityData` constant with 6 level-locked abilities: Counter Blast (5), Perfect Parry (6), Extricate Aether (6), Heroic Resolve (9), Knight's Insight (9), Knight's Resolution (9)
- Added `levelAbilities` computed that returns boolean unlock status for each ability based on current level
- Added Level Abilities section in KnightView.vue after Combat Forms: displays all 6 abilities with level badge, name, and description
- Unlocked abilities show full opacity with green badge; locked abilities are dimmed
- Added `levelAbilityData` and `levelAbilities` to store exports
- Updated ARCHITECTURAL_ANALYSIS.md with Level-Locked Abilities documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 12: Implement Sleep Phase effect tracking and daily limits

**Changes Made:**
- Added `sleepEffect` ref (string, default 'average') with three options: average, feverish, refreshing
- Added `sleepEffectData` constant with recovery values for each sleep type: Average (-1 Stress/-1 Exhaustion), Feverish (no recovery, nightmares), Refreshing (-2 Stress/-2 Exhaustion, full HP, -1 Fracture)
- Added `sealImplantGiven` ref (boolean, default false) for 1/day Crystalline Seal given tracking
- Added `sealImplantReceived` ref (boolean, default false) for 1/day Crystalline Seal received tracking
- Added `soulSacrificeCount` ref (number, default 0) for career-total usage tracking
- Added `soulSacrificeMax` computed (returns reputation value) for career max
- Integrated `manaConduitUsed` (already existed from Task 6) into the Daily Limits UI
- Added all new refs to dehydrate/hydrate cycle for persistence
- Added "Sleep & Daily Limits" section in KnightView.vue after Level Abilities: Sleep Effect radio buttons, Daily Limits checkboxes (Seal Implant Given/Received, Mana Conduit Used), Soul Sacrifice counter with career max
- Added CSS styling for the new section
- Updated ARCHITECTURAL_ANALYSIS.md with Sleep Phase & Daily Limits documentation
- All exports added to store return block

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 13: Implement Heart Stage tracking for social bonds

**Changes Made:**
- Added `heartStage` field (string, default 'neutral') to the social bond template in sheetStore.js for both `npc-social` and `squadron-social` repeating sections
- Added `heartStageData` constant with 7 stages in progression order: Threatening, Hostile, Cold, Neutral, Warm, Friendly, Sympathetic
- Updated `SocialSection.vue` grid from 3 columns to 4 columns (Name, Heart Stage, SP, Bond Ability)
- Collapsed view shows the Heart Stage label text for each bond
- Expanded view shows a dropdown selector with all 7 stage options
- Added `heartStageData` to store exports for use in the component
- Heart Stage persists automatically via generic section serialization (arrayToObject/objectToArray in dehydrate/hydrate)
- Updated ARCHITECTURAL_ANALYSIS.md with Social Bonds & Heart Stages documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/SocialSection.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 14: Implement Rolls to Resist advantage/disadvantage tracking

**Changes Made:**
- Added `resistModifiers` ref with per-type (physical, magic, horror, purity) advantage/disadvantage boolean tracking
- Added `abilityToResistType` constant mapping ability names to their resist type (STR/DEX/CON → physical, INT/WIS/CHA → magic)
- Added `conditionResistDisadvantage` computed: Disoriented condition automatically applies Disadvantage on Physical Resists
- Added `activeResistModifiers` computed: combines manual toggles and condition effects, handles advantage/disadvantage cancellation
- Added `getResistRollMode(abilityName)` function that returns the effective roll mode for a given ability's resist type
- Updated `getRollDice()` to accept both `forceDisadvantage` and `forceAdvantage` parameters (previously only supported disadvantage)
- Updated `rollAbility` to detect resist rolls (rollToResist > 0) and apply the appropriate resist type's advantage/disadvantage to the dice formula
- Roll subtitle now shows resist type and advantage/disadvantage source when making a Roll to Resist
- Added resist modifiers UI in KnightView.vue: per-type checkboxes for Advantage and Disadvantage, with condition-based disadvantage shown as disabled+active with "(Condition)" note
- Added `resistModifiers` to dehydrate/hydrate cycle for persistence
- Added CSS styling for the resist grid (compact row layout with type labels and toggle checkboxes)
- Added store exports: resistModifiers, conditionResistDisadvantage, activeResistModifiers, getResistRollMode
- Updated ARCHITECTURAL_ANALYSIS.md with Rolls to Resist Advantage/Disadvantage documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 15: Implement Magi-Squire companion section

**Changes Made:**
- Added `squire` ref object to sheetStore.js with fields: name, level, healthBlips (6), manaBlips (3), studentArmor (13), knightArmor (15), spellPath1, spellPath2, skills, notes, collapsed
- Added `squireDamage` computed that scales damage based on mentor level (1d6+3 at levels 1-3 up to 4d6 at levels 13+)
- Added `squireSpellPaths` constant: ['Beam', 'Explosion', 'Curing', 'Restoration']
- Added `dehydrateSquire`/`hydrateSquire` functions for state persistence
- Created `src/components/MagiSquire.vue` component: collapsible panel with name input, damage/armor stats display, 6 health blip checkboxes, 3 mana blip checkboxes, 2 spell path dropdowns, skills textarea, notes textarea
- Collapsed view shows squire name and damage badge; expanded view shows full configuration
- Imported and added MagiSquire component to StudentView.vue after Herald section
- Added squire, squireDamage, squireSpellPaths to store exports
- Updated ARCHITECTURAL_ANALYSIS.md with Magi-Squire Companion documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/MagiSquire.vue` (new)
- `src/views/PC/StudentView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 16: Add Relic capacity enforcement

**Changes Made:**
- Added `relicCapacity` computed (returns reputation.value, i.e., max relics = Reputation Level 0-5)
- Added `relicsOverCapacity` computed (true when relic count exceeds capacity)
- Added `relicCount` computed (number of relics in sections.relics.rows)
- Updated KnightView.vue relics section: added capacity indicator showing current/max (e.g., "2/3")
- Added visual warning text when over capacity ("Over capacity! Max relics = Reputation Level")
- Over-capacity indicator turns red; normal state has subtle green background
- Added CSS styling for relic header row, capacity badge, and warning text
- Added relicCapacity, relicsOverCapacity, relicCount to store exports
- Updated ARCHITECTURAL_ANALYSIS.md with Relic Capacity documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 17: Final verification and cleanup

**Verification Results:**
- Build: PASSES (npm run build successful, 824 modules transformed)
- Old conditions (blinded, charmed, frightened, incapacitated, stunned): NOT FOUND in src/ (only `invisible` as CSS class name, not condition)
- Old gun quality system (gunQualityDefs, gunCritRange, scatter, longRange): NOT FOUND
- Old implement qualities (spellFocus, channeling, quickCast, wardingFocus): NOT FOUND
- Old NPC types/sizes (Tiny, Gargantuan, Construct, Undead, Beast, Aberration): NOT FOUND
- Deleted stubs (BurstDisplay, DiamondDisplay): NOT FOUND
- All new refs properly in dehydrate/hydrate cycle: VERIFIED (resistModifiers, squire)
- Computed properties (relicCapacity, relicsOverCapacity, relicCount) derive from persisted state: VERIFIED
- ARCHITECTURAL_ANALYSIS.md reflects current state: VERIFIED

**All 17 tasks complete.**

### 2026-01-23 - Task 18: Implement Budget Tallies and Training Tallies resource counters

**Changes Made:**
- Added `budgetTallies` ref (number, default 0) for the game's currency system
- Added `trainingTallies` ref (number, default 0) for the XP counter (0-8)
- Added `trainingTalliesMax` constant (8) for tallies needed to level up
- Added both refs to the dehydrate/hydrate cycle for persistence
- Added all three to the store return/exports block
- Added tallies UI in BasicView.vue: Budget Tallies numeric input (no max), Training Tallies numeric input with /8 max display
- Added CSS styling for the tallies section (bordered flex row with labeled inputs)
- Updated ARCHITECTURAL_ANALYSIS.md with Budget & Training Tallies documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/BasicView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 19: Implement Skill Mastery designation and bonus calculation

**Changes Made:**
- Added `masteredSkill` ref (string, default '') to sheetStore.js to designate which skill has Mastery
- Modified `rollSkill` function: when the rolled skill matches `masteredSkill`, adds a 'Mastery' component with value Math.max(1, reputation) to the roll breakdown
- Mastery bonus applies to both normal rolls and override-value rolls
- Added `masteredSkill` to dehydrate/hydrate cycle for persistence
- Added `masteredSkill` to store exports
- Updated `SkillSection.vue`: added Mastery dropdown selector at bottom of skills section (None + all 17 skills), shows +N bonus indicator when a skill is selected
- Updated `Skill.vue`: added `isMastered` prop, mastered skill name is bolded in accent color, proficiency diamond border turns accent color when mastered
- Updated ARCHITECTURAL_ANALYSIS.md with Skill Mastery documentation

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/SkillSection.vue`
- `src/components/Skill.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 20: Implement Spell Paths Known selection and tracking

**Changes Made:**
- Added `availableSpellPaths` constant with all 11 spell paths: Beam, Explosion, Ward, Curing, Restoration, Augmentation, Summoning, Chronomancy, Divination, Psionics, Necromancy
- Added `spellPathsKnown` ref (array of strings, default []) to track selected paths
- Added `maxSpellPaths` computed: returns 2 if level < 4, 3 if level < 8, 4 if level >= 8
- Added `spellPathsKnown` to dehydrate/hydrate cycle for persistence
- Added Spell Paths Known UI in KnightView.vue above the spell tier headers: checkboxes for all 11 paths, count indicator (e.g., "2/2 Paths"), warning when over max
- Added CSS styling for the paths-known section (bordered container, flex-wrap checkboxes, count badge, warning text)
- Added store exports: availableSpellPaths, spellPathsKnown, maxSpellPaths
- Updated ARCHITECTURAL_ANALYSIS.md Magic System section with Spell Paths Known documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 21: Implement Branching Element selection

**Changes Made:**
- Added `branchingElement` ref (string, default '') for sub-element choice
- Added `branchingElementOptions` constant mapping primary elements to branches: earth→Wood/Metal, fire→Lightning/Toxins, air→Force/Sonance, water→Ice/Blood, void→Light/Dark
- Added `availableBranches` computed that returns branch options for current elemental_affinity
- Added `branchingElement` to dehydrate/hydrate cycle for persistence
- Added Branching Element dropdown selector in KnightView.vue after Element Name field (only shown when affinity is selected)
- Updated elemental_affinity watcher to reset branchingElement when affinity changes
- Added store exports: branchingElement, branchingElementOptions, availableBranches
- Updated ARCHITECTURAL_ANALYSIS.md with Branching Elements documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 22: Implement Soul Armament tier bonus auto-calculation

**Changes Made:**
- Added `soulArmamentData` constant with progression table: Rep 0→+0/+0, Rep I→+1/+0, Rep II→+1/+1, Rep III→+2/+1, Rep IV→+2/+2, Rep V→+3/+3
- Added `soulArmamentWeaponBonus` computed (returns weapon bonus for current reputation)
- Added `soulArmamentArmorBonus` computed (returns armor bonus for current reputation)
- Added `knightArmorTotal` computed (knight_armor + soulArmamentArmorBonus)
- Integrated weapon bonus into `rollKnightAttack`: adds 'Armament' component to roll breakdown when bonus > 0
- Added armament tier info banner in KnightView.vue below stat cards (shows Weapon +N, Armor +N, and reputation level)
- Added CSS styling for armament-tier-info display
- Added store exports: soulArmamentData, soulArmamentWeaponBonus, soulArmamentArmorBonus, knightArmorTotal
- Updated ARCHITECTURAL_ANALYSIS.md Equipment section with Soul Armament Progression documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 23: Implement Rune Slot capacity tracking and enforcement

**Changes Made:**
- Added `slotCost` field (number, default 1) to the rune template in sections.runes
- Added `runeSlotCapacity` computed (max(1, reputation) = 1-5 slots)
- Added `runeSlotsUsed` computed (sums slotCost across all runes)
- Added `runesOverCapacity` computed (runeSlotsUsed > runeSlotCapacity)
- Updated KnightView.vue runes section: header shows "Slots: X/Y" capacity indicator, over-capacity warning, slot cost selector (1-3) in expanded view, slot cost badge in collapsed view
- Fixed bug in rune delete button (was calling removeRow('forms') instead of removeRow('runes'))
- Added CSS styling for rune header row, capacity badge, warning text, and slot badge
- Added store exports: runeSlotCapacity, runeSlotsUsed, runesOverCapacity
- Updated ARCHITECTURAL_ANALYSIS.md Equipment section with Rune Slot documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 24: Add Swift Attack, Energy Surge, and Flight to level-locked abilities

**Changes Made:**
- Added Energy Surge (level 4), Swift Attack (level 5), Swift Attack II (level 10), and Flight (level 10) to `levelAbilityData`
- Added `energySurgeUsed` ref (boolean, default false) for 1/Sleep Phase usage tracking
- Added `isFlying` ref (boolean, default false) for active flight state
- Updated `levelAbilities` computed to include the 4 new abilities
- Added both refs to dehydrate/hydrate cycle for persistence
- Updated KnightView.vue Level Abilities section: Energy Surge shows "Used" checkbox, Flight shows "Active" toggle when unlocked
- Added `.ability-toggle` CSS styling for the usage/state toggles
- Added store exports: energySurgeUsed, isFlying
- Updated ARCHITECTURAL_ANALYSIS.md Level-Locked Abilities section (now 10 abilities)
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 25: Implement Well Fed effect and split Studied into Combat/School variants

**Changes Made:**
- Replaced `studied` ref with `studiedCombat` ref and `studiedSchool` ref (both boolean, default false)
- Added `wellFed` ref (boolean, default false) for restaurant buff
- Updated dehydrate/hydrate: removed `studied`, added `studiedCombat`/`studiedSchool`/`wellFed` (with backward-compatible migration from old `studied`)
- Integrated `studiedCombat` into `rollKnightAttack`: adds +1d8 component to attack roll, consumed after use
- Updated StudentView.vue: replaced single "Studied" checkbox with 4 checkboxes: Studied [C] (combat), Studied [S] (school), Well Fed, Rested
- Updated store exports: removed `studied`, added `studiedCombat`, `studiedSchool`, `wellFed`
- Updated ARCHITECTURAL_ANALYSIS.md with Temporary Effects documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/StudentView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 26: Implement Magi-Knight Visor equipment slot

**Changes Made:**
- Added `visor` ref (object with `type` string, default 'none')
- Added `visorData` constant with 4 options: None, Ether Identification, Medical Diagnostic, Virtual HUD
- Added `activeVisorEffect` computed returning effect string for current visor type
- Added visor to dehydrate/hydrate cycle
- Added Visor NotchContainer in KnightView.vue with dropdown selector and effect description
- Added CSS styling for visor section
- Added store exports: visor, visorData, activeVisorEffect
- Updated ARCHITECTURAL_ANALYSIS.md Equipment section with Visor documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 27: Add Elemental Summon stat block tracking

**Changes Made:**
- Added `elementalSummon` ref (object: name, hp, hpMax, armor, attack, damage, move, description, active, collapsed)
- Added elementalSummon to dehydrate/hydrate cycle
- Added Elemental Summon collapsible section in KnightView.vue with: Active toggle, name input, HP/HPMax/Armor/Attack/Damage/Move stat grid, notes textarea
- Added CSS styling for summon container (header row, stats grid, active badge)
- Added store export: elementalSummon
- Updated ARCHITECTURAL_ANALYSIS.md with Elemental Summon documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/KnightView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 28: Implement Club Tallies counter and Club Position tracking

**Changes Made:**
- Added `clubTallies` ref (number, default 0) - 0-8 counter for club activities
- Added `clubTalliesMax` constant (8) - tallies needed for Resounding Growth
- Added `resoundingGrowths` ref (number, default 0) - total growths achieved
- Added `clubPosition` ref (string, default 'member') with 3 options
- Added `clubPositionData` constant with position bonuses for VP and President
- Added all to dehydrate/hydrate cycle for persistence
- Added Club Tallies (current/8), Resounding Growths counter, and Club Position dropdown in BasicView.vue
- Added CSS styling for club-position-section
- Added store exports: clubTallies, clubTalliesMax, resoundingGrowths, clubPosition, clubPositionData
- Updated ARCHITECTURAL_ANALYSIS.md with Club System documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/BasicView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 29: Implement Detention Tickets counter

**Changes Made:**
- Added `detentionTickets` ref (number, default 0)
- Added to dehydrate/hydrate cycle
- Added detention counter in StudentView.vue with warning display when tickets > 0
- Added CSS styling for detention display
- Added store export: detentionTickets
- Updated ARCHITECTURAL_ANALYSIS.md with Detention Tickets documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/StudentView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 30: Implement Heart Stage SP threshold display

**Changes Made:**
- Updated `heartStageData` to include min/max SP thresholds for each stage
- Added `getHeartStageForSP(sp)` function that returns the appropriate stage for a given SP value
- Updated SocialSection.vue expanded view: shows SP threshold range next to Heart Stage dropdown, and a mismatch hint (orange text) when SP doesn't match selected stage
- Added CSS styling for heart-stage-row, sp-threshold-hint, sp-mismatch-hint
- Added store export: getHeartStageForSP
- Updated ARCHITECTURAL_ANALYSIS.md Heart Stage section with SP thresholds documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/components/SocialSection.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 33: Final verification of missing rules implementation

**Changes Made:**
- Build verified: passes cleanly (chunk size warnings acceptable)
- All 18 new refs verified in dehydrate/hydrate cycle
- All new store exports verified in return block
- Vue component template references verified against exports
- Old `studied` ref migration confirmed clean (backward-compatible fallback in hydrate only)
- No TODO/FIXME comments found in src/
- Added implementation summary table to ARCHITECTURAL_ANALYSIS.md
- All 33 tasks now pass

**Files Modified:**
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 32: Implement Fortune Pool resource counter

**Changes Made:**
- Added `fortunePool` ref (number, default 0) for current Fortune points
- Added `fortunePoolEnabled` ref (boolean, default false) for Fortune Box crystal ownership
- Added `fortunePoolMax` computed: proficiency bonus when enabled (level-based: 1-4=2, 5-8=3, 9-12=4, 13-16=5, 17+=6)
- Added fortunePool and fortunePoolEnabled to dehydrate/hydrate cycle
- Added Fortune Pool UI in BasicView.vue: enable checkbox, current/max counter, usage description
- Added CSS styling for fortune-pool-section
- Added store exports for fortunePool, fortunePoolEnabled, fortunePoolMax
- Updated ARCHITECTURAL_ANALYSIS.md with Fortune Pool documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/BasicView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 31: Implement Statistic Increase tracking for level-up choices

**Changes Made:**
- Added `statIncreases` ref (array, default []) for logging applied stat boosts
- Added `statIncreaseLevels` constant [3, 6, 9, 12, 15]
- Added `statIncreasesApplied`, `statIncreasesAvailable`, `statIncreasesMissing` computeds
- Added statIncreases to dehydrate/hydrate cycle
- Added "Stat Increases: X/Y applied" indicator in BasicView.vue with missing reminder
- Added CSS styling for stat-increases-section
- Added store exports for all new members
- Updated ARCHITECTURAL_ANALYSIS.md with Statistic Increase documentation
- Build verified successfully

**Files Modified:**
- `src/stores/sheetStore.js`
- `src/views/PC/BasicView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 34: Move tallies, club position, stat increases, and fortune pool from Base Stats tab to Settings tab

**Changes Made:**
- Removed tallies-section (Budget/Training/Club Tallies + Resounding Growths), club-position-section, stat-increases-section, and fortune-pool-section from BasicView.vue template
- Removed corresponding CSS (.tallies-section, .stat-increases-section, .club-position-section, .fortune-pool-section) from BasicView.vue
- Added all four sections to SettingsView.vue template after Token Settings, wrapped in a "Tallies & Resources" container with h3 heading
- Added all corresponding CSS to SettingsView.vue's style block (nested under .settings-view), with flex-wrap added to .tallies-section for better responsiveness
- SettingsView.vue already had the useSheetStore import and sheet variable, so no script changes needed
- Updated ARCHITECTURAL_ANALYSIS.md: changed all UI location references from BasicView to SettingsView for these features, updated view descriptions in component tree
- Build verified successfully

**Files Modified:**
- `src/views/PC/BasicView.vue`
- `src/views/PC/SettingsView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 35: Rename 'Settings' tab to 'Misc' in navigation

**Changes Made:**
- Changed the tab label text from "Settings" to "Misc" in KnightNav.vue (line 37)
- Route path `/settings` remains unchanged (only the display label changed)
- Build verified successfully

**Files Modified:**
- `src/components/KnightNav.vue`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 36: Move Sleep & Daily Limits section from Magi-Knight tab to Student tab

**Changes Made:**
- Removed the sleep-daily-container NotchContainer (Sleep Effect radio buttons, Daily Limits checkboxes, Soul Sacrifice tracker) from KnightView.vue template
- Removed corresponding CSS (.sleep-daily-container and all nested rules) from KnightView.vue
- Added the same NotchContainer section to StudentView.vue, placed after the detention-counter div and before the student-ability section
- Added corresponding CSS to StudentView.vue style block
- Updated ARCHITECTURAL_ANALYSIS.md: changed Sleep & Daily Limits UI location from KnightView to StudentView
- Build verified successfully

**Files Modified:**
- `src/views/PC/KnightView.vue`
- `src/views/PC/StudentView.vue`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

### 2026-01-23 - Task 37: Remove Magi-Squire from Student tab and add triple-view NPC page

**Changes Made:**
- Removed MagiSquire import and component usage from StudentView.vue
- Added `npc_sheet_type` ref (string, default 'monster') to sheetStore.js with 3 options: 'npc', 'monster', 'squire'
- Added NPC social refs: `npc_social_name`, `npc_social_role`, `npc_social_heart_stage`, `npc_social_sp`, `npc_social_personality`, `npc_social_abilities`, `npc_social_notes`
- Added all new refs to dehydrate/hydrate cycle and store exports
- Updated NPCView.vue: added MagiSquire import, sheet type selector dropdown at top with Switch to PC button
- Wrapped existing monster content in `v-if="sheet.npc_sheet_type === 'monster'"` block, removed old Switch to PC button from header
- Added NPC social view (`v-else-if="sheet.npc_sheet_type === 'npc'"`) with name, role/occupation, Heart Stage dropdown, SP input, personality/abilities/notes textareas
- Added Magi-Squire view (`v-else-if="sheet.npc_sheet_type === 'squire'"`) rendering the MagiSquire component
- Added CSS for npc-type-selector, monster-view, npc-social-view, npc-social-header, npc-social-field, npc-social-details, squire-view
- Updated ARCHITECTURAL_ANALYSIS.md: NPCView description, Magi-Squire section, NPC System section with triple-view architecture docs
- Build verified successfully

**Files Modified:**
- `src/views/PC/StudentView.vue`
- `src/views/NPCView.vue`
- `src/stores/sheetStore.js`
- `ARCHITECTURAL_ANALYSIS.md`
- `ralph/plan.md`
- `ralph/activity.md`

