# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Roll20 Beacon SDK character sheet for the AGE (Adventure Game Engine) system, supporting multiple product lines: Fantasy AGE (1e/2e), Modern AGE, Blue Rose, The Expanse, and Threefold. It is built with Vue 3, TypeScript, Pinia, and Vite, and runs embedded in Roll20's VTT via the Beacon SDK.

## Commands

```sh
npm install          # Install dependencies
npm run dev          # Offline dev server at http://localhost:5173 (mock relay, no VTT connection)
npm run sandbox      # Build SCSS then serve on port 7620 for Roll20 sandbox/VTT connection
npm run build        # Build for production (outputs sheet.js and sheet.css to dist/)
npm run test:unit    # Run Vitest unit tests
npm run lint         # ESLint with auto-fix
npm run format       # Prettier format src/
npm run type-check   # TypeScript check
npm run watch-scss   # Watch and build roll template CSS
npm run ci-check     # Full check: format + lint + type-check + unit tests + e2e tests
```

For sandbox VTT testing, add to sheet.json editor in game settings:
```json
{ "advanced": true, "advancedPort": 7620 }
```

## Architecture

### Beacon SDK Integration (`src/relay/`)

The Beacon SDK bridges the sheet and Roll20's VTT. The key file is `src/relay/relay.ts`, which:
- Calls `initRelay(relayConfig)` with handlers and computed properties
- Exports `initValues` (reactive object holding character, settings, compendiumDrop)
- Exports `createRelay()` which returns `relayPinia` (hydrates/dehydrates Pinia stores) and `relayVue` (provides dispatch to Vue)
- In dev mode (`npm run dev`), uses a stub relay that logs to console instead of connecting to VTT

Handler implementations are in `src/relay/handlers/handlers.ts`. Computed token bar values (healthPoints, magicPoints, stuntPoints) are defined in `src/relay/handlers/computed.ts`.

**Important**: Roll template actions do not have access to Pinia stores — data must be passed through dispatch or the character object.

### Store Architecture (`src/sheet/stores/`)

`src/sheet/stores/index.ts` defines the master `useAgeSheetStore` (`examplesheetStore`), which aggregates all sub-stores and exposes `hydrateStore` / `dehydrateStore` for serialization to/from Roll20's Firebase. Each sub-store implements `hydrate()` and `dehydrate()` methods.

Sub-stores:
- `meta/` — character name, avatar, bio, GM notes, permissions, campaignId
- `settings/` — game system, campaign mode, sheet toggles (whisper, aim, guard, reroll), theme
- `bio/` — character type (PC/NPC/Ship), background fields
- `abilityScores/` — ability scores with focuses
- `character/` — XP, stunt points, character qualities, ship data (`shipStore.ts`)
- `attack/` — attack list
- `magic/` — spells/magic
- `inventory/` — equipment/items
- `conditions/`, `conditions/customConditions` — conditions tracking
- `modifiers/`, `enhancements/` — stat modifiers and enhancements

### View Routing (`src/views/`)

`App.vue` is the root, conditionally rendering:
- `NewSplashView` — game system selector shown on first load (until `settings.gameSystem` is set)
- `PCView` — player character sheet
- `NPCView` — NPC sheet
- `ShipView` — ship sheet (Expanse only, when `bio.type === 'Ship'`)

> **Note on the Vue Router:** `src/router/index.ts` is installed in `main.ts` but `App.vue` does not include a `<router-view>`. The router routes are inert scaffolding from the initial project template and do not render in the live sheet. `src/views/SheetView.vue` is an old debug scaffold. Do not add logic to the router — use conditional rendering in `App.vue` instead.

### Game System Theming (`src/utility/productLineStyle.ts`)

`productLineStyle(gameSystem, lightDark, args?)` applies CSS classes and CSS custom properties (`--theme-primary`, `--theme-secondary`) to `document.body` based on the active game system. Game-specific SCSS lives in `src/sheet/scss/product/` (e.g., `fage.scss`, `expanse.scss`, `mage.scss`).

Supported game systems: `fage1e`, `fage2e`, `mage`, `blue rose`, `expanse`, `threefold`. The Expanse additionally themes by `originFaction` (earth/mars/belters/transportUnion).

### SCSS Structure (`src/sheet/scss/`)

- `index.scss` — main entry, imports all partials
- `product/` — per-game-system styles (fage, mage, bluerose, expanse, etc.)
- `icons/` — tab and UI icon styles
- `inputs.scss`, `scale/`, `characterType/` — shared layout styles
- `utilities.scss` — shared single-purpose utility classes (`age-form-field`, `age-row`, `age-cell-center`, `age-btn-icon`, `age-nowrap`, `age-section-block`, `age-icon-right`, etc.) that replaced inline `style=""` attributes during the 2026-06 cleanup. Add new utilities here for any recurring pattern; do not add inline styles to components.
- Roll template styles are compiled separately: `src/rolltemplates/styles/host.scss` → `public/host.css`

### Path Alias

`@` is aliased to `src/` throughout the codebase.

### Build Output

Production build outputs to `dist/` as `sheet.js` and `sheet.css` (CSS is not split). The base path uses `VITE_SHEET_PATH` and `VITE_SHEET_SHORT_NAME` environment variables.

## Dead Code Policy

- **No commented-out code blocks.** If code is no longer needed, delete it — git history preserves it. Large comment blocks are frequently stale and make files hard to read.
- **No backup file copies.** Files like `Foo-old.vue` or `Foo copy.vue` are not allowed. Use git branches or tags instead.
- **No production `console.log`.** All `console.log` calls must be gated behind a `logMode` flag (as in `relay.ts`'s `doUpdate`) or removed before merging. The `devRelay` stub in `relay.ts` is an acceptable exception.
- **No scaffold boilerplate.** Files generated by `npm create vue@latest` (e.g., `src/stores/counter.ts`, `src/components/icons/Icon*.vue`) that are not used by the sheet must be deleted.
- **No inline `style=""` attributes.** All CSS belongs in SCSS. One-off styles go in `<style scoped>` at the component level. Recurring layout utilities belong in `src/sheet/scss/utilities.scss`.

## How Roll20 Stores Data

Roll20 persists character data as a flat JSON object in Firebase. Understanding the serialization shape is essential when adding new fields or stores.

### Top-Level Firebase Shape

```
{
  name: string,           // character name (from metaStore)
  bio: string,            // character biography HTML (from metaStore)
  gmNotes: string,        // GM notes (from metaStore)
  avatar: string,         // avatar URL (from metaStore)
  attributes: {
    meta: { ... },        // campaignId
    settings: { settings: { ... } },
    bio: { bio: { ... } },
    abilityScores: { abilityScores: { ... } },
    character: { character: { ... } },
    attack: { ... },
    spells: { ... },
    inventory: { inventory: { ... } },
    conditions: { ... },
    customConditions: { ... },
    modifiers: { ... },
    enhancements: { ... },
    ships: { ... },
    quality: { ... },
  }
}
```

Each sub-store's `dehydrate()` return value is stored at `attributes[storeId]`. The master store (`src/sheet/stores/index.ts`) loops all sub-stores and assembles this shape. Meta fields (`name`, `bio`, `gmNotes`, `avatar`) are special-cased directly onto the root character object.

### Arrays Must Be Stored as Keyed Objects

Firebase does not support sparse arrays. Any list of items (inventory, attacks, spells, conditions, etc.) **must be converted to a keyed object** before saving, and converted back to an array on hydration.

Use the helpers in `src/utility/objectify.ts`:
- `arrayToObject(array)` — converts `[{ _id, ...rest }]` → `{ [_id]: { ...rest, arrayPosition: index } }`
- `objectToArray(object)` — reverses the above, restores ordering via `arrayPosition`, filters out deleted slots

Every list item **must have a `_id` field** (use `uuidv4()` when creating). The `arrayPosition` field is managed automatically by `arrayToObject` and should not be set manually.

**Example — dehydrate:**
```ts
customMovements: arrayToObject(customMovements.value ?? [])
```

**Example — hydrate:**
```ts
const arr = stored ? objectToArray(stored) : [];
customMovements.value = arr.map((m: any) => ({ _id: m._id ?? uuidv4(), ... }));
```

### Hydrate Pattern

Every `hydrate()` uses `??` (nullish coalescing) against the current store value as the fallback, so missing/undefined fields in Firebase don't clobber existing in-memory state:

```ts
xp.value = hydrateStore.character.xp ?? xp.value;
```

Never use `||` for hydration — it would also overwrite valid falsy values like `0` or `false`.

### Adding a New Persisted Field

1. Add the field to the store's `*Hydrate` type.
2. Initialize the `ref` with a sensible default.
3. Add it to `dehydrate()` — use `arrayToObject()` if it's a list.
4. Add it to `hydrate()` with `?? currentValue` fallback — use `objectToArray()` if it's a list.
5. No changes needed in `src/sheet/stores/index.ts` unless adding an entirely new sub-store.

### Adding a New Sub-Store

1. Create the store file with `hydrate()` and `dehydrate()` methods.
2. Import and add it to the `stores` map in `src/sheet/stores/index.ts`.
3. The master store's `hydrateStore` / `dehydrateStore` loop will automatically include it, saving to `attributes[storeId]`.

## Ship System (The Expanse only)

Ships are only displayed when `settings.gameSystem === 'expanse'` AND `bio.type === 'Ship'`. The ship view renders `ShipView.vue` in place of `PCView`/`NPCView`.

### Ship Store Data Schema (`src/sheet/stores/character/shipStore.ts`)

The ship store is registered as `ships` in the master store. Its Firebase shape (after `dehydrate()`):

```
attributes.ships: {
  type: string,
  length: number,            // meters — drives size category via computedShipSize
  sensorsBase: number,
  sensorsCurrent: number,
  drive: { [uuid]: { type: string, arrayPosition: number } },
  weapons: { [uuid]: { name: string, offline: boolean, arrayPosition: number } },
  crew: { [uuid]: { name, primaryRole, ability: { [uuid]: { ability, value, focus, focusDbl, arrayPosition } }, arrayPosition } },
  qualityFlaws: { [uuid]: { name, description, arrayPosition } },
  shipStunts: { commander: number, pilot: number, engineer: number, gunner: number, sensor: number }
}
```

All list fields use `arrayToObject`/`objectToArray` for serialization. Size category is computed from length via a built-in size table (Tiny → Titanic).

### Crew Roles and Expected Ability Scores

| Role | Ability | Focus |
|------|---------|-------|
| Commander | Communication | Leadership |
| Pilot | Dexterity | Piloting |
| Engineer | Intelligence | Engineering |
| Sensors | Intelligence | Technology |
| Gunner | Accuracy | Gunnery |

Ship stunt types match roles: `commander`, `pilot`, `engineer`, `gunner`, `sensor` (note: role is "sensors" but stunt key is "sensor" — inconsistency to be aware of).

### Ship Combat Roll Formulas (from rulebook)

All four ship action rolls use `3d6` as the base. The correct formulas are:

| Action | Roll Formula | Target Number |
|--------|-------------|---------------|
| Electronic Warfare | 3d6 + Intelligence + Technology focus + `sensorsBase` | 11 |
| Evasion | 3d6 + Dexterity + Piloting focus + maneuverability penalty + reactor penalty | 10 + attacking ship's `sensorsBase` |
| Point Defense | 3d6 + `sensorsCurrent` | 10 + attacking ship's `sensorsBase` (+2 if PDCs fired this round = 12) |
| Damage Control | 3d6 + Intelligence + Engineering focus | TN 11, advanced test ST 5 (one loss) / ST 10 (two losses) |

**Electronic Warfare winner** gets a bonus equal to half the Drama Die result (round up). The winning crew decides whether it applies to defensive actions or to the TN for enemies evading their ship's attacks that round. This bonus is session-state (not persisted).

**Evasion modifiers that stack onto the roll:**
- Each Maneuverability loss condition: **-1** per stack to Dexterity (Piloting)
- Reactor Offline serious loss: **-2** flat to evasion rolls
- High-G maneuver option: **+1 to +6** bonus chosen by pilot — but also grants the same bonus to OTHER ships evading this ship's attacks that round

**Torpedo evasion special rules:**
- Medium range torpedoes: TN = **12** + attacking ship's Sensors (not 10)
- Long range torpedoes: **cannot be evaded** — point defense only

**Point Defense special rule:**
- If PDCs were used to attack this round, TN increases by **+2** (becomes 12 + enemy sensors)

**Damage Control** is an advanced test — it cannot eliminate Collateral or Hull losses, only Maneuverability, Sensors, and Weapons losses.

### Loss Conditions System (needs implementation)

Loss conditions are the ship damage state. Each is a stackable counter (max 6 per type). They must be added to `ShipHydrate` and wired into `hydrate()`/`dehydrate()`.

**Normal losses** (each stack reduces incoming damage by 1d6, imposes 2 conditions):

| Loss | Effect on Rolls |
|------|----------------|
| `collateral` | Crew takes 1d6 damage (not a roll modifier — triggers a crew injury event) |
| `hull` | **-1 per stack** to Hull score totals when rolling hull dice |
| `maneuverability` | **-1 per stack** to Dexterity (Piloting) rolls — affects Evasion |
| `sensors` | **-1 per stack** to `sensorsCurrent` — affects EW and Point Defense |
| `weaponsSystem` | **-1 per stack** to TN when evading attacks from those weapons; **-1** to weapon damage |
| `weapon` | One individual weapon goes offline (`offline: true` on that weapon entry) |

**Serious losses** (two losses = 2d6 reduction + 4 conditions OR one serious loss):

| Serious Loss | Effect |
|-------------|--------|
| `reactorOffline` | Main drive offline (no High-G maneuvers); **-2** to all evasion rolls |
| `weaponSystemOffline.railguns` | All rail guns non-functional |
| `weaponSystemOffline.torpedoes` | All torpedoes non-functional |
| `weaponSystemOffline.pdcs` | All PDCs non-functional |

**D6 random loss table** (for reference in UI or roll template):
1 = Collateral, 2 = Hull, 3 = Maneuverability, 4 = Sensors, 5 = Weapons System*, 6 = Weapon*
(*re-roll 5 or 6 if ship has no weapons)

**Proposed store shape for losses** (to add to `ShipHydrate` and shipStore):
```ts
losses: {
  collateral: number;       // 0–6
  hull: number;             // 0–6, each = -1 to Hull total
  maneuverability: number;  // 0–6, each = -1 to Dexterity (Piloting)
  sensors: number;          // 0–6, each = -1 to sensorsCurrent
  weaponsSystem: number;    // 0–6, each = -1 to weapon evasion TN and damage
  weapon: number;           // 0–6, tracked via weapon.offline flags
  reactorOffline: boolean;  // serious: -2 to evasion, no High-G
  weaponSystemOffline: {
    railguns: boolean;
    torpedoes: boolean;
    pdcs: boolean;
  };
}
```

**`sensorsCurrent` should be computed** as `sensorsBase - losses.sensors` rather than stored independently.

### Computed Modifiers for `ships.ts`

`src/sheet/stores/modifiersCheck/ships.ts` is currently empty. It needs to export computed penalties derived from the loss conditions above, consumed by `printRoll()`:

```ts
// Penalties to pass as roll components
maneuverabilityPenalty: computed(() => -losses.maneuverability)
sensorsCurrent:         computed(() => sensorsBase - losses.sensors)
evasionPenalty:         computed(() => losses.reactorOffline ? -2 : 0)
hullPenalty:            computed(() => -losses.hull)  // applied when rolling hull dice
```

### Weapon Store Fields (need expansion)

Current weapon object only has `{ _id, name, offline }`. Based on the rules, weapons also need:

```ts
type: 'railgun' | 'torpedo' | 'pdc';   // determines which weaponSystemOffline flag applies
range: 'close' | 'medium' | 'long';    // weapon's effective range band
damage: string;                          // dice formula e.g. "3d6"
attacksPerRound: number;
special?: string;
```

The `offline` flag is set either by a **Weapon** loss condition (individual weapon) or by **Weapon System Offline** serious loss (all of that type). The roll system should skip offline weapons.

### High-G Maneuvering (Pilot action — not yet in sheet)

When a pilot declares a High-G maneuver (+1 to +6 bonus):
- Add chosen bonus to the Evasion roll
- The same bonus applies as a penalty to OTHER ships evading this ship's attacks that round (session state, not persisted)
- All crew must make Constitution (Stamina) vs TN `8 + maneuver bonus`:
  - Failure: `1d6` penetrating damage per point of bonus (round down)
  - Success: half that damage (rounded down)
  - Juice users can absorb via Fatigued/Exhausted conditions before Injured/Wounded

### Roll Template Notes

No ship-specific roll template exists yet. When implementing ship rolls via `rollToChat`, consider:
- EW, Evasion, Point Defense are standard opposed/TN rolls — `ageRoll.hbs` or `basicRoll.hbs` can work
- Damage Control is an **advanced test** (success threshold) — may need a dedicated template or a `rollType: 'damageControl'` branch in an existing template
- The Drama Die result matters for EW (half round up = EW bonus) — ensure the stunt die value is accessible post-roll

### Known Gaps and In-Progress Areas

The following are known incomplete or inconsistent areas in the ship system. Do not assume these are bugs to fix without checking with the developer first — they represent work in progress:

- **`printRoll()` `rollToChat` call is commented out** — ship rolls only log to console. The roll formulas above are the correct target implementation.

- **`src/sheet/stores/modifiersCheck/ships.ts` is empty** — no modifiers computed yet. See "Computed Modifiers" section above.

- **Loss conditions not yet persisted** — `ShipHydrate` has stubs for `conditions` and `modifiers` but they are not wired into `hydrate()`/`dehydrate()`. The losses schema above is the intended design.

- **`hullBase`/`hullCurrent`** are in `ShipHydrate` type but not wired. Hull should track a dice formula (e.g. `"2d6"`) and the `hull` loss count should apply as a penalty when rolling it.

- **Weapon fields incomplete** — `ShipWeaponsSection.vue` renders type/range/damage fields but they are not in the store type or persisted.

- **Weapon `offline` toggle** has no UI in `ShipWeaponsSection.vue`. It should be settable both manually and automatically via loss conditions.

- **No ship-specific relay handlers** — ship state syncs via the generic `onChange` cycle, same as all other data.

- **Crew `ability` field** typed as `Record<string, {}>` but actual structure is `{ [uuid]: { ability, value, focus, focusDbl, arrayPosition } }`. The type should be updated to reflect this.

- **Stunt key naming** — role is called `"sensors"` in the crew UI but the stunt key is `"sensor"` (no s). Inconsistency to resolve when wiring loss conditions.

## Planned Features (Not Yet Active)

### Legacy Sheet Migration (`src/utility/legacyAdapter.ts`)

An adapter to import character data from the old Roll20 sheet format (repeating_* attributes) into the Beacon SDK store. All function bodies are currently commented out. The module is imported nowhere in the live sheet. When implementing:

1. Uncomment and complete the function bodies.
2. Wire up in `src/relay/handlers/handlers.ts` `onInit` (not in `App.vue`).
3. Add a `isLegacyData(attributes)` guard so migration only runs once on first load.
4. Test against a real old-format character from the Roll20 API.

## Known Issues

> **Known typo:** `settings.incomeMode` uses the string value `'recources'` (misspelled — missing the 's') for non-FAGE games. This value is persisted in Firebase. Fixing the spelling requires a migration in `settingsStore.ts`'s `hydrate()` method to remap the old value. Do not silently correct the spelling in new code without the migration.
