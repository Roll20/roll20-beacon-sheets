Magi-Knights Awakening Roll20 Sheet - Defects & Feature Requests
RESOLVED ISSUES (For Reference)
These issues have been fixed and deployed - included for historical context only.
[RESOLVED] Custom Skill Values Not Saving
Status: Fixed (deployed 2024-11-21)
Description: When manually changing a skill value (e.g., for Skill Mastery or Renaissance Student abilities), the sheet reverts to the auto-calculated Skill modifier instead of saving the manually inputted number.
[RESOLVED] Sheet Privacy/Permissions Issue
Status: Fixed (deployed 2024-11-21)
Description: Users without edit rights could see character sheets they shouldn't have access to.
[RESOLVED] Damage Roll Parser Doesn't Support Complex Dice Expressions
Status: Fixed (deployed 2026-01-16)
Description: The damage field only parsed the first numeric value when entering complex dice expressions. For example, entering 1d12+2d6+3+4+5 only registered the 2 instead of the full expression.
Solution: Refactored rollStudentDamage and rollKnightDamage functions to use getRollResults with formula property, delegating dice expression parsing to the Roll20 Beacon API which properly handles complex expressions.

OPEN DEFECTS
DEF-002: Token Bars Not Linkable to Character Attributes
Priority: High
Description: Token bars (HP, SHP, MP, Temp HP, etc.) cannot be linked to character sheet attributes. The sheet has an "hp" attribute in the code that isn't properly hooked up. Custom attributes created by users also cannot be added to tokens.
Expected Behavior: Token bars should be assignable to character sheet values (MKHP, SHP, MP, etc.) so they update automatically.
Rules Reference:

SHP Formula: 10 + CON Modifier + Reputation Level (Section 2.1)
MKHP Level 1: 10 + CON Modifier (Section 2.2)
MP: MCO * 2 or MCO * 3 with Magical Implement (Section 2.3)
Technical Notes: Beacon sheets use Vue.js; token bar attributes need to be defined in initial code and hooked up in Vue code.

DEF-003: Cannot Support Multiple Resist Proficiencies
Priority: Medium
Description: The sheet only supports one Roll to Resist proficiency. A tactic exists that grants additional resist proficiencies (STR, DEX, CON, and Magic), but there's no way to track multiple proficiencies on the sheet.
Expected Behavior: Support for multiple resist proficiency toggles (STR, DEX, CON, Magic resistance).
Rules Reference: Roll to Resist uses Proficiency Bonus + Stat Modifier per Section 3.1.
Suggested Fix: Re-enable the diamond toggles under stats (like the original PDF) or add dedicated checkbox fields.

FEATURE REQUESTS
FEAT-001: Stress/Exhaustion Endurance Die Integration
Priority: Medium
Description: Add functionality where clicking on Stress or Exhaustion fields rolls the Endurance Die and outputs the total negative modifier to apply to rolls. Should also display "Disadvantage" reminder when Stress or Exhaustion reaches level 6.
Rules Reference (Section 4.1):

Stress/Exhaustion cap at Level 6
Endurance Die: Roll 1d6, success if d6 >= point level
Level 6 imposes automatic Disadvantage
Overflow (>6) grants 1 Trauma Point
Technical Notes: The stress/exhaustion fields at the top are already set up to function as buttons (similar to initiative).

FEAT-002: Advantage/Disadvantage Toggle
Priority: Low
Description: Add a toggle to roll with Advantage (roll twice, take higher) or Disadvantage (roll twice, take lower), or both simultaneously (which cancel out).
Rules Reference: Standard advantage/disadvantage mechanics apply throughout the game.
Notes: Low priority as users can manually roll twice.
FEAT-003: Spell Path & Tier Chat Output
Priority: Medium
Description: Add a way to post the Spell Path and Tier being cast to chat when using spells.
Rules Reference (Section 2.3): MP Tiers: Tier I (3 MP), II (6 MP), III (15 MP), IV (25 MP), V (36 MP), VI (45 MP).
FEAT-004: NPC/Enemy Character Sheet
Priority: High
Description: Create a separate NPC/Enemy stat block sheet for GMs. Currently there is no way to create enemy character sheets - only PC sheets exist.
Rules Reference (Section 6.1 - NPC Ranks):

Vassal: Initiative 12
Adversary: Initiative 14
Nemesis: Initiative 16
Harbinger: Initiative 18
Rules Reference (Section 6.2 - Horde Logic):
Units: Typically 4 Units/Parts
Damage: Multi-target (Explosion) hits all Units; single-target hits one
O-Attack: 1d20 + Athletics vs O-Attack DC
Current Workaround: GMs store NPC stat blocks in the "GM Only" section of the Bio/Info tab.

FEAT-005: Hidden/GM Rolls for NPCs and Enemies
Priority: Medium
Description: Add the ability for GMs to make hidden rolls for NPCs and enemies that aren't visible to players.
FEAT-006: Character Image in Bio/Info Section
Priority: Low
Description: Display the main character image in the Bio/Info section for easy reference.
Technical Notes: Need to verify if this is possible in Beacon sheets.
FEAT-007: GM Character Sheet Assignment
Priority: Medium
Description: Allow the Magic Keeper (GM) to assign a character sheet to someone other than the owner.
Current Behavior: Only the sheet owner can access/edit their sheet; GMs must give edit rights to show sheets to players.
FEAT-008: Compendium Integration (Future)
Priority: Low (Long-term)
Description: Create a Compendium with drag-and-drop monsters/spells/tactics for easy sheet population.
Prerequisites: Requires creating and selling a compendium on Roll20.
Notes: D&D monsters require modification per "Heroes from Overthere" supplement.

PLATFORM LIMITATIONS (Not Actionable)
Character Sheet Preview Unavailable
Description: The MKA sheet is grayed out in Roll20's sheet preview menu because Roll20 only enables previews for popular sheets.
Error Message: "Viewing the character is not currently supported for this sheet type."
Workaround: Users can vote on Roll20 to add preview support. Sheet still works when creating a game.

TECHNICAL NOTES
Architecture

Sheet Type: Roll20 Beacon (Vue.js application)
Repository: Roll20 Beacon Sheets repo on GitHub
Legacy vs Beacon: Beacon sheets significantly differ from legacy Roll20 sheets

Token Bar Implementation
Per Roll20 developer guidance, token bar attributes need to be:

Defined in the initial sheet code
Hooked up in the Vue code to corresponding character data values
