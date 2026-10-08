import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'
// Import cycle (relay.js → handlers.js → drop.js → stores → relay.js): read relay bindings only inside functions, never at module top level.
import { dispatchRef } from '@/relay/relay.js'
import { post } from '@/utility/post.js'
import { createRollTemplate } from '@/rollTemplates/index.js'
import { interpretStatRoll, interpretGuidedRoll, easedSteps, effortCost, rawEffortCost } from '@/dice/rolls.js'
import { guidedRollTemplateData } from '@/rollTemplates/guidedCard.js'
import { recoveryRollTemplateData } from '@/rollTemplates/recoveryCard.js'
import { itemCardTemplateData } from '@/rollTemplates/itemCard.js'
// Contract data, locked to the v3 schema by components/__tests__/contract-enums.test.js,
// which is where every stored enum already lives. enums.js imports nothing, so there is no
// cycle back into the stores.
import { DAMAGE_TRACK_STEPS } from '@/components/enums.js'

// The nine contract arrays, in schema order.
export const ARRAY_KEYS = [
  'skills', 'abilities', 'attacks', 'equipment', 'cyphers',
  'artifacts', 'powerShifts', 'currencies', 'arcs'
]

// Default rows are schema-valid (every `name` has minLength 1), no _id —
// callers stamp one at creation (beacon-mapping §3.2).
export const rowFactories = {
  skills: () => ({ name: 'New skill', rating: 'practiced', pool: null, asset: 0, isProficiency: false, source: '', description: '' }),
  abilities: () => ({ name: 'New ability', cost: null, pools: [], enabler: false, activation: '', source: '', description: '', stressCost: null }),
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

// How long a dropped row stays highlighted (spec ⑥ §4.4, "about two seconds").
export const DROP_HIGHLIGHT_MS = 2000

// The five schemaVersion 3 root fields at their defaults (ddd-xrug, spec §7). A factory,
// not a shared constant: rules is an object the checkboxes mutate in place.
//
// These six values ARE the export predicate. A document holding all of them, with every
// ability row's stressCost null, carries nothing version 3 can express, so exporter.js
// emits version 2 and omits them. Changing a default here changes which version every
// existing character exports as, so change both together or the round-trip law on one
// corpus or the other goes red immediately.
export const v3Defaults = () => ({
  rules: { damageTrack: false, stress: false },
  damageTrack: null,
  luck: null,
  stress: null,
  wearingArmor: false
})

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

  // schemaVersion 3 (ddd-xrug). Carried and persisted whether or not the sheet renders
  // them: phase 1 renders rules and damageTrack only, and dropping luck, stress or
  // wearingArmor here would mean an import followed by an export deleted a player's Luck
  // Pool (spec §2).
  const v3 = v3Defaults()
  const rules = ref(v3.rules)
  const damageTrack = ref(v3.damageTrack)
  const luck = ref(v3.luck)
  const stress = ref(v3.stress)
  const wearingArmor = ref(v3.wearingArmor)

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
    // settingsSeen (ddd-wqx6) is deliberately NOT defaulted here. App adds it the first
    // time a brand-new character opens, and adding it is what changes the dehydrated
    // document so the relay persists a ui branch. A default would change every existing
    // character's payload, which appStore.dehydrate.test.js forbids (NPC spec §5.2).
  })

  // A WHITELIST, not a spread. spec ⑦ §5 drops ui.activeTab rather than mapping it,
  // and `{...ui.value, ...s.ui}` would defeat that: a pre-bead-2 character's stored
  // activeTab would merge straight back in, and since dehydrate() ships ui wholesale
  // it would be re-persisted forever. Unknown keys from a future sheet version are
  // dropped for the same reason — this branch is owned here, not by the payload.
  const UI_KEYS = ['characterSegment', 'kitSegment', 'guidedRoll', 'theme', 'whisperItemCards', 'settingsSeen']

  // Whether the last hydrated document carried a ui branch (ddd-wqx6). Not persisted.
  // Written by the app store's hydrateStore, which also sees the no-attributes case that
  // hydrate() never receives. Defaults true so a store nothing has hydrated, as in
  // tests, reads as an existing character.
  const hasStoredUi = ref(true)

  const arrays = { skills, abilities, attacks, equipment, cyphers, artifacts, powerShifts, currencies, arcs }

  const addRow = (key) => {
    arrays[key].value.push({ _id: uuidv4(), ...rowFactories[key]() })
  }
  const removeRow = (key, id) => {
    const i = arrays[key].value.findIndex((r) => r._id === id)
    if (i >= 0) arrays[key].value.splice(i, 1)
  }

  // Compendium drop (spec ⑥ decision 8). The only write path a drop has: a fresh _id, the
  // row factory, then the payload's item over the top.
  //
  // The factory is what makes the row COMPLETE (ddd-xrug). A drop payload is authored
  // against contract version 2, whose ability branch has no stressCost and forbids extra
  // keys, so a valid ability drop cannot carry one. Spread only the item and the row is
  // short a key the v3 schema requires, and the player's next export is refused.
  //
  // The order is what keeps the page authoritative, and it costs nothing: the payload
  // schema requires every key of its item shape, so a valid payload wins all of them and
  // the factory reaches only the keys that shape does not have.
  //
  // structuredClone so the store shares no object with the parsed payload (§5 "Row copy").
  const addDroppedRow = (list, item) => {
    const _id = uuidv4()
    arrays[list].value.push({ _id, ...rowFactories[list](), ...structuredClone(item) })
    return _id
  }

  // Drop feedback. TRANSIENT, like rollerStat: never in dehydrate(), never exported.
  // Each notice and each announcement carries a sequence number, so the same words
  // twice are still two changes that DropNotice renders and a screen reader announces.
  const dropNotice = ref(null)
  const dropAnnouncement = ref({ seq: 0, text: '' })
  const dropHighlightId = ref(null)
  let noticeSeq = 0
  const showDropNotice = (message) => {
    noticeSeq += 1
    dropNotice.value = { seq: noticeSeq, message }
  }
  const dismissDropNotice = () => {
    dropNotice.value = null
  }
  const announceDrop = (text) => {
    dropAnnouncement.value = { seq: dropAnnouncement.value.seq + 1, text }
  }
  // The timer clears only the id it set, so an older drop's timer cannot remove a newer
  // drop's highlight (§5 "Rapid drops").
  const highlightDroppedRow = (id) => {
    dropHighlightId.value = id
    setTimeout(() => {
      if (dropHighlightId.value === id) dropHighlightId.value = null
    }, DROP_HIGHLIGHT_MS)
  }

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
  // ddd-keb3: the same transient shape for the per-attack entry. Mutually exclusive
  // with rollerSkillId in practice — each entry point refuses while the other's
  // roller is open — and part of the open predicate for the same reason skillId is:
  // an attack whose pool is illegal opens with NO stat.
  const rollerAttackId = ref(null)
  const rollerSession = ref(0)
  const rollerOpen = computed(() =>
    rollerStat.value !== null || rollerSkillId.value !== null || rollerAttackId.value !== null
  )

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

  // Per-attack entry (ddd-keb3). rollSkill's shape: an explicit per-row button is
  // its own opt-in, so it ignores ui.guidedRoll, and an open roller owns the
  // session. Unlike skills there is no exclusion — every attack rolls.
  //
  // attack.pool has NO null branch in the schema, so null, '' or a stray value is
  // ILLEGAL data rather than a legal absence (ddd-644, where it was invisible: a
  // blank select and a dropped card field). It opens on the sentinel with Roll
  // gated, and the modal says why.
  const rollAttack = (attackId) => {
    if (rollerOpen.value) return
    const row = attacks.value.find((r) => r._id === attackId)
    if (!row) return
    rollerSession.value += 1
    rollerAttackId.value = attackId
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

  const rollGuided = async ({ stat, skillId = null, attackId = null, assets = 0, effortLevels = 0, damageEffortLevels = 0, difficulty = null }) => {
    // Resolution-boundary clamps (the modal mirrors both, but no caller may
    // exceed them): Effort ≤ the character's Effort stat; difficulty 0–10.
    // Policy: silent normalization — the card is built from the clamped
    // values, so chat always shows what was actually charged.
    //
    // ddd-keb3: attack Effort and damage Effort are ONE ladder capped at the
    // Effort stat (owner ruling, book). Attack Effort is taken first and damage
    // Effort gets what is left, so an over-ask normalizes downward instead of
    // charging for levels the character cannot apply.
    const levels = Math.min(Math.max(effortLevels, 0), effort.value)
    const damageLevels = attackId === null
      ? 0
      : Math.min(Math.max(damageEffortLevels, 0), Math.max(effort.value - levels, 0))
    const diff = difficulty === null ? null : Math.min(Math.max(Math.floor(difficulty) || 0, 0), 10)

    // Resolved ABOVE the unknown-pool throw below (round-1 plan audit): a stale
    // attack id arriving with an unusable stat must return this structured refusal,
    // which the modal explains in its own words, rather than throwing into the
    // generic "Roll failed" path. Nothing has been reserved at this point.
    const attackRow = attackId === null ? null : (attacks.value.find((r) => r._id === attackId) ?? null)
    if (attackId !== null && !attackRow) return { ok: false, reason: 'attack-missing' }

    // ddd-wc3. Same class as the modal's lookup, one layer down and worse: an
    // ABSENT stat throws on pool.edge below, but a PROTOTYPE key returns a truthy
    // Function and the whole roll goes quietly NaN — two failure modes for one
    // bad input, and the quiet one is the resolution boundary charging Effort
    // against a pool that does not exist. Loud is right HERE (the modal keeps its
    // zero fallback, because a modal that cannot render is worse than one showing
    // an empty pool): this throws above every deduction, so the modal's
    // defence-in-depth catch reports "Roll failed — no points spent" truthfully.
    if (!Object.hasOwn(pools.value, stat)) throw new Error(`rollGuided: unknown pool ${stat}`)

    // Snapshot everything the card will render: after the awaits below, live
    // objects may have been replaced or edited.
    const pool = pools.value[stat]
    const edge = pool.edge
    const poolMax = pool.max
    // The damage-track rule is snapshotted like every other figure the card renders
    // (ddd-xrug). Read live inside cardFor it would let a table toggling the rule
    // mid-roll strip the nudge off a spend that really did empty a Pool, or add one
    // to a roll made under the other rules. The card reports commit-time truth.
    const trackOn = rules.value.damageTrack
    const available = Math.min(pool.current, Math.max(poolMax, 0))
    // Attack mode ignores skillId — the attack row's own skillRating is its
    // training term, and the modal shows no skill picker.
    const row = attackId !== null || skillId === null ? null : (skills.value.find((r) => r._id === skillId) ?? null)
    const skill = row ? { name: row.name, rating: row.rating } : null
    // The attack is snapshotted like everything else the card renders: after the
    // awaits below the row may have been renamed, re-pointed or replaced by a
    // hydrate, and the card must report commit-time truth. The modifier is copied
    // rather than referenced for the same reason — it is a nested object the
    // editor mutates in place.
    const attack = attackRow
      ? {
          name: attackRow.name,
          skillRating: attackRow.skillRating,
          weaponClass: attackRow.weaponClass,
          modifier: attackRow.modifier && typeof attackRow.modifier === 'object'
            ? { ...attackRow.modifier }
            : attackRow.modifier,
          damage: attackRow.damage
        }
      : null
    const eased = easedSteps({
      skillRating: attack ? attack.skillRating : (skill?.rating ?? null),
      weaponClass: attack?.weaponClass ?? null,
      modifier: attack?.modifier ?? null,
      assets,
      effortLevels: levels
    })
    // One ladder for the whole action, Edge subtracted once (book): two levels
    // split between hitting and damage cost 5, not 3 + 3.
    const rawCost = rawEffortCost(levels + damageLevels)
    const cost = effortCost(levels + damageLevels, edge)
    if (cost > available) return { ok: false, reason: 'insufficient-pool' }

    // Reserve — synchronous with the check above; nothing can interleave.
    pool.current -= cost
    const poolAfter = pool.current
    // Did THIS reservation empty the pool (ddd-xrug)? `cost > 0` keeps a zero-cost
    // roll against an already-empty pool silent — the player emptied that one.
    const emptiedByReservation = cost > 0 && poolAfter === 0
    const refund = () => { if (pools.value[stat] === pool) pool.current += cost }
    const rededuct = () => {
      const live = pools.value[stat]
      live.current = Math.max(0, live.current - cost) // pool floor 0, whatever happened meanwhile
    }

    const statLabel = stat.charAt(0).toUpperCase() + stat.slice(1)
    // Card pool figures always come as a PAIR from the same snapshot (4th
    // audit F3): reservation-time by default, live-time whenever a branch
    // reports the live current — never reservation-max with live-current.
    //
    // `emptied` joins them for the same reason and is never inferred from shownAfter:
    // each branch answers "was it above 0 before this deduction and 0 after" for
    // itself, so a branch that forgets defaults to no nudge rather than a wrong one.
    const cardFor = (interp, { refunded = false, shownAfter = poolAfter, shownMax = poolMax, emptied = false } = {}) => createRollTemplate({
      guidedRoll: guidedRollTemplateData({
        statLabel, skill, attack, assets, effortLevels: levels, damageEffortLevels: damageLevels,
        interp, cost, rawCost, edge, poolAfter: shownAfter, poolMax: shownMax, refunded,
        damageTrack: trackOn, emptied
      })
    })

    if (diff !== null && Math.max(0, diff - eased) === 0) {
      const interp = { die: null, beats: null, special: null, eased, difficulty: diff, effective: 0, success: true, autoSuccess: true }
      let posting
      try {
        // Inside try: a SYNCHRONOUS throw from post() must refund like any
        // other failure — never escape with the reservation held (5th audit F3).
        posting = post(cardFor(interp, { emptied: emptiedByReservation }))
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
      return post(cardFor(interpretGuidedRoll({ die, eased, difficulty: diff }),
        { refunded, ...shown, emptied: emptiedByReservation }))
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
          // Read BEFORE the re-deduction (ddd-xrug). rededuct() floors at 0, so a
          // live pool a concurrent hydrate already emptied shows 0 after a
          // re-deduction that took nothing — no line for that one.
          const liveBefore = pools.value[stat].current
          if (!refunded) rededuct()
          const live = pools.value[stat] // settlement-time pair (4th audit F3)
          return post(cardFor(interpretGuidedRoll({ die: lateDie, eased, difficulty: diff }),
            { refunded, shownAfter: live.current, shownMax: live.max, emptied: liveBefore > 0 && live.current === 0 }))
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
    rules: rules.value,
    damageTrack: damageTrack.value,
    luck: luck.value,
    stress: stress.value,
    wearingArmor: wearingArmor.value,
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
    // stressCost is a nullable SCALAR inside a row, where `{ ...defaults, ...row }`
    // preserves an incoming '' (ddd-wbc: Roll20 materializes the Firebase-dropped null as
    // an empty string). An absent key already takes the factory's null above.
    if (key === 'abilities' && out.stressCost !== null && !Number.isInteger(out.stressCost)) {
      out.stressCost = null
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

  // ddd-xrug. damageTrack, luck and stress are three more nullable objects in the ddd-wbc
  // family, and they get a STRICTER heal than shield's in two ways. `typeof [] ===
  // 'object'`, so shield's check accepts an array. A plain-object check alone also accepts
  // a PARTIAL object, so `luck: { current: 1 }` would survive hydrate and reach the export
  // validator with no way for the player to repair it from the sheet.
  //
  // So each is healed by SHAPE: every member present and of the right type, or null. And
  // rebuilt member by member rather than passed through, so an extra key cannot reach an
  // additionalProperties: false export either.
  //
  // `!Array.isArray(v)` inside isPlainObject is UNREACHABLE at all four call sites below.
  // With the shape checks in place an array already fails every one of them: an array has
  // no `step`, `current` or `points` when it came from JSON, and the rules branch rebuilds
  // an array into a value identical to the default anyway. The clause stays as defence in
  // depth for the fourth heal someone writes, because a shared helper named isPlainObject
  // that says yes to an array is a trap, and it costs one token. It carries no test, and
  // no test can be written that fails without it.
  //
  // Nulling a partial object does lose it, and that is still the right trade. hydrate
  // HEALS persisted state, and a partial object cannot have come from this sheet's own
  // dehydrate(). Neither dehydrate nor hydrate runs a validator, so no save is at stake
  // here. The real choice is between silently dropping a field the sheet may give the
  // player no control to rebuild, and an export refusal that names the missing member,
  // because useImportExport.js validates the export and fieldLabels.js labels a
  // `/luck/max` error by field.
  //
  // The stronger reason to null is that not one member of the three is nullable. They are
  // one enum string, two booleans, five integers and two strings, every one required. So
  // the only documented way a stored value loses a key, Firebase dropping a null on write,
  // cannot produce a partial object here. The partial branch guards an undocumented
  // corruption mode rather than a known one. shield sets the precedent by nulling.
  const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
  const int = (v) => Number.isInteger(v)
  const healDamageTrack = (v) =>
    isPlainObject(v) && DAMAGE_TRACK_STEPS.includes(v.step) &&
    typeof v.hurtAvailable === 'boolean' && typeof v.hurt === 'boolean'
      ? { step: v.step, hurtAvailable: v.hurtAvailable, hurt: v.hurt }
      : null
  const healLuck = (v) =>
    isPlainObject(v) && int(v.current) && int(v.max) && int(v.edge) &&
    typeof v.name === 'string' && typeof v.description === 'string'
      ? { current: v.current, max: v.max, edge: v.edge, name: v.name, description: v.description }
      : null
  const healStress = (v) =>
    isPlainObject(v) && int(v.points) && int(v.supernaturalLevels)
      ? { points: v.points, supernaturalLevels: v.supernaturalLevels }
      : null

  // ddd-7ub. Deep copy of a contract document: plain objects and arrays rebuilt,
  // everything else passed through. Deliberately not JSON.parse(JSON.stringify(...)),
  // which would DROP undefined-valued keys — normalizeRow distinguishes a present
  // `cost.points: undefined` from an absent one — and not structuredClone, which
  // refuses Proxies. The contract document is finite and acyclic by schema, so the
  // recursion needs no cycle guard.
  const plainClone = (value) => {
    if (Array.isArray(value)) return value.map(plainClone)
    if (value === null || typeof value !== 'object') return value
    const out = {}
    for (const key of Object.keys(value)) out[key] = plainClone(value[key])
    return out
  }

  const hydrate = (snapshot) => {
    if (!snapshot) return
    // ddd-7ub. The snapshot arriving here is the SAME object the Beacon SDK holds in
    // dispatch.characters[id].attributes, and the SDK's actionHandler merges host
    // changes into it with lodash/merge, which MUTATES its destination in place
    // (actionHandler.js:57). Assigning s.pools — or advancement/wounds/shield, or any
    // nested object inside a row — straight into a ref therefore hands the host a
    // write path into store state that never passes through the Vue proxy: reads see
    // the new data but reactive effects may not fire, so the sheet can show stale
    // values until something unrelated triggers a render. It also lets a test pass by
    // aliasing rather than through the code path under test (the ddd-6qe integration
    // guard had to deep-clone its fake cache to avoid exactly that false green).
    //
    // Cloned ONCE here rather than per key on purpose: a per-key clone list is a thing
    // to keep in step, and the next ref assigned from the snapshot would re-grow the
    // bug silently. Everything below this line is the store's own.
    //
    // NOT structuredClone: it throws DataCloneError on a Proxy, and dehydrate() hands
    // back the store's own reactive objects, so every import → dehydrate → hydrate
    // round trip would fail. plainClone reads through a proxy and rebuilds plain data.
    const s = plainClone(snapshot)
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
    damageTrack.value = healDamageTrack(s.damageTrack)
    luck.value = healLuck(s.luck)
    stress.value = healStress(s.stress)
    // rules and wearingArmor are not nullable, so they cannot arrive as the empty string a
    // stored null does, and ?? against the default is right for the ABSENT case, matching
    // advancement. But ?? also passes a malformed non-null value straight into the export
    // validator, so both get a type check too. `=== true` rather than Boolean(...): the
    // schema requires a real boolean, 'false' is truthy, and reading the string 'false' as
    // true is a worse answer than reading it as false.
    rules.value = isPlainObject(s.rules)
      ? { damageTrack: s.rules.damageTrack === true, stress: s.rules.stress === true }
      : v3Defaults().rules
    wearingArmor.value = s.wearingArmor === true
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
    rules, damageTrack, luck, stress, wearingArmor,
    skills, abilities, attacks, equipment, cyphers, artifacts, powerShifts, currencies, arcs,
    background, notes, ui, hasStoredUi,
    addRow, removeRow,
    addDroppedRow, dropNotice, dropAnnouncement, dropHighlightId,
    showDropNotice, dismissDropNotice, announceDrop, highlightDroppedRow,
    postItem, rollStat, rollerStat, rollerSkillId, rollerAttackId, rollerSession, rollerOpen,
    rollIntent, rollSkill, rollAttack, rollGuided, rollRecovery, dehydrate, hydrate
  }
}

export const useSheetStore = defineStore('sheet', sheetStore)
