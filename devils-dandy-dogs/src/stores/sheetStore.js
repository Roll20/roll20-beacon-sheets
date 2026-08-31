import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'
import { dispatchRef, initValues } from '@/relay/relay.js'
import { createRollTemplate } from '@/rollTemplates/index.js'
import {
  effectivePool as poolFor,
  tierLabel as tierOf,
  interpretTraitRoll,
  temptationResult
} from '@/dice/rolls.js'
import roles from '@/data/ddd-sheet-data.json'
import pacts from '@/data/ddd-pacts.json'

const blankTraits = () => ({ devil: 0, dandy: 0, dog: 0 })
const withId = (obj) => ({ _id: uuidv4(), ...obj })
const findRole = (name) => roles.find((r) => r.role === name)

const sheetStore = () => {
  // Role-template fields
  const role = ref('Custom')
  const traits = ref(blankTraits())
  const drive = ref('')
  const storytellingStyle = ref('')
  const description = ref('')
  const tricks = ref([])
  // Per-dog identity
  const devilsMark = ref({ location: '', description: '' })
  const goal = ref('')
  const packmates = ref('')
  const notes = ref('')
  // Play tracks
  const shadowRends = ref(0)
  const memoryShards = ref(0)
  const memories = ref([])
  const savedPacts = ref([])
  // Roll context
  const mode = ref('narrative')
  // Call & Response. null = no exchange in progress. `tierLabel` and `mode` are
  // SNAPSHOTS: the book freezes the pool for the whole exchange ("keep using the
  // same set of rolls"), so later trait/Shadow Riven/mode edits must not reach in.
  const exchange = ref(null)

  // Derived
  const shadowRiven = computed(() => shadowRends.value >= 3)
  const effectivePool = (trait) => poolFor(traits.value[trait] ?? 0, shadowRiven.value)
  const tierLabel = (trait) => tierOf(traits.value[trait] ?? 0)
  const canUnlockMemory = computed(() => memoryShards.value >= 3)
  const heldCount = computed(() => exchange.value?.dice.filter((d) => !d.spent).length ?? 0)
  const outOfDice = computed(() => Boolean(exchange.value) && heldCount.value === 0)

  // Role selection
  const isDirtyFromTemplate = () => {
    const tpl = findRole(role.value)
    if (!tpl) return false
    const tricksNow = tricks.value.map((t) => ({ name: t.name, text: t.text }))
    return (
      JSON.stringify(traits.value) !== JSON.stringify({ ...blankTraits(), ...tpl.traits }) ||
      drive.value !== tpl.drive ||
      storytellingStyle.value !== tpl.storytellingStyle ||
      description.value !== tpl.description ||
      JSON.stringify(tricksNow) !== JSON.stringify(tpl.tricks)
    )
  }
  const applyRole = (name) => {
    const tpl = findRole(name)
    if (!tpl) return
    role.value = tpl.role
    traits.value = { ...blankTraits(), ...tpl.traits }
    drive.value = tpl.drive
    storytellingStyle.value = tpl.storytellingStyle
    description.value = tpl.description
    tricks.value = tpl.tricks.map((t) => withId({ name: t.name, text: t.text }))
  }
  // Returns false when a confirm is needed (edited template fields would be lost).
  const selectRole = (name, { force = false } = {}) => {
    if (!force && isDirtyFromTemplate()) return false
    applyRole(name)
    return true
  }

  // Tricks
  const addTrick = () => tricks.value.push(withId({ name: '', text: '' }))
  const removeTrick = (id) => {
    const i = tricks.value.findIndex((t) => t._id === id)
    if (i >= 0) tricks.value.splice(i, 1)
  }

  // Tracks
  const setShadowRends = (n) => {
    shadowRends.value = Math.max(0, Math.min(3, Number(n) || 0))
  }
  const unlockMemory = () => {
    if (memoryShards.value < 3) return false
    memoryShards.value -= 3
    memories.value.push(withId({ text: '' }))
    return true
  }
  const addMemory = () => memories.value.push(withId({ text: '' }))
  const removeMemory = (id) => {
    const i = memories.value.findIndex((m) => m._id === id)
    if (i >= 0) memories.value.splice(i, 1)
  }

  // Pacts
  const addPact = (name) => {
    const p = pacts.find((x) => x.name === name)
    if (!p) return
    savedPacts.value.push(withId({ name: p.name, text: p.text }))
  }
  const removePact = (id) => {
    const i = savedPacts.value.findIndex((p) => p._id === id)
    if (i >= 0) savedPacts.value.splice(i, 1)
  }

  // Call & Response
  const findDie = (id) => exchange.value?.dice.find((d) => d._id === id)
  const spendDie = (id) => {
    const die = findDie(id)
    if (die) die.spent = true
  }
  const unspendDie = (id) => {
    const die = findDie(id)
    if (die) die.spent = false
  }
  const endExchange = () => {
    exchange.value = null
  }

  // Beacon integration
  const post = (content) =>
    dispatchRef.value.post({
      characterId: initValues.character.id,
      content,
      options: { whisper: undefined }
    })

  const rollTrait = async (trait) => {
    const pool = effectivePool(trait)
    if (pool < 1) return
    // Snapshot BEFORE the await: a mode/trait edit while the
    // dispatch is in flight must not relabel dice already rolled.
    const rolledTier = tierLabel(trait)
    const rolledMode = mode.value
    const { results } = await dispatchRef.value.roll({ rolls: { [trait]: `${pool}d6` } })
    const faces = results[trait].results.rolls[0].results
    const interpreted = interpretTraitRoll(faces, rolledMode)
    const label = trait.charAt(0).toUpperCase() + trait.slice(1)
    exchange.value = {
      trait: label,
      tierLabel: rolledTier,
      mode: rolledMode,
      // `effect` prose is deliberately not carried: the chat card renders it, and the
      // sheet panel lives in a ~200px column with no room for it.
      dice: interpreted.dice.map((d) => ({
        _id: uuidv4(),
        value: d.value,
        face: d.face,
        label: d.label,
        spent: false
      })),
      // Holds the roll RESULT once one exists, not a flag — hence the name (ddd-4zr, ddd-7qi).
      temptation: null
    }
    return post(createRollTemplate({ traitRoll: { trait: label, tierLabel: rolledTier, ...interpreted } }))
  }

  // In-flight guard for rollTemptation. NOT redundant with `exchange.temptation` — see below.
  const temptationBusy = ref(false)

  const rollTemptation = async () => {
    // Two guards, because they close different holes and neither covers the other's.
    //
    // `temptation` is the BOOK's rule — one Temptation die per Call & Response, never saved for
    // later — but it is only written after the dispatch RESOLVES, so it is still null for the
    // whole in-flight interval. ddd-19n prescribes a UI `:disabled` bound to it and says that
    // "also covers the double-click"; it does not, because it reads false during exactly the
    // window it would need to read true. `temptationBusy` is that window.
    //
    // Without the busy guard, two rolls would leave the sheet showing a symbol that disagrees
    // with the chat card posted above it.
    if (temptationBusy.value || exchange.value?.temptation) return
    temptationBusy.value = true
    try {
      const { results } = await dispatchRef.value.roll({ rolls: { temptation: '1d6' } })
      const value = results.temptation.results.rolls[0].results[0]
      const result = temptationResult(value)
      // Holds the RESULT, not just a flag (ddd-4zr) — the sheet shows the symbol that was rolled,
      // and the value was previously thrown away here. It lives INSIDE `exchange`, which is one
      // top-level key that dehydrate spreads whole, so nothing extra is exposed to
      // updateCharacter's not-a-patch-API semantics (ddd-6qe). Frozen once written — enforced
      // by the guard above, not merely intended.
      if (exchange.value) exchange.value.temptation = { value, band: result.band }
      return post(createRollTemplate({ temptation: result }))
    } finally {
      // `finally`, not a trailing assignment: a dispatch that throws would otherwise leave the
      // flag set and both buttons permanently disabled with no way back — the busy-freeze class
      // of bug ddd-axi shipped and an external audit caught.
      temptationBusy.value = false
    }
  }

  const postTrick = (trick) => post(createRollTemplate({ ability: { kind: 'Trick', name: trick.name, text: trick.text } }))
  const postPact = (pact) => post(createRollTemplate({ ability: { kind: 'Pact', name: pact.name, text: pact.text } }))

  // Persistence
  const dehydrate = () => ({
    role: role.value,
    // Spread to plain objects: a live reactive proxy in the snapshot would
    // let post-dehydrate mutations leak into it (inert today only because
    // Firebase serializes on write).
    traits: { ...traits.value },
    drive: drive.value,
    storytellingStyle: storytellingStyle.value,
    description: description.value,
    tricks: arrayToObject(tricks.value),
    devilsMark: { ...devilsMark.value },
    goal: goal.value,
    packmates: packmates.value,
    notes: notes.value,
    shadowRends: shadowRends.value,
    memoryShards: memoryShards.value,
    memories: arrayToObject(memories.value),
    savedPacts: arrayToObject(savedPacts.value),
    mode: mode.value,
    // Must be present even when null: updateCharacter treats an omitted key as a
    // deletion, so a conditional spread here would silently orphan stored pools.
    exchange: exchange.value
      ? { ...exchange.value, dice: arrayToObject(exchange.value.dice) }
      : null
  })
  const hydrate = (s) => {
    if (!s) return
    role.value = s.role ?? role.value
    traits.value = s.traits ?? traits.value
    drive.value = s.drive ?? drive.value
    storytellingStyle.value = s.storytellingStyle ?? storytellingStyle.value
    description.value = s.description ?? description.value
    tricks.value = s.tricks ? objectToArray(s.tricks) : tricks.value
    devilsMark.value = s.devilsMark ?? devilsMark.value
    goal.value = s.goal ?? goal.value
    packmates.value = s.packmates ?? packmates.value
    notes.value = s.notes ?? notes.value
    shadowRends.value = s.shadowRends ?? shadowRends.value
    memoryShards.value = s.memoryShards ?? memoryShards.value
    memories.value = s.memories ? objectToArray(s.memories) : memories.value
    savedPacts.value = s.savedPacts ? objectToArray(s.savedPacts) : savedPacts.value
    mode.value = s.mode ?? mode.value
    // Explicit assignment, NOT the `?? current` idiom used above: a pool cleared
    // elsewhere arrives here as null, and `??` would resurrect the stale local one.
    //
    // The falsy branch is NOT legacy handling and must stay: `dehydrate` only writes the
    // `exchange` key once this sheet has saved a character, so every brand-new character
    // arrives without it. This is the permanent empty state, not an old shape (ddd-7qi).
    exchange.value = s.exchange
      ? { ...s.exchange, dice: objectToArray(s.exchange.dice) }
      : null
  }

  return {
    role, traits, drive, storytellingStyle, description, tricks,
    devilsMark, goal, packmates, notes,
    shadowRends, memoryShards, memories, savedPacts, mode, exchange, temptationBusy,
    shadowRiven, effectivePool, tierLabel, canUnlockMemory, heldCount, outOfDice,
    roles, pacts,
    selectRole, addTrick, removeTrick,
    setShadowRends, unlockMemory, addMemory, removeMemory,
    addPact, removePact,
    rollTrait, rollTemptation, postTrick, postPact,
    spendDie, unspendDie, endExchange,
    dehydrate, hydrate
  }
}

export const useSheetStore = defineStore('sheet', sheetStore)
