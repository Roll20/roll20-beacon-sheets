# Cypher 2 — official Roll20 Beacon character sheet

Official Beacon character sheet for **Cypher 2** (system family: **Cypher**),
published by **Monte Cook Games**. Built with Vue 3, Pinia, and the Beacon SDK.

## Features

- Full character sentence (descriptor / type / focus, with optional species and
  second descriptor/focus), tier, effort, XP, and pools with edge
- Quick d20 pool rolls and a guided roller with skill selection, assets, a
  situational hindrance counter, effort spending (edge-aware), and live
  cost/ease preview
- Attack rolls from the guided roller, with training, light weapons and the
  attack's own modifier applied as ease, and effort spendable on damage, plus a
  Roll initiative button above the attacks list
- Wound boxes, recovery rolls, shield and armor tracking. A game that uses the
  damage track gets the four-step track in place of the wound boxes, set from
  the Damage & Recovery panel, and an impaired character pays the track's extra
  effort point per level
- A game that uses The Magnus Archives Stress rules gets a Stress column with
  points, levels and worn armor, a Hurt step on the damage track, Stress
  hindrances and burning a Stress level in the guided roller, and a Stress cost
  on an ability's row
- A character with the Lucky descriptor gets a Luck Pool, with points
  allocatable toward a roll's cost from the guided roller
- Reads character files for the Old Gods of Appalachia and The Magnus Archives
  rules as well as Cypher 2, and exports whichever format the character needs
- Skills (with proficiencies), abilities, attacks, cyphers, artifacts, gear,
  and character arcs
- NPC mode: a GM can turn any sheet into a stat block following the Cypher GM's
  Guide
- Token bars: 21 of the sheet's values can drive a token's three bars, including
  each wound tier, a shield's tiers, the Luck Pool, Stress, the damage track,
  recoveries remaining, cyphers carried against the limit, XP, Story XP,
  resource points, tier, effort, superhero rank and an NPC's health. Sixteen
  accept an edit typed into the bubble; five are read-only
- Import and export of character data, and of NPC creature stat blocks
- Genre skins configurable from the sheet's settings
- Drag a page from the Cypher compendium onto the sheet to add an ability,
  skill, cypher, artifact or piece of equipment as a new row

## Development

```bash
npm i
npm run dev      # dev server with an offline relay (browser, no Roll20)
npm run build    # generates the validator, compiles scss, bundles dist/
```

## Structure notes

- The four files in `src/contract/` named `validate.js`, `validateV3.js`,
  `validateCreature.js` and `validateDropPayload.js` are **generated** —
  `prebuild` regenerates them from the three vendored schemas in
  `cypher-contract/`: `cypher-character.schema.json`,
  `cypher-character.schema.v3.json` and `cypher-creature.schema.json`. Edit the
  schemas, not the generated files. A missing schema fails the build by design.
- `public/host.css` is compiled from `src/rollTemplates/host.scss` by
  `npm run build-scss`.
- `changelog.txt` is the player-facing changelog.
