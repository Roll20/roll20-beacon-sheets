# Cypher 2 — official Roll20 Beacon character sheet

Official Beacon character sheet for **Cypher 2** (system family: **Cypher**),
published by **Monte Cook Games**. Built with Vue 3, Pinia, and the Beacon SDK.

## Features

- Full character sentence (descriptor / type / focus, with optional species and
  second descriptor/focus), tier, effort, XP, and pools with edge
- Quick d20 pool rolls and a guided roller with skill selection, assets,
  effort spending (edge-aware), and live cost/ease preview
- Damage track, recovery rolls, shield and armor tracking
- Skills (with proficiencies), abilities, attacks, cyphers, artifacts, gear,
  and character arcs
- Genre skins configurable from the sheet's settings

## Development

```bash
npm i
npm run dev      # dev server with an offline relay (browser, no Roll20)
npm run build    # generates the validator, compiles scss, bundles dist/
```

## Structure notes

- `src/contract/validate.js` is **generated** — `prebuild` regenerates it from
  `cypher-contract/cypher-character.schema.json` (the vendored character-data
  schema). Edit the schema, not the generated file.
- `public/host.css` is compiled from `src/rollTemplates/host.scss` by
  `npm run build-scss`.
