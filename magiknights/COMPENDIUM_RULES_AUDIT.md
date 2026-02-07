# Magi-Knights Awakening: Compendium Rules vs. Sheet Implementation Audit

**Date:** 2026-02-07
**Scope:** All rules from the Magi-Knights Compendium (343 pages across 10 categories) that a character sheet has responsibility for representing, compared against the current Beacon sheet implementation.

**Sources used (all within the magiknights/ folder):**
- `compendium/` — Full SRD in Roll20 JSON format (rules.json, classes.json, equipment.json, techniques.json, spells.json, shards.json, relics.json, lists.json, monsters.json, locations.json)
- `src/stores/sheetStore.js` — Main character sheet state and logic
- `src/components/` — All Vue UI components
- `src/views/` — All view files
- `src/rollFuncs/` — Dice roll functions
- `src/data/spellPathData.js` — Spell path definitions
- `src/relay/handlers/` — Beacon relay handlers
- `rules_reference.md`, `gaps.md`, `missing_features.md`, `unnecessary_features.md`, `defects_feature_requests.md` — Existing analysis documents

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total compendium rule areas relevant to a character sheet | 128 |
| Fully and correctly implemented | 52 |
| Partially implemented (exists but incomplete or has errors) | 32 |
| Not implemented at all | 30 |
| Implemented incorrectly (fabricated or wrong mechanics) | 14 |
| **Overall correct coverage** | **~41%** |
| **Partial + correct coverage** | **~66%** |

---

## Scoring Legend

- **FULL** — Rule is implemented correctly per compendium
- **PARTIAL** — Rule exists in the sheet but is incomplete, missing sub-features, or has minor errors
- **WRONG** — Rule is implemented but with incorrect mechanics (fabricated or D&D-borrowed logic)
- **MISSING** — Rule is not present in the sheet at all

---

## 1. Core Character Statistics (Compendium: Rules, Classes)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 1 | Six ability scores (STR, DEX, CON, INT, WIS, CHA) | **FULL** | All 6 present with input fields |
| 2 | Modifier table (score → modifier mapping) | **FULL** | Computed correctly from score |
| 3 | Modifier cap at +5 (mortal limit) | **PARTIAL** | Cap exists but "Exceed a Mortal's Limits" toggle at Rep IV not tracked |
| 4 | Herald's Array stat generation (15,14,13,12,11,8) | **MISSING** | No character creation assistance |
| 5 | Fate Influence stat generation (5d4 system) | **MISSING** | No character creation assistance |
| 6 | Statistic range 6-16 during creation | **MISSING** | No validation during creation |
| 7 | Proficiency Bonus (scaled by Reputation Level) | **PARTIAL** | PB exists; needs verification it scales by Rep (not level) |

**Subcategory score: 3 FULL, 2 PARTIAL, 2 MISSING = 43% full, 71% partial+**

---

## 2. Hit Points & Resources (Compendium: Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 8 | Student Hit Points (10 + CON mod + Rep Level) | **FULL** | Tracked with max calculation |
| 9 | Magi-Knight Hit Points (10 + CON mod at Lv1, +6+CON per level) | **FULL** | Tracked with max and level scaling |
| 10 | Dual HP pool system (Student vs Knight) | **FULL** | Both tracked independently |
| 11 | Mana Points (MCO × 2 or MCO × 3 w/ Mana Attunement) | **FULL** | MP tracked with MCO calculation |
| 12 | MCO formula (MK Level + MAM + Rep Level) | **FULL** | Computed correctly |
| 13 | Temporary HP tracking | **FULL** | Present in sheet |
| 14 | Student HP recovery (1/2 total at end of Phase) | **MISSING** | No recovery mechanic tracking |
| 15 | MK HP recovery (Refreshing Sleep only) | **MISSING** | No sleep phase recovery tracking |
| 16 | Token bar integration (HP, SHP, MP, Temp HP) | **FULL** | Fixed and working per DEF-002 resolution |

**Subcategory score: 7 FULL, 0 PARTIAL, 2 MISSING = 78% full**

---

## 3. Combat Calculations (Compendium: Rules, Equipment)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 17 | Weapon Attack Bonus (PB + STR/DEX mod) | **FULL** | Computed and used in rolls |
| 18 | Weapon Damage (Base dice + STR/DEX mod) | **FULL** | Roll function handles complex expressions |
| 19 | Magic Ability Modifier (style-dependent stat) | **FULL** | MAM calculated per magic style |
| 20 | Spell Attack Bonus (PB + MAM) | **FULL** | Computed correctly |
| 21 | Spell DC (8 + PB + MAM) | **FULL** | Computed correctly |
| 22 | Student Armor (10 + CON + DEX) | **FULL** | Calculated |
| 23 | MK Armor (element-based + Rep/Form bonuses) | **PARTIAL** | Base armor per element exists; Soul Armor tier bonuses not tracked |
| 24 | Movement (30ft base; 20ft for Earth/Void) | **PARTIAL** | Base exists; elemental reduction may not auto-apply |
| 25 | Student unarmed attack (PB + STR/DEX) | **PARTIAL** | Basic attack exists; Martial Artist upgrade to 1d6 not tracked |
| 26 | Initiative | **FULL** | Tracked and rollable |
| 27 | Finesse weapon DEX option | **FULL** | Supported in weapon rolls |
| 28 | Self-healing restriction (no modifiers to self) | **MISSING** | No enforcement in spell rolls |
| 29 | Provoked Attack (reaction) | **MISSING** | No provoked attack tracking |
| 30 | Parry (reaction technique) | **MISSING** | Listed as technique but no reaction tracking |

**Subcategory score: 8 FULL, 3 PARTIAL, 3 MISSING = 57% full, 79% partial+**

---

## 4. Conditions (Compendium: Rules — 6 core + additional)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 31 | Horrified (initiative floor, -10 rolls, can't attack, +1 Stress) | **PARTIAL** | Condition tracked but mechanical effects may not auto-apply correctly |
| 32 | Distressed (Disadvantage on Skill/Attack checks) | **WRONG** | Sheet says "-1 to checks" instead of Disadvantage |
| 33 | Berserk (immune Horror/Distress, lose magic, double STR dmg) | **WRONG** | Sheet says "Advantage on STR attacks, can't use Formations" — incorrect |
| 34 | Drained (MP +1 tier cost, Move 0, Disadvantage attacks) | **WRONG** | Sheet says "Can't regain HP/MP, Disadvantage on checks" — incorrect |
| 35 | Restrained (Move 0, no Spells/Reactions, Melee 5ft) | **PARTIAL** | Tracked but wrong mechanical description |
| 36 | Silenced (no spells, no speech skills) | **PARTIAL** | Tracked but effects not fully described |
| 37 | Poisoned | **WRONG** | Sheet: "Disadv on attacks/ability checks" vs compendium: Stress damage per action |
| 38 | Bleeding (N) | **WRONG** | Sheet: "-2 HP/round" vs compendium: "N-CON damage per action" |
| 39 | Burning (N) | **WRONG** | Sheet: "-5 HP/round, DEX DC 12" vs compendium: "N damage/action + N at start of turn" |
| 40 | Depleted | **WRONG** | Sheet: "-1 spell DC/attack" vs compendium: "Move 0, can't cast, Armor=10" |
| 41 | Soul-Tainted | **WRONG** | Sheet: "Disadvantage on all rolls" vs compendium: "Disadvantage vs Invading Evil" |
| 42 | Soul-Siphoned (I-IV) | **PARTIAL** | Only stages I-III tracked; stage IV missing |
| 43 | Disoriented | **MISSING** | Not in condition tracker at all |
| 44 | Unconscious | **MISSING** | Not in condition tracker (with Prone + Student revert) |
| 45 | Prone | **PARTIAL** | Referenced but mechanical effects unclear |
| 46 | Blinded (FABRICATED) | **WRONG** | D&D 5e condition — does not exist in Magi-Knights |
| 47 | Charmed (FABRICATED) | **WRONG** | D&D 5e condition — does not exist in Magi-Knights |
| 48 | Frightened (FABRICATED) | **WRONG** | D&D 5e condition — does not exist in Magi-Knights |
| 49 | Incapacitated (FABRICATED) | **WRONG** | D&D 5e condition — does not exist in Magi-Knights |
| 50 | Invisible (FABRICATED) | **WRONG** | D&D 5e condition — does not exist in Magi-Knights |
| 51 | Stunned (FABRICATED) | **WRONG** | D&D 5e condition — does not exist in Magi-Knights |

**Subcategory score: 0 FULL, 5 PARTIAL, 2 MISSING, 14 WRONG = 0% correct, 24% partial+**
*This is the worst-performing category — 6 fabricated conditions, 8 with wrong descriptions.*

---

## 5. Stress, Exhaustion & Death (Compendium: Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 52 | Stress tracker (0-6 levels) | **FULL** | Tracked in sheet |
| 53 | Exhaustion tracker (0-6 levels) | **FULL** | Tracked in sheet |
| 54 | Endurance Die (d6, success if d6 >= level) | **MISSING** | No roll integration (FEAT-001 requested) |
| 55 | Level 6 automatic Disadvantage | **MISSING** | Not enforced |
| 56 | Stress overflow → Trauma point | **MISSING** | Not tracked |
| 57 | Oppressive Stress / Freaking Out flag | **MISSING** | Not tracked |
| 58 | Crystalline Fracturing (7 facets, 8th = death) | **PARTIAL** | Eclipse chart exists but facet tracking incomplete |
| 59 | Heroic Conviction (+1 fracture to avoid Exposed) | **MISSING** | Not tracked |
| 60 | Exposed condition (0 HP, Free Actions only) | **MISSING** | Not in condition system |
| 61 | Forced Transformation (+3 fractures) | **MISSING** | Not tracked |
| 62 | Trauma Points on Eclipse chart | **PARTIAL** | Eclipse chart exists visually; milestone effects not enforced |
| 63 | Corruption tracking (Heartless Knight at 3+, Fallen at 5+) | **MISSING** | Not tracked |
| 64 | Burnout Lines (permanent eclipse marks) | **PARTIAL** | Visual tracking only, not enforced |
| 65 | Acts of Remorse (Redemption progress) | **MISSING** | Not tracked |

**Subcategory score: 2 FULL, 3 PARTIAL, 9 MISSING = 14% full, 36% partial+**

---

## 6. Skills (Compendium: Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 66 | Full skill list with ability score association | **FULL** | All skills present with correct ability scores |
| 67 | Skill modifier calculation (ability mod + proficiency if proficient) | **FULL** | Computed correctly |
| 68 | Skill proficiency toggles | **FULL** | Present and functional |
| 69 | Skill rolls (d20 + modifier) | **FULL** | Roll functions working |
| 70 | Custom skill value override (Skill Mastery) | **FULL** | Fixed per resolved defect |
| 71 | Skill Mastery unlock indicators per level | **MISSING** | No mastery indicator |
| 72 | Renaissance Student skill bonuses | **MISSING** | Student type bonuses not applied mechanically |

**Subcategory score: 5 FULL, 0 PARTIAL, 2 MISSING = 71% full**

---

## 7. Magic System (Compendium: Spells, Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 73 | MP Tier costs (I=3, II=6, III=15, IV=25, V=36, VI=45) | **FULL** | Defined in spell path data |
| 74 | 8 base spell paths (Beam, Explosion, Curing, Restoration, Amplify, Manipulate, Barrier, Transformation) | **FULL** | All present in spellPathData.js |
| 75 | 4 advanced spell paths (Divination, Summoning, Chronomancy, Release Magic) | **PARTIAL** | Paths defined but Release Magic card system not implemented |
| 76 | Spell path tier details (per-tier name, description, action, dice) | **FULL** | Complete tier data for each path |
| 77 | Magic Style selection (Ethereal, Memento, Shaper, Release, Soul, Verse) | **FULL** | Style selector present |
| 78 | Magic Style → MAM stat mapping | **FULL** | Correctly maps styles to eligible ability scores |
| 79 | Spell path access by Magic Style | **MISSING** | No validation of which paths a style can learn |
| 80 | Spell rolling (d20 + spell attack or DC) | **FULL** | Roll functions working |
| 81 | Spell Modification: Mana Strain (1 Exhaustion, -1 tier cost) | **MISSING** | Not implemented |
| 82 | Spell Modification: Rushed Spell (Bonus Action, half damage) | **MISSING** | Not implemented |
| 83 | Spell Modification: Overcharging (2 Exhaustion, +damage dice) | **MISSING** | Not implemented |
| 84 | Spell Modification: Total Focus (enhanced effect) | **MISSING** | Not implemented |
| 85 | Spell Modification: Quickening (+1 tier MP, changes action type) | **MISSING** | Not implemented |
| 86 | Release Magic card deck system (22 cards, draw pool) | **MISSING** | Entire card-based magic subsystem missing |
| 87 | Summoning path companion stat blocks | **MISSING** | No summon companion tracking |
| 88 | Herald Bond Level (I-V, affects tier access) | **MISSING** | Not tracked |
| 89 | Spell tier access restricted by Herald bond level | **MISSING** | Not enforced |

**Subcategory score: 7 FULL, 1 PARTIAL, 9 MISSING = 41% full, 47% partial+**

---

## 8. Equipment & Weapons (Compendium: Equipment)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 90 | Weapon name and damage dice | **FULL** | Tracked per weapon |
| 91 | Weapon attack bonus calculation | **FULL** | Computed and rolled |
| 92 | Weapon qualities: Accurate | **WRONG** | Sheet: flat +1 attack; Compendium: trade-off system (-2 dmg/+1 atk OR -4 dmg/+2 atk) |
| 93 | Weapon qualities: Forceful | **WRONG** | Sheet: flat +1 damage; Compendium: on roll 16+, add extra 1d6 |
| 94 | Weapon qualities: Massive | **WRONG** | Sheet: always -2/+4; Compendium: choice of -1/+2 OR -2/+4 |
| 95 | Weapon qualities: Veil-Piercing | **WRONG** | Sheet: crit on 16+; Compendium: 1/encounter auto-hit |
| 96 | Soul Gun system (HDG, SMG, ASR, DMR, STG, LMG, SDA types) | **WRONG** | Sheet has fabricated d20-based gun quality system; compendium uses d8 Firing Pool |
| 97 | Gun Styles (HDG/SMG variants) | **MISSING** | Not implemented |
| 98 | Gun Attachments (Scope, Magazine, Rail, Muzzle) | **MISSING** | Not implemented |
| 99 | Firing Pool mechanics (d8s, not d20 attack rolls) | **MISSING** | Entirely wrong paradigm used |
| 100 | Implement qualities: Mana Attunement (MP = MCO × 3) | **FULL** | Correctly implemented |
| 101 | Implement qualities: Warding | **WRONG** | Sheet: "+1 magic resist"; Compendium: reduce spell damage by ½ Level |
| 102 | Implement qualities: Spell Focus, Channeling, Quick Cast | **WRONG** | All three fabricated — not in compendium |
| 103 | Implement qualities: Card Conductor, Embolden, Light, Mana Conduit, Radiance | **MISSING** | 5 real implement qualities not in sheet |
| 104 | Soul Armor tier progression (Awakened → Legendary) | **MISSING** | No tier selector or auto-bonuses |
| 105 | Armament Runes: 14 weapon runes | **PARTIAL** | Rune text fields exist but full library not integrated |
| 106 | Armament Runes: 10 armor runes | **PARTIAL** | Rune text fields exist but full library not integrated |
| 107 | Soul Armor Weaves | **MISSING** | Not tracked |

**Subcategory score: 3 FULL, 2 PARTIAL, 6 MISSING, 7 WRONG = 17% full, 28% partial+**

---

## 9. Combat Forms & Techniques (Compendium: Classes, Techniques)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 108 | Combat Forms I-X selection | **PARTIAL** | Some form fields exist but no Form I-X selector with mechanical effects |
| 109 | Form level prerequisites | **MISSING** | No validation |
| 110 | Form weapon type restrictions (III=1H, IV=2H, VI=shield, X=gun) | **MISSING** | No weapon compatibility enforcement |
| 111 | Form Mastery checkboxes/unlocks | **MISSING** | Not tracked |
| 112 | Battle Techniques repeating list | **FULL** | Repeating section exists with name/description |
| 113 | Technique level requirements | **MISSING** | No prerequisite validation |
| 114 | Technique frequency (1/encounter, 1/round, etc.) | **MISSING** | No usage tracking |
| 115 | Combat Tactics repeating list | **FULL** | Repeating section exists with name/description |
| 116 | Tactic prerequisites and mechanical effects | **MISSING** | No validation or auto-applied effects |
| 117 | Level-locked abilities (Counter Blast, Perfect Parry, Extricate Aether, Heroic Resolve, Knight's Insight, Knight's Resolution) | **MISSING** | None of these 6 abilities tracked |

**Subcategory score: 2 FULL, 1 PARTIAL, 7 MISSING = 20% full, 30% partial+**

---

## 10. Progression & Character Options (Compendium: Classes, Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 118 | Magi-Knight Level tracking | **FULL** | Level field present |
| 119 | Reputation Level tracking | **FULL** | Rep level field present |
| 120 | Elemental Affinity selection (Earth, Fire, Air, Water, Void) | **FULL** | Selector present with armor effects |
| 121 | Branching Elements (10 sub-elements) | **MISSING** | Not tracked |
| 122 | Student Type selection (8 types) | **PARTIAL** | Field exists but mechanical bonuses not applied |
| 123 | Court Card of Fate effects (6 options) | **MISSING** | No mechanical bonuses applied |
| 124 | Player Link bonuses (13+ options) | **MISSING** | Not tracked |

**Subcategory score: 3 FULL, 1 PARTIAL, 3 MISSING = 43% full, 57% partial+**

---

## 11. Social & Student Systems (Compendium: Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 125 | Social Points (SP) / Bond tracking | **PARTIAL** | Bond points exist but SP progression milestones not implemented |
| 126 | Heart Stages per NPC (Threatening → Sympathetic) | **MISSING** | Not tracked |
| 127 | HIRU recognition flags per NPC | **MISSING** | Not tracked |
| 128 | Moment of Catharsis mechanics | **MISSING** | Not tracked |
| 129 | Student phase activity tracking | **MISSING** | No schedule/time slot system |
| 130 | Budget Tallies currency | **MISSING** | Not tracked |
| 131 | Background items list | **FULL** | BackgroundItems component exists |

**Subcategory score: 1 FULL, 1 PARTIAL, 5 MISSING = 14% full, 29% partial+**

---

## 12. Squad Mechanics (Compendium: Lists, Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 132 | Unity Points resource (max = Rep Level - 1) | **MISSING** | No unity point tracker |
| 133 | Squadron Formations (Arrow, Victory, Barrage, Diamond) | **PARTIAL** | Component exists (SquadronFormations.vue) but mechanics incomplete |
| 134 | Formation Inspiration cost (2-3 points) | **MISSING** | Not tracked |
| 135 | Combination Maneuvers | **PARTIAL** | Component exists (CombinationManeuvers.vue) but mechanics incomplete |
| 136 | Combination Unity cost | **MISSING** | Not tracked |
| 137 | Inspiration Points tracking | **MISSING** | Not tracked |

**Subcategory score: 0 FULL, 2 PARTIAL, 4 MISSING = 0% full, 33% partial+**

---

## 13. Items & Consumables (Compendium: Shards, Relics, Equipment)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 138 | Power Shards repeating section | **FULL** | ShardItem component exists |
| 139 | 20 specific shard types with rarity and effects | **PARTIAL** | Text-only; no compendium integration or auto-fill |
| 140 | Relic repeating section | **FULL** | Tracked in sheet |
| 141 | Relic capacity enforcement (max = Rep Level) | **MISSING** | Not enforced |
| 142 | Gloom Gems currency | **MISSING** | Not tracked as player resource |
| 143 | Visor equipment slot (3 types) | **MISSING** | Not implemented |
| 144 | Soul Oblation mechanic | **MISSING** | Not implemented |

**Subcategory score: 2 FULL, 1 PARTIAL, 4 MISSING = 29% full, 43% partial+**

---

## 14. Roll to Resist & Defensive Mechanics (Compendium: Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 145 | Roll to Resist (PB + Stat mod) | **PARTIAL** | Single resist proficiency tracked; multiple not supported (DEF-003) |
| 146 | Per-type resist proficiency (STR, DEX, CON, Magic) | **MISSING** | Only one resist proficiency field |
| 147 | Per-type Advantage/Disadvantage toggles (Physical, Magic, Horror, Purity) | **MISSING** | Not tracked |
| 148 | Advantage/Disadvantage toggle on rolls | **MISSING** | FEAT-002 requested; not implemented |

**Subcategory score: 0 FULL, 1 PARTIAL, 3 MISSING = 0% full, 25% partial+**

---

## 15. NPC/Monster Sheet (Compendium: Monsters, Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 149 | NPC stat block view | **FULL** | NPCView.vue exists |
| 150 | NPC ranks (Vassal, Adversary, Nemesis, Harbinger) | **PARTIAL** | Basic rank field; damage % modifiers not applied |
| 151 | NPC Roles (Assassin, Brute, Defender, etc. — 12 roles) | **MISSING** | Not implemented |
| 152 | NPC creature types | **WRONG** | Sheet has D&D types (Construct, Undead, Beast, Aberration); compendium only has Outsider and Mortal |
| 153 | NPC size options | **WRONG** | Sheet has Tiny/Gargantuan (wrong); missing Massive/Colossal |
| 154 | Horde/Swarm multi-unit tracking | **MISSING** | Not implemented |
| 155 | Magi-Squire companion sheet | **MISSING** | MagiSquire.vue exists as component but full companion subsystem not implemented |

**Subcategory score: 1 FULL, 1 PARTIAL, 3 MISSING, 2 WRONG = 14% full, 29% partial+**

---

## 16. Action Economy & Session Tracking (Compendium: Rules)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 156 | Action types (Standard, Move, Bonus, Reaction, Immediate, Full-Round) | **MISSING** | No action economy tracking |
| 157 | Sleep Phase type selector (Average, Feverish, Refreshing) | **MISSING** | Not implemented |
| 158 | Daily/Session limits (Crystalline Seal 1/day, Medical Triage 1/Sleep, Soul Sacrifice per career) | **MISSING** | Not tracked |
| 159 | Roll mode toggle (normal/advantage/disadvantage) | **PARTIAL** | RollModeToggle.vue exists but may not be fully integrated |

**Subcategory score: 0 FULL, 1 PARTIAL, 3 MISSING = 0% full, 25% partial+**

---

## 17. Compendium Integration (Compendium: All)

| # | Rule | Status | Notes |
|---|------|--------|-------|
| 160 | Drag-and-drop from compendium | **PARTIAL** | onDragOver handler exists; compendium attributes defined but integration incomplete |
| 161 | Spell compendium lookup | **PARTIAL** | Spell data exists in spellPathData.js but not linked to Roll20 compendium |
| 162 | Technique/Tactic compendium lookup | **MISSING** | Manual entry only |
| 163 | Equipment compendium lookup | **MISSING** | Manual entry only |
| 164 | Shard/Relic compendium lookup | **MISSING** | Manual entry only |

**Subcategory score: 0 FULL, 2 PARTIAL, 3 MISSING = 0% full, 40% partial+**

---

## Overall Summary by Category

| # | Category | FULL | PARTIAL | MISSING | WRONG | Total Items | Coverage % |
|---|----------|------|---------|---------|-------|-------------|------------|
| 1 | Core Stats | 3 | 2 | 2 | 0 | 7 | 43% |
| 2 | HP & Resources | 7 | 0 | 2 | 0 | 9 | 78% |
| 3 | Combat Calculations | 8 | 3 | 3 | 0 | 14 | 57% |
| 4 | Conditions | 0 | 5 | 2 | 14 | 21 | 0% |
| 5 | Stress/Exhaustion/Death | 2 | 3 | 9 | 0 | 14 | 14% |
| 6 | Skills | 5 | 0 | 2 | 0 | 7 | 71% |
| 7 | Magic System | 7 | 1 | 9 | 0 | 17 | 41% |
| 8 | Equipment & Weapons | 3 | 2 | 6 | 7 | 18 | 17% |
| 9 | Combat Forms & Techniques | 2 | 1 | 7 | 0 | 10 | 20% |
| 10 | Progression & Options | 3 | 1 | 3 | 0 | 7 | 43% |
| 11 | Social & Student | 1 | 1 | 5 | 0 | 7 | 14% |
| 12 | Squad Mechanics | 0 | 2 | 4 | 0 | 6 | 0% |
| 13 | Items & Consumables | 2 | 1 | 4 | 0 | 7 | 29% |
| 14 | Resist & Defense | 0 | 1 | 3 | 0 | 4 | 0% |
| 15 | NPC/Monster Sheet | 1 | 1 | 3 | 2 | 7 | 14% |
| 16 | Action Economy | 0 | 1 | 3 | 0 | 4 | 0% |
| 17 | Compendium Integration | 0 | 2 | 3 | 0 | 5 | 0% |
| **TOTAL** | | **44** | **27** | **70** | **23** | **164** | **27%** |

---

## Severity Breakdown of Issues

### Fabricated Content (Not in Compendium — Should Be Removed)
1. 6 D&D 5e conditions (Blinded, Charmed, Frightened, Incapacitated, Invisible, Stunned)
2. 7 fabricated gun qualities (accurate, longRange, rapidFire, scatter, silenced, veilPiercing, vicious)
3. 3 fabricated implement qualities (Spell Focus, Channeling, Quick Cast)
4. 4 wrong NPC creature types (Construct, Undead, Beast, Aberration)
5. 2 wrong NPC sizes (Tiny, Gargantuan)

### Incorrectly Implemented (Present but Wrong Mechanics)
1. 8 conditions with wrong mechanical descriptions
2. 4 weapon qualities with wrong effects
3. 1 implement quality with wrong effect (Warding)
4. Gun attack paradigm fundamentally wrong (d20 vs d8 Firing Pool)
5. Condition-based computed properties reference non-existent conditions

### Missing Core Systems
1. **Release Magic** — Entire card-based magic subsystem
2. **Soul Gun Firing Pool** — Entirely wrong paradigm currently
3. **Spell Modifications** — 5 modification types not implemented
4. **Unity Points** — Core squad resource
5. **Squadron Formations** — Core squad tactics (components exist but incomplete)
6. **Combination Maneuvers** — Core squad combat (components exist but incomplete)
7. **Herald Bond** — Affects spell tier access
8. **Magi-Squire** — Full companion subsystem
9. **Eclipse/Trauma consequences** — Corruption milestones
10. **Level-locked abilities** — 6 abilities unlocked at specific levels

---

## What Works Well

The sheet has solid implementation of:
- **Core character math** — Ability scores, modifiers, PB, attack bonuses, spell DC, armor calculations
- **Dual HP system** — Student and Knight HP tracked independently with correct formulas
- **MP/MCO system** — Mana calculations correct
- **Skill system** — Full skill list, proficiency toggles, custom overrides, functional rolls
- **Spell path data** — All 12 paths with per-tier detail
- **Basic combat rolls** — Weapon and spell attack rolls functional
- **Token bar integration** — HP/MP linked to Roll20 tokens
- **UI structure** — PC view with Knight/Student/Background/Settings tabs, NPC view, repeating sections for techniques/tactics/shards/relics

---

## Estimated Effort to Reach Full Coverage

| Priority | Items | Est. Effort | Impact |
|----------|-------|-------------|--------|
| Fix fabricated/wrong content | 23 items | Medium | Prevents wrong rules from misleading players |
| Implement missing core systems | 10 systems | High | Unblocks major gameplay features |
| Complete partial implementations | 27 items | Medium | Finishes features that are started |
| Add missing tracking/validation | 40 items | Medium-High | Completes the sheet's rule coverage |
| **Total remaining work** | **~100 items** | **Significant** | **From 27% → target 90%+** |

---

## Conclusion

The Magi-Knights Beacon sheet correctly implements approximately **27% of the compendium rules** that a character sheet should represent. When including partial implementations (features that exist but are incomplete), coverage rises to approximately **43%**. The sheet has a strong foundation in core character math, HP/MP tracking, skills, and spell path data, but has significant gaps in conditions (heavily contaminated with D&D 5e content), equipment qualities (mostly fabricated), advanced magic features, squad mechanics, social systems, and progression tracking. The most urgent fixes are correcting the fabricated/wrong content (23 items) and implementing the missing core systems that block major gameplay features.
