# *Phantasy Star Tabletop Roleplaying* Character Sheet for Roll20

The official Roll20 character sheet for *Phantasy Star Tabletop Roleplaying*,
published by Skydawn Game Studios under license from SEGA.

Built on Roll20's Beacon SDK with Vue 3, Pinia and Vite. The sheet covers four character types that can be chosen from the Settings tab:

- **Player character** — standard PC sheet with abilities, skills, features, attacks, techniques, gear and bio.
- **NPC creature** — stat block, with optional Legendary, Boss and Techniques sections.
- **NPC ship** — stat block for NPC starships.
- **Starship** — a shared starship sheet, crewed from the characters aboard it.

The sheet contains no product text. Techniques, items and features can be input manually or dropped in from a compendium.

## Commands

```sh
npm install        # once
npm run dev        # offline preview at http://localhost:5173 (mock relay)
npm run sandbox    # serves the sheet to a Roll20 custom sheet sandbox on port 7620
npm run build      # production build into dist/
npm run lint
```

For `npm run sandbox`, the sandbox game's Sheet.json Editor needs:

```json
{ "advanced": true, "advancedPort": 7620 }
```

## Layout

- `src/rules/` — game mechanics stored as functions.
- `src/stores/` — one Pinia store per saved block of character data.
- `src/components/` — the pages, by sheet type.
- `src/relay/` —  Beacon connection, token bars, macro attributes and campaign options.
- `src/rollTemplates/` —  chat cards; `host.scss` compiles to `host.css`.
- `src/compendium/` — reading compendium pages and pasted stat blocks.

## Credits

© Skydawn Game Studios Inc.  © SEGA.
All rights reserved. Rules: <https://skydawngames.com/phantasystar>

This work includes material taken from the System Reference Document 5.2.1 ("SRD 5.2.1") by
Wizards of the Coast LLC and available at
<https://dnd.wizards.com/resources/systems-reference-document>. The SRD 5.2.1 is licensed
under the Creative Commons Attribution 4.0 International License available at
<https://creativecommons.org/licenses/by/4.0/legalcode>.
