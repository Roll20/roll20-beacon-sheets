# Activity Log

## Status
- **Tasks Completed:** 3/17
- **Current Task:** 4 - Fix weapon quality definitions and computed effects
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

