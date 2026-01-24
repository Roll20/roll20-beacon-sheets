# Magi-Knights Character Sheet Correction Plan

Tasks to remove incorrect/unnecessary features and implement missing ones. Each task is self-contained with full context for fresh context window execution.

```json
[
  {
    "id": 1,
    "category": "fix-conditions",
    "description": "Remove fabricated D&D 5e conditions and add missing Magi-Knights conditions",
    "steps": [
      "Read `src/components/ConditionTracker.vue`",
      "Remove these fabricated conditions from the `other` category: blinded, charmed, frightened, incapacitated, invisible, stunned",
      "Add `disoriented` to the `physical` category with key 'disoriented', name 'Disoriented', effect 'Disadvantage on Attacks, Physical Resists, Skill Checks'",
      "Add `unconscious` to the `physical` category with key 'unconscious', name 'Unconscious', effect 'Knocked out, Prone, revert to Student Persona'",
      "Add `soulSiphoned4` to the `depletion` category with key 'soulSiphoned4', name 'Soul-Siphoned IV', effect 'Paralyzed + 1 Trauma'",
      "Remove the entire `other` category object (all its conditions were either fabricated or moved)",
      "Move `poisoned` from the removed `other` category into `depletion` category with corrected effect: 'Stress damage per Action, +1 Stress per Action'",
      "In `src/stores/sheetStore.js`, find the `conditions` ref object and remove: blinded, charmed, frightened, incapacitated, invisible, stunned",
      "Add to the conditions ref: disoriented: false, unconscious: false, soulSiphoned4: false",
      "Verify the `activeConditions` computed still works correctly with the new keys",
      "Update ARCHITECTURAL_ANALYSIS.md to reflect the corrected condition list"
    ],
    "context": "The ConditionTracker.vue has 4 categories (mental, physical, depletion, other). The `other` category contains 7 D&D 5e conditions (blinded, charmed, frightened, incapacitated, invisible, poisoned, stunned) that don't exist in Magi-Knights. The compendium defines 17+ conditions: Berserk, Bleeding, Burning, Depleted, Disoriented, Distressed, Drained, Exposed, Horrified, Paralyzed, Poisoned, Prone, Restrained, Silenced, Soul-Siphoned I-IV, Soul-Tainted, Unconscious. The sheet is missing Disoriented, Unconscious, and Soul-Siphoned IV.",
    "passes": true
  },
  {
    "id": 2,
    "category": "fix-conditions",
    "description": "Fix incorrect condition descriptions to match compendium",
    "steps": [
      "Read `src/components/ConditionTracker.vue`",
      "Fix the `bleeding` condition effect to: '(N)-CON damage per Action (min 1). Medicine or healing to remove'",
      "Fix the `burning` condition effect to: '(N) damage per Action + at start of turn. Athletics/Mysticism to end'",
      "Fix the `depleted` condition effect to: 'Move 0, Disadvantage on Attacks, can\\'t cast Spells, Armor = 10'",
      "Fix the `drained` condition effect to: 'Move 0, Disadvantage on Attacks, spells cost +1 Tier MP'",
      "Fix the `berserk` condition effect to: 'Must attack, double STR damage, attacks have Advantage vs you'",
      "Fix the `soulTainted` condition effect to: 'Disadvantage vs Invading Evil, damage halved vs them'",
      "Fix the `distressed` condition effect to: 'Disadvantage on Skill Checks and Attack Actions'",
      "Fix the `horrified` condition effect to: '+1 Stress, Move 0, can\\'t damage enemies, auto-hit vs you'",
      "Update ARCHITECTURAL_ANALYSIS.md condition section if it lists condition effects"
    ],
    "context": "Multiple condition descriptions in ConditionTracker.vue are simplified or incorrect compared to the compendium. The compendium defines precise mechanical effects for each condition. Key corrections: Bleeding uses (N)-CON formula not flat -2, Burning has per-Action AND start-of-turn damage, Depleted/Drained set Move to 0 and have specific spell restrictions, Berserk forces attacks and doubles STR (not advantage on attacks), Soul-Tainted only affects rolls vs Invading Evil.",
    "passes": true
  },
  {
    "id": 3,
    "category": "fix-conditions",
    "description": "Fix condition mechanics computeds in sheetStore.js",
    "steps": [
      "Read `src/stores/sheetStore.js` and search for `conditionDisadvantageOnAttacks`",
      "The current implementation references blinded, frightened, prone, restrained, poisoned - these are wrong",
      "Replace with correct conditions that cause Disadvantage on attacks per compendium: depleted, drained, distressed, berserk (attacks vs Berserk have advantage, not the Berserk character's attacks)",
      "Actually per compendium, conditions that give Disadvantage on YOUR attacks are: Depleted, Drained, Distressed, Disoriented. Berserk does NOT give you disadvantage. Fix accordingly",
      "Search for `distressedPenalty` - it currently applies -1 to checks. The compendium says Distressed gives 'Disadvantage on Skill Checks and Attack Actions'. Change this to apply disadvantage (not a flat -1 penalty) or remove the flat penalty computed if not needed",
      "If there's a computed that checks conditions for attack roll penalties, ensure it only references: depleted, drained, distressed, disoriented (conditions that cause Disadvantage on YOUR attacks)",
      "Remove any references to the deleted conditions (blinded, charmed, frightened, incapacitated, invisible, stunned) throughout the store",
      "Update ARCHITECTURAL_ANALYSIS.md to document the corrected condition mechanics"
    ],
    "context": "In sheetStore.js, the `conditionDisadvantageOnAttacks` computed references non-existent conditions (blinded, frightened) and incorrect conditions (prone gives advantage to attackers within 15ft, not disadvantage to the prone creature's attacks; restrained doesn't cause attack disadvantage). Per the compendium, conditions that cause Disadvantage on YOUR attacks: Depleted ('Attacks made with Disadvantage'), Drained ('Attacks made with Disadvantage'), Distressed ('Disadvantage on Skill Checks and Attack Actions'), Disoriented ('Disadvantage on Attacks'). The `distressedPenalty` applies a flat -1 which is wrong - it should be Disadvantage.",
    "passes": true
  },
  {
    "id": 4,
    "category": "fix-weapons",
    "description": "Fix weapon quality definitions and computed effects to match compendium",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `weaponQualityDefs` object (around line 753)",
      "Update Accurate: name 'Accurate', effect 'Before rolling: -2 damage for +1 Attack, OR -4 damage for +2 Attack', category 'trade'",
      "Update Forceful: name 'Forceful', effect 'On Attack Roll 16+: Add extra 1d6 damage', category 'trigger'",
      "Update Massive: name 'Massive', effect 'Before rolling: -1 Attack for +2 damage, OR -2 Attack for +4 damage', category 'trade'",
      "Update Veil-Piercing: name 'Veil-Piercing', effect '1/Combat Encounter: Instead of rolling, automatically hit', category 'special'",
      "Update Staggering Blow: name 'Staggering Blow', effect 'On Attack Roll 16+: Knock target 10ft. Cannot affect Large+ or Adversary+', category 'trigger'",
      "Update Ensnaring: name 'Ensnaring', effect 'On Attack Roll 16+: Target Restrained. Cannot affect Large+ or Adversary+', category 'trigger'",
      "Update Coupled: name 'Coupled', effect 'Free Action: Split into Primary + Secondary. Bonus Action secondary attack', category 'special'",
      "Fix `weaponQualityAttackBonus` computed: Accurate and Massive are TRADE-OFF choices (not always-on bonuses). Remove the flat +1/-2 logic. These should NOT auto-apply to attack bonus since the player chooses each roll. Set this computed to return 0 (trade-offs are per-roll choices, not persistent bonuses)",
      "Fix `weaponQualityDamageBonus` computed: Remove the flat +1/+4 logic for same reason. Set to return 0",
      "Remove the `weaponCritRange` computed entirely - there is no crit range mechanic in Magi-Knights. Veil-Piercing is auto-hit 1/encounter, not crit range",
      "Add a `veilPiercingUsed` ref (boolean, default false) to track the 1/encounter use",
      "Update ARCHITECTURAL_ANALYSIS.md weapon quality section"
    ],
    "context": "The weapon quality system in sheetStore.js has incorrect effects. Per the compendium: Accurate = trade-off choice per roll (-2 damage for +1 attack OR -4 for +2), Forceful = triggered on 16+ (add 1d6), Massive = trade-off choice (-1 atk/+2 dmg OR -2/+4), Veil-Piercing = 1/Combat auto-hit (not crit range), Ensnaring = 16+ triggers Restrained, Staggering Blow = 16+ triggers knockback. The sheet currently applies flat bonuses which is wrong - Accurate/Massive are per-roll choices that players make before rolling. The weaponCritRange computed (crit on 16+) is entirely fabricated.",
    "passes": true
  },
  {
    "id": 5,
    "category": "fix-guns",
    "description": "Replace fabricated gun quality system with correct Soul Gun mechanics",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `soul_gun` object (around line 795)",
      "Replace the `qualities` ref object entirely. Remove: accurate, longRange, rapidFire, scatter, silenced, veilPiercing, vicious",
      "Replace with correct Soul Gun fields: gunType (ref string, default 'hdg'), gunStyle (ref string, default ''), eRange (ref number computed from type), rof_rf (ref number), rof_md (ref number), firingPoolBonus (ref number, default 0), hasReloaded (ref boolean, default true)",
      "Add gunType data object with correct stats from compendium: hdg: {name:'Handgun', eRange:20, damage:'1d6', rf:2, md:3}, smg: {name:'Submachine Gun', eRange:30, damage:'1d6', rf:2, md:4}, asr: {name:'Assault Rifle', eRange:40, damage:'1d8', rf:2, md:4}, dmr: {name:'Designated Marksman Rifle', eRange:80, damage:'1d10', rf:2, md:3}, stg: {name:'Shotgun', eRange:15, damage:'1d12', rf:2, md:3}, lmg: {name:'Light Machine Gun', eRange:50, damage:'1d10', rf:2, md:5}, sda: {name:'Sidearm', eRange:20, damage:'1d4', rf:2, md:0}",
      "Add gunStyles data: akimbo: {name:'Akimbo',applies:'hdg',effect:'MD +1 ROF, Two-Handed'}, aegis: {name:'Aegis/Musketeer',applies:'hdg',effect:'Shield or Light Weapon + Bonus attack'}, fastReload: {name:'Fast Reload',applies:'hdg',effect:'Reload as Bonus Action'}, mobile: {name:'Mobile',applies:'smg',effect:'Move 10ft before/after attack'}, hailOfBullets: {name:'Hail of Bullets',applies:'smg',effect:'MD at 15ft: reroll one die'}",
      "Add gun attachments as a repeating section: attachments with template {name:'', type:'scope/magazine/rail/muzzle', effect:'', slot:1}",
      "Remove `gunQualityDefs`, `gunQualityAttackBonus`, `gunQualityDamageBonus`, `gunCritRange`, `activeGunQualities` computed properties",
      "Add computed `gunTypeStats` that returns the stats for the currently selected gunType",
      "Read `src/components/GunQualitiesSelector.vue` and rewrite it to show: Gun Type selector (dropdown of 7 types), Gun Style selector (filtered by type, only HDG/SMG have styles), Attachments repeating list",
      "Update the gun section in KnightView.vue if it references the old quality system",
      "Update ARCHITECTURAL_ANALYSIS.md Soul Gun section"
    ],
    "context": "The entire gun quality system is fabricated. Soul Guns in Magi-Knights use a completely different mechanic: a Firing Pool system where you roll multiple d8s (RF for rapid fire, MD for mag dump) + DEX + Proficiency vs Armor. Each '8' rolled is a Direct Hit (+Prof damage). The 7 gun types have different E-Range, damage, and ROF values. HDG and SMG have Gun Style choices. All guns can have Attachments (Scopes, Magazines, Rail/Underbarrel, Muzzles) that modify the Firing Pool. The sheet should track: gun type, style (if applicable), attachments, and firing pool state (aimed, reloaded).",
    "passes": true
  },
  {
    "id": 6,
    "category": "fix-implements",
    "description": "Fix implement quality system to match compendium",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `magical_implement` object (around line 850)",
      "Replace the `qualities` ref with correct implement qualities: cardConductor: false, embolden: false, light: false, manaAttunement: false, manaConduit: false, radiance: false, twoHanded: false, warding: false",
      "Replace `implementQualityDefs` with correct definitions: cardConductor: {name:'Card Conductor', effect:'Required for Divination Spell Path or Release Magic Style'}, embolden: {name:'Embolden', effect:'Spell damage +MK Level. Multi-target: choose one target for bonus'}, light: {name:'Light', effect:'One hand, does not count toward weapon limit'}, manaAttunement: {name:'Mana Attunement', effect:'MP = Mana Coefficient x 3 (instead of x 2)'}, manaConduit: {name:'Mana Conduit', effect:'1/Sleep Phase, Bonus Action: Next spell costs -1 Tier MP'}, radiance: {name:'Radiance', effect:'Healing spells: +1+Level HP. AoE: halved (min 1)'}, twoHanded: {name:'Two-Handed', effect:'Requires two hands. Cannot use Shield or Light items'}, warding: {name:'Warding', effect:'Reduce spell damage taken by 1/2 Level (min 1)'}",
      "Remove fabricated computeds: `implementSpellAttackBonus` (spellFocus doesn't exist), `implementSpellDCBonus` (channeling doesn't exist)",
      "Keep `hasManaAttunement` computed (it's correct)",
      "Add `hasEmbolden` computed that returns magical_implement.qualities.value.embolden",
      "Add `manaConduitUsed` ref (boolean, default false) for tracking 1/Sleep Phase usage",
      "Add computed `emboldenDamageBonus` that returns level.value when embolden is true, 0 otherwise",
      "Add computed `radianceHealBonus` that returns 1 + level.value when radiance is true, 0 otherwise",
      "Add computed `wardingReduction` that returns Math.max(1, Math.floor(level.value / 2)) when warding is true, 0 otherwise",
      "Update `activeImplementQualities` computed to use new quality keys",
      "Read and update `src/components/ImplementQualitiesSelector.vue` to display the new qualities",
      "Update ARCHITECTURAL_ANALYSIS.md implement section"
    ],
    "context": "The compendium defines 7 implement qualities (8 counting Two-Handed): Card Conductor (required for Divination/Release Magic), Embolden (+MK Level spell damage), Light (one-hand, no weapon limit), Mana Attunement (MP x3), Mana Conduit (1/Sleep -1 Tier cost), Radiance (+1+Level healing), Two-Handed, Warding (reduce spell damage by 1/2 Level). The 4 implements are: Witch's Force Wand (1d4, Mana Attunement+Mana Conduit+Radiance+Warding), Wizard's Magic Staff (1d6, Embolden+Mana Attunement+Mana Conduit+Two-Handed+Warding), Master's Instrument (1d4, Embolden+Mana Attunement+Mana Conduit+Radiance+Two-Handed), Collector's Spell Deck (no damage, Card Conductor+Light).",
    "passes": true
  },
  {
    "id": 7,
    "category": "fix-npc",
    "description": "Fix NPC creature types, sizes, and add Role system",
    "steps": [
      "Read `src/views/NPCView.vue`",
      "Replace `creatureTypes` array: change from ['Outsider', 'Mortal', 'Construct', 'Undead', 'Beast', 'Aberration'] to ['Outsider', 'Mortal']",
      "Replace `sizeOptions` array: change from ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] to ['Small', 'Medium', 'Large', 'Huge', 'Massive', 'Colossal']",
      "Add a `roleOptions` array with: [{value:'none',label:'None'}, {value:'assassin',label:'Assassin'}, {value:'brute',label:'Brute'}, {value:'defender',label:'Defender'}, {value:'heavy',label:'Heavy'}, {value:'lithe',label:'Lithe'}, {value:'merciless',label:'Merciless'}, {value:'savage',label:'Savage'}, {value:'skirmisher',label:'Skirmisher'}, {value:'striker',label:'Striker'}, {value:'tank',label:'Tank'}, {value:'vanguard',label:'Vanguard'}, {value:'watcher',label:'Watcher'}]",
      "In `src/stores/sheetStore.js`, add `npc_role` ref with default 'none'",
      "Add `roleModifiers` data object with stat adjustments per role: assassin:{ac:0,hpPct:-25,atkBonus:3,dprPct:0}, brute:{ac:0,hpPct:33,atkBonus:-3,dprPct:0}, defender:{ac:0,hpPct:33,atkBonus:0,dprPct:-25}, heavy:{ac:-4,hpPct:33,atkBonus:0,dprPct:0}, lithe:{ac:3,hpPct:-25,atkBonus:0,dprPct:0}, merciless:{ac:0,hpPct:0,atkBonus:-3,dprPct:33}, savage:{ac:-4,hpPct:0,atkBonus:0,dprPct:33}, skirmisher:{ac:0,hpPct:-25,atkBonus:0,dprPct:33}, striker:{ac:-4,hpPct:0,atkBonus:3,dprPct:0}, tank:{ac:3,hpPct:0,atkBonus:-3,dprPct:0}, vanguard:{ac:3,hpPct:0,atkBonus:0,dprPct:-25}, watcher:{ac:0,hpPct:0,atkBonus:3,dprPct:-25}",
      "Add `sizeModifiers` data: small:{ac:1,hpPct:-10,atkBonus:1,dprPct:-10}, medium:{ac:0,hpPct:0,atkBonus:0,dprPct:0}, large:{ac:-1,hpPct:5,atkBonus:0,dprPct:5}, huge:{ac:-1,hpPct:10,atkBonus:-1,dprPct:10}, massive:{ac:-2,hpPct:15,atkBonus:-2,dprPct:15}, colossal:{ac:-2,hpPct:20,atkBonus:-2,dprPct:20}",
      "Add `rankDamagePct` data: vassal:50, adversary:55, nemesis:60, harbinger:70",
      "Add computed `npc_role_modifiers` that returns the modifiers for the current npc_role",
      "Add computed `npc_size_modifiers` that returns the modifiers for the current npc_size",
      "In NPCView.vue template, add a Role selector dropdown in the type-row section after creature type",
      "Ensure the npc_role field is included in the store's dehydrate/hydrate cycle",
      "Update ARCHITECTURAL_ANALYSIS.md NPC section"
    ],
    "context": "The NPC view has incorrect creature types (Construct/Undead/Beast/Aberration don't exist - only Outsider and Mortal), incorrect sizes (Tiny/Gargantuan don't exist - correct sizes are Small/Medium/Large/Huge/Massive/Colossal), and is missing the Role system entirely. Roles modify NPC stats: each role has AC, HP%, Atk Bonus, and DPR% adjustments. Sizes also have stat modifications. Ranks (Vassal/Adversary/Nemesis/Harbinger) have damage percentage values (50/55/60/70).",
    "passes": true
  },
  {
    "id": 8,
    "category": "cleanup",
    "description": "Remove empty stub components",
    "steps": [
      "Delete `src/components/BurstDisplay.vue` (empty component with no functionality)",
      "Delete `src/components/DiamondDisplay.vue` (empty component with no functionality)",
      "Search all .vue files for any imports or references to BurstDisplay or DiamondDisplay and remove them",
      "Update ARCHITECTURAL_ANALYSIS.md component list if it references these files"
    ],
    "context": "BurstDisplay.vue and DiamondDisplay.vue are empty stub files with no template, script, or style content. They are not imported or used anywhere in the application. They should be removed to keep the codebase clean.",
    "passes": true
  },
  {
    "id": 9,
    "category": "missing-feature",
    "description": "Implement Endurance Die and attrition mechanics",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the stress/exhaustion section (around line 380-400)",
      "Add `enduranceDieEnabled` ref (boolean, default true) - whether the 1d6 Endurance Die system is used",
      "The Endurance Die mechanic: when a character has Stress or Exhaustion, they roll 1d6 alongside their d20. If the d6 result >= their current Stress/Exhaustion level, the penalty is negated for that roll. At level 6, Disadvantage cannot be negated",
      "Add `freakingOutToday` ref (boolean, default false) - tracks if Oppressive Stress occurred today",
      "Add `heartlessKnight` computed that returns true when eclipse_blips has 3+ corruption points (blip state === 2)",
      "Add `fallenKnight` computed that returns true when eclipse_blips has 5+ corruption points",
      "Add `corruptionCount` computed that counts eclipse_blips with state === 2",
      "Add `burnoutLines` computed that counts eclipse_blips with state === 3",
      "Ensure heartlessKnight and fallenKnight are exposed from the store",
      "In the roll functions (src/rollFuncs/), find where ability/skill rolls are made. Add logic: if stress > 0 and roll involves INT/WIS/CHA, note 'Endurance Die: roll 1d6, negate if >= stress level'. Same for exhaustion with STR/DEX/CON rolls",
      "Update ARCHITECTURAL_ANALYSIS.md attrition section"
    ],
    "context": "The compendium defines the Endurance Die system: roll 1d6 with d20 when affected by Stress (mental rolls) or Exhaustion (physical rolls). If d6 >= current level, negate the penalty. Level 6 Disadvantage cannot be negated. Freaking Out occurs at 6 Stress + Oppressive Stress same day. Heartless Knight (3+ Corruption): -1 SP gained, no Catharsis, lose Comforting Comrade. Fallen Knight (5+ Corruption): 1/2 Trauma received, Refreshing->Average Sleep, Horrified->Distressed immediately, Risk of Relapse (double Corruption gained permanently). The eclipse_blips array uses states: 0=empty, 1=Trauma, 2=Corruption, 3=Burnout.",
    "passes": true
  },
  {
    "id": 10,
    "category": "missing-feature",
    "description": "Implement Combat Form selection and tracking",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `sections.forms` repeating section",
      "The current forms section is a generic repeating list. Replace with a structured Combat Form system",
      "Add `activeCombatForm` ref (string, default '') to track which form is currently selected",
      "Add `combatFormMastery` ref (object with form keys as booleans) to track mastery unlocks: {formI:false, formII:false, formIII:false, formIV:false, formV:false, formVI:false, formVII:false, formVIII:false, formIX:false, formX:false}",
      "Add `combatFormData` constant with the 10 forms. Each form should have: name, description (brief), masteryDescription (brief). The forms are: I-Initiate, II-Discipline, III-Tempo, IV-Enhancement, V-Awakening, VI-Arcana, VII-Resonance, VIII-Transcendence, IX-Unity, X-Regulation (Soul Guns)",
      "Keep the existing `sections.forms` repeating section for custom form notes if needed, but add the structured system alongside it",
      "In `src/views/PC/KnightView.vue`, find where forms are displayed and add: a dropdown/selector for active Combat Form, checkboxes for Mastery status per form",
      "Add computed `hasFormX` that returns combatFormMastery.formX (needed to determine if Soul Gun is available)",
      "Update ARCHITECTURAL_ANALYSIS.md combat forms section"
    ],
    "context": "The compendium defines 10 Combat Forms (I-X) that Magi-Knights learn as they level up. Each form provides specific combat bonuses and can be Mastered for enhanced effects. Form X: Regulation is specifically required for Soul Gun access. The current sheet has a generic repeating section for forms but no structured selection, mastery tracking, or mechanical integration. Combat Forms are a core character sheet feature that players actively choose and switch between.",
    "passes": true
  },
  {
    "id": 11,
    "category": "missing-feature",
    "description": "Implement level-locked ability tracking",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the level ref",
      "Add `levelAbilities` computed that returns which special abilities are unlocked based on current level: { counterBlast: level >= 5, perfectParry: level >= 6, extricateAether: level >= 6, heroicResolve: level >= 9, knightsInsight: level >= 9, knightsResolution: level >= 9 }",
      "Add `levelAbilityData` constant with descriptions: counterBlast: {name:'Counter Blast', level:5, description:'Reaction: When hit by spell, spend MP to counter'}, perfectParry: {name:'Perfect Parry', level:6, description:'Immediate: Negate weapon damage received'}, extricateAether: {name:'Extricate Aether', level:6, description:'Recover MP from defeated Outsiders'}, heroicResolve: {name:'Heroic Resolve', level:9, description:'Resist conditions with enhanced willpower'}, knightsInsight: {name:'Knight\\'s Insight', level:9, description:'Gain tactical information about enemies'}, knightsResolution: {name:'Knight\\'s Resolution', level:9, description:'Enhanced resistance to attrition effects'}",
      "In `src/views/sections/TechniquesTactics.vue` or `src/views/PC/KnightView.vue`, add a small section showing unlocked level abilities with their current level status (locked/unlocked indicator)",
      "Update ARCHITECTURAL_ANALYSIS.md progression section"
    ],
    "context": "The compendium defines special abilities that unlock at specific levels: Counter Blast (5th+), Perfect Parry (6th+), Extricate Aether (6th+), Heroic Resolve (9th+), Knight's Insight (9th+), Knight's Resolution (9th+). These are distinct from Battle Techniques and Combat Tactics - they are permanent abilities that all Magi-Knights gain at the specified levels. The sheet should display which are unlocked based on the character's current level.",
    "passes": true
  },
  {
    "id": 12,
    "category": "missing-feature",
    "description": "Implement Sleep Phase effect tracking and daily limits",
    "steps": [
      "Read `src/stores/sheetStore.js`",
      "Add `sleepEffect` ref (string, default 'average') with options: 'average', 'feverish', 'refreshing'",
      "Add `sleepEffectData` constant: average: {name:'Average Sleep', stressRecovery:1, exhaustionRecovery:1, hpRecovery:'none', fractureRecovery:0}, feverish: {name:'Feverish Dreams', stressRecovery:0, exhaustionRecovery:0, hpRecovery:'none', fractureRecovery:0, note:'Nightmares, no recovery'}, refreshing: {name:'Refreshing Sleep', stressRecovery:2, exhaustionRecovery:2, hpRecovery:'full', fractureRecovery:1, note:'Full HP, -1 Fracture'}",
      "Add daily limit tracking refs: `sealImplantGiven` ref (boolean, default false), `sealImplantReceived` ref (boolean, default false), `medicalTriageTargets` ref (array of strings, default []), `soulSacrificeCount` ref (number, default 0)",
      "Add `soulSacrificeMax` computed that returns reputation.value (max uses per career)",
      "Add `manaConduitUsed` ref (boolean, default false) if not already added in task 6",
      "In `src/views/PC/KnightView.vue` or `src/views/PC/StudentView.vue`, add a small Sleep Effect selector (radio buttons or dropdown for Average/Feverish/Refreshing)",
      "Add a 'Daily Limits' collapsible section showing: Crystalline Seal (given/received checkboxes), Mana Conduit (used checkbox if implement has it), Soul Sacrifice (count/max display)",
      "Update ARCHITECTURAL_ANALYSIS.md with sleep and daily limits sections"
    ],
    "context": "The compendium defines three Sleep Phase effects that affect recovery: Average (reduce Stress and Exhaustion by 1), Feverish Dreams (no recovery, caused by trauma/relics), Refreshing Sleep (reduce by 2, full HP, -1 Fracture). Several abilities have daily or per-session limits that should be tracked: Crystalline Seal Implantation (1/day given AND 1/day received), Medical Triage (1/Sleep Phase per target), Soul Sacrifice (Rep Level times per career), Mana Conduit (1/Sleep Phase).",
    "passes": true
  },
  {
    "id": 13,
    "category": "missing-feature",
    "description": "Implement Heart Stage tracking for social bonds",
    "steps": [
      "Read `src/components/SocialSection.vue`",
      "The current implementation has NPC bonds with name, social points, and bond ability fields",
      "Add a `heartStage` field to each bond entry. Heart Stages are: 'threatening', 'hostile', 'cold', 'neutral', 'warm', 'friendly', 'sympathetic'",
      "Add `heartStageData` constant with the 7 stages in order: [{value:'threatening',label:'Threatening',icon:'⚠'}, {value:'hostile',label:'Hostile'}, {value:'cold',label:'Cold'}, {value:'neutral',label:'Neutral'}, {value:'warm',label:'Warm'}, {value:'friendly',label:'Friendly'}, {value:'sympathetic',label:'Sympathetic'}]",
      "In the template for each NPC bond, add a Heart Stage selector (dropdown or segmented control) showing the current stage",
      "In `src/stores/sheetStore.js`, find the social bonds section (sections or dedicated refs) and ensure the heartStage field is included in the data model and serialization",
      "Update ARCHITECTURAL_ANALYSIS.md social section"
    ],
    "context": "The compendium defines a Heart Stage progression system for NPC relationships: Threatening -> Hostile -> Cold -> Neutral -> Warm -> Friendly -> Sympathetic. Each stage represents how an NPC feels toward the character and affects what social actions are available. The current social section tracks Social Points and Bond Abilities but not the Heart Stage. This is a key character sheet feature for tracking NPC relationship progression.",
    "passes": true
  },
  {
    "id": 14,
    "category": "missing-feature",
    "description": "Implement Rolls to Resist advantage/disadvantage tracking",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the Rolls to Resist section (look for roll_resist or resist-related refs)",
      "Add `resistModifiers` ref object: { physical: {advantage: false, disadvantage: false}, magic: {advantage: false, disadvantage: false}, horror: {advantage: false, disadvantage: false}, purity: {advantage: false, disadvantage: false} }",
      "Add computed `activeResistModifiers` that returns which types currently have advantage or disadvantage",
      "Integrate with condition effects: when `disoriented` condition is active, set resistModifiers.physical.disadvantage = true (or compute it). When `horrified` is active, horror checks are affected",
      "In the KnightView.vue or wherever Rolls to Resist are displayed, add toggle buttons or checkboxes for Advantage/Disadvantage per resist type (Physical, Magic, Horror, Purity)",
      "In `src/rollFuncs/`, find where resist rolls are made and pass the advantage/disadvantage state to the roll",
      "Update ARCHITECTURAL_ANALYSIS.md resist section"
    ],
    "context": "The compendium defines 4 types of Rolls to Resist: Physical (STR/DEX/CON based), Magic (INT/WIS/CHA based), Horror (special d100 roll), Purity (moral/corruption checks). Various conditions and effects grant Advantage or Disadvantage on specific resist types. For example, Disoriented gives Disadvantage on Physical Resists, Horrified affects Horror resist checks. The current sheet has basic resist roll support but no per-type advantage/disadvantage tracking.",
    "passes": true
  },
  {
    "id": 15,
    "category": "missing-feature",
    "description": "Implement Magi-Squire companion section",
    "steps": [
      "Read `src/views/PC/StudentView.vue` to see where Herald info is displayed",
      "In `src/stores/sheetStore.js`, add a `squire` ref object: { name: '', level: 1, healthBlips: [true,true,true,true,true,true], manaBlips: [true,true,true], studentArmor: 13, knightArmor: 15, spellPath1: '', spellPath2: '', skills: '', notes: '', collapsed: true }",
      "Add `squireDamage` computed based on mentor level: levels 1-3: '1d6+3', levels 4-6: '2d6+3', levels 7-9: '2d6+4', levels 10-12: '3d6+4', levels 13-15: '4d6'",
      "Add `squireLevel` computed: Math.min(level.value, Math.floor(trainingTallies / 4)) or just use the manual level ref since tallies may not be tracked granularly",
      "Create `src/components/MagiSquire.vue` component with: name input, level display, 6 health blip checkboxes, 3 mana blip checkboxes, armor display (13 Student/15+2melee Knight), damage display (computed), two spell path text fields (limited to Beam/Explosion/Curing/Restoration), skills text area, notes",
      "Import and add MagiSquire component in StudentView.vue near the Herald section (squires are bound to the Herald system)",
      "Add squire to the store's dehydrate/hydrate cycle",
      "Update ARCHITECTURAL_ANALYSIS.md with Magi-Squire section"
    ],
    "context": "The compendium defines a Magi-Squire companion system: NPC companions with 6 Health Blips (no Crystalline Fractures), 3 Mana Blips (fixed), Armor 13 (Student)/15 (Knight, +2 vs melee), damage scaling from 1d6+3 to 4d6 at level 15. Squires have access to only 2 spell paths (from Beam, Explosion, Curing, Restoration), have a Paired Attack (Immediate Action), and provide +2 assist on Squire Skills. Their level syncs with their mentor. The current sheet only has a basic Herald name/bond level - no squire mechanics.",
    "passes": true
  },
  {
    "id": 16,
    "category": "missing-feature",
    "description": "Add Relic capacity enforcement",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `sections.relics` repeating section",
      "Add `relicCapacity` computed that returns reputation.value (max relics = Reputation Level)",
      "Add `relicsOverCapacity` computed that returns sections.relics.rows.value.length > relicCapacity.value",
      "In `src/views/PC/KnightView.vue`, find where relics are displayed",
      "Add a capacity indicator showing current/max relics (e.g., '2/3 Relics')",
      "Add visual warning (red text or border) when over capacity",
      "Optionally disable the 'Add Relic' button when at capacity",
      "Update ARCHITECTURAL_ANALYSIS.md relics section"
    ],
    "context": "The compendium states that Magi-Knights can carry a maximum number of Relics equal to their Reputation Level (0-V, so 0-5 relics). The current sheet has a generic repeating section for relics with no capacity enforcement. Adding a simple capacity display and warning keeps players aware of their limit.",
    "passes": true
  },
  {
    "id": 17,
    "category": "verification",
    "description": "Final verification and cleanup",
    "steps": [
      "Run the build: cd magiknights && npm run build",
      "Fix any build errors that arise from the changes",
      "Verify all removed conditions are no longer referenced anywhere in the codebase (grep for blinded, charmed, frightened, incapacitated, invisible, stunned)",
      "Verify the gun quality old system is fully removed (grep for gunQualityDefs, gunCritRange, rapidFire, scatter, longRange, silenced in context of gun qualities)",
      "Verify implement old qualities are removed (grep for spellFocus, channeling, quickCast, wardingFocus)",
      "Verify no references to Tiny, Gargantuan, Construct, Undead, Beast, Aberration remain",
      "Verify BurstDisplay.vue and DiamondDisplay.vue are deleted and not imported",
      "Ensure all new refs are included in the store's dehydrate/hydrate functions for persistence",
      "Update ARCHITECTURAL_ANALYSIS.md with a final summary of all changes made",
      "Commit all changes with message: 'Fix incorrect features and implement missing mechanics per compendium'"
    ],
    "context": "This is the final verification step. The build must succeed, all old references must be cleaned up, and all new state must be properly serialized. The ARCHITECTURAL_ANALYSIS.md should reflect the current state of the sheet after all corrections.",
    "passes": true
  },
  {
    "id": 18,
    "category": "missing-feature",
    "description": "Implement Budget Tallies and Training Tallies resource counters",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the resource/currency section (near reputation, level refs)",
      "Add `budgetTallies` ref (number, default 0) - the game's currency for purchasing gear and services",
      "Add `trainingTallies` ref (number, default 0) - the XP system, 0-8 counter that resets on level-up",
      "Add `trainingTalliesMax` constant (8) - tallies needed to gain a level",
      "Add `budgetTallies` and `trainingTallies` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/BasicView.vue`, find a suitable location near the level/reputation display",
      "Add a Budget Tallies numeric input (label 'Budget Tallies', min 0, no max)",
      "Add a Training Tallies display showing current/max (e.g., '3/8') with a numeric input (min 0, max 8)",
      "Add store exports for budgetTallies, trainingTallies, trainingTalliesMax",
      "Update ARCHITECTURAL_ANALYSIS.md with Budget and Training Tallies documentation"
    ],
    "context": "Budget Tallies are the game's currency system. Players earn them from part-time jobs (+1-2 per session), quest rewards, and downtime activities. They spend them at shops, the mall, and for social tactics like 'Greasing Palms' (-1 Budget). Training Tallies are the XP system: accumulate 8 to level up (4 for New Rice Squires). Sources: Grinding the New Rice activity (+1 Training Tally), mission completions, and other activities. Both are simple numeric counters that must persist between sessions.",
    "passes": true
  },
  {
    "id": 19,
    "category": "missing-feature",
    "description": "Implement Skill Mastery designation and bonus calculation",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the skills section (the object with athletics, acrobatics, etc.)",
      "Add a `masteredSkill` ref (string, default '') to designate which skill has Mastery",
      "Find the skill roll function in `src/rollFuncs/skill.js` or the store's `rollSkill`",
      "Modify the skill roll calculation: when the rolled skill matches `masteredSkill`, add the `reputation` value (min 1) as a bonus to the roll",
      "In the roll components, when mastery bonus applies, add a component like {label: 'Mastery', value: reputationValue}",
      "In `src/components/SkillSection.vue`, add a visual indicator for the mastered skill (e.g., a filled diamond icon or highlight) and a way to designate mastery (right-click, dropdown, or a selector at the top of the skills section)",
      "Add `masteredSkill` to the dehydrate/hydrate cycle for persistence",
      "Add `masteredSkill` to store exports",
      "Update ARCHITECTURAL_ANALYSIS.md skills section with Mastery documentation"
    ],
    "context": "Per the compendium: 'Select one Skill Proficiency from Court Card or Student Type. Add Reputation Level (min 1) to that Skill. Circle the Proficiency Diamond to indicate Mastery.' This means one skill gets a permanent +Reputation Level bonus (1-5) in addition to its normal proficiency bonus. For Squadron Checks, Mastery grants '+3 (+ reroll one d4)'. The current skill system only tracks binary proficiency (true/false) per skill with no mastery option. The mastery bonus should be added to the roll result alongside the ability modifier and proficiency bonus.",
    "passes": true
  },
  {
    "id": 20,
    "category": "missing-feature",
    "description": "Implement Spell Paths Known selection and tracking",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the spells section",
      "Add `spellPathsKnown` ref (array of strings, default []) to track which spell paths the character has chosen",
      "Add `maxSpellPaths` computed: returns 2 if level < 4, 3 if level < 8, 4 if level >= 8",
      "Add `availableSpellPaths` constant array with all 11 spell paths: ['Beam', 'Explosion', 'Ward', 'Curing', 'Restoration', 'Augmentation', 'Summoning', 'Chronomancy', 'Divination', 'Psionics', 'Necromancy']",
      "Add `spellPathsKnown` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/KnightView.vue`, find the Spells section header area",
      "Add a 'Spell Paths' sub-section above the spells list showing: current selections (checkboxes or multi-select from availableSpellPaths), count indicator (e.g., '2/2 Paths' or '3/4 Paths'), visual warning if over max",
      "Add store exports for spellPathsKnown, maxSpellPaths, availableSpellPaths",
      "Update ARCHITECTURAL_ANALYSIS.md spells section with Spell Paths Known documentation"
    ],
    "context": "Per the compendium, each Magic Style (Enchanter, Shaper, Occultist, Cleric) has access to 7 of the 11 spell paths, and characters choose 2 paths at level 1, gaining +1 at levels 4 and 8 (max 4). The spell paths are: Beam, Explosion, Ward, Curing, Restoration, Augmentation, Summoning, Chronomancy, Divination, Psionics, Necromancy. The current sheet has a spells repeating section for individual spells but no way to record WHICH paths the character has chosen. This is needed for reference and validation during play.",
    "passes": true
  },
  {
    "id": 21,
    "category": "missing-feature",
    "description": "Implement Branching Element selection",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `elemental_affinity` ref",
      "Add `branchingElement` ref (string, default '') for the sub-element choice",
      "Add `branchingElementOptions` constant mapping primary elements to their branches: { earth: ['Wood', 'Metal'], fire: ['Lightning', 'Toxins'], air: ['Force', 'Sonance'], water: ['Ice', 'Blood'], void: ['Light', 'Dark'] }",
      "Add `availableBranches` computed that returns the branch options for the current elemental_affinity (or empty array if no affinity set)",
      "Add `branchingElement` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/BasicView.vue`, find where elemental_affinity is displayed",
      "Add a Branching Element dropdown below or next to the elemental affinity selector, showing only the 2 options available for the chosen primary element",
      "If elemental_affinity changes, reset branchingElement to '' (since the old branch may not be valid)",
      "Add store exports for branchingElement, branchingElementOptions, availableBranches",
      "Update ARCHITECTURAL_ANALYSIS.md character identity section"
    ],
    "context": "Per the compendium's Elemental Affinity section, each primary element branches into two sub-elements: Earth→Wood/Metal, Fire→Lightning/Toxins, Air→Force/Sonance, Water→Ice/Blood, Void→Light/Dark. Characters eventually choose one branching element which affects spell/technique flavor and some mechanical interactions. The sheet stores elemental_affinity (primary) and element_name (custom name) but has no field for the branching sub-element choice.",
    "passes": true
  },
  {
    "id": 22,
    "category": "missing-feature",
    "description": "Implement Soul Armament tier bonus auto-calculation",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `knight_armor` ref and weapon damage/attack calculations",
      "Add `soulArmamentData` constant with the progression table: { 0: {weapon: 0, armor: 0}, 1: {weapon: 1, armor: 0}, 2: {weapon: 1, armor: 1}, 3: {weapon: 2, armor: 1}, 4: {weapon: 2, armor: 2}, 5: {weapon: 3, armor: 3} }",
      "Add `soulArmamentWeaponBonus` computed that returns soulArmamentData[reputation.value].weapon",
      "Add `soulArmamentArmorBonus` computed that returns soulArmamentData[reputation.value].armor",
      "Find the knight attack roll function (rollKnightAttack or similar) and add soulArmamentWeaponBonus to the attack roll components",
      "Find where knight_armor is used in computeds or display and add soulArmamentArmorBonus to it. If knight_armor is already a manual override, add a `knightArmorTotal` computed that includes base armor + soulArmamentArmorBonus",
      "In `src/views/PC/KnightView.vue`, find the armor display and show the breakdown (base + armament bonus = total), or at minimum display the Soul Armament tier bonus value",
      "Add store exports for soulArmamentData, soulArmamentWeaponBonus, soulArmamentArmorBonus",
      "Update ARCHITECTURAL_ANALYSIS.md equipment section with Soul Armament Progression documentation"
    ],
    "context": "Per the compendium's Soul Armament Progression table: Rep 0 = +0 weapon/+0 armor, Rep I = +1/+0, Rep II = +1/+1, Rep III = +2/+1, Rep IV = +2/+2, Rep V = +3/+3. These bonuses are deterministic based on reputation level and should be auto-calculated rather than manually entered. Currently knight_armor is a raw ref(0) with manual entry, and weapon attack bonuses don't include the armament tier. The base armor comes from Elemental Affinity (13-16 depending on element) plus this reputation-based bonus.",
    "passes": true
  },
  {
    "id": 23,
    "category": "missing-feature",
    "description": "Implement Rune Slot capacity tracking and enforcement",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `sections.runes` repeating section",
      "Add a `slotCost` field (number, default 1) to the rune template object in the repeating section definition",
      "Add `runeSlotCapacity` computed that returns reputation.value (max rune slots = Reputation Level, 1-5)",
      "Add `runeSlotsUsed` computed that sums all slotCost values from sections.runes.rows",
      "Add `runesOverCapacity` computed that returns runeSlotsUsed > runeSlotCapacity",
      "In `src/views/PC/KnightView.vue`, find where runes are displayed (similar to how relics were done in task 16)",
      "Add a slot capacity indicator showing 'Slots: X/Y' (used/max) in the runes section header",
      "Add visual warning when over capacity (red text or border, similar to relic over-capacity)",
      "In the individual rune item template, add a slot cost selector (1, 2, or 3) since compendium runes cost 1-3 slots each",
      "Add store exports for runeSlotCapacity, runeSlotsUsed, runesOverCapacity",
      "Update ARCHITECTURAL_ANALYSIS.md equipment section with Rune Slot documentation"
    ],
    "context": "Per the compendium: 'Reputation I: 1 Rune Slot each... Reputation II: 2 Rune Slots... Rep III: 3... Rep IV: 4... Rep V: 5'. Each Armament Rune costs 1-3 slots depending on its power. Examples: Warrior's Rune (1 slot, +1d4 damage), Piercing Rune (1 slot, ignore 1 AC), Titan's Rune (2 slots, +1d8 damage), Sundering Rune (3 slots, ignore 3 AC). The sheet has a runes repeating section but no slot cost per rune and no capacity enforcement, unlike relics which already have capacity tracking from task 16.",
    "passes": true
  },
  {
    "id": 24,
    "category": "missing-feature",
    "description": "Add Swift Attack, Energy Surge, and Flight to level-locked abilities",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `levelAbilityData` constant (added in task 11)",
      "Add Swift Attack 1 to levelAbilityData: {name: 'Swift Attack', level: 5, description: 'Weapon Attack as Bonus Action 1/round'}",
      "Add Swift Attack 2 to levelAbilityData: {name: 'Swift Attack II', level: 10, description: 'Additional Weapon Attack as Bonus Action 1/round'}",
      "Add Energy Surge to levelAbilityData: {name: 'Energy Surge', level: 4, description: '1/Sleep Phase, Bonus Action: Recover HP (Rep d10s+CON), MP (Rep d4s+Spell Mod), remove 1 Exhaustion, or remove 3 Stress'}",
      "Add Flight to levelAbilityData: {name: 'Flight', level: 10, description: 'Standard Action: Gain Fly speed equal to Move speed'}",
      "Add `energySurgeUsed` ref (boolean, default false) for tracking 1/Sleep Phase usage",
      "Add `isFlying` ref (boolean, default false) for tracking active flight state",
      "Add `energySurgeUsed` and `isFlying` to the dehydrate/hydrate cycle for persistence",
      "Update the `levelAbilities` computed to include the new abilities (swiftAttack1: level >= 5, swiftAttack2: level >= 10, energySurge: level >= 4, flight: level >= 10)",
      "In `src/views/PC/KnightView.vue`, find the Level Abilities display section and ensure the new abilities show up with their unlock status",
      "Add an Energy Surge 'Used' checkbox next to it (similar to manaConduitUsed or veilPiercingUsed)",
      "Add a Flight 'Active' toggle next to Flight when unlocked",
      "Add store exports for energySurgeUsed, isFlying",
      "Update ARCHITECTURAL_ANALYSIS.md level abilities section"
    ],
    "context": "The levelAbilityData from task 11 included Counter Blast, Perfect Parry, Extricate Aether, Heroic Resolve, Knight's Insight, and Knight's Resolution. However, three important level-locked abilities were omitted: Swift Attack (level 5: weapon attack as Bonus Action, level 10: additional attack), Energy Surge (level 4: 1/Sleep Phase recovery of HP/MP/Exhaustion/Stress), and Flight (level 10: fly speed = move speed, Standard Action to activate). Energy Surge is a once-per-rest resource that needs usage tracking. Flight is a toggleable state affecting movement and prone mechanics.",
    "passes": false
  },
  {
    "id": 25,
    "category": "missing-feature",
    "description": "Implement Well Fed effect and split Studied into Combat/School variants",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `studied` and `rested` refs",
      "Rename or replace the existing `studied` ref with two separate refs: `studiedCombat` ref (boolean, default false) and `studiedSchool` ref (boolean, default false)",
      "Add `wellFed` ref (boolean, default false) for the restaurant buff",
      "Update any computed properties or roll functions that reference the old `studied` ref to use `studiedCombat` instead (these would be weapon/combat rolls)",
      "Find where student class checks or school-related rolls are made and integrate `studiedSchool` (+1d8 to student class checks)",
      "Find where physical skill checks are made and integrate `wellFed` (reroll Physical Skill dice once)",
      "In the roll functions, when studiedCombat is true and a weapon attack is rolled, add +1d8 component and set studiedCombat to false after use",
      "When studiedSchool is true and a student class check is rolled, add +1d8 component and set studiedSchool to false after use",
      "When wellFed is true and a physical skill check is rolled, note reroll available and set wellFed to false after use",
      "Add `wellFed`, `studiedCombat`, `studiedSchool` to the dehydrate/hydrate cycle (remove old `studied` if it existed)",
      "In the UI (BasicView.vue or KnightView.vue), find where the Studied/Rested checkboxes are displayed and update to show: Rested checkbox, Studied [Combat] checkbox, Studied [School] checkbox, Well Fed checkbox",
      "Add store exports for wellFed, studiedCombat, studiedSchool (remove old studied export if present)",
      "Update ARCHITECTURAL_ANALYSIS.md temporary effects section"
    ],
    "context": "The compendium defines three distinct temporary effects: (1) Well Fed (from restaurants): 'Reroll Physical Skill Check dice (once). Expires at Sleep Phase.' (2) Studied [Combat] (from Combat Training): '+1d8 to Weapon Attack (once, post-roll). Expires at Sleep Phase or use.' (3) Studied [School] (from Study/Homework): '+1d8 to Student Class Check (once, post-roll). Expires at School Phase end or use.' The current sheet has a single `studied: ref(false)` that doesn't distinguish Combat vs School, and has no Well Fed tracking. These are separate effects that can all be active simultaneously.",
    "passes": false
  },
  {
    "id": 26,
    "category": "missing-feature",
    "description": "Implement Magi-Knight Visor equipment slot",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the equipment section (near soul_weapon, soul_gun, magical_implement)",
      "Add `visor` ref object: { equipped: '', type: 'none' }",
      "Add `visorData` constant with the 3 visor types: { none: {name: 'None', effect: ''}, etherIdentification: {name: 'Ether Identification Visor', effect: 'Bonus Action: +1d6 to Investigation/Perception to identify magical signatures', cost: 150}, medicalDiagnostic: {name: 'Medical Diagnostic Visor', effect: 'Advantage on Medicine checks, see HP values of willing allies', cost: 150}, virtualHUD: {name: 'Virtual HUD Visor', effect: 'Darksight 60ft, Bonus Action: Mark target for +1d4 to next attack against it', cost: 150} }",
      "Add `activeVisorEffect` computed that returns the effect string for the currently equipped visor type",
      "Add `visor` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/KnightView.vue`, find the equipment section (near weapons/implements)",
      "Add a Visor selector: dropdown with None + 3 visor options, showing the effect description when a visor is selected",
      "Add store exports for visor, visorData, activeVisorEffect",
      "Update ARCHITECTURAL_ANALYSIS.md equipment section with Visor documentation"
    ],
    "context": "Per the compendium: Magi-Knight Visors cost 150 Gloom Gems, take 0 Rune Slots, and are limited to 1 at a time. Three types exist: (1) Ether Identification Visor - Bonus Action to add 1d6 to Investigation/Perception for identifying magical signatures; (2) Medical Diagnostic Visor - Advantage on Medicine checks, can see HP values of willing allies within 30ft; (3) Virtual HUD Visor - Darksight 60ft, Bonus Action to mark a target granting +1d4 to next attack against it. These are a separate equipment category from runes and relics.",
    "passes": false
  },
  {
    "id": 27,
    "category": "missing-feature",
    "description": "Implement Elemental Summon companion stat block",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `squire` ref object (added in task 15) as a reference pattern",
      "Add `elementalSummon` ref object: { name: '', active: false, currentHP: 0, type: 'basic', enhancement: 'none', notes: '' }",
      "Add `summonBaseStats` constant with stats scaling by level: { 1: {hp:8, armor:12, move:30, attack:4, damage:'1d6+2'}, 3: {hp:14, armor:13, move:30, attack:5, damage:'1d8+3'}, 5: {hp:22, armor:14, move:35, attack:6, damage:'2d6+3'}, 7: {hp:30, armor:15, move:35, attack:7, damage:'2d8+4'}, 9: {hp:40, armor:16, move:40, attack:8, damage:'3d6+4'}, 11: {hp:52, armor:17, move:40, attack:9, damage:'3d8+5'}, 13: {hp:66, armor:18, move:45, attack:10, damage:'4d6+5'}, 15: {hp:80, armor:19, move:45, attack:11, damage:'4d8+6'} }",
      "Add `summonEnhancements` constant: { none: {name:'Basic Summon'}, companion: {name:'Enhanced Companion', bonus:'Permanent, shares spell paths, telepathic link'}, guardian: {name:'Guardian Form', bonus:'+50% HP, +2 Armor, Taunt ability'}, striker: {name:'Striker Form', bonus:'+50% damage, +10 Move, Flanking bonus'} }",
      "Add `activeSummonStats` computed that returns the base stats for the current level (use the highest level tier <= current level)",
      "Add `elementalSummon` to the dehydrate/hydrate cycle for persistence",
      "Create `src/components/ElementalSummon.vue` component: collapsible panel with name input, Active toggle, HP tracker (current/max from computed), Armor/Move/Attack/Damage display from computed stats, Enhancement selector dropdown, Notes textarea",
      "Import and add ElementalSummon component in KnightView.vue in the spells section area (since summoning is a spell path)",
      "Add store exports for elementalSummon, summonBaseStats, summonEnhancements, activeSummonStats",
      "Update ARCHITECTURAL_ANALYSIS.md with Elemental Summon Companion documentation"
    ],
    "context": "The Summoning Spell Path creates a persistent companion entity. Per the compendium, summons have HP, Armor, Move, Attack bonus, and Damage that all scale with MK level. Enhanced Summoning (Companion Path) makes the summon permanent with shared spell paths and telepathic link. The Guardian and Striker forms modify stats further. This is analogous to the Magi-Squire companion (task 15) but for Summoner builds. Summons need HP tracking since they can be damaged and dismissed. Multiple Summoning techniques (Reinforced Connection, Telepathic Summoner, etc.) modify summon behavior.",
    "passes": false
  },
  {
    "id": 28,
    "category": "missing-feature",
    "description": "Implement Club Tallies counter and Club Position tracking",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the social/club section (look for club or goal references)",
      "Add `clubTallies` ref (number, default 0) - counter from 0-8 that resets at Resounding Growth",
      "Add `clubTalliesMax` constant (8) - tallies needed for Resounding Growth",
      "Add `resoundingGrowths` ref (number, default 0) - total Resounding Growths achieved (track for advancement)",
      "Add `clubPosition` ref (string, default 'member') with options: 'member', 'vicePresident', 'president'",
      "Add `clubPositionData` constant: { member: {name:'Member', bonus:''}, vicePresident: {name:'Vice-President', bonus:'+5 Influence with Faculty, 1/Sleep: Auto-pass Student Body Influence'}, president: {name:'President', bonus:'+4 Persuasion with club members, Grant VP benefits to others'} }",
      "Add `clubTallies`, `resoundingGrowths`, `clubPosition` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/StudentView.vue` or `src/views/PC/BasicView.vue`, find the clubs/social area",
      "Add a Club section with: Club Tallies counter (0-8) with visual pips or numeric input, Resounding Growths count, Club Position dropdown (Member/VP/President) showing the bonus text for the selected position",
      "Add store exports for clubTallies, clubTalliesMax, resoundingGrowths, clubPosition, clubPositionData",
      "Update ARCHITECTURAL_ANALYSIS.md social section with Club System documentation"
    ],
    "context": "Per the compendium: Club participation gives +1 Club Tally per activity. At 8 Club Tallies, 'Resounding Growth' occurs: choose 3 NPCs to gain +2 SP each, then erase all tallies. After 3 Resounding Growths (24 cumulative tallies), club advancement unlocks Vice-President and President positions. VP grants '+5 Influence with Faculty' and '1/Sleep: Auto-pass Influence with Student Body'. President grants '+4 Persuasion with club members' and can share VP benefits. These are persistent mechanical bonuses affecting social skill checks.",
    "passes": false
  },
  {
    "id": 29,
    "category": "missing-feature",
    "description": "Implement Detention Tickets counter",
    "steps": [
      "Read `src/stores/sheetStore.js` and find a suitable location near stress/exhaustion or daily tracking refs",
      "Add `detentionTickets` ref (number, default 0) - counter for outstanding detention obligations",
      "Add `detentionTickets` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/StudentView.vue`, find the student-specific info area",
      "Add a Detention Tickets counter (numeric input, min 0) with a brief note: 'Each ticket = 1 Free Time spent. Skipping = +1 Trauma/day'",
      "Add store exports for detentionTickets",
      "Update ARCHITECTURAL_ANALYSIS.md student section with Detention documentation"
    ],
    "context": "Per the compendium: 'Detention: For each Detention Ticket: Must spend 1 Free Time doing Mandatory Detention. Skipping: +1 Trauma per day avoided.' Detention Tickets represent mandatory school obligations that consume Free Time Phase slots. Accumulating them without serving has severe consequences (Trauma). This is a simple counter but important for Student phase gameplay tracking.",
    "passes": false
  },
  {
    "id": 30,
    "category": "missing-feature",
    "description": "Implement Heart Stage SP threshold display",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the `heartStageData` constant (added in task 13)",
      "Update `heartStageData` to include SP thresholds for each stage: threatening: {min: -999, max: -16}, hostile: {min: -15, max: -6}, cold: {min: -5, max: -1}, neutral: {min: 0, max: 5}, warm: {min: 6, max: 11}, friendly: {min: 12, max: 19}, sympathetic: {min: 20, max: 999}",
      "Add `getHeartStageForSP(sp)` function that returns the appropriate heart stage string based on SP value",
      "Read `src/components/SocialSection.vue`",
      "In the expanded bond view, add a small SP threshold reference next to the Heart Stage dropdown showing the range for the current stage (e.g., 'Warm: 6-11 SP')",
      "Optionally add a visual indicator if the current SP value doesn't match the selected Heart Stage (suggesting it should be updated), displayed as a subtle hint rather than forced auto-update",
      "Add store exports for getHeartStageForSP",
      "Update ARCHITECTURAL_ANALYSIS.md social bonds section with SP threshold documentation"
    ],
    "context": "The compendium defines specific SP thresholds that determine Heart Stage progression. While the sheet (from task 13) tracks both SP points and Heart Stage per bond, they are set independently with no reference to the threshold values. Players need to know what SP range corresponds to each stage to update appropriately. The thresholds are approximately: Threatening (very negative), Hostile (-15 to -6), Cold (-5 to -1), Neutral (0-5), Warm (6-11), Friendly (12-19), Sympathetic (20+). Showing these helps players without forcing auto-updates (since GMs may override).",
    "passes": false
  },
  {
    "id": 31,
    "category": "missing-feature",
    "description": "Implement Statistic Increase tracking for level-up choices",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the ability scores section",
      "Add `statIncreases` ref (array of objects, default []) to log applied increases. Each entry: { level: number, choices: [{ability: string, amount: number}] }",
      "Add `statIncreaseLevels` constant: [3, 6, 9, 12, 15] - the 5 levels that grant stat increases",
      "Add `statIncreasesApplied` computed that returns statIncreases.value.length (how many have been applied)",
      "Add `statIncreasesAvailable` computed that returns the number of increase levels <= current level (e.g., at level 7, 2 increases are available: levels 3 and 6)",
      "Add `statIncreasesMissing` computed that returns statIncreasesAvailable - statIncreasesApplied (positive = needs attention)",
      "Add `statIncreases` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/BasicView.vue`, near the ability scores display, add a small 'Stat Increases' indicator showing 'X/Y applied' (e.g., '2/2' at level 7 with both applied). If missing increases, show a reminder note",
      "Add store exports for statIncreases, statIncreaseLevels, statIncreasesApplied, statIncreasesAvailable, statIncreasesMissing",
      "Update ARCHITECTURAL_ANALYSIS.md progression section with Statistic Increase documentation"
    ],
    "context": "Per the compendium: 'Statistic Increase (3rd, 6th, 9th, 12th, 15th): +2 to one Statistic OR +1 to two different Statistics.' At 5 different levels, characters get permanent ability score increases. While the scores themselves are tracked, there is no log or reminder of which increases have been applied. This helps players ensure they haven't missed or double-applied an increase during level-up. The tracking is a reference/reminder, not a hard enforcement (since the actual scores are manually editable).",
    "passes": false
  },
  {
    "id": 32,
    "category": "missing-feature",
    "description": "Implement Fortune Pool resource counter",
    "steps": [
      "Read `src/stores/sheetStore.js` and find the resource section (near unity points or other pools)",
      "Add `fortunePool` ref (number, default 0) - current Fortune points available",
      "Add `fortunePoolEnabled` ref (boolean, default false) - whether the character has the Fortune Box crystal",
      "Add `fortunePoolMax` computed that returns the proficiency bonus value when fortunePoolEnabled is true, 0 otherwise. Proficiency bonus in Magi-Knights: levels 1-4 = 2, levels 5-8 = 3, levels 9-12 = 4, levels 13-16 = 5, levels 17+ = 6",
      "Add `fortunePool` and `fortunePoolEnabled` to the dehydrate/hydrate cycle for persistence",
      "In `src/views/PC/KnightView.vue` or `src/views/PC/BasicView.vue`, add a Fortune Pool display that only shows when fortunePoolEnabled is true: current/max counter (e.g., '2/3 Fortune'), brief description 'Spend 1: +1d6 to non-combat Skill Check'",
      "Add a toggle or checkbox in Settings or the resource area to enable/disable Fortune Pool (for characters who acquire or lose the Fortune Box crystal)",
      "Add store exports for fortunePool, fortunePoolEnabled, fortunePoolMax",
      "Update ARCHITECTURAL_ANALYSIS.md resources section with Fortune Pool documentation"
    ],
    "context": "Per the compendium: 'Enchanted Crystal: Fortune Box - Gain a Pool of Fortune equal to your Proficiency Bonus. Replenishes on Refreshing Sleep Effect. During non-Combat Encounter: Spend 1 Fortune to add 1d6 to a Skill Check.' This is a conditional resource that only exists if the character has the Fortune Box enchanted crystal. It functions like Unity Points - a consumable pool that replenishes at rest. The pool size scales with proficiency bonus (2-6).",
    "passes": false
  },
  {
    "id": 33,
    "category": "verification",
    "description": "Final verification of missing rules implementation",
    "steps": [
      "Run the build: npm run build",
      "Fix any build errors that arise from the new additions",
      "Verify all new refs are included in the store's dehydrate/hydrate functions for persistence: budgetTallies, trainingTallies, masteredSkill, spellPathsKnown, branchingElement, elementalSummon, clubTallies, resoundingGrowths, clubPosition, detentionTickets, statIncreases, fortunePool, fortunePoolEnabled, visor, energySurgeUsed, isFlying, wellFed, studiedCombat, studiedSchool",
      "Verify all new store exports are properly added to the store return block",
      "Verify the Vue components render without errors by checking for missing imports or undefined references",
      "Verify that the old `studied` ref migration is clean (no remaining references to the single `studied` boolean)",
      "Run a grep for any TODO or FIXME comments that may have been left behind",
      "Update ARCHITECTURAL_ANALYSIS.md with a summary of all missing rules now implemented",
      "Commit all changes with message: 'Implement missing compendium rules: tallies, mastery, paths, elements, armament, runes, abilities, effects, visor, summons, clubs, fortune'"
    ],
    "context": "This is the final verification step for the missing rules batch (tasks 18-32). All new state must be properly serialized in dehydrate/hydrate, all exports must be in the store return block, and the application must build without errors. This task ensures everything from the 15 new feature tasks integrates correctly.",
    "passes": false
  }
]
```
