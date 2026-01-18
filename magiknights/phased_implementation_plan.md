# Magi-Knights Awakening Roll20 Sheet - Phased Implementation Plan

This document contains implementation phases for adding missing features to the Magi-Knights Awakening Roll20 character sheet. Each phase is designed to be completed in a single Claude Code session. Features are ordered by priority (Critical → High → Medium → Lower).

---

## Phase 1: Core Resources & Herald System

**Priority Level:** Critical + High
**Estimated Complexity:** Low
**Features:**
1. Unity Points Resource System (Critical)
2. Gloom Gems Currency Tracking (High)
3. Herald Bond Level System (High)

### Claude Code Prompt

```
I need you to implement three new resource tracking features for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing codebase to understand the patterns used, especially:
- src/sheet/stores/sheetStore.ts for state management
- src/sheet/views/ for UI components
- src/sheet/styles/ for styling patterns

Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on any game rules or mechanics, consult the compendium JSON files at:
- `compendium/rules.json` - Core game rules and mechanics
- `compendium/lists.json` - Game lists and reference data
- `compendium/classes.json` - Character class information

**Feature 1: Unity Points Resource System**
- Add Unity Points tracking to the character sheet resources section
- Unity Points are unlocked at Reputation Level II (reputation >= 2)
- Maximum Unity Points = Reputation Level - 1 (so Rep II = 1 max, Rep III = 2 max, etc.)
- Add current/max display similar to other resource pools
- Unity Points should be restorable (used for Combination Maneuvers)
- Add to the store with computed max based on reputation
- Only show the Unity Points section when reputation >= 2

**Feature 2: Gloom Gems Currency**
- Add Gloom Gems as a currency tracker in the resources section
- Simple numeric counter (no maximum)
- This is the currency used to purchase Shards, Runes, and Visors from the Herald
- Add increment/decrement controls
- Store as a simple number in the sheet state

**Feature 3: Herald Bond Level System**
- Add a Herald section (can be collapsible) to track the character's connection to their Herald
- Herald Bond Level ranges from I to V (1-5)
- Display the current bond level with a selector
- Show the following tier unlock information based on bond level:
  - Bond I-III: Access to Spell Tiers I-V
  - Bond IV+: Access to Spell Tier VI (show indicator when unlocked)
- Add a Herald Name text field
- Add a Herald Notes/Description text area

Place the Unity Points near other combat resources (HP, MP, etc.).
Place Gloom Gems in an appropriate resources/inventory area.
Place Herald section in the Magi-Knight view or a new dedicated section.

Ensure all new features integrate with the existing dehydrate/hydrate system for save/load functionality.
```

---

## Phase 2: Squadron Formations System

**Priority Level:** Critical
**Estimated Complexity:** Medium
**Features:**
1. Squadron Formations (Arrow, Victory, Barrage, Diamond)

### Claude Code Prompt

```
I need you to implement the Squadron Formations system for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing codebase to understand the patterns used. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on formation rules, effects, or costs, consult:
- `compendium/rules.json` - Search for "formation" for detailed formation mechanics
- `compendium/techniques.json` - May contain formation-related techniques

**Squadron Formations System**

Formations are squad-based tactical abilities that cost Inspiration points and provide combat bonuses. Implement a formations section that allows players to:

1. **Formation Types** (create as selectable options):
   - Arrow Formation (Attack) - Cost: 2 Inspiration
     - Effect: +2× Reputation Level bonus to damage
   - Victory Formation (Defense) - Cost: 2 Inspiration
     - Effect: Reduce incoming damage by 2× Reputation Level
   - Barrage Formation (Destruction) - Cost: 3 Inspiration
     - Effect: Cast spells without damage reduction penalties
   - Diamond Formation (Restoration) - Cost: 3 Inspiration
     - Effect: Heal 3× Reputation Level HP, advantage on condition removal rolls

2. **UI Requirements**:
   - Add a "Squadron Formations" section in the Magi-Knight combat view
   - Display all four formations with their costs and effects
   - Each formation should have an "Activate" button that:
     - Checks if the character has enough Inspiration points
     - Outputs a roll template to chat announcing the formation activation
     - Shows the calculated effect value (based on current Reputation Level)
   - Show active formation status (optional toggle to mark which formation is currently active)
   - Effects should display calculated values (e.g., if Rep Level is 3, Arrow shows "+6 damage")

3. **Integration**:
   - Reference the existing Inspiration tracking in the sheet
   - Use the Reputation Level for effect calculations
   - Add formation activation to the roll system following existing roll patterns
   - Store active formation state if tracking which formation is currently in use

4. **Roll Output** should include:
   - Formation name
   - Inspiration cost
   - Calculated effect for current Reputation Level
   - Brief description of the effect

Follow the existing collapsible section patterns and button styling used elsewhere in the sheet.
```

---

## Phase 3: Combination Maneuvers System

**Priority Level:** Critical
**Estimated Complexity:** High
**Features:**
1. Combination Maneuvers (multi-character coordinated attacks)

### Claude Code Prompt

```
I need you to implement the Combination Maneuvers system for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing codebase to understand the patterns used. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on combination maneuver rules, effects, or Unity Point costs, consult:
- `compendium/rules.json` - Search for "combination" or "maneuver" for detailed mechanics
- `compendium/techniques.json` - May contain maneuver-related abilities

**Combination Maneuvers System**

Combination Maneuvers are powerful coordinated attacks requiring 2+ Magi-Knights and Unity Points. This builds on the Unity Points system (Phase 1).

1. **Maneuver Types** (implement these predefined maneuvers):

   - **Avenging Flare** (2 participants)
     - Unity Cost: 1
     - Effect: Combined attack dealing 2d10 + both participants' Reputation Levels in damage

   - **Planetary Aegis** (2 participants)
     - Unity Cost: 1
     - Effect: Create barrier absorbing damage equal to 3d8 + combined Reputation Levels

   - **Starstorm Restoration** (2 participants)
     - Unity Cost: 2
     - Effect: Heal all squad members for 2d12 + average Reputation Level

   - **Blueshift Collision** (3 participants)
     - Unity Cost: 2
     - Effect: Devastating attack dealing 4d10 + sum of all participants' Reputation Levels

   - **Envoys of Hope** (3 participants)
     - Unity Cost: 2
     - Effect: Remove one condition from each squad member, heal 1d10 each

   - **Ultimate Radiant Reflection** (4 participants)
     - Unity Cost: 3
     - Effect: Reflect all damage taken this round back at attackers, multiplied by participant count

   - **Ringshine Fulmination** (4+ participants)
     - Unity Cost: 3
     - Effect: Massive AoE dealing 6d12 + (2 × sum of all Reputation Levels)

2. **UI Requirements**:
   - Add a "Combination Maneuvers" section (can be near Squadron Formations)
   - Display available maneuvers in a list/grid format
   - Each maneuver should show:
     - Name
     - Required participants count
     - Unity Point cost
     - Effect description with dice
   - "Execute Maneuver" button for each that:
     - Checks Unity Points availability
     - Rolls the appropriate dice
     - Outputs results to chat
   - Include a participant count input (or checkboxes) to indicate how many are participating
   - Disable/gray out maneuvers that require more participants than available

3. **Roll Output** should include:
   - Maneuver name
   - Participant count
   - Unity cost spent
   - Dice rolled and results
   - Total effect value
   - Description of what happens

4. **Store Integration**:
   - Track preferred/frequently used maneuvers (optional)
   - Deduct Unity Points when maneuver is executed
   - Store participant count setting

Consider adding a "Maneuver Tax" note - players must succeed on a coordination check (not rolled by the sheet, but mentioned in output).
```

---

## Phase 4: Release Magic Card System

**Priority Level:** Critical
**Estimated Complexity:** High
**Features:**
1. Release Magic (22-card spell deck system)

### Claude Code Prompt

```
I need you to implement the Release Magic card-based spell system for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing codebase, especially the spell system implementation. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on Release Magic rules, card effects, or scaling values, consult:
- `compendium/spells.json` - Search for "Release" magic or card-based spells
- `compendium/rules.json` - Search for "Release" or "card" for the card magic system rules
- `compendium/classes.json` - May contain Release magic style information

**Release Magic System**

Release Magic is a unique magic style that uses a 22-card spell deck instead of traditional spell paths. This should be an alternative magic system available when the character's Magic Style is set to "Release" or similar.

1. **Core Mechanics**:
   - Draw Pool: 3 + Reputation Level cards drawn at start of combat
   - Cards are played as Standard Actions
   - Each card has a unique effect
   - "Scaling Value" mechanic: Some cards have effects that scale (SV = Reputation Level or MAM modifier)

2. **The 22 Card Types** (implement all - verify exact effects against compendium/spells.json):
   ```
   0. The Fool - Wild card, copy effect of last card played
   1. The Magician - Deal SV d8 magical damage to one target
   2. The High Priestess - Gain SV × 2 temporary HP
   3. The Empress - Heal ally for SV d6 HP
   4. The Emperor - Grant ally +SV to next attack roll
   5. The Hierophant - Remove one condition from ally
   6. The Lovers - Link with ally, share damage taken (halved) for SV rounds
   7. The Chariot - Gain +SV × 5 feet movement this turn, attacks of opportunity against you have disadvantage
   8. Strength - Next melee attack deals +SV d6 damage
   9. The Hermit - Become invisible until end of next turn or until you attack
   10. Wheel of Fortune - Roll d20: 11+ gain Inspiration, 10- lose next card drawn
   11. Justice - Reflect SV × 3 damage back at attacker when hit
   12. The Hanged Man - Target cannot move for SV rounds (Roll to Resist)
   13. Death - Deal SV d10 damage, if this kills target draw a card
   14. Temperance - Restore SV × 2 MP
   15. The Devil - Target has disadvantage on all rolls for SV rounds (Roll to Resist)
   16. The Tower - Deal SV d6 damage to all enemies in 15ft radius
   17. The Star - Heal all allies in 30ft for SV d4 HP
   18. The Moon - Create illusion, enemies must succeed Roll to Resist or be Disoriented
   19. The Sun - All allies gain +SV to damage rolls until your next turn
   20. Judgement - Revive unconscious ally with SV × 3 HP
   21. The World - End one ongoing effect or condition on yourself or ally
   ```

3. **UI Requirements**:
   - Add "Release Magic" section/tab (alternative to standard Spell Paths)
   - Show/hide based on Magic Style selection (add "Release" as Magic Style option if not present)
   - **Deck Management**:
     - Visual representation of the 22 cards (can be simplified list)
     - Checkbox or toggle for each card to mark if it's in the deck
   - **Hand/Draw Pool**:
     - Display area for currently drawn cards
     - "Draw Cards" button to simulate drawing (3 + Rep Level)
     - Track which cards are in hand vs played vs in deck
   - **Card Play**:
     - Click/select a card in hand to play it
     - Roll appropriate dice based on card effect
     - Move card from hand to discard/played pile
     - Output effect to chat with full description
   - **Scaling Value Display**: Show current SV (based on Rep Level) prominently

4. **Roll Output** for card play:
   - Card name and number
   - Scaling Value used
   - Dice rolled and results
   - Effect description
   - Any Roll to Resist DC if applicable (8 + Proficiency + MAM)

5. **State Management**:
   - Store deck composition (which cards are available)
   - Store current hand
   - Store discard pile
   - Reset hand function for new combat
   - Integrate with dehydrate/hydrate

This is a complex feature - prioritize core functionality (card list, play button, roll output) over visual polish.
```

---

## Phase 5: Battle Techniques & Combat Tactics

**Priority Level:** High + Medium
**Estimated Complexity:** Medium-High
**Features:**
1. Battle Technique Level Requirements & Frequency Tracking
2. Combat Tactics Library Integration

### Claude Code Prompt

```
I need you to enhance the Battle Techniques and Combat Tactics systems for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing techniques/tactics implementation in the codebase. Use existing styles and component patterns wherever possible.

**Compendium Reference**: This phase heavily relies on compendium data. Consult these files for accurate technique/tactic information:
- `compendium/techniques.json` - **PRIMARY SOURCE** for all battle techniques with level requirements, frequencies, and effects
- `compendium/rules.json` - For technique usage rules and frequency definitions
- `compendium/classes.json` - For tactic prerequisites related to class features

**Part 1: Battle Technique Enhancements**

The existing techniques section needs additional fields for proper rule enforcement:

1. **Level Requirements**:
   - Add a "Required Level" field to each technique (number 1-15)
   - Display a warning or disable techniques if character level is below requirement
   - Common requirements: Level 3+, Level 5+, Level 6+, Level 9+ (verify against compendium/techniques.json)

2. **Frequency/Usage Tracking**:
   - Add "Frequency Type" selector with options:
     - At-Will (unlimited use)
     - 1/Round (once per round)
     - 1/Encounter (once per combat encounter)
     - 1/Rest (once per sleep phase)
     - X/Encounter (custom number per encounter)
   - Add "Uses Remaining" counter for limited techniques
   - Add "Reset" button to restore uses (for encounter/rest resets)
   - Visual indicator when a technique is expended

3. **Technique Categories** (for organization):
   - Physical Attacks (Action Burst, Coordinated Assault, Fatal Focus, etc.)
   - Defensive (Perfect Parry, Perfect Riposte, Sidestep, etc.)
   - Magical (Counter Blast, Overpowering Surge, Extricate Aether, etc.)
   - Squad Support (Leadership variants, Magical Augmentation, etc.)
   - Add category field to technique data structure

4. **Enhanced Technique Entry**:
   - Name, Description (existing)
   - Required Level (new)
   - Frequency Type (new)
   - Uses/Max Uses (new, for limited techniques)
   - Category (new)
   - Associated Roll (optional - dice expression for technique effect)

**Part 2: Combat Tactics Library**

Combat Tactics are passive abilities with prerequisites. Enhance the existing system:

1. **Tactic Data Structure**:
   - Name
   - Description
   - Prerequisites (level requirement, other requirements like "Divination path" or "Force Shield equipped")
   - Effect Type (Passive/Active/Reaction)
   - Automatic Bonus (if applicable - e.g., "+1 to Initiative")

2. **Key Tactics to Support** (verify effects against compendium/techniques.json):
   ```
   - Adept of Magic: +1 Rep Level for Mana Coefficient calculation
   - Combat Form Drills: Can learn second Combat Form, switch as Free Action
   - Combat Form Mastery (Lvl 9+): Upgrade all form modifiers by +1
   - Disciplined Agility: +1 Reaction per round
   - Elemental Bulwark: -3 Physical Damage taken
   - Implement Mastery: Add MAM to Implement attack/damage
   - Magical Foresight: Add MAM to Initiative
   - Martial Artist: 1d6 unarmed, bonus action unarmed attack
   - Quicksword Technique: No opportunity attacks after attacking, +10ft movement
   - Resilient Soul Crystal: +1 to chosen Stat
   - Shield of the Guardian (requires Force Shield): Reaction -3+Rep damage
   - Tough as Nails: +2 Student HP, +2 HP/Level transformed
   ```

3. **UI Enhancements**:
   - Show prerequisite status (met/unmet) for each tactic
   - Tactics with automatic bonuses should indicate what they modify
   - Group tactics by type or alphabetically
   - Quick reference for active tactics' effects

4. **Auto-calculation Integration** (where feasible):
   - Tough as Nails: Add to HP calculation
   - Adept of Magic: Add to MP calculation
   - Magical Foresight: Add MAM to Initiative
   - Flag these tactics in the store and adjust computed values accordingly

Ensure all changes integrate with the existing repeating sections pattern and dehydrate/hydrate system.
```

---

## Phase 6: Spell Modification System

**Priority Level:** High
**Estimated Complexity:** Medium
**Features:**
1. Spell Modifications (Mana Strain, Rushed, Overcharging, Total Focus, Quickening)

### Claude Code Prompt

```
I need you to implement the Spell Modification system for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing spell casting implementation. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on spell modification rules, costs, or effects, consult:
- `compendium/rules.json` - Search for "Mana Strain", "Rushed", "Overcharging", "Total Focus", "Quickening" for exact mechanics
- `compendium/spells.json` - For spell tier costs and how modifications interact with spells

**Spell Modification System**

When casting spells, players can apply modifications that alter the spell's cost, action type, or power. Implement toggles/options that apply when casting any spell.

1. **Modification Types** (verify exact costs/effects against compendium/rules.json):

   - **Mana Strain**
     - Effect: Reduce MP cost by one tier (Tier III costs as Tier II, etc.)
     - Cost: Gain 1 Exhaustion point
     - Cannot reduce below Tier I cost

   - **Rushed Spell**
     - Effect: Cast spell as Bonus Action instead of Standard Action
     - Cost: Spell damage/healing is reduced by half (round down)
     - Note in output that damage is halved

   - **Overcharging**
     - Effect: Add bonus damage dice equal to spell tier (Tier III = +3 dice)
     - Cost: Gain 2 Exhaustion points
     - Only applies to damage spells

   - **Total Focus**
     - Effect: Maintain enhanced concentration for better sustained effects
     - Requires: Not taking other actions while maintained
     - Broken by: Being Horrified or Unconscious
     - Track as active state

   - **Quickening**
     - Effect: Change spell's action type (Standard → Bonus, Bonus → Reaction, etc.)
     - Cost: Pay +1 Tier worth of MP (Tier II spell costs as Tier III)
     - Different from Rushed - no damage penalty but higher cost

2. **UI Implementation**:
   - Add a "Spell Modifications" panel near spell casting area
   - Toggle/checkbox for each modification type
   - When casting a spell, selected modifications apply automatically:
     - Adjust displayed MP cost based on Mana Strain/Quickening
     - Note action type change in roll output
     - Apply damage modifiers for Rushed/Overcharging
   - Show current Exhaustion and warn if modifications would exceed safe levels
   - "Total Focus" as a persistent toggle with indicator when active

3. **Roll Output Modifications**:
   - Include "[Modified]" or similar indicator when modifications are active
   - List which modifications were applied
   - Show original vs modified values (e.g., "MP Cost: 15 → 10 (Mana Strain)")
   - For Overcharging, show bonus dice separately
   - For Rushed, show "(Halved)" next to damage total

4. **Integration with Existing Spell System**:
   - Modifications should work with all spell paths
   - When rolling a spell, check active modifications and adjust:
     - MP cost calculation
     - Dice rolled (Overcharging adds dice)
     - Final damage (Rushed halves it)
   - Increment Exhaustion automatically when using Mana Strain or Overcharging

5. **State Management**:
   - Store active modifications (which are toggled on)
   - Total Focus active state
   - Persist settings in dehydrate/hydrate

Consider adding a "Clear Modifications" button to quickly reset all toggles after casting.
```

---

## Phase 7: Summoning Companions System

**Priority Level:** High
**Estimated Complexity:** Medium
**Features:**
1. Summoning Path Companion Tracking

### Claude Code Prompt

```
I need you to implement the Summoning Companions system for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing codebase, especially repeating sections and the NPC view. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on summoning rules, summon stats, or command mechanics, consult:
- `compendium/spells.json` - Search for "Summoning" path spells and summon creation rules
- `compendium/monsters.json` - May contain summon stat block templates
- `compendium/rules.json` - For summoning command range, verbal component rules, and Form interactions
- `compendium/techniques.json` - Search for "Telepathic Summoner" and other summoning-related tactics

**Summoning Companions System**

Characters with the Summoning spell path can create and command summoned creatures. This needs dedicated tracking.

1. **Summon Companion Data Structure**:
   - Name
   - Summon Type (Elemental, Construct, Spirit, Beast, etc.)
   - HP (current/max)
   - Armor value
   - Movement speed
   - Attack bonus
   - Damage dice
   - Special abilities (text field)
   - Duration/Rounds remaining (if temporary)
   - Active/Dismissed status

2. **Command Mechanics**:
   - Command Range: 30 feet + character level (display calculated value)
   - Commands require verbal component (note Silenced condition prevents commands)
   - Track if "Telepathic Summoner" tactic is active (allows commands while Silenced)
   - Commands available:
     - Attack (target)
     - Defend (protect character or ally)
     - Move (to location)
     - Special (use special ability)
     - Dismiss (end summon)

3. **UI Requirements**:
   - Add "Summoned Companions" section in Magi-Knight view
   - Repeating section for multiple summons
   - Each summon entry shows:
     - Name and type
     - HP tracker (current/max with increment/decrement)
     - Armor value
     - Attack roll button (rolls d20 + summon's attack bonus)
     - Damage roll button
     - Special abilities display
     - Duration countdown (if applicable)
     - Active/Dismissed toggle
     - Delete button
   - "Add Summon" button to create new entry
   - Display calculated command range prominently
   - Indicator for Telepathic Summoner tactic if active

4. **Form Integration**:
   - Form I: Adaptation can grant +1 Attack to summons (track this)
   - Form II: Deflection can grant +1 Armor to summons (track this)
   - Add checkboxes or indicators if these forms are applied to summons vs self

5. **Roll Output**:
   - Summon attack rolls should identify the summon by name
   - Include summon's stats in output
   - Note if commanding while Silenced (should fail unless Telepathic)

6. **State Management**:
   - Store summon list as repeating section
   - Each summon has all stats stored
   - Integrate with dehydrate/hydrate
   - Consider linking Summoning spell path usage to summon creation

Optional: Add preset summon templates for common summon types that can be quickly added.
```

---

## Phase 8: Magi-Squire Companion System

**Priority Level:** High
**Estimated Complexity:** Medium
**Features:**
1. Magi-Squire NPC Companion System

### Claude Code Prompt

```
I need you to implement the Magi-Squire companion system for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing codebase, especially the NPC view patterns. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on Magi-Squire rules, blip system, or restrictions, consult:
- `compendium/rules.json` - Search for "Squire" or "Magi-Squire" for the companion rules
- `compendium/classes.json` - For Student Type options and abilities that squires can use
- `compendium/lists.json` - May contain squire-related reference data

**Magi-Squire System**

Magi-Squires are NPC companions assigned to mentor Magi-Knights. They use a simplified stat system.

1. **Magi-Squire Data Structure**:
   - Name
   - Student Type (same options as player characters)
   - Level (simplified, 1-5)
   - Health Blips: 6 maximum (not HP, discrete blips)
   - Mana Blips: 3 maximum (discrete blips)
   - Primary Stat Modifier (single modifier for most rolls)
   - Skills (simplified - 2-3 key skills)
   - Special Ability (from Student Type)
   - Equipment notes
   - Personality/Notes

2. **Blip System** (different from HP):
   - Health Blips: 6 circles/boxes that can be filled or empty
   - Taking damage removes 1 blip (regardless of damage amount)
   - At 0 Health Blips, squire is Exposed/Unconscious
   - Mana Blips: 3 circles/boxes
   - Using magic removes 1 Mana Blip
   - Visual representation similar to stress/exhaustion tracking

3. **Simplified Combat**:
   - Attack Roll: d20 + Primary Stat Modifier + Level
   - Damage: Fixed value (Level + 2) or simple dice (1d6 + Level)
   - Defense: 10 + Primary Stat Modifier + Level
   - No complex abilities or spell tiers

4. **UI Requirements**:
   - Add "Magi-Squire" collapsible section
   - Toggle to enable/disable (not all characters have squires)
   - Squire profile area:
     - Name field
     - Student Type selector
     - Level selector (1-5)
   - Blip Trackers:
     - 6 Health Blips as clickable circles (filled/empty)
     - 3 Mana Blips as clickable circles (filled/empty)
   - Rolls section:
     - Attack button (rolls simplified attack)
     - Skill check button (generic d20 + modifier)
   - Notes/abilities text area
   - "Rest" button to restore all blips

5. **Restrictions to Note**:
   - Squires cannot gain Gloom Gems
   - Squires cannot hold or use Shards of Power
   - Squires follow their mentor in combat (note in UI)
   - Display these as reminder text in the section

6. **Roll Output**:
   - Identify rolls as coming from "[Character]'s Squire: [Squire Name]"
   - Show simplified stat block in roll
   - Keep output concise

7. **State Management**:
   - Store all squire data in sheet state
   - squireEnabled toggle
   - squireName, squireType, squireLevel
   - squireHealthBlips (number 0-6)
   - squireManaBlips (number 0-3)
   - squireModifier, squireNotes
   - Integrate with dehydrate/hydrate

Place this section in the Student view or create a "Companions" tab that includes both Magi-Squire and Summoned Companions.
```

---

## Phase 9: Equipment Progression Systems

**Priority Level:** Medium
**Estimated Complexity:** Medium
**Features:**
1. Soul Armor Progression System
2. Combat Form Level Requirements & Weapon Restrictions
3. Relic Capacity Enforcement

### Claude Code Prompt

```
I need you to implement equipment progression and validation systems for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing equipment sections in the codebase. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on equipment progression, combat forms, or relic rules, consult:
- `compendium/equipment.json` - **PRIMARY SOURCE** for Soul Armor tiers, weapon qualities, and equipment bonuses
- `compendium/rules.json` - For Combat Form requirements and Relic capacity rules
- `compendium/relics.json` - For relic data and capacity mechanics

**Part 1: Soul Armor Progression System**

Soul Armor upgrades as characters gain Reputation, providing scaling bonuses.

1. **Armor Tiers** (verify exact bonuses against compendium/equipment.json):
   - Awakened (Rep 0-I): +0 Armor, +0 Weapon
   - Destined (Rep I): +1 Armor, +0 Weapon
   - Fabled (Rep II): +1 Armor, +1 Weapon
   - Super (Rep III): +2 Armor, +1 Weapon
   - Mythic (Rep IV): +2 Armor, +2 Weapon
   - Legendary (Rep V): +3 Armor, +3 Weapon

2. **UI Requirements**:
   - Add "Soul Armor Tier" selector in equipment section
   - Auto-suggest tier based on Reputation Level
   - Display current bonuses:
     - Armor Bonus: +X (adds to Knight Armor)
     - Weapon Bonus: +X (adds to Knight Attack and Damage)
   - Apply bonuses to calculated values automatically
   - Visual progression indicator showing all tiers with current highlighted

3. **Integration**:
   - Add soulArmorTier to state
   - Modify Knight Armor computed value to include armor bonus
   - Modify Knight Attack computed value to include weapon bonus
   - Modify Knight Damage to include weapon bonus

**Part 2: Combat Form Validation**

Combat Forms have level and equipment requirements that need validation.

1. **Form Requirements** (verify against compendium/rules.json or compendium/equipment.json):
   ```
   Form I - Adaptation: Any level, any weapon
   Form II - Deflection: Any level, any weapon
   Form III - Vindication: Any level, requires One-Handed weapon
   Form IV - Purgation: Any level, requires Two-Handed weapon
   Form V - Refraction: Any level, any weapon
   Form VI - Reflection: Any level, requires Shield equipped
   Form VII - Vibration: Any level, requires Coupled weapon
   Form VIII - Constellation: Any level, any weapon
   Form IX - Cessation: Any level, requires 15ft+ range weapon, ally adjacent to target
   Form X - Regulation: Any level, enables Soul Gun usage
   ```

2. **UI Requirements**:
   - Add Form selector or picker with all 10 forms
   - Display requirement for each form
   - Show validation status:
     - ✓ Requirements met (green)
     - ✗ Requirements not met (red) with explanation
   - Cross-reference with equipped Soul Weapon qualities:
     - Check "Two-Handed" quality for Form IV
     - Check weapon type for "Coupled" for Form VII
     - Check if Shield is equipped for Form VI
   - Form X should enable/reveal the Soul Gun section

3. **Integration**:
   - Store selected forms (can have up to 2 with Combat Form Drills tactic)
   - Validate against current equipment
   - If Form X is selected, ensure Soul Gun section is accessible

**Part 3: Relic Capacity Enforcement**

1. **Capacity Rule** (verify against compendium/rules.json):
   - Maximum equipped relics = Reputation Level (minimum 1)
   - Rep 0-I: 1 relic, Rep II: 2 relics, Rep III: 3 relics, etc.

2. **UI Requirements**:
   - Display "Relics: X / Y" (equipped / capacity)
   - Count entries in relics repeating section
   - Show warning if over capacity:
     - "⚠ Over relic capacity! Remove X relic(s) or increase Reputation."
   - Optionally prevent adding relics when at capacity

3. **Integration**:
   - Computed value for relic capacity based on reputation
   - Computed value for current relic count
   - Warning display logic

Ensure all changes integrate with dehydrate/hydrate and existing computed properties.
```

---

## Phase 10: Equipment Libraries (Runes, Attachments, Visors)

**Priority Level:** Medium
**Estimated Complexity:** Medium
**Features:**
1. Comprehensive Armament Runes Library
2. Soul Gun Attachment System
3. Magi-Knight Visor Equipment

### Claude Code Prompt

```
I need you to implement equipment library systems for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing equipment sections, especially the runes repeating section. Use existing styles and component patterns wherever possible.

**Compendium Reference**: This phase heavily relies on equipment compendium data. Consult:
- `compendium/equipment.json` - **PRIMARY SOURCE** for all runes, attachments, and visors with exact effects
- `compendium/lists.json` - May contain categorized equipment lists

**Part 1: Armament Runes Library**

Implement a picker/library system for runes with predefined effects.

1. **Weapon Runes** (verify exact effects against compendium/equipment.json):
   ```
   - Enhanced Element: +1 damage of your element type
   - Discharge Energy: 1/encounter, bonus action for +2d6 elemental damage
   - Imbued with Power: +1 to attack rolls
   - Sending Weapon: Can throw weapon 30ft, returns to hand
   - Shifting Weapon: Change weapon form as bonus action
   - Bane of Elsewhere: +1d6 damage vs Outsiders
   - Energy Siphoning: On kill, restore 1d6 MP
   - Fatal Elemental Enchantment: Crits deal +2d8 elemental damage
   - Radiant Energy: Weapon sheds bright light 20ft
   - Serrated Energy: Crits cause Bleeding (1)
   - Mystical Strengthening: +1 to damage rolls
   - Quickened Weapon: +2 to Initiative
   - Volatile Blast Enchantment: On crit, 10ft AoE for 1d6 damage
   ```

2. **Armor Runes** (verify exact effects against compendium/equipment.json):
   ```
   - Blinding Stride: When moving 20ft+, attackers have disadvantage
   - Levitation: Hover up to 10ft as move action
   - Magical Absorption: Reduce magic damage by 2
   - Weapon Absorption: Reduce physical damage by 2
   - Deflection: +1 to Armor
   - Enhanced Sight: Darkvision 60ft, +2 Perception
   - Flash Step: 1/encounter, teleport 30ft as bonus action
   - Minor Relocation: 1/round, teleport 10ft as free action
   - All-Seeing: Cannot be surprised, +5 to passive Perception
   - True Enhancement: +2 to one ability score
   ```

3. **UI Requirements**:
   - Convert runes section to use a picker/dropdown with predefined runes
   - Allow custom rune entry as well
   - When selecting a predefined rune, auto-fill:
     - Name
     - Full effect description
     - Type (Weapon/Armor/Gun)
   - Display active rune effects in a summary
   - Apply automatic bonuses where applicable:
     - Imbued with Power: +1 attack (add to weapon)
     - Mystical Strengthening: +1 damage
     - Deflection: +1 armor
     - Quickened Weapon: +2 initiative

**Part 2: Soul Gun Attachment System**

Add attachment slots for Soul Guns with specific bonuses.

1. **Attachment Types** (4 slots per gun - verify against compendium/equipment.json):

   **Scope** (affects accuracy/range):
   - Standard Scope: +1 to attack rolls at 30ft+
   - Large Scope: +2 to attack rolls at 60ft+, -1 at close range
   - Minimal Scope: No bonus, but no penalties either

   **Magazine** (affects ammo/fire rate):
   - Extended Magazine: +50% capacity, -1 Initiative
   - Standard Magazine: Normal capacity
   - Light Magazine: -25% capacity, +1 Initiative

   **Rail/Underbarrel**:
   - Laser Targeter: +1 to attack rolls
   - Foregrip: Reduce recoil, no penalty on Rapid Fire
   - Bipod: +2 to attack when prone or braced, -2 otherwise

   **Muzzle**:
   - Braker: Reduce recoil on heavy weapons
   - Compensator: +1 damage
   - Suppressor: Silent shots, -1 damage

2. **UI Requirements**:
   - Add 4 dropdown selectors for Soul Gun attachments
   - Show combined bonuses from all attachments
   - Apply bonuses to gun attack/damage rolls

**Part 3: Magi-Knight Visor Equipment**

1. **Visor Types** (verify against compendium/equipment.json):
   - Ether Identification: Identify magical items, see magical auras
   - Medical Diagnostic: +2 to Medicine checks, see ally HP status
   - Virtual HUD: Track up to 6 targets, +1 to attack tracked targets

2. **UI Requirements**:
   - Add "Visor" equipment slot (single selection)
   - Dropdown with three visor types + "None"
   - Display selected visor's effect
   - Apply bonuses where applicable

Ensure all selections persist via dehydrate/hydrate. Consider grouping all equipment modifications in an "Equipment Upgrades" subsection for organization.
```

---

## Phase 11: Compendium Integration

**Priority Level:** Medium + Lower
**Estimated Complexity:** Medium-High
**Features:**
1. Shards of Power Compendium Integration
2. Compendium Drag-and-Drop Support

### Claude Code Prompt

```
I need you to implement compendium integration features for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the Roll20 Beacon SDK documentation for compendium integration. Use existing styles and component patterns wherever possible.

**Compendium Reference**: This phase directly uses the compendium JSON files:
- `compendium/shards.json` - **PRIMARY SOURCE** for all Shard of Power data
- `compendium/equipment.json` - For equipment drag-drop mapping
- `compendium/spells.json` - For spell drag-drop mapping
- `compendium/techniques.json` - For technique drag-drop mapping
- `compendium/relics.json` - For relic drag-drop mapping
- `compendium/manifest.json` - For understanding the compendium structure

**Part 1: Shards of Power Compendium Integration**

Implement a picker for the 20 Shard types with full data.

1. **Shard Data** (load directly from compendium/shards.json - the list below is for reference):
   ```
   Rarity 1:
   - Shard of Mending [Lesser]: Heal 1d12 + Level HP

   Rarity 2:
   - Shard of Clarity [Lesser]: Restore 1d10 + Level MP
   - Shard of Confidence: +1d12 to next skill check

   Rarity 3:
   - Shard of Mending [Potent]: Heal 3d12 + Level HP
   - Shard of Mercurial Alacrity: +1 Bonus Action until next turn
   - Shard of Purification [Lesser]: Remove one minor condition
   - Shard of Rejuvenation: Ignore Stress/Exhaustion effects, -1 to both

   Rarity 4:
   - Shard of Unstoppable Might: +2 + Rep Level to Physical damage (1 encounter)

   Rarity 5:
   - Shard of Mending [Greater]: Heal 5d12 + Level HP
   - Shard of Purification [Potent]: Remove moderate conditions
   - Shard of Tenacity: Physical Resistance until next turn

   Rarity 6:
   - Shard of Clarity [Potent]: Restore 3d10 + Level MP
   - Shard of Magical Force: Advantage on spell attack, +Rep to attack and damage

   Rarity 7:
   - Shard of Purification [Greater]: Remove severe conditions
   - Shard of Solidarity: Gain 1 Unity Point or 1 Inspiration

   Rarity 8:
   - Shard of Fate: Roll 2d20, keep highest for any one roll
   - Shard of Fortune: Change a natural 1 to a 15

   Rarity 9:
   - Shard of Clarity [Greater]: Restore 6d10 + Level MP
   - Shard of Nepenthe: Remove 2 Trauma, full Stress/Exhaustion restoration

   Rarity 10:
   - Shard of the Magi-Knight: Full HP/MP restoration, remove all conditions, -1 Fracture
   ```

2. **UI Requirements**:
   - Shard Picker: Dropdown or searchable list of all 20 shards
   - When adding a shard, auto-fill:
     - Name
     - Rarity (1-10)
     - Full effect description
     - Gloom Gem cost (if tracking purchasing)
   - Sort/filter options by rarity
   - "Use Shard" button that:
     - Rolls any dice in the effect
     - Outputs effect to chat
     - Optionally removes shard from inventory (consumable)
   - Quick-add for common shards
   - Manual entry option for homebrew shards

3. **Integration**:
   - Update existing Power Shards repeating section
   - Add shard picker modal or inline selector
   - Connect rarity display to styling (higher rarity = more prominent)

**Part 2: Compendium Drag-and-Drop Support**

Enable dragging items from Roll20 compendium to the character sheet.

1. **Beacon SDK Compendium Events**:
   - Register drop handlers for compendium items
   - Handle different item types:
     - Spells → Add to spell paths
     - Techniques → Add to techniques section
     - Equipment → Add to appropriate equipment section
     - Shards → Add to Power Shards
     - Relics → Add to Relics

2. **Implementation**:
   - Review Beacon SDK documentation for `onDropCompendiumData` or similar
   - Parse incoming compendium data
   - Map compendium fields to sheet fields
   - Auto-populate repeating section entries

3. **Data Mapping** (analyze the structure of each compendium JSON file):
   - Read compendium/*.json files to understand field names
   - Create mapping functions for each item type
   - Handle missing or optional fields gracefully

4. **UI Feedback**:
   - Visual indicator when drag-drop is supported
   - Success message when item is added
   - Error message if item type is unsupported

This phase requires understanding the Roll20 Beacon SDK's compendium integration features. Reference:
- Official Beacon SDK documentation
- Existing compendium-enabled sheets for patterns

Ensure all new data integrates with dehydrate/hydrate.
```

---

## Phase 12: Character Enhancement Systems

**Priority Level:** Lower
**Estimated Complexity:** Low-Medium
**Features:**
1. Branching Elements System
2. Proficiency Bonus Verification
3. Social Points Progression System

### Claude Code Prompt

```
I need you to implement character enhancement systems for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing elemental system and proficiency calculations. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on elements, proficiency, or social mechanics, consult:
- `compendium/rules.json` - For proficiency progression table and social point thresholds
- `compendium/classes.json` - For elemental affinities and branch element details
- `compendium/lists.json` - May contain element and social progression reference data

**Part 1: Branching Elements System**

Expand the elemental system to include branching/advanced elements.

1. **Primary and Branch Elements** (verify against compendium/classes.json):
   ```
   Earth → Wood OR Metal
   Fire → Lightning OR Toxins
   Air → Force OR Sonance
   Water → Ice OR Blood
   Void → Light OR Dark
   ```

2. **Branch Element Properties**:
   Each branch element provides:
   - Modified damage type
   - Unique enhancement options
   - Thematic abilities

   Example effects (verify against compendium):
   - Wood (Earth): Nature-based, healing affinity
   - Metal (Earth): Construct affinity, armor bonus
   - Lightning (Fire): Speed bonus, chain damage
   - Toxins (Fire): DoT effects, poison resistance
   - Force (Air): Telekinesis, push/pull effects
   - Sonance (Air): Sound-based, disruption abilities
   - Ice (Water): Slow effects, cold resistance
   - Blood (Water): Life drain, sacrifice mechanics
   - Light (Void): Radiant damage, dispel effects
   - Dark (Void): Shadow abilities, stealth bonuses

3. **UI Requirements**:
   - After selecting primary element, show branch selector
   - Two options per primary element
   - Display branch-specific enhancements when branch is selected
   - Update damage type references (e.g., "Fire" → "Lightning")
   - Branch selection should unlock additional enhancement options

4. **Integration**:
   - Add branchElement to state
   - Reset branch when primary element changes
   - Conditional enhancement options based on branch

**Part 2: Proficiency Bonus Verification**

Verify proficiency bonus calculation matches the Reputation-based system.

1. **Expected Progression** (verify exact values against compendium/rules.json):
   ```
   Rep 0 (Level 1): +2
   Rep I (Level 2-4): +2
   Rep II (Level 5-7): +3
   Rep III (Level 8-10): +3
   Rep IV (Level 11-13): +4
   Rep V (Level 14-16): +5
   ```

2. **Verification Tasks**:
   - Review current proficiency calculation in sheetStore
   - Compare against SRD progression table in compendium/rules.json
   - Fix formula if incorrect
   - Ensure proficiency is based on Reputation, NOT Level directly
   - Document the correct formula in code comments

3. **UI Display**:
   - Show proficiency bonus prominently
   - Indicate it's tied to Reputation Level
   - Tooltip explaining the progression

**Part 3: Social Points (SP) Progression System**

Enhance bond tracking with SP milestone system.

1. **Bond Progression Milestones** (verify thresholds against compendium/rules.json):
   ```
   0 SP: New Beginning (just met)
   5 SP: Friendly (acquaintance)
   15 SP: Caring (friend)
   30 SP: Beloved (close friend)
   50 SP: Treasured (deepest bond)
   ```

2. **Moment of Catharsis**:
   - Triggered at certain SP thresholds
   - Special scenes/events between characters
   - Track whether catharsis has occurred per bond

3. **UI Requirements**:
   - Update bond sections (NPC and Magi-Knight bonds)
   - Show current SP and next milestone
   - Progress bar or indicator toward next level
   - Badge/label showing current bond level
   - "Catharsis Available" indicator when eligible
   - Checkbox for "Catharsis Completed" at each milestone

4. **Integration**:
   - Enhance existing bond repeating sections
   - Add computed property for bond level based on SP
   - Add catharsis tracking fields

Example display:
```
[Bond Name] - 23 SP
Level: Caring (need 7 SP for Beloved)
[████████░░] 23/30
☐ Catharsis Available
```

Ensure all changes integrate with dehydrate/hydrate.
```

---

## Phase 13: Student Phase & Final Polish

**Priority Level:** Lower
**Estimated Complexity:** Medium
**Features:**
1. Student Phase Activity Tracking
2. Soul Oblation Mechanics
3. Trauma Milestone Warnings

### Claude Code Prompt

```
I need you to implement student phase systems and final polish features for the Magi-Knights Awakening Roll20 Beacon character sheet located at /home/mechageo/projects/roll20-beacon-sheets/magiknights.

Review the existing Student view and Eclipse chart. Use existing styles and component patterns wherever possible.

**Compendium Reference**: If you need clarification on student phase rules, Soul Oblation, or trauma mechanics, consult:
- `compendium/rules.json` - **PRIMARY SOURCE** for student phase activities, Soul Oblation tiers, and Eclipse/Trauma thresholds
- `compendium/lists.json` - May contain activity options and phase structure

**Part 1: Student Phase Activity Tracking**

Implement tracking for the non-combat student life portion of gameplay.

1. **Budget Tallies Currency**:
   - Mundane currency for student purchases
   - Simple counter (similar to Gloom Gems)
   - Starting amount varies by school type
   - Used for buying mundane gear, food, activities

2. **Free Time Phase** (~90 minutes of activity time - verify against compendium/rules.json):
   - Time slot tracker (can represent 90 min in 15-30 min blocks)
   - Activity log/selector:
     - Socialize (gain SP with someone)
     - Study (prepare for class, reduce Stress)
     - Relax (recover Exhaustion)
     - Club Activity (specific club effects)
     - Work Part-Time (gain Budget Tallies)
     - Train (physical training effects)
   - Track time spent per activity
   - "Reset Day" button to clear time slots

3. **Class Schedule** (optional, simpler implementation):
   - List of classes (text entries)
   - Per-class stress indicator (some classes are stressful)
   - Notes field per class
   - Simple time-of-day tracker (Morning/Afternoon/Evening)

4. **UI Requirements**:
   - Add "Student Schedule" collapsible section in Student view
   - Budget Tallies counter
   - Activity selector with time allocation
   - Day/Phase tracker (which phase of the day)
   - Quick buttons for common activities
   - Notes field for session events

**Part 2: Soul Oblation Mechanics**

Implement the heroic sacrifice ability.

1. **Soul Oblation** (unlocked at Rep I - verify effects against compendium/rules.json):
   - Effect: Burn out Soul Crystal to heal and stabilize entire squad
   - Cost: Gain 1 Crystalline Fracture
   - Base effect: Heal all squad members for (Level + Rep) × 2 HP

2. **Greater Soul Oblation** (Rep III+):
   - All effects of basic
   - Plus: Deal (Level + Rep) × 2 damage to all enemies in 30ft

3. **Ultimate Soul Oblation** (Rep IV+):
   - All effects of greater
   - Plus: Stun all enemies for 1 round (Roll to Resist)

3. **UI Requirements**:
   - Add "Soul Oblation" button in combat section
   - Show which tier is available based on Rep Level
   - Confirmation dialog ("This will add 1 Crystalline Fracture. Proceed?")
   - Roll output includes:
     - Healing amount for squad
     - Damage amount (if Rep III+)
     - Stun effect and DC (if Rep IV+)
   - Auto-increment Crystalline Fractures on use

4. **Integration**:
   - Reference Reputation Level for tier availability
   - Reference Level for effect calculations
   - Update Crystalline Fractures when used

**Part 3: Trauma Milestone Warnings**

Add warnings and indicators for dangerous Trauma/Corruption levels.

1. **Eclipse Chart Milestones** (verify thresholds against compendium/rules.json):
   - 3+ Corruption: Risk of becoming Heartless Knight
   - 5+ Total (Trauma + Corruption): Severe psychological effects
   - 7+ Total: Near Total Soul Eclipse
   - 8 Total: Total Soul Eclipse (death/transformation)

2. **UI Requirements**:
   - Add warning indicators to Eclipse chart based on filled blips
   - Color-coded warnings:
     - Yellow: 3+ Corruption ("Heartless Knight risk")
     - Orange: 5+ Total ("Severe Eclipse")
     - Red: 7+ Total ("Critical Eclipse")
     - Flashing/Pulsing: 8 Total ("Total Soul Eclipse")
   - Tooltip explanations for each warning level
   - Summary text showing current status

3. **Consequences Display**:
   - When at 3+ Corruption, show reminder about Heartless Knight condition
   - When at 8 Total, show dramatic "Soul Eclipse" indicator
   - Optional: Lock certain actions when severely eclipsed

4. **Integration**:
   - Read from existing Eclipse chart state
   - Computed values for warning thresholds
   - CSS classes for warning states

Ensure all changes integrate with existing systems and dehydrate/hydrate.
```

---

## Implementation Order Summary

| Phase | Priority | Features | Est. Sessions |
|-------|----------|----------|---------------|
| 1 | Critical/High | Unity Points, Gloom Gems, Herald | 1 |
| 2 | Critical | Squadron Formations | 1 |
| 3 | Critical | Combination Maneuvers | 1 |
| 4 | Critical | Release Magic Cards | 1-2 |
| 5 | High/Medium | Techniques & Tactics | 1 |
| 6 | High | Spell Modifications | 1 |
| 7 | High | Summoning Companions | 1 |
| 8 | High | Magi-Squire System | 1 |
| 9 | Medium | Equipment Progression | 1 |
| 10 | Medium | Equipment Libraries | 1 |
| 11 | Medium/Lower | Compendium Integration | 1 |
| 12 | Lower | Character Enhancements | 1 |
| 13 | Lower | Student Phase & Polish | 1 |

**Total Estimated Sessions: 13-14**

---

## General Guidelines for All Phases

Include these instructions in each session:

1. **Before starting**: Review the existing codebase structure, especially:
   - `src/sheet/stores/sheetStore.ts` - State management patterns
   - `src/sheet/views/` - Component structure
   - `src/sheet/styles/` - SCSS patterns and variables
   - `src/sheet/components/` - Reusable components

2. **Styling**: Use existing CSS classes, variables, and patterns. Match the visual style of existing sections.

3. **State Management**: Follow the existing Pinia store patterns. Ensure all new state is included in dehydrate/hydrate functions.

4. **Rolling**: Use the existing roll infrastructure. Study how other rolls are implemented before adding new ones.

5. **Testing**: After implementing, test all new features interact correctly with existing functionality.

6. **Documentation**: Add code comments for complex logic. Update any relevant documentation.

7. **Compendium Reference for Rule Clarification**:

   **IMPORTANT**: When implementing any game mechanic and you are unsure about the exact rules, effects, costs, or thresholds, **always consult the compendium JSON files** located at `compendium/` in the project root:

   | File | Contents |
   |------|----------|
   | `rules.json` | Core game rules, mechanics, proficiency tables, phase rules |
   | `classes.json` | Student types, magic styles, elemental affinities |
   | `techniques.json` | Battle techniques and combat tactics with requirements |
   | `spells.json` | Spell paths, tiers, Release magic cards |
   | `equipment.json` | Weapons, armor, runes, attachments, visors |
   | `shards.json` | Shards of Power with rarity and effects |
   | `relics.json` | Relic items and their properties |
   | `monsters.json` | NPC/enemy stat blocks, summon templates |
   | `lists.json` | Reference lists and categorized data |
   | `locations.json` | Setting and location information |
   | `manifest.json` | Compendium structure and metadata |
   | `magi-knights-compendium.json` | Combined/master compendium data |

   The compendium files are the **authoritative source** for game rules. If there's any discrepancy between the prompt instructions and the compendium data, **prefer the compendium data** as it represents the official game rules.

8. **Rule Implementation Philosophy**: The goal is to faithfully implement the Magi-Knights Awakening rules as defined in the compendium. When in doubt:
   - Read the relevant compendium JSON file
   - Search for keywords related to the feature
   - Implement according to the compendium specification
   - Add a code comment referencing which compendium entry was used
