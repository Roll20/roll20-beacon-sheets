// The ordered <option> lists for the contract's closed enums (ddd-yzx). The POOL
// enum keeps its own home in pools.js, which also owns the degrading label reader.
//
// These are NOT derived from cypher-character.schema.json at runtime, deliberately:
// the schema reaches the sheet only through scripts/build-validator.mjs, which bakes
// it into the generated src/contract/validate.js and exports the validator FUNCTION
// only — the schema object there is module-private. Importing the .json a second time
// would ship a second copy of it in the bundle and sits outside vite's dev-server
// fs.allow root, and a JSON Schema `enum` array carries neither display ORDER nor
// LABELS, both of which these lists decide. So the lists are hand-written and
// __tests__/contract-enums.test.js is the lock: it fails if any of them stops
// matching the schema, or if a <select> stops rendering the list.

// Weakest -> strongest. That order is a UX decision of this sheet's, not the
// schema's — the schema's enum array happens to agree, and the guard test pins
// this spelling literally so a schema reorder can never reshuffle the dropdown.
export const RATINGS = ['inability', 'practiced', 'trained', 'specialized', 'expert']

// Lightest -> heaviest, matching the book's damage ladder. Stored lowercase; the
// <select> shows title case, the chat card prints the raw value ("medium weapon").
export const WEAPON_CLASSES = ['light', 'medium', 'heavy']
export const WEAPON_CLASS_LABELS = { light: 'Light', medium: 'Medium', heavy: 'Heavy' }

// Recovery-track box labels, keyed by $defs.recoverySlot's kind enum (schema v2).
// Shortest -> longest rest, the book's track order. The key set is locked against
// the schema by contract-enums.test.js like every other list here; a slot whose
// stored kind is outside it renders the raw value instead (RecoveryBlock), the
// same honest-degrade rule as poolLabel()/strayOptions.
export const RECOVERY_KIND_LABELS = {
  action: 'Action',
  tenMinutes: '10 min',
  oneHour: '1 hr',
  tenHours: '10 hrs'
}

// Nearest -> farthest, the book's range ladder; 'special' is the catch-all and
// sits last. attack.range is nullable ("— unspecified", treat as immediate per
// the schema note), so the sentinel '' option belongs to the segment, not here.
export const WEAPON_RANGES = ['immediate', 'short', 'long', 'veryLong', 'special']
export const WEAPON_RANGE_LABELS = {
  immediate: 'Immediate',
  short: 'Short',
  long: 'Long',
  veryLong: 'Very long',
  special: 'Special'
}

// cypher vs manifest is BEHAVIORAL, not a label — manifest cyphers are worn or
// wielded rather than one-shot (contract §3.10). Nullable: null = unspecified.
export const CYPHER_KINDS = ['cypher', 'manifest']
export const CYPHER_KIND_LABELS = { cypher: 'Cypher', manifest: 'Manifest' }

// Weakest -> strongest power tiers; 'nonstandard' last (contract §3.10).
// Nullable: 73 of MCG's 189 catalog cyphers carry no power icon.
export const POWER_TIERS = ['low', 'medium', 'high', 'advanced', 'ultra', 'nonstandard']
export const POWER_TIER_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  advanced: 'Advanced',
  ultra: 'Ultra',
  nonstandard: 'Nonstandard'
}

// skill.asset's closed enum (contract §3.5): assets ease like training but
// stack under different rules, capped at 2.
export const SKILL_ASSETS = [0, 1, 2]

// attackModifier.direction's closed enum. The editor folds it into a
// none/eased/hindered mode select ('none' = the schema's null).
export const MODIFIER_DIRECTIONS = ['eased', 'hindered']

// EVERY read of a stored value through a label map goes through here — never
// LABELS[value] directly (ddd-9ir / ddd-5vb audit): hydrate() applies no enum
// validation, and a stored 'constructor' finds the inherited Function on a
// bare lookup, printing its source into the cell. Object.hasOwn + raw-value
// fallback is the poolLabel() rule, shared so no new map can re-grow the bug.
export const enumLabel = (labels, value) => (Object.hasOwn(labels, value) ? labels[value] : value)

// The EDITOR half of the ddd-9ir ruling (ddd-4s3). poolLabel() made the row SUMMARY
// degrade honestly; a <select> had no such fallback, so an out-of-enum stored value
// matched no <option> and the control rendered BLANK — indistinguishable from a
// rendering fault, and pointing at no field in particular while the player is looking
// straight at the broken one. Coercing to a legal value on open was rejected: that is
// a silent WRITE of data the player never asked for, which is the objection ddd-9ir
// was filed over. So the bad value gets an <option> of its own instead, `disabled` —
// the value stays visible and selected, and once the player moves off it, it cannot be
// re-picked. A one-way exit is correct: a legal value must never be replaceable by an
// illegal one.
//
// Returns an ARRAY of 0 or 1 entries so the template can v-for it (ArtifactsSegment's
// summaryCells idiom): a v-if plus an interpolation would evaluate this twice per
// render, the double-read ddd-0k1 removed elsewhere. Zero entries for a legal value is
// what keeps a clean row's option list BYTE-IDENTICAL — contract-enums.test.js asserts
// those lists EQUAL the schema enum, and it must stay unmodified.
//
// null/undefined/'' are excluded deliberately, not incidentally: for skill.pool and
// attack.weaponClass they are the nullable state, a LEGAL value that already owns the
// '— no pool' / '— n/a' sentinel option. Handing it a second, disabled option would
// brand a valid choice as broken. This is the same boundary the summary's `v-if` and
// poolLabel() already draw.
//
// The ⚠ leads so the "this is wrong" signal is the first glyph rendered and cannot be
// clipped away at 280px (docs/sandbox-walkthrough.md item 5); the raw value comes next
// because it is the payload — the one thing telling the player WHAT their file got
// wrong; the parenthetical names the problem last. Nothing here can be mistaken for a
// legal option, which the raw value alone ("psyche") would be.
export const strayOptions = (value, allowed, what) =>
  value === null || value === undefined || value === '' || allowed.includes(value)
    ? []
    : [{ value, text: `⚠ ${value} (not a valid ${what})` }]
