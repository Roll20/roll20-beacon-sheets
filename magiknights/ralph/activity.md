# Activity Log

## Status
- **Tasks Completed:** 14/17
- **Current Task:** 15 - Implement Magi-Squire companion section
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

