# Variable Cost Stunts

**Date:** 2026-05-04
**Branch:** DW-variableCostStunts
**Asana:** Stunts | Variable Cost Stunts (GID 1212469623028974)

## Overview

Stunt costs in the AGE system are not always a single fixed value. Some stunts let players spend a variable number of stunt points to scale the effect. This feature replaces the current `number`-only stunt cost field with a string that supports three formats, and adds a modal picker when a variable-cost stunt is activated.

## Cost Formats

| Format | Example | Valid options (5 SP available) | Notes |
|--------|---------|-------------------------------|-------|
| Static | `2` | `[2]` | No popup — fires immediately |
| Range | `1-3` | `[1, 2, 3]` | Every integer in range |
| Open-ended | `1+` | `[1, 2, 3, 4, 5]` | Multiples of N up to available SP |
| Open-ended | `2+` | `[2, 4]` | Multiples of N up to available SP |

`N+` means "spend any multiple of N, up to your available SP."

## Parser Utility — `src/utility/spCost.ts`

Two exported functions:

```ts
// Returns array of valid SP amounts the player can spend
parseSpOptions(cost: string, availableSP: number): number[]

// Returns the minimum SP required (for the disabled check)
getMinSpCost(cost: string): number
```

Parsing rules:
- Plain integer (e.g. `"2"`) → `[2]`
- Range `"N-M"` → every integer from N to M inclusive
- Open-ended `"N+"` → `[N, 2N, 3N, ...]` up to and including the largest multiple ≤ availableSP
- If options array is empty (player can't afford minimum), button is disabled

## Data Layer Changes

### Type definitions
- `characterQualitiesStore.ts`: `Quality.spCost?: number` → `spCost?: string`
- `shipStore.ts`: `ShipStuntDef.sp: number` → `sp: string`

### Firebase compatibility
No migration needed. Old numeric values stored in Firebase are read back as numbers; the parser coerces them to strings via `String(cost)` before parsing, so existing data continues to work.

### Input fields
| File | Line | Change |
|------|------|--------|
| `QualitiesModal.vue` | 165 | `type="number"` → `type="text"`, remove `v-model.number`, default `"1"` |
| `ShipStuntsView.vue` | 89 | `type="number"` → `type="text"`, remove `v-model.number` |

### Default on create
`QualitiesModal.vue:12`: `feature.spCost = 1` → `feature.spCost = "1"`

### Sort fix
`ShipStuntsView.vue:151`: `a.sp - b.sp` → `getMinSpCost(a.sp) - getMinSpCost(b.sp)`

### Modifier check fix
`attackDamage.ts:53,67`: `(parent.spCost || 0) <= char.stunts` → `getMinSpCost(String(parent.spCost || "0")) <= char.stunts`

### Attack damage deduction fix
`CharacterAttack.vue:270`: `attackDamage.spCost = Number(attackDmgLabel.spCost)` → `attackDamage.spCost = getMinSpCost(String(attackDmgLabel.spCost))`

This path triggers when damage from a Favored Stunt modifier is printed via the attack section (not via the stunt button). For variable-cost stunts in this path, the minimum cost is deducted — there is no popup since the SP choice was already made when the stunt was activated.

## Modal Component — `src/components/shared/SpCostModal.vue`

- **Props:** `stuntName: string`, `options: number[]`
- **Emits:** `confirm(amount: number)`, `cancel`
- Centered overlay, matches existing modal style in the project
- Shows stunt name, "How many stunt points?" prompt, one button per option, Cancel link

## Button Behavior

### Disabled state (both locations)
```
disabled = char.stunts < getMinSpCost(spCost)
tooltip  = "Not enough stunt points"  (unchanged)
```

### Click — `CharacterQualitiesView.vue`
- **Static cost** (`options.length === 1`): deducts cost, runs existing modifier/damage logic immediately — no UX change
- **Variable cost** (`options.length > 1`): opens `SpCostModal` with valid options; on `confirm(amount)` deducts `amount` then runs existing modifier/damage logic

### Click — `ShipStuntsView.vue`
- **Static cost**: calls `sendStuntToChat` immediately — no UX change
- **Variable cost**: opens `SpCostModal` with valid options; on `confirm(amount)` calls `sendStuntToChat` passing `amount` (shown in chat subtitle as `${amount} SP`)

## Files Changed

| File | Change |
|------|--------|
| `src/utility/spCost.ts` | **New** — parser utility |
| `src/components/shared/SpCostModal.vue` | **New** — SP picker modal |
| `src/sheet/stores/character/characterQualitiesStore.ts` | `spCost` type: `number` → `string` |
| `src/sheet/stores/character/shipStore.ts` | `sp` type: `number` → `string` |
| `src/components/qualities/QualitiesModal.vue` | Input type + default |
| `src/components/qualities/CharacterQualitiesView.vue` | Disabled check + click handler + modal |
| `src/sheet/stores/modifiersCheck/attackDamage.ts` | Modifier SP check |
| `src/components/attack/CharacterAttack.vue` | Attack damage deduction — use min cost instead of `Number()` |
| `src/components/ship/ShipStuntsView.vue` | Input type + disabled check + sort + click handler + modal |

## Out of Scope

- Per-tier descriptions (e.g. showing what 2 SP vs 3 SP does) — the description field is a single text block; splitting it per tier is a separate feature
- `2/4` slash-separated format — not used in the AGE rulebooks, excluded
