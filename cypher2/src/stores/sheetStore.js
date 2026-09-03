import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'
import { dispatchRef, initValues } from '@/relay/relay.js'
import { createRollTemplate } from '@/rollTemplates/index.js'
import { interpretStatRoll, interpretGuidedRoll, easedSteps, effortCost, rawEffortCost } from '@/dice/rolls.js'
import { guidedRollTemplateData } from '@/rollTemplates/guidedCard.js'
import { recoveryRollTemplateData } from '@/rollTemplates/recoveryCard.js'
import { itemCardTemplateData } from '@/rollTemplates/itemCard.js'

// The nine contract arrays, in schema order.
export const ARRAY_KEYS = [
  'skills', 'abilities', 'attacks', 'equipment', 'cyphers',
  'artifacts', 'powerShifts', 'currencies', 'arcs'
]

// Default rows are schema-valid (every `name` has minLength 1), no _id —
// callers stamp one at creation (beacon-mapping §3.2).
export const rowFactories = {
  skills: () => ({ name: 'New skill', rating: 'practiced', pool: null, asset: 0, isProficiency: false, source: '', description: '' }),
  abilities: () => ({ name: 'New ability', cost: null, pools: [], enabler: false, activation: '', source: '', description: '' }),
  attacks: () => ({ name: 'New attack', pool: 'might', weaponClass: 'light', damage: 0, skillRating: 'practiced', range: null, modifier: null, notes: '' }),
  equipment: () => ({ name: 'New equipment', level: null, quantity: 1, notes: '' }),
  cyphers: () => ({ name: 'New cypher', displayName: '', level: null, cypherKind: null, power: null, activated: false, description: '' }),
  artifacts: () => ({ name: 'New artifact', level: null, depletion: null, form: '', description: '' }),
  powerShifts: () => ({ name: 'New power shift', shifts: 1, description: '' }),
  currencies: () => ({ name: 'New currency', amount: 0 }),
  arcs: () => ({ name: 'New arc', description: '', steps: [] })
}

// The recovery track's standard four boxes, in book order (order is positional
// rest duration — beacon-mapping §3.3). A factory, not a shared constant: slot
// objects are mutated in place by the checkboxes.
export const STANDARD_SLOT_KINDS = ['action', 'tenMinutes', 'oneHour', 'tenHours']
export const defaultRecoverySlots = () =>
  STANDARD_SLOT_KINDS.map((kind) => ({ kind, used: false, note: '' }))

const sheetStore = () => {
  // Scalars and nested objects: schema paths verbatim (beacon-mapping §2).
  // Defaults mirror fixtures/valid/blank-tier1.json — pools 10/10/10 and
  // cypherLimit 2 are neutral seeds, wounds 3/3/3 is the book default.
  const blankSentence = () => ({
    descriptor: '', secondDescriptor: '', type: '', focus: '', secondFocus: '', species: ''
  })
  const sentence = ref(blankSentence())
  const tier = ref(1)
  const effort = ref(1)
  const xp = ref(0)
  const storyXp = ref(0)
  const resourcePoints = ref(0)
  const rank = ref(null)
  const advancement = ref({ stats: false, effort: false, edge: false, skill: false, other: false })
  const pools = ref({
    might: { current: 10, max: 10, edge: 0 },
    speed: { current: 10, max: 10, edge: 0 },
    intellect: { current: 10, max: 10, edge: 0 }
  })
  const recovery = ref({ bonus: 1, slots: defaultRecoverySlots() })
  const wounds = ref({
    minor: { current: 0, max: 3 },
    moderate: { current: 0, max: 3 },
    major: { current: 0, max: 3 }
  })
  const shield = ref(null)
  const armor = ref(0)
  const armorModifiers = ref('')
  const cypherLimit = ref(2)
  const genre = ref('')
  const subgenre = ref('')
  const portraitUrl = ref('')

  const skills = ref([])
  const abilities = ref([])
  const attacks = ref([])
  const equipment = ref([])
  const cyphers = ref([])
  const artifacts = ref([])
  const powerShifts = ref([])
  const currencies = ref([])
  const arcs = ref([])

  const background = ref('')
  const notes = ref('')

  // Sheet-local state: outside the contract (beacon-mapping §4).
  // ui is a PRESENTATION branch, not a contract path: dehydrate() ships it alongside
  // the contract paths and hydrate() merges it back, so the two segment keys,
  // guidedRoll and theme persist per character without touching
  // cypher-character.schema.json or the exported document (exporter.js never reads
  // ui). Spec amendment 6; spec ⑦ §2.3 for the activeTab -> two-key replacement.
  const ui = ref({
    characterSegment: 'skills',
    kitSegment: 'attacks',
    guidedRoll: false,
    theme: 'base',
    // Item cards only. Roll cards stay public whatever this says — a sheet whose
    // rolls could go silent would be a different feature (item-contents spec §5).
    whisperItemCards: false
  })

  // A WHITELIST, not a spread. spec ⑦ §5 drops ui.activeTab rather than mapping it,
  // and `{...ui.value, ...s.ui}` would defeat that: a pre-bead-2 character's stored
  // activeTab would merge straight back in, and since dehydrate() ships ui wholesale
  // it would be re-persisted forever. Unknown keys from a future sheet version are
  // dropped for the same reason — this branch is owned here, not by the payload.
  const UI_KEYS = ['characterSegment', 'kitSegment', 'guidedRoll', 'theme', 'whisperItemCards']

  const arrays = { skills, abilities, attacks, equipment, cyphers, artifacts, powerShifts, currencies, arcs }

  const addRow = (key) => {
    arrays[key].value.push({ _id: uuidv4(), ...rowFactories[key]() })
  }
  const removeRow = (key, id) => {
    const i = arrays[key].value.findIndex((r) => r._id === id)
    if (i >= 0) arrays[key].value.splice(i, 1)
  }

  // Visibility is an ARGUMENT, not a store read. post() is shared by the roll cards
  // and the item cards, and only the item cards are governed by ui.whisperItemCards
  // (item-contents spec §5) — a branch that read the flag in here would silence rolls
  // too, and every existing caller would keep compiling.
  const post = (content, { whisper = false } = {}) =>
    dispatchRef.value.post({
      characterId: initValues.character.id,
      content,
      options: { whisper: whisper ? 'gm' : undefined }
    })

  // Post one row's contents to chat (item-contents spec §4.1). The per-list field
  // wording lives in the segment's `contents` descriptor; the shared projection rules
  // live in itemCard.js. This is the seam between them and owns neither.
  const postItem = (list, contents) =>
    post(createRollTemplate({ itemCard: itemCardTemplateData(list, contents) }), {
      whisper: ui.value.whisperItemCards
    })

  // Quick roll: 1d20 on a stat. Reports the ladder; NEVER deducts pool points.

  const rollStat = async (statName) => {
    const { results } = await dispatchRef.value.roll({ rolls: { [statName]: '1d20' } })
    const die = results[statName].results.rolls[0].results[0]
    const stat = statName.charAt(0).toUpperCase() + statName.slice(1)
    return post(createRollTemplate({ statRoll: { stat, ...interpretStatRoll(die) } }))
  }

  // Recovery roll (ddd-5v9; tier inference dropped by ddd-4uhf): recoveries
  // can be used in ANY order — owner ruling — so the card never guesses which
  // slot is being spent. 1d6 + bonus; the card carries the full three-tier
  // wound-removal summary instead. The rollStat shape, not rollGuided's:
  // nothing is mutated — the slot checkboxes stay player-owned manual state —
  // and the bonus is snapshotted BEFORE the await so a mid-flight edit cannot
  // rewrite the card.
  const rollRecovery = async () => {
    const bonus = recovery.value.bonus
    const { results } = await dispatchRef.value.roll({ rolls: { recovery: '1d6' } })
    const die = results.recovery.results.rolls[0].results[0]
    return post(createRollTemplate({ recoveryRoll: recoveryRollTemplateData({ die, bonus }) }))
  }

  // Guided roller (spec ③ + ddd-669y). rollerStat / rollerSkillId /
  // rollerSession are transient UI state — deliberately NOT in dehydrate():
  // a half-open roller must never persist or export.
  //
  // rollerStat alone can no longer express "open": a poolless skill's entry
  // (ddd-669y) opens the roller with NO stat chosen, so the open predicate is
  // rollerOpen and every "an open roller owns the session" guard reads it.
  // rollerSession is the modal's remount key — bumped once per OPEN, stable
  // within one, because the modal's own pool select now writes rollerStat
  // mid-open and a rollerStat-keyed modal would remount and wipe its state on
  // every pool change.
  const rollerStat = ref(null)
  const rollerSkillId = ref(null)
  const rollerSession = ref(0)
  const rollerOpen = computed(() => rollerStat.value !== null || rollerSkillId.value !== null)

  const rollIntent = (statName) => {
    // An open roller owns the session UNCONDITIONALLY (4th audit F2): the
    // guard sits above the toggle branch, so even a hydrate flipping the
    // toggle off mid-open cannot let an intent fall through to a free quick
    // roll behind the modal — and the session-keyed modal never sees a
    // truthy→truthy stat swap that would reuse stale transient state (3rd
    // audit F8).
    if (rollerOpen.value) return
    if (ui.value.guidedRoll) {
      rollerSession.value += 1
      rollerStat.value = statName
      return
    }
    return rollStat(statName)
  }

  // Per-skill entry (ddd-669y): opens the guided roller REGARDLESS of the
  // ui.guidedRoll setting — an explicit per-row button is its own opt-in, the
  // setting only governs what a bare pool click means. The skill's pool
  // preselects when it has one (changeable in the modal — owner ruling);
  // poolless skills open with no stat and the modal gates Roll until one is
  // picked. Proficiencies never roll (MCG §3.6): the row hides the button,
  // and this guard holds when a stale id arrives anyway.
  const rollSkill = (skillId) => {
    if (rollerOpen.value) return
    const row = skills.value.find((r) => r._id === skillId)
    if (!row || row.isProficiency) return
    rollerSession.value += 1
    rollerSkillId.value = skillId
    // Only a LEGAL pool preselects (audit P2): hydrate preserves out-of-enum
    // pool values by design (ddd-9ir), and handing one to rollerStat would
    // enable Roll against a pool that does not exist — rollGuided then throws,
    // and a prototype key like __proto__ would even resolve to an inherited
    // object. Object.hasOwn against the live pools graph, the poolLabel shape;
    // an unknown pool opens on the sentinel and the player picks.
    rollerStat.value = typeof row.pool === 'string' && Object.hasOwn(pools.value, row.pool) ? row.pool : null
  }

  // The roller owns pool costs (spec ① decision). Concurrency policy (audit
  // passes 2–3): the spend is RESERVED synchronously at commit — no await
  // sits between the affordability check and the deduction, so the check can
  // never go stale and the card reports reservation-time truth. Affordability
  // is checked against min(current, max): PoolCard clamps its fields
  // independently, so current > max sheets exist and must not fund Effort
  // with phantom points (3rd audit F2). Reservation and refund are exact
  // ±cost on the SAME pool object — never negative (cost ≤ current by the
  // check). The refund is an exact reversal, but an upward edit of that same
  // object mid-flight can leave current above max afterward — tolerated,
  // like any hand-edited overfull pool. If a mid-flight hydrate replaced
  // the pools graph, the refund is SKIPPED — the newer write wins, like any
  // sheet field (3rd audit F5). Promise.race cannot cancel a Beacon
  // dispatch, so a timeout refunds AND stays subscribed: dice (or an
  // auto-success card) settling late re-deduct and finish, keeping "dice
  // rolled ⇔ points spent" eventually consistent (3rd audit F1). A natural
  // 20 refunds the spend (book rule, 3rd audit F3); a failed post after real
  // dice undoes nothing — the dice hit the table. (Known, out of scope: the
  // spec ② relay debounce can persist a stale pre-hydrate snapshot — a
  // sheet-wide pre-existing race tracked as ddd-ej2; these writes ride that
  // path by design, like every other field.)
  const ROLL_TIMEOUT_MS = 15000
  const TIMEOUT_ERROR = new Error('dispatch timeout')
  const withTimeout = (promise, ms = ROLL_TIMEOUT_MS) => {
    let timer
    return Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(TIMEOUT_ERROR), ms) })
    ]).finally(() => clearTimeout(timer))
  }

  const rollGuided = async ({ stat, skillId = null, assets = 0, effortLevels = 0, difficulty = null }) => {
    // Resolution-boundary clamps (the modal mirrors both, but no caller may
    // exceed them): Effort ≤ the character's Effort stat; difficulty 0–10.
    // Policy: silent normalization — the card is built from the clamped
    // values, so chat always shows what was actually charged.
    const levels = Math.min(Math.max(effortLevels, 0), effort.value)
    const diff = difficulty === null ? null : Math.min(Math.max(Math.floor(difficulty) || 0, 0), 10)

    // Snapshot everything the card will render: after the awaits below, live
    // objects may have been replaced or edited.
    const pool = pools.value[stat]
    const edge = pool.edge
    const poolMax = pool.max
    const available = Math.min(pool.current, Math.max(poolMax, 0))
    const row = skillId === null ? null : (skills.value.find((r) => r._id === skillId) ?? null)
    const skill = row ? { name: row.name, rating: row.rating } : null
    const eased = easedSteps({ skillRating: skill?.rating ?? null, assets, effortLevels: levels })
    const rawCost = rawEffortCost(levels)
    const cost = effortCost(levels, edge)
    if (cost > available) return { ok: false, reason: 'insufficient-pool' }

    // Reserve — synchronous with the check above; nothing can interleave.
    pool.current -= cost
    const poolAfter = pool.current
    const refund = () => { if (pools.value[stat] === pool) pool.current += cost }
    const rededuct = () => {
      const live = pools.value[stat]
      live.current = Math.max(0, live.current - cost) // pool floor 0, whatever happened meanwhile
    }

    const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1)
    // Card pool figures always come as a PAIR from the same snapshot (4th
    // audit F3): reservation-time by default, live-time whenever a branch
    // reports the live current — never reservation-max with live-current.
    const cardFor = (interp, { refunded = false, shownAfter = poolAfter, shownMax = poolMax } = {}) => createRollTemplate({
      guidedRoll: guidedRollTemplateData({
        statLabel, skill, assets, effortLevels: levels, interp, cost, rawCost, edge,
        poolAfter: shownAfter, poolMax: shownMax, refunded
      })
    })

    if (diff !== null && Math.max(0, diff - eased) === 0) {
      const interp = { die: null, beats: null, special: null, eased, difficulty: diff, effective: 0, success: true, autoSuccess: true }
      let posting
      try {
        // Inside try: a SYNCHRONOUS throw from post() must refund like any
        // other failure — never escape with the reservation held (5th audit F3).
        posting = post(cardFor(interp))
        await withTimeout(posting)
      } catch (err) {
        refund()
        // The card may still land after a timeout refund — spend re-applies.
        // Accepted exception (5th audit F2): the card's HTML left with the
        // post at reservation time; late settlement re-deducts the pool but
        // cannot rewrite an already-submitted card — its figures stay the
        // (internally consistent) reservation-time pair.
        // Outer .catch for the same reason as the dice path below: a sync
        // throw from rededuct() rejects the .then-returned promise.
        if (err === TIMEOUT_ERROR) posting.then(() => rededuct(), () => {}).catch(() => {})
        return { ok: false, reason: 'post-failed' }
      }
      return { ok: true }
    }

    // On-time finish: a natural 20 refunds the spend BEFORE the card is
    // built. Non-refunded cards keep reporting reservation-time truth
    // (documented policy); the nat-20 card reports the pool after its refund.
    const finishRoll = (die) => {
      const refunded = die === 20 && cost > 0
      if (refunded) refund()
      const live = pools.value[stat]
      const shown = refunded ? { shownAfter: live.current, shownMax: live.max } : {}
      return post(cardFor(interpretGuidedRoll({ die, eased, difficulty: diff }), { refunded, ...shown }))
    }

    let rolling
    let die
    try {
      // Inside try: a synchronous throw refunds too (5th audit F3). A sync
      // throw can never be TIMEOUT_ERROR, so the late-settlement branch
      // below only runs with `rolling` defined.
      rolling = dispatchRef.value.roll({ rolls: { [stat]: '1d20' } })
      const { results } = await withTimeout(rolling)
      die = results[stat].results.rolls[0].results[0]
    } catch (err) {
      refund()
      if (err === TIMEOUT_ERROR) {
        // Dice may still land after the timeout refund. Re-deduct and post
        // then — except a late natural 20, which nets to zero: the timeout
        // already refunded, so the pool is never touched again.
        rolling.then(({ results }) => {
          const lateDie = results[stat].results.rolls[0].results[0]
          const refunded = lateDie === 20 && cost > 0
          if (!refunded) rededuct()
          const live = pools.value[stat] // settlement-time pair (4th audit F3)
          return post(cardFor(interpretGuidedRoll({ die: lateDie, eased, difficulty: diff }),
            { refunded, shownAfter: live.current, shownMax: live.max }))
        }, () => {}).catch(() => {})
        // ^ outer catch, not inner: a SYNCHRONOUS throw from post() rejects
        // the .then-returned promise, which an inner .catch on post's own
        // promise would never see (7th audit F4).
      }
      return { ok: false, reason: 'dispatch-failed' }
    }
    try {
      await withTimeout(finishRoll(die))
    } catch {
      // Card lost but dice hit the table — the spend (or nat-20 refund) stands.
    }
    return { ok: true }
  }

  // Persistence: contract paths at the attributes root + the ui branch.
  const dehydrate = () => ({
    sentence: sentence.value,
    tier: tier.value,
    effort: effort.value,
    xp: xp.value,
    storyXp: storyXp.value,
    resourcePoints: resourcePoints.value,
    rank: rank.value,
    advancement: advancement.value,
    pools: pools.value,
    recovery: recovery.value,
    wounds: wounds.value,
    shield: shield.value,
    armor: armor.value,
    armorModifiers: armorModifiers.value,
    cypherLimit: cypherLimit.value,
    genre: genre.value,
    subgenre: subgenre.value,
    ...Object.fromEntries(ARRAY_KEYS.map((k) => [k, arrayToObject(arrays[k].value)])),
    background: background.value,
    notes: notes.value,
    portraitUrl: portraitUrl.value,
    ui: ui.value
  })

  // Beacon persistence hardening: Firebase-backed storage drops null-valued
  // keys on write and can hand nested arrays back as numeric-keyed objects,
  // and the VTT host hands them back as '$__$<json>' marker STRINGS in the
  // onInit payload (sandbox ground truth, ddd-bt6). Restore each row to its
  // schema shape — missing fields fall back to the row factory's defaults
  // (which carry the schema's nulls), nested arrays are decoded from either
  // readback form. A complete row passes through unchanged, so
  // import/round-trip behavior is unaffected.
  const ARRAY_MARKER = '$__$'
  const decodeMarkerArray = (v, fallback) => {
    try {
      const parsed = JSON.parse(v.slice(ARRAY_MARKER.length))
      return Array.isArray(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }
  const normalizeRow = (key, row) => {
    const defaults = rowFactories[key]()
    const out = { ...defaults, ...row }
    for (const [field, dv] of Object.entries(defaults)) {
      const v = out[field]
      if (!Array.isArray(dv)) continue
      if (typeof v === 'string' && v.startsWith(ARRAY_MARKER)) {
        out[field] = decodeMarkerArray(v, dv)
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        out[field] = Object.values(v)
      }
    }
    // ability cost is the one nested object with a nullable required member:
    // a dropped cost.points must come back as null, not stay absent.
    if (key === 'abilities' && out.cost && typeof out.cost === 'object' && out.cost.points === undefined) {
      out.cost = { ...out.cost, points: null }
    }
    return out
  }

  // recovery.slots is the one nested array OUTSIDE the row path (beacon-mapping
  // §3.3), so it needs the same Firebase-readback decoding normalizeRow gives
  // row-nested arrays — plus the schemaVersion-1 migration: attributes written
  // by the v1 sheet carry `used` (four booleans) instead of `slots`. Policy
  // (beacon-mapping §5): hydrate HEALS persisted state — no validator runs
  // here, and an unrecoverable slots value must fall back to the standard four
  // rather than brick the export; strict rejection is the importer's job, not
  // hydrate's.
  const normalizeRecovery = (r) => {
    if (!r || typeof r !== 'object') return undefined
    const bonus = typeof r.bonus === 'number' ? r.bonus : 1
    let slots = r.slots
    if (typeof slots === 'string' && slots.startsWith(ARRAY_MARKER)) {
      slots = decodeMarkerArray(slots, [])
    } else if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
      slots = Object.values(slots) // numeric keys iterate ascending — order preserved
    }
    if (!Array.isArray(slots)) slots = []
    slots = slots
      .filter((s) => s && typeof s === 'object')
      .map((s) => {
        const { kind = 'action', used = false, note = '' } = s
        return { kind, used, note }
      })
    if (!slots.length && r.used && typeof r.used === 'object') {
      // v1 shape: the four booleans map to the four standard slots, in order.
      slots = STANDARD_SLOT_KINDS.map((kind) => ({ kind, used: r.used[kind] === true, note: '' }))
    }
    return { bonus, slots: slots.length ? slots : defaultRecoverySlots() }
  }

  const hydrate = (s) => {
    if (!s) return
    // Merge over the blank sentence: pre-v2 attributes carry only four keys, and
    // a clobbering assignment would export a schema-invalid document.
    if (s.sentence) sentence.value = { ...blankSentence(), ...s.sentence }
    tier.value = s.tier ?? tier.value
    effort.value = s.effort ?? effort.value
    xp.value = s.xp ?? xp.value
    storyXp.value = s.storyXp ?? storyXp.value
    resourcePoints.value = s.resourcePoints ?? resourcePoints.value
    // rank/shield: null is the only legal absent state, and Firebase drops
    // null-valued keys on write. The dropped null does NOT come back as a
    // missing key — Roll20's attribute layer materializes it as an EMPTY
    // STRING (ddd-wbc, live-verified), so the heal must be type-checked:
    // `?? null` would pass '' into the store and the export validator.
    rank.value = Number.isInteger(s.rank) ? s.rank : null
    advancement.value = s.advancement ?? advancement.value
    pools.value = s.pools ?? pools.value
    recovery.value = normalizeRecovery(s.recovery) ?? recovery.value
    wounds.value = s.wounds ?? wounds.value
    shield.value = s.shield && typeof s.shield === 'object' ? s.shield : null
    armor.value = s.armor ?? armor.value
    armorModifiers.value = s.armorModifiers ?? armorModifiers.value
    cypherLimit.value = s.cypherLimit ?? cypherLimit.value
    genre.value = s.genre ?? genre.value
    subgenre.value = s.subgenre ?? subgenre.value
    portraitUrl.value = s.portraitUrl ?? portraitUrl.value
    ARRAY_KEYS.forEach((k) => {
      if (s[k]) arrays[k].value = objectToArray(s[k]).map((row) => normalizeRow(k, row))
    })
    background.value = s.background ?? background.value
    notes.value = s.notes ?? notes.value
    const incoming = s.ui ?? {}
    const nextUi = { ...ui.value }
    for (const k of UI_KEYS) if (incoming[k] !== undefined) nextUi[k] = incoming[k]
    ui.value = nextUi
  }

  return {
    sentence, tier, effort, xp, storyXp, resourcePoints, rank,
    advancement, pools, recovery, wounds, shield, armor, armorModifiers, cypherLimit,
    genre, subgenre, portraitUrl,
    skills, abilities, attacks, equipment, cyphers, artifacts, powerShifts, currencies, arcs,
    background, notes, ui,
    addRow, removeRow, postItem, rollStat, rollerStat, rollerSkillId, rollerSession, rollerOpen,
    rollIntent, rollSkill, rollGuided, rollRecovery, dehydrate, hydrate
  }
}

export const useSheetStore = defineStore('sheet', sheetStore)
