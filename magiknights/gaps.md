# Magi-Knights Awakening Roll20 Sheet - Required Changes

Based on analysis of the SRD compendium versus the current sheet implementation, here are the changes needed, ordered by impact for gameplay.

---

## **CRITICAL PRIORITY** (Core Gameplay Blockers)

### 1. **Unity Points Resource System**
- **Gap:** Sheet doesn't track Unity Points (unlocked at Rep Level II, max = Rep Level - 1)
- **Impact:** Unity Points are required for Combination Maneuvers - a core squad combat feature
- **Implementation:** Add Unity Point tracker with auto-calculated max based on Reputation, restoration on Sleep Phase

### 2. **Squadron Formations System**
- **Gap:** Missing tactical formation mechanics entirely
- **Impact:** Formations (Arrow, Victory, Barrage, Diamond) are core squad tactics costing 2-3 Inspiration
- **Implementation:** Add formation selector with Inspiration cost tracking, effects display, and squad coordination UI

### 3. **Combination Maneuvers**
- **Gap:** No system for multi-Magi-Knight coordinated attacks
- **Impact:** Essential group combat mechanics requiring 2+ players and Unity Points
- **Implementation:** Add maneuver list (Avenging Flare, Planetary Aegis, Starstorm Restoration, etc.) with Unity cost, participant tracking, and effect rolls

### 4. **Release Magic (Card-Based Spell System)**
- **Gap:** Entirely missing this unique magic style
- **Impact:** Players choosing "Release" magic style have no way to use their 22-card spell deck system
- **Implementation:** Add spell deck management, draw pool (3 + Rep Level cards), card play UI with Scaling Value mechanics

---

## **HIGH PRIORITY** (Major Feature Gaps)

### 5. **Battle Technique Level Requirements & Frequency**
- **Gap:** Techniques exist but lack level prerequisite validation and usage tracking (1/encounter, 1/round, etc.)
- **Impact:** Players can't properly track technique availability during combat
- **Implementation:** Add level requirement field, frequency type selector, usage counter that resets on encounter/rest

### 6. **Spell Modification System**
- **Gap:** Missing Mana Strain, Rushed Spells, Overcharging, Total Focus, Quickening mechanics
- **Impact:** Advanced spellcasting options unavailable
- **Implementation:** Add spell modification toggles per cast: Mana Strain (1 Exhaustion, -1 tier cost), Rushed (Bonus Action, half damage), Overcharging (2 Exhaustion, +damage dice), Quickening (+1 tier MP for action change)

### 7. **Summoning Path Companion Tracking**
- **Gap:** Summons need dedicated stat blocks and command tracking
- **Impact:** Summoning path users can't properly manage their summoned allies
- **Implementation:** Add summon companion section with HP, armor, abilities, command range (30ft + level), telepathic options

### 8. **Magi-Squire NPC Companion System**
- **Gap:** No tracking for assigned Magi-Squire companions
- **Impact:** Mentor Magi-Knights can't manage their squire's 6 Health Blips, 3 Mana Blips, simplified actions
- **Implementation:** Add collapsible Magi-Squire section with blip tracking, simplified attack/defense rolls

### 9. **Gloom Gems Currency Tracking**
- **Gap:** Only exists in NPC yield rolls, not as player resource
- **Impact:** Players can't track currency for purchasing Shards, Runes, Visors from Herald
- **Implementation:** Add Gloom Gems counter in resources section, integrate with Shard/Rune purchasing

### 10. **Herald Bond Level System**
- **Gap:** Herald connection not tracked beyond basic info
- **Impact:** Herald bond level affects spell tier access (Tier VI requires bond level IV+) and ability unlocks
- **Implementation:** Add Herald section with bond level (I-V), associated benefits display, tier unlock indicator

---

## **MEDIUM PRIORITY** (Enhanced Gameplay Features)

### 11. **Soul Armor Progression System**
- **Gap:** Missing armor tier tracking (Awakened → Destined → Fabled → Super → Mythic → Legendary)
- **Impact:** Armor/weapon bonuses from progression not automatically calculated
- **Implementation:** Add Soul Armor tier selector with auto-calculated bonuses (+0/+1/+1/+2/+2/+3 armor, +0/+0/+1/+1/+2/+3 weapon)

### 12. **Comprehensive Armament Runes Library**
- **Gap:** Runes exist as text fields but full rune list with effects not integrated
- **Impact:** 14 weapon runes, 10 armor runes with specific mechanics need proper tracking
- **Implementation:** Add rune picker with compendium integration, auto-apply bonuses (Enhanced Element, Discharge Energy, Quickened Weapon, Flash Step, etc.)

### 13. **Soul Gun Attachment System**
- **Gap:** Gun qualities exist but full attachment system missing
- **Impact:** Scopes, Magazines, Rail attachments, Muzzle attachments each provide specific bonuses
- **Implementation:** Add 4 attachment slots per gun: Scope (Standard/Large/Minimal), Magazine (Extended/Standard/Light), Rail (Targeter/Grip/Bipod), Muzzle (Braker/Compensator/Suppressor)

### 14. **Combat Form Level Requirements & Weapon Restrictions**
- **Gap:** Forms tracked but prerequisites not validated
- **Impact:** Forms have level and weapon type requirements (Form III = one-handed, Form IV = two-handed, Form VI = shield, Form X = any for Soul Guns)
- **Implementation:** Add form prerequisite checking, weapon compatibility validation, Form X unlocks Soul Gun access

### 15. **Relic Capacity Enforcement**
- **Gap:** Relics tracked but capacity limit (= Reputation Level) not enforced
- **Impact:** Players may equip more relics than allowed
- **Implementation:** Add relic count vs capacity display, warning when over limit

### 16. **Shards of Power Compendium Integration**
- **Gap:** Shards exist as text but 20 specific shard types with rarity 1-10 not linked
- **Impact:** Shard effects (healing amounts, condition removal, etc.) must be manually referenced
- **Implementation:** Add shard picker with compendium data, auto-fill effects, rarity-based sorting

### 17. **Combat Tactics Full Implementation**
- **Gap:** Tactics exist as repeating text but 25+ specific tactics need mechanics
- **Impact:** Tactics like "Adept of Magic", "Combat Form Drills", "Elemental Bulwark" have specific triggers and effects
- **Implementation:** Add tactic library with prerequisite validation, effect descriptions, and automatic bonuses where applicable

---

## **LOWER PRIORITY** (Quality of Life & Completeness)

### 18. **Student Phase Activity Tracking**
- **Gap:** Missing school schedule, class stress mechanics, Budget Tallies economy
- **Impact:** Student Persona gameplay loop incomplete
- **Implementation:** Add class schedule tracker, activity time slots (~90 min Free Time), Budget Tallies currency, activity effect logging

### 19. **Social Points (SP) System**
- **Gap:** Bond points exist but full SP progression (New Beginning → Friendly → Caring → Beloved → Treasured) not implemented
- **Impact:** Relationship milestone tracking and Moment of Catharsis mechanics missing
- **Implementation:** Add SP thresholds per relationship, milestone notifications, catharsis trigger options

### 20. **Branching Elements System**
- **Gap:** 5 primary elements implemented but 10 branching elements missing (Wood/Metal, Lightning/Toxins, Force/Sonance, Ice/Blood, Light/Dark)
- **Impact:** Advanced elemental options unavailable
- **Implementation:** Add branch selection for each primary element, associated enhancement options

### 21. **Magi-Knight Visor Equipment**
- **Gap:** Visor slot missing (Ether Identification, Medical Diagnostic, Virtual HUD)
- **Impact:** Visor equipment bonuses not tracked
- **Implementation:** Add visor equipment slot with three visor types and their effects

### 22. **Soul Oblation Mechanics**
- **Gap:** Missing heroic sacrifice ability (Rep I+: burn Soul Crystal to heal squad)
- **Impact:** Dramatic sacrifice option not available
- **Implementation:** Add Soul Oblation button with tier effects (basic, greater at Rep III, ultimate at Rep IV)

### 23. **Trauma Point Eclipse Progression**
- **Gap:** Eclipse chart exists but milestone effects (3+ Corruption = Heartless Knight risk) not tracked
- **Impact:** Trauma/Corruption consequences not surfaced
- **Implementation:** Add milestone warnings, Total Soul Eclipse threshold indicator

### 24. **Proficiency Bonus Accuracy Check**
- **Gap:** Need to verify proficiency scales correctly with Reputation (not Level)
- **Impact:** Core modifier may be incorrect
- **Implementation:** Verify formula matches SRD Rep-based progression, fix if needed

### 25. **Compendium Drag-and-Drop Integration**
- **Gap:** Sheet doesn't appear to support Roll20 compendium drag-and-drop
- **Impact:** Users must manually enter all data from compendium
- **Implementation:** Add drop handlers for spells, techniques, equipment, shards from compendium entries

---

## Summary Table

| Priority | Item | Type | Effort |
|----------|------|------|--------|
| Critical | Unity Points | Resource | Low |
| Critical | Squadron Formations | Combat System | Medium |
| Critical | Combination Maneuvers | Combat System | High |
| Critical | Release Magic Cards | Magic System | High |
| High | Technique Requirements | Combat | Medium |
| High | Spell Modifications | Magic | Medium |
| High | Summoning Companions | Magic | Medium |
| High | Magi-Squire System | NPC | Medium |
| High | Gloom Gems | Resource | Low |
| High | Herald Bond Level | Progression | Low |
| Medium | Soul Armor Progression | Equipment | Medium |
| Medium | Armament Runes Library | Equipment | Medium |
| Medium | Gun Attachments | Equipment | Medium |
| Medium | Combat Form Validation | Combat | Low |
| Medium | Relic Capacity | Equipment | Low |
| Medium | Shards Compendium | Items | Medium |
| Medium | Combat Tactics Library | Combat | High |
| Lower | Student Phase | Social | High |
| Lower | Social Points System | Social | Medium |
| Lower | Branching Elements | Character | Low |
| Lower | Visor Equipment | Equipment | Low |
| Lower | Soul Oblation | Combat | Low |
| Lower | Trauma Milestones | Resources | Low |
| Lower | Proficiency Verification | Core | Low |
| Lower | Compendium Drag-Drop | Integration | High |

---

The **Critical** items should be addressed first as they represent core game mechanics that players cannot currently use at all through the sheet.
