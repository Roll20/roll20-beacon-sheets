# Cypher 2 — official Roll20 Beacon character sheet

Official Beacon character sheet for **Cypher 2** (system family: **Cypher**),
published by **Monte Cook Games**. Built with Vue 3, Pinia, and the Beacon SDK.

## Features

- Full character sentence (descriptor / type / focus, with optional species and
  second descriptor/focus), tier, effort, XP, and pools with edge
- Quick d20 pool rolls and a guided roller with skill selection, assets,
  effort spending (edge-aware), and live cost/ease preview
- Attack rolls from the guided roller, with training, light weapons and the
  attack's own modifier applied as ease, and effort spendable on damage
- Damage track, recovery rolls, shield and armor tracking
- Skills (with proficiencies), abilities, attacks, cyphers, artifacts, gear,
  and character arcs
- NPC mode: a GM can turn any sheet into a stat block following the Cypher GM's
  Guide, with health linkable to a token bar
- Import and export of character data, and of NPC creature stat blocks
- Genre skins configurable from the sheet's settings

## Development

```bash
npm i
npm run dev      # dev server with an offline relay (browser, no Roll20)
npm run build    # generates the validator, compiles scss, bundles dist/
```

## Structure notes

- `src/contract/validate.js` and `src/contract/validateCreature.js` are
  **generated** — `prebuild` regenerates them from
  `cypher-contract/cypher-character.schema.json` and
  `cypher-contract/cypher-creature.schema.json` (the vendored character- and
  creature-data schemas). Edit the schemas, not the generated files.
- `public/host.css` is compiled from `src/rollTemplates/host.scss` by
  `npm run build-scss`.
- `changelog.txt` is the player-facing changelog.
