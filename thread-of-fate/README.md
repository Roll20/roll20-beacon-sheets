# The Thread of Fate

The official **Convergence TTRPG** character sheet for **Roll20**, built on the
[Beacon SDK](https://roll20.github.io/beacon-docs/). It pairs a guided, illustrated
character builder with a fully interactive play sheet: attributes, talents, saves,
weapons, and Artes roll directly to Roll20 chat, and core resources are exposed to
token bars and macros.

Built with Vue 3, TypeScript, Vite, Pinia, and SCSS. The sheet runs standalone in a
browser (offline relay) for development and connects to Roll20 through the Beacon
relay in the VTT.

## Features

- **Guided builder** - a ten-step flow (Stats -> Background -> Equipment -> Philosophy ->
  Race -> Class -> Artes -> Bio -> Review) with live validation and an in-world guide.
- **Cinematic intro** - an opening sequence and the "How do you die?" prompt that records
  a defining thread of fate on the character.
- **Interactive play sheet** - click attributes, talents, saving throws, weapons, and
  Artes to roll to chat; track HP, Stamina, Aether, Hit Dice, death saves, and conditions.
- **Roll20 integration** - HP / Stamina / Aether token bars and ability-score macros are
  derived live from the character; themed chat roll templates.
- **Rules reference** - conditions, action economy, damage types, senses, rests, and
  crafting, available in-sheet and on the exported PDF.
- **PDF export** - a filled, print-ready character sheet.
- **Accessibility** - reduced motion, high contrast, adjustable text size, and a
  dyslexia-friendly font, all in the Settings panel.
- **The Crucible (GM forge)** - a Storyteller-facing entity creator (⚒ Crucible mode):
  type one sentence ("a level 8 blackstone war beast for 4 level 7 players") and get a
  playable, Threat-balanced statblock, or build NPCs, monsters, bosses, minions, swarms,
  hazards, traps, and vehicles step by step. Includes the Bestiary Threat Budget math,
  an encounter builder with difficulty derivations, a creature library with scaling and
  templates, GM-only secrets kept off player-visible channels, and Roll20 token bars
  (`crucible_hp` / `crucible_stamina` / `crucible_aether` / `crucible_ap`). Everything is
  fully deterministic and offline; every inferred field is listed as an
  assumption the GM can accept, edit, or reroll. See `docs/CRUCIBLE_AUDIT.md`.

## Getting started

```bash
npm install

npm run dev          # standalone (offline relay) - http://localhost:5173
npm run sandbox      # Roll20 sandbox (staging relay) - http://localhost:7620
```

### Quality gates

```bash
npm run type-check   # vue-tsc
npm run test:unit    # rules-engine + integration tests (Vitest)
npm run lint         # ESLint
npm run format       # Prettier
npm run ci-check     # format + lint + type-check + unit + e2e
```

### Build

```bash
npm run build        # -> dist/sheet.js, dist/sheet.css, dist/host.css
```

These three files are what Roll20 hosts for the sheet (`host.css` styles chat roll
templates).

## Connecting to Roll20

1. Run `npm run sandbox` (serves on port 7620).
2. In the Roll20 [custom sheet sandbox](https://app.roll20.net/sheetsandbox), set the
   sheet.json editor to `{ "advanced": true, "advancedPort": 7620 }`.
3. Launch the game; the sheet connects to the local server.

For releasing the sheet to playtesters and the public via the Beacon community-sheet
repository, see [RELEASING.md](RELEASING.md).

## Architecture

```
src/
  maker/
    draftModel.ts        Character state (build + live play resources) and step order
    types.ts             Domain types
    data/                Game data (attributes, classes, races, philosophies,
                         backgrounds, equipment, aspects, artes, disciplines, reference)
    rules/               Pure rules engine + tests (stats, proficiency, casting,
                         aggregation, weapons, selectors, play state, rolls, PDF)
    store/
      draftStore.ts      Primary store: draft, derived stats, play actions, persistence
      prefsStore.ts      Interface and accessibility preferences
    components/          Shell, steps, play sheet, intro cinematic, modals
    styles/theme.scss    Brand theme and cosmic background
  sheet/stores/index.ts  Beacon master store (dehydrate / hydrate for Roll20)
  relay/                 Beacon relay and computed token-bar / macro bindings
  rolltemplates/         Handlebars chat roll templates + host.css
  main.ts                Entry point
```

The character draft persists to `localStorage` when standalone and to the Roll20
character's attributes (`attributes.draft`) in the VTT.

## Credits

Convergence TTRPG and all associated content © Convergence Studios. Built on Roll20's
[Beacon community sheet](https://github.com/Roll20/roll20-beacon-sheets) framework.
