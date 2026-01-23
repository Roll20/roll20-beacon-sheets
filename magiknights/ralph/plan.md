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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
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
    "passes": false
  }
]
```
