# Activity Log

## Status
- **Tasks Completed:** 5/17
- **Current Task:** 6 - Fix implement quality system to match compendium
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

