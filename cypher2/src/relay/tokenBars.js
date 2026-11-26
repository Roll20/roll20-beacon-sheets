import { objectToArray } from '@/utility/objectify.js'
import { decodeStoredArray } from '@/utility/storedArray.js'
import { DAMAGE_TRACK_STEPS } from '@/components/enums.js'
import { healthBarGet, healthBarWrite } from '@/creature/creature.js'

/*
Every value a campaign can bind a token bar to.

Roll20 owns the mapping UI. The SDK reports each computed property's `tokenBarValue` and
`readonly` flags to the host (actionHandler.js `computedSummary`), and the host's token
settings dialog is what lets a player point bar1/bar2/bar3 at one of them. So the sheet's
whole half of "let players customise their token" is this list: which values exist, what
each one is called, and which of them a bubble may write back.

Plain functions on plain attributes: no Vue, no Pinia, no DOM. These run HEADLESS on
Roll20, in a sheet instance where no store has ever hydrated (NPC spec §6), which is the
same constraint creature.js was written under and the reason the damage-track and Stress
rules below are re-read from raw attributes rather than from sheetStore.

Three laws hold for every writer here, all three learned the hard way:

  1. Send the WHOLE attributes tree with one branch moved. dispatch.updateCharacter
     jsonDiffs what it is handed against the cached document and treats every OMITTED key
     as a deletion, so a one-field fragment wipes the rest of the character (ddd-6qe).
  2. Never stamp this sheet's own updateId. doUpdate stamps sheetId so the beaconPulse
     watcher can skip its own echo; a token write that inherited it would be swallowed by
     that guard and the open sheet would drift away from the bar (ddd-6qe).
  3. A cleared or garbled bubble writes NOTHING. Mid-combat, silently zeroing a pool or a
     wound track is worse than ignoring the keystroke.

A value that does not apply to this character reads '' — not 0, and not a plausible
default. That is computedHealth's convention for a PC asked for NPC health, and it is the
honest answer for a shield nobody carries or a damage track the table does not use. A
number the host can render is a number the GM will believe.
*/

// Marks a write as token-originated, so the beaconPulse watcher hydrates rather than
// treating it as this sheet's own echo. Any non-sheetId value forces the hydrate; the
// literal is shared so the relay and the bars cannot disagree about it (ddd-6qe).
export const TOKEN_BAR_UPDATE_ID = 'token-bar'

// Standard advancement caps tier and Effort at 6. Neither field is capped in the
// contract, which notes that abilities can raise the Effort limit past it and that `tier`
// is unbounded by the same precedent — so this is the gauge's full-scale mark, never a
// clamp. A character past it reads as a full bar instead of an over-full one.
const STANDARD_ARC_CAP = 6

// Superhero rank's schema bound (contract: integer 1-5, null outside the genre).
const RANK_MAX = 5

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/*
A stored integer. Type-checked rather than `??`-defaulted, because Roll20 hands a dropped
null-valued key back as an EMPTY STRING and a numeric one back as a numeric STRING
(ddd-wbc), and '' sails straight through a nullish default. `null` means unreadable, which
every caller turns into '' rather than into a number.
 */
const readInt = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.trunc(parsed)
  }
  return null
}

// A stored integer, or 0. For the halves of a gauge where an unreadable value should read
// as empty rather than hide the whole bar — a wound track whose max is junk still wants
// to show the wounds that are marked.
const readCount = (value) => Math.max(0, readInt(value) ?? 0)

/*
What a bar bubble was typed into, as an integer, or null to ignore the edit entirely.
Law 3 above: '' and junk are ignored, never coerced to 0. Floor rather than round, which
is the convention clampInt already sets for every hand-edited number on the sheet.
 */
const parseBubble = (raw) => {
  const trimmed = String(raw ?? '').trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? Math.floor(parsed) : null
}

const clampTo = (value, min, max) => Math.min(Math.max(value, min), max)

/*
The one dispatch seam. `nextAttributes` is the WHOLE tree (law 1); null means the write was
refused and nothing is sent. The updateId is stamped here rather than by each writer so a
new bar cannot forget it (law 2).
 */
const writeThrough = async ({ character, dispatch }, nextAttributes) => {
  if (!dispatch?.updateCharacter || !nextAttributes) return
  await dispatch.updateCharacter({
    character: { id: character?.id, attributes: { ...nextAttributes, updateId: TOKEN_BAR_UPDATE_ID } }
  })
}

/* ------------------------------------------------------------------ the three Pools */

// Unchanged behaviour from the accepted ddd-6qe bars, with the reads type-checked through
// readCount: a junk stored `current` used to reach the host as the raw string.
const poolFromCharacter = (character, pool) => {
  const p = character?.attributes?.pools?.[pool]
  return { current: readCount(p?.current), max: readCount(p?.max) }
}

const poolBar = (pool) => ({
  tokenBarValue: true,
  description: `${pool[0].toUpperCase()}${pool.slice(1)} Pool, current and maximum.`,
  get: ({ character }) => poolFromCharacter(character, pool),
  set: async (props, value) => {
    const typed = parseBubble(value)
    if (typed === null) return
    const attributes = props.character?.attributes
    const { max } = poolFromCharacter(props.character, pool)
    await writeThrough(props, {
      ...attributes,
      pools: { ...attributes?.pools, [pool]: { ...attributes?.pools?.[pool], current: clampTo(typed, 0, max) } }
    })
  }
})

/* ------------------------------------------------------- wounds and the shield track */

// Wound and shield tiers are the same contract shape ($defs/woundTier: current and max),
// which is why one factory serves both branches.
const WOUND_TIERS = ['minor', 'moderate', 'major']

/*
A wound bar counts UP. `current` is wounds MARKED, so an unhurt character shows an empty
bar and a dying one shows a full bar — the opposite polarity to a Pool. Exposed as stored
rather than inverted, because the sheet's pips are authoritative and a bar that disagreed
with the pip count would be the worse surprise. The description says so, since the bar is
read on the map by someone who cannot see the pips.
 */
const woundBar = (branch, tier, { nullable = false, label, note }) => ({
  tokenBarValue: true,
  description: `${label} — wounds marked out of the maximum. Fills as damage is taken.${note}`,
  get: ({ character }) => {
    const track = character?.attributes?.[branch]
    if (nullable && !isPlainObject(track)) return ''
    const w = track?.[tier]
    if (nullable && !isPlainObject(w)) return ''
    return { current: readCount(w?.current), max: readCount(w?.max) }
  },
  set: async (props, value) => {
    const typed = parseBubble(value)
    if (typed === null) return
    const attributes = props.character?.attributes
    const track = attributes?.[branch]
    // A shield nobody carries is `null` by contract. Creating one from a token bubble
    // would invent six values the player never set, so the write is refused and the
    // bubble snaps back — the shield is added on the sheet, where its maxima are visible.
    if (nullable && !isPlainObject(track)) return
    const max = readCount(track?.[tier]?.max)
    await writeThrough(props, {
      ...attributes,
      [branch]: { ...track, [tier]: { ...track?.[tier], current: clampTo(typed, 0, max) } }
    })
  }
})

const TIER_LABELS = { minor: 'Minor', moderate: 'Moderate', major: 'Major' }

const woundBars = (branch, prefix, { nullable, what, note }) =>
  Object.fromEntries(
    WOUND_TIERS.map((tier) => [
      `${prefix}${TIER_LABELS[tier]}`,
      woundBar(branch, tier, { nullable, label: `${what} ${TIER_LABELS[tier].toLowerCase()} wounds`, note })
    ])
  )

/* ------------------------------------------------------------------------ Luck Pool */

/*
The fourth Pool the Lucky descriptor grants (ddd-xrug phase 2). `null` when the character
has none, and the object IS the switch — Luck has no rule flag that could disagree with
it, which is how LuckPool.vue gates its own panel. Writable like the three Pools: Luck is
spent at the table.

`edge` is carried in the stored object and deliberately not exposed: the book gives Luck no
Edge and the sheet's Effort maths subtracts Edge once, from the stat Pool being spent, so a
bar for it would show a number that changes nothing.
 */
const luckBar = {
  tokenBarValue: true,
  description: 'Luck Pool, current and maximum. Empty unless the character has a Luck Pool.',
  get: ({ character }) => {
    const luck = character?.attributes?.luck
    if (!isPlainObject(luck)) return ''
    return { current: readCount(luck.current), max: readCount(luck.max) }
  },
  set: async (props, value) => {
    const typed = parseBubble(value)
    if (typed === null) return
    const attributes = props.character?.attributes
    const luck = attributes?.luck
    // Same refusal as the shield: `luck` is additionalProperties:false with all five
    // members required, so a bar that built one from nothing would owe it a name and a
    // description and would export an invalid document.
    if (!isPlainObject(luck)) return
    await writeThrough(props, {
      ...attributes,
      luck: { ...luck, current: clampTo(typed, 0, readCount(luck.max)) }
    })
  }
}

/* --------------------------------------------------------- Stress and the damage track */

// Both of these are schemaVersion 3 branches with a rule flag that is INDEPENDENT of the
// object: the flag can be true with no object at all on a hand-edited or third-party file.
// A bar reads '' unless the flag says the table uses the rule, and writes only when the
// object already exists — turning a rules module on is a sheet act with its own checkbox,
// not something a token bubble should do behind the table's back.
const ruleOn = (attributes, rule) => attributes?.rules?.[rule] === true

/*
Stress points (Magnus Archives, ddd-xrug phase 3). No maximum in the contract, so the bar
carries `current` alone and the host renders the count without a fill. What matters
mechanically is floor(points / 3) hindrance levels; the points are what a player tracks, and
a second derived bar would add a dropdown entry carrying no new information at a glance.
 */
const stressBar = {
  tokenBarValue: true,
  description: 'Stress points. Empty unless the table uses the Stress rule.',
  get: ({ character }) => {
    const attributes = character?.attributes
    if (!ruleOn(attributes, 'stress')) return ''
    const stress = attributes?.stress
    if (!isPlainObject(stress)) return ''
    const points = readInt(stress.points)
    return points === null ? '' : { current: Math.max(0, points) }
  },
  set: async (props, value) => {
    const typed = parseBubble(value)
    if (typed === null) return
    const attributes = props.character?.attributes
    if (!ruleOn(attributes, 'stress')) return
    const stress = attributes?.stress
    if (!isPlainObject(stress)) return
    await writeThrough(props, { ...attributes, stress: { ...stress, points: Math.max(0, typed) } })
  }
}

/*
The damage track as a gauge: hale 0, impaired 1, debilitated 2, dead 3, over the enum's own
best-to-worst order so the bar fills as the character slides down it.

`hurt` is NOT in the number. It is the Magnus half-step between hale and impaired, and
representing it would shift every index on characters who have it — the same bar number
would mean different things on two tokens, which is worse than leaving it to the sheet.

A write clears `hurt`, exactly as every step pip in DamageTrack.vue does. That clearing is
the whole mechanism behind the book's sidebar rule that a character moving back UP the track
lands on hale and never on Hurt, so a bar that preserved `hurt` would quietly break it.
Clicking the step already shown is a no-op there unless `hurt` is set, in which case it is
the way back off the Hurt pip; this mirrors that rule rather than restating it.
 */
const damageTrackBar = {
  tokenBarValue: true,
  description: 'Damage track position: 0 hale, 1 impaired, 2 debilitated, 3 dead. Empty unless the table uses the damage track.',
  get: ({ character }) => {
    const attributes = character?.attributes
    if (!ruleOn(attributes, 'damageTrack')) return ''
    const track = attributes?.damageTrack
    if (!isPlainObject(track)) return ''
    const index = DAMAGE_TRACK_STEPS.indexOf(track.step)
    // A step outside the enum is layer junk, which hydrate nulls the whole track over.
    // '' says so; a plausible 0 would tell the GM the character is hale.
    return index < 0 ? '' : { current: index, max: DAMAGE_TRACK_STEPS.length - 1 }
  },
  set: async (props, value) => {
    const typed = parseBubble(value)
    if (typed === null) return
    const attributes = props.character?.attributes
    if (!ruleOn(attributes, 'damageTrack')) return
    const track = attributes?.damageTrack
    // The first damage-track object is created by the sheet's own pip or rule checkbox,
    // which seed all three members together — a partial object is refused by the export
    // validator and nulled on the way back in, so a bar must not build one.
    if (!isPlainObject(track)) return
    const step = DAMAGE_TRACK_STEPS[clampTo(typed, 0, DAMAGE_TRACK_STEPS.length - 1)]
    if (track.step === step && track.hurt !== true) return
    await writeThrough(props, { ...attributes, damageTrack: { ...track, step, hurt: false } })
  }
}

/* ---------------------------------------------------------------- read-only gauges */

/*
Recoveries left, not recoveries used: a player glancing at a token wants to know what they
still have. Read-only on purpose. The slots are ORDERED and position determines rest
duration, so a typed "2" cannot say which two were spent, and the book's "+2 if the
one-action recovery is taken as your last action" depends on that order.

Three stored shapes are handled by decodeStoredArray, and the v1 `used` object — four
booleans, no `slots` — is read as well, because the headless computed sees the RAW stored
document and a character nobody has opened on this sheet has not been normalised yet.
 */
const readRecoverySlots = (attributes) => {
  const slots = decodeStoredArray(attributes?.recovery?.slots, []).filter(isPlainObject)
  if (slots.length) return slots
  const used = attributes?.recovery?.used
  if (!isPlainObject(used)) return []
  return Object.keys(used).map((kind) => ({ kind, used: used[kind] === true }))
}

const recoveryBar = {
  tokenBarValue: true,
  description: 'Recovery rolls remaining, out of the slots this character has.',
  get: ({ character }) => {
    const slots = readRecoverySlots(character?.attributes)
    if (!slots.length) return ''
    return { current: slots.filter((s) => s.used !== true).length, max: slots.length }
  }
}

/*
Cyphers carried against the character's limit — a real play constraint, since carrying over
the limit has consequences. Read-only: a bubble cannot say which cypher to drop.

objectToArray is the row reader, so the count matches what the sheet lists: stored values
that are not rows are dropped, which is also what keeps a '__proto__'-keyed entry from
counting (ddd-p7by).
 */
const cyphersBar = {
  tokenBarValue: true,
  description: 'Cyphers carried, out of the character’s cypher limit.',
  get: ({ character }) => ({
    current: objectToArray(character?.attributes?.cyphers).length,
    max: readCount(character?.attributes?.cypherLimit)
  })
}

/*
Tier and Effort are a character's standing, not a resource they spend, and they are
READ-ONLY for that reason: an accidental bubble edit to tier cascades into the recovery
bonus default and the Effort cap, silently and off-sheet. They are worth showing on a token
anyway, which is the whole point of a bar you cannot type into.
 */
const arcGauge = (field, description) => ({
  tokenBarValue: true,
  description,
  get: ({ character }) => {
    const value = readInt(character?.attributes?.[field])
    if (value === null || value < 1) return ''
    return { current: value, max: Math.max(value, STANDARD_ARC_CAP) }
  }
})

const rankBar = {
  tokenBarValue: true,
  description: 'Superhero rank, 1 to 5. Empty outside the superhero genre.',
  get: ({ character }) => {
    const value = readInt(character?.attributes?.rank)
    if (value === null || value < 1 || value > RANK_MAX) return ''
    return { current: value, max: RANK_MAX }
  }
}

/* -------------------------------------------------------------------- bare counters */

/*
Counters with no maximum in the contract. They carry `current` alone, so the host shows the
number without a fill — which is what a count of experience should look like.

Writable, unlike tier and Effort: awarding XP mid-session is exactly the kind of thing a GM
does from the token, and the write is unambiguous. Floored at 0 to match the schema.
 */
const counterBar = (field, description) => ({
  tokenBarValue: true,
  description,
  get: ({ character }) => {
    const value = readInt(character?.attributes?.[field])
    return value === null ? '' : { current: Math.max(0, value) }
  },
  set: async (props, value) => {
    const typed = parseBubble(value)
    if (typed === null) return
    await writeThrough(props, { ...props.character?.attributes, [field]: Math.max(0, typed) })
  }
})

/* ------------------------------------------------------------------- the NPC health bar */

/*
Declared for every sheet, because Beacon computed values are sheet-wide: a PC token can pick
it too and reads ''. The rules live in creature.js; this is only the SDK seam.
 */
const healthBar = {
  tokenBarValue: true,
  description: 'NPC health, current and maximum. Empty on a Character-mode sheet.',
  get: ({ character }) => healthBarGet(character?.attributes ?? {}),
  set: async (props, value) => {
    await writeThrough(props, healthBarWrite(props.character?.attributes ?? {}, value))
  }
}

/* ------------------------------------------------------------------------------ the map */

/*
KEY ORDER is the order the host's bar dropdown offers them in, so the three Pools and NPC
health lead — the four a table reaches for first, and the four that have been bound in live
campaigns since ddd-6qe.

KEY NAMES ARE AN API. A token's bar binding is stored by property key, so renaming one
breaks every token already pointed at it in every campaign. The first four are pinned by
exactly that history and must never be respelled. `description` is additive and safe to
revise: the host shows it beside the key, and no binding is made through it.
 */
export const tokenBars = {
  might: poolBar('might'),
  speed: poolBar('speed'),
  intellect: poolBar('intellect'),
  health: healthBar,

  ...woundBars('wounds', 'wounds', {
    nullable: false,
    what: 'Body',
    note: ''
  }),
  ...woundBars('shield', 'shield', {
    nullable: true,
    what: 'Shield',
    note: ' Empty unless the character carries a shield.'
  }),

  luck: luckBar,
  stress: stressBar,
  damageTrack: damageTrackBar,

  recoveryRolls: recoveryBar,
  cyphersCarried: cyphersBar,

  xp: counterBar('xp', 'Experience points.'),
  storyXp: counterBar('storyXp', 'Story XP, tracked separately from XP. 0 when the game does not use it.'),
  resourcePoints: counterBar('resourcePoints', 'Resource points (RP). 0 when the game does not use it.'),

  tier: arcGauge('tier', 'Character tier. Read-only; advance on the sheet.'),
  effort: arcGauge('effort', 'Effort the character can apply. Read-only; advance on the sheet.'),
  rank: rankBar
}

// Kept as named exports: the pools and health were the whole of this module's job before
// the bar set was widened, and both the relay and its tests reach for them by name.
export const computedPools = {
  might: tokenBars.might,
  speed: tokenBars.speed,
  intellect: tokenBars.intellect
}
export const computedHealth = tokenBars.health
