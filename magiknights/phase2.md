# Phase 2 Implementation Summary

## Task 2.1: NPC/Monster Sheet

### sheetStore.js - NPC Data Fields

Added comprehensive NPC data structure:

**Basic Info:**
- `npc_name` - NPC name
- `npc_type` - Horde, Vassal, Adversary, Nemesis, or Harbinger
- `npc_size` - Tiny, Small, Medium, Large, Huge, Gargantuan
- `npc_creature_type` - Outsider, Mortal, Construct, Undead, Beast, Aberration
- `npc_armor` - Armor value
- `npc_move` - Movement speed in feet
- `npc_invasion_level` - Invasion level (0+)
- `npc_horrific_rating` - Horrific rating (optional)
- `npc_physical_check` - Physical check modifier
- `npc_magical_check` - Magical check modifier
- `npc_inert_spectral_energy` - Gloom gems dice expression (e.g., "1d4")
- `npc_whisper_rolls` - Boolean for GM-only rolls

**HP System:**
- `npc_hp` - Single HP pool for non-horde enemies (current/max)
- `npc_horde_hp` - Array of 4 unit HP pools for horde enemies
- `npc_active_units` - Computed count of active horde units

**Attack System:**
- `npc_primary_attack` - Primary attack with:
  - `name`, `attackBonus`, `attackDC` (array for hordes)
  - `range`, `damage`, `hordeDamage` (array for hordes)
  - `damageType`, `special`
- `npc_secondary_attack` - Same structure as primary
- `npc_primary_current` / `npc_secondary_current` - Computed current values based on active units

**Other:**
- `npc_traits` - Array of trait objects with name/description
- `npc_notes` - Free-form notes field
- `npcTypes` - Reference object for NPC type metadata

### sheetStore.js - NPC Roll Functions

- `rollNPCAttack(attackType)` - Rolls attack (or shows DC for hordes)
- `rollNPCDamage(attackType)` - Rolls damage (flat or dice based on type)
- `rollNPCCheck(checkType)` - Rolls physical or magical check
- `rollNPCGloomGems()` - Rolls inert spectral energy for gloom gems yield
- `addNPCTrait()` / `removeNPCTrait(id)` - Trait management

### NPCView.vue

Full NPC sheet UI with:
- **Header:** Name input, PC/NPC mode toggle, type/size/creature type dropdowns
- **Stats Grid:** Armor, Move, Physical Check (clickable), Magical Check (clickable)
- **HP Section:**
  - Horde mode: 4 separate unit HP pools with defeat/revive buttons
  - Non-horde mode: Single current/max HP display
  - Active units counter for hordes
- **Attacks Section:** Side-by-side primary/secondary attack editors
  - Dynamic inputs based on horde vs non-horde (DC array vs attack bonus)
  - Attack and Damage roll buttons
  - Special abilities textarea
- **Extra Stats:** Invasion Level, Horrific Rating, Gloom Gems (clickable roll)
- **Traits Section:** Add/remove traits with name and description
- **Notes Section:** Free-form notes textarea

---

## Task 2.2: Hidden/GM Rolls

### rollToChat.js

Updated `rollToChat` utility function to accept `whisper` parameter:
- When `whisper: true`, rolls are sent to GM only
- Uses Beacon SDK's `dispatch.post` with `whisper: 'gm'` option

### NPC Whisper Integration

- Added `npc_whisper_rolls` ref to sheetStore
- Added checkbox toggle in NPCView header: "Whisper rolls to GM only"
- All NPC roll functions pass `whisper: npc_whisper_rolls.value` to rollToChat:
  - `rollNPCAttack`
  - `rollNPCDamage`
  - `rollNPCCheck`
  - `rollNPCGloomGems`

When enabled, all NPC rolls are visible only to the GM, allowing secret enemy actions during gameplay.

---

## Sheet Mode Toggle

### SettingsView.vue

Added "Sheet Mode" section at the top of the Settings page:
- Displays current mode (Player Character)
- "Switch to NPC Sheet" button that sets `sheet.sheet_mode = 'npc'`

### NPCView.vue

- "Switch to PC" button in the header to return to PC mode

This allows users to easily toggle between PC and NPC sheet modes from within the sheet UI.
