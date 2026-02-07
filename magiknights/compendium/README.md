# Magi-Knights Awakening Roll20 Compendium

This directory contains the Magi-Knights Awakening System Reference Document (SRD) converted into Roll20 Compendium JSON format.

## Files

- **magi-knights-compendium.json** - Main compendium file with all content
- **manifest.json** - Manifest listing all categories and page counts
- **Category-specific JSON files:**
  - `rules.json` - Core rules, conditions, glossary (141 pages)
  - `spells.json` - Spell paths and magic (18 pages)
  - `techniques.json` - Battle techniques and tactics (44 pages)
  - `equipment.json` - Weapons, armor, and gear (26 pages)
  - `shards.json` - Shards of Power consumables (20 pages)
  - `relics.json` - Magical relics (10 pages)
  - `monsters.json` - Outsiders and cultists (43 pages)
  - `locations.json` - Lapis City locations (5 pages)
  - `classes.json` - Combat forms and character options (30 pages)
  - `lists.json` - Formations and combinations (5 pages)

## Total Content

- **Total Pages:** 343
- **Source Files:** 24 markdown files from `/src`

## File Structure

All JSON files follow the Roll20 Compendium schema:

```json
{
  "pagesByCategory": {
    "CATEGORY_NAME": {
      "Page Title": "HTML content string",
      "Page With Attributes": {
        "content": "HTML content string",
        "name": "Entry name",
        "Category": "Category name",
        "...": "Additional attributes for drag-and-drop"
      }
    }
  }
}
```

## Usage

### For Roll20

1. Upload the appropriate JSON file(s) to your Roll20 game as a custom compendium
2. Use the Roll20 API or game settings to integrate the compendium
3. Players can search and drag-and-drop entries onto character sheets

### For Foundry VTT or Other Platforms

The JSON structure can be adapted for other virtual tabletop platforms with appropriate conversion scripts.

## Content Categories

### Rules (141 pages)
Core game mechanics, conditions, social systems, glossary terms, and reference tables.

### Spells (18 pages)
- Spell paths: Beam, Explosion, Curing, Restoration, Amplify, Manipulate, Barrier, Transformation
- Advanced paths: Divination, Summoning, Chronomancy, Release Magic
- Spell modification rules

### Techniques (44 pages)
Battle techniques available at different levels, combat tactics, and special abilities.

### Equipment (26 pages)
- Soul Weapons and Magical Implements
- Soul Guns and attachments
- Armament Runes
- Shards of Power
- Soul Armor Weaves

### Relics (10 pages)
Powerful magical objects with unique properties.

### Monsters (43 pages)
- **Outsiders:** Spectral enemies from Elsewhere (Vassal, Adversary, Nemesis ranks)
- **Cultists:** Mortal servants of the Invading Evil
- Stat blocks with full abilities and traits

### Locations (5 pages)
Lapis City locations, NPCs, and setting information.

### Classes (30 pages)
- Combat Forms (I-X)
- Character creation options
- Herald information

### Lists (5 pages)
- Tactical Formations
- Combination Maneuvers
- Index pages

## Attributes for Character Sheet Integration

Entries designed for drag-and-drop onto character sheets include these attributes:

### Spells
- `name`, `range`, `tier_I-VI_name`, `tier_I-VI_description`, `tier_I-VI_action`, `tier_I-VI_dice`, `tier_I-VI_special`, `Category`

### Techniques
- `name`, `description`, `level_requirement`, `frequency`, `type`, `Category`

### Monsters
- `name`, `HP`, `AC`, `Speed`, `Type`, `Traits`, `Actions`, `Category`

### Equipment
- `name`, `description`, `Category`

## Source Preservation

- **Source files** (`src/*.md`) are **READ ONLY** and remain unchanged
- All generated files are **WRITE ONLY** in this `compendium/` directory
- The conversion script `convert-to-roll20.js` can be re-run to regenerate files

## Regenerating Content

To regenerate the compendium files:

```bash
node convert-to-roll20.js
```

This will:
1. Read all markdown files from `src/`
2. Convert markdown to HTML
3. Parse and structure content
4. Write JSON files to `compendium/`
5. Create/update the manifest

## Version

**Version:** 1.0.0
**Generated:** 2026-01-17
**Total Pages:** 343
