# Unnecessary/Incorrect Features in the Character Sheet

Features in the Magi-Knights Vue character sheet that do not exist in the compendium, or are incorrectly implemented compared to the compendium rules.

---

## 1. Fabricated Conditions (Not in Compendium)

The following conditions in `ConditionTracker.vue` / `sheetStore.js` do not exist in the Magi-Knights system. They appear to be borrowed from D&D 5e:

| Condition | Sheet Description | Compendium Status |
|-----------|-------------------|-------------------|
| **Blinded** | "Auto-fail sight checks, Disadvantage on attacks" | Does not exist |
| **Charmed** | "Can't attack charmer, charmer has social advantage" | Does not exist |
| **Frightened** | "Disadvantage while source visible, can't move closer" | Does not exist (Horrified/Distressed cover fear) |
| **Incapacitated** | "No actions or reactions" | Does not exist |
| **Invisible** | "Advantage on attacks, attacks vs you have disadvantage" | Does not exist |
| **Stunned** | "Incapacitated, can't move, auto-fail STR/DEX saves" | Does not exist |

Additionally, the sheet is **missing Soul-Siphoned IV** (only tracks Stages I-III; compendium defines I-IV).

---

## 2. Incorrect Condition Descriptions

Several conditions that DO exist have wrong descriptions in the tracker:

| Condition | Sheet Description | Compendium Description |
|-----------|-------------------|------------------------|
| **Poisoned** | "Disadvantage on attacks and ability checks" | Stress damage per Action, +1 Stress per Action, Disadvantage on attacks |
| **Bleeding** | "-2 HP/round until Medicine DC 12" | (Bleeding N) N-CON damage per Action (min 1), specific removal mechanics |
| **Burning** | "-5 HP/round, DEX DC 12 to end" | (Burning N) N damage per Action + N at start of turn, Athletics or Mysticism to end |
| **Depleted** | "-1 spell DC/attack, no Bonus Actions" | Move 0, Disadvantage on Attacks, can't cast Spells, Armor = 10 |
| **Drained** | "Can't regain HP/MP, Disadvantage on checks" | Move 0, Disadvantage on Attacks, spells cost +1 Tier |
| **Berserk** | "Advantage on STR attacks, can't use Formations" | Must attack, double STR damage, attacks have Advantage vs you |
| **Soul-Tainted** | "Disadvantage on all rolls" | Disadvantage vs Invading Evil, damage halved vs them |

---

## 3. Incorrect Condition Mechanics in Store

In `sheetStore.js`:

- **`conditionDisadvantageOnAttacks`** references `blinded` and `frightened` (non-existent conditions) and `prone`/`restrained` (which don't cause attack disadvantage per compendium)
- **`distressedPenalty`** applies `-1 to checks` but compendium says Distressed gives "Disadvantage on Skill Checks and Attack Actions"

---

## 4. Incorrect Weapon Quality Implementations

The weapon quality effects in `sheetStore.js` are significantly wrong:

| Quality | Sheet Effect | Compendium Effect |
|---------|-------------|-------------------|
| **Accurate** | Flat +1 to attack rolls | Trade-off: -2 damage for +1 Attack, OR -4 damage for +2 Attack |
| **Forceful** | Flat +1 to damage rolls | On Attack Roll 16+: Add extra 1d6 damage |
| **Massive** | Always -2 attack, +4 damage | Choice: -1 Attack for +2 damage, OR -2 Attack for +4 damage |
| **Veil-Piercing** | Critical hit on 16+ | 1/Combat Encounter: Instead of rolling, automatically hit |

The `weaponCritRange` computed (crit on 16+) is based on a nonexistent mechanic. The 16+ trigger in the compendium belongs to Ensnaring, Forceful, and Staggering Blow (not Veil-Piercing).

---

## 5. Fabricated Gun Qualities (Entire System Wrong)

The Soul Gun quality system in the sheet is completely fabricated. Soul Guns do NOT use weapon-style qualities. They use a **Firing Pool** system with d8s, Gun Styles, and Gun Attachments.

**Sheet's fabricated gun qualities (none exist in compendium):**
- `accurate`: "+1 to attack rolls"
- `longRange`: "Double effective range"
- `rapidFire`: "Can attack twice with -2 penalty"
- `scatter`: "+2 damage at close range (5ft)"
- `silenced`: "Does not reveal position"
- `veilPiercing`: "Critical hit on 16+"
- `vicious`: "On crit, maximize duplicated dice"

**What should exist instead:**
- Gun Type selection (HDG, SMG, ASR, DMR, STG, LMG, SDA)
- Gun Style selection (for HDG/SMG only)
- Gun Attachments (Scopes, Magazines, Rail/Underbarrel, Muzzles)
- Firing Pool mechanics (d8s, not d20 attack rolls)

---

## 6. Incorrect Implement Qualities

Most implement qualities in the sheet are fabricated:

| Sheet Quality | Sheet Effect | Compendium Status |
|---------------|-------------|-------------------|
| **Spell Focus** | "+1 to spell attack rolls" | Does not exist |
| **Channeling** | "+1 to Spell DC" | Does not exist |
| **Quick Cast** | "Cast one Tier I spell as bonus action per rest" | Does not exist (partially resembles Mana Conduit but wrong) |
| **Warding Focus** | "+1 to magical damage resistance" | Incorrect (Warding = reduce spell damage by 1/2 Level) |
| **Mana Attunement** | "MP = MCO x 3" | Correct |

**Missing implement qualities:**
- Card Conductor (required for Divination/Release Magic)
- Embolden (spell damage + MK Level)
- Light (one-hand, no weapon limit impact)
- Mana Conduit (1/Sleep, -1 Tier MP cost)
- Radiance (healing spells +1+Level HP)

---

## 7. Incorrect NPC Creature Types

The NPC view lists creature types that don't exist in Magi-Knights:

| Type | Compendium Status |
|------|-------------------|
| **Construct** | Does not exist |
| **Undead** | Does not exist |
| **Beast** | Does not exist |
| **Aberration** | Does not exist |

The compendium only uses **Outsider** and **Mortal** as creature types.

---

## 8. Incorrect NPC Size Options

| Size | Compendium Status |
|------|-------------------|
| **Tiny** | Does not exist |
| **Gargantuan** | Does not exist |
| Small | Exists |
| Medium | Exists |
| Large | Exists |
| Huge | Exists |

---

## 9. Empty/Stub Components

These files exist but contain no functionality:

- `BurstDisplay.vue` - Empty component (no template, script, or style)
- `DiamondDisplay.vue` - Empty component (no template, script, or style)

---

## Summary

| Category | Issue |
|----------|-------|
| Fabricated conditions | 6 D&D 5e conditions that don't exist in system |
| Wrong condition descriptions | 7 conditions with incorrect effects |
| Wrong condition mechanics | 2 computed properties using wrong logic |
| Wrong weapon qualities | 4 qualities with incorrect implementations |
| Fabricated gun qualities | Entire 7-quality system doesn't exist |
| Wrong implement qualities | 4 fabricated, 1 incorrect, 5 missing |
| Wrong NPC creature types | 4 D&D types that don't exist |
| Wrong NPC sizes | 2 sizes that don't exist |
| Empty components | 2 stub files |
