import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'

import {
  NPC_SHIP_ABILITY_IDS,
  npcManeuverSaveDC,
  initiativeScore,
} from '@/rules/index.js'

const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const blankCrew = () =>
  Object.fromEntries(NPC_SHIP_ABILITY_IDS.map((id) => [id, { mod: 0 }]))

const npcShipStore = () => {
  const size = ref('')
  const notes = ref('')

  const defense = ref(10)
  const speed = ref(0)
  const hull = ref({ current: 0, max: 0 })
  const si = ref({ current: 0, max: 0 })
  const maneuverDefense = ref(10)
  const initiative = ref(0)

  const crew = ref(blankCrew())

  const piloting = ref(0)

  const maneuverSaveDC = ref('')

  const saves = ref([])
  const skills = ref([])
  const sensorRange = ref(0)
  const passivePerception = ref(10)

  const addSave = () => {
    saves.value.push({ _id: uuidv4(), name: '', bonus: 0 })
  }

  const removeSave = (id) => {
    const i = saves.value.findIndex((s) => s._id === id)
    if (i >= 0) saves.value.splice(i, 1)
  }

  const addSkill = () => {
    skills.value.push({ _id: uuidv4(), name: '', bonus: 0 })
  }

  const removeSkill = (id) => {
    const i = skills.value.findIndex((s) => s._id === id)
    if (i >= 0) skills.value.splice(i, 1)
  }

  const traits = ref([])
  const actions = ref([])
  const reactions = ref([])

  const blankEntry = (entryName = '') => ({
    _id: uuidv4(),
    name: entryName,
    text: '',
    isAttack: false,
    attackPower: '',
    range: '',
    damage: '',
    damageType: '',
  })

  const listFor = (kind) =>
    ({ trait: traits, action: actions, reaction: reactions })[kind] ?? actions

  const addEntry = (kind) => {
    listFor(kind).value.push(blankEntry())
  }

  const removeEntry = (kind, id) => {
    const list = listFor(kind).value
    const i = list.findIndex((e) => e._id === id)
    if (i >= 0) list.splice(i, 1)
  }

  const suggestedSaveDC = computed(() => npcManeuverSaveDC(piloting.value))

  const saveDC = computed(() => {
    const typed = String(maneuverSaveDC.value ?? '').trim()
    return typed === '' ? suggestedSaveDC.value : num(typed, suggestedSaveDC.value)
  })

  const saveDCIsCustom = computed(() => saveDC.value !== suggestedSaveDC.value)

  const initiativeValue = computed(() => initiativeScore(initiative.value))

  const crewMods = computed(() =>
    Object.fromEntries(NPC_SHIP_ABILITY_IDS.map((id) => [id, num(crew.value[id]?.mod)])),
  )

  const damageEntry = (entry) =>
    [entry.damage, entry.damageType].filter(Boolean).join(' ')

  const importEntry = ({
    patch = {}, notes: prose,
    saves: v = [], skills: k = [], traits: t = [], actions: a = [], reactions: r = [],
  } = {}) => {
    hydrate(patch)
    if (prose) notes.value = prose
    v.forEach((line) => saves.value.push({ _id: uuidv4(), name: '', bonus: 0, ...line }))
    k.forEach((line) => skills.value.push({ _id: uuidv4(), name: '', bonus: 0, ...line }))
    const append = (list, rows) =>
      rows.forEach((row) => list.value.push({ ...blankEntry(), ...row }))
    append(traits, t)
    append(actions, a)
    append(reactions, r)
  }

  const dehydrate = () => ({
    size: size.value,
    notes: notes.value,
    defense: defense.value,
    speed: speed.value,
    hull: hull.value,
    si: si.value,
    maneuverDefense: maneuverDefense.value,
    initiative: initiative.value,
    crew: crew.value,
    piloting: piloting.value,
    maneuverSaveDC: maneuverSaveDC.value,
    saves: arrayToObject(saves.value),
    skills: arrayToObject(skills.value),
    sensorRange: sensorRange.value,
    passivePerception: passivePerception.value,
    traits: arrayToObject(traits.value),
    actions: arrayToObject(actions.value),
    reactions: arrayToObject(reactions.value),
    crewMods: crewMods.value,
    saveDC: saveDC.value,
  })

  const hydrate = (s = {}) => {
    size.value = s.size ?? size.value
    notes.value = s.notes ?? notes.value
    defense.value = s.defense ?? defense.value
    speed.value = s.speed ?? speed.value
    hull.value = { ...hull.value, ...(s.hull || {}) }
    si.value = { ...si.value, ...(s.si || {}) }
    maneuverDefense.value = s.maneuverDefense ?? maneuverDefense.value
    initiative.value = s.initiative ?? initiative.value
    if (s.crew) {
      crew.value = Object.fromEntries(
        NPC_SHIP_ABILITY_IDS.map((id) => [id, { mod: num(s.crew[id]?.mod, crew.value[id]?.mod ?? 0) }]),
      )
    }
    piloting.value = s.piloting ?? piloting.value
    maneuverSaveDC.value = s.maneuverSaveDC ?? maneuverSaveDC.value
    sensorRange.value = s.sensorRange ?? sensorRange.value
    passivePerception.value = s.passivePerception ?? passivePerception.value
    if (s.saves) saves.value = objectToArray(s.saves)
    if (s.skills) skills.value = objectToArray(s.skills)
    if (s.traits) traits.value = objectToArray(s.traits)
    if (s.actions) actions.value = objectToArray(s.actions)
    if (s.reactions) reactions.value = objectToArray(s.reactions)
  }

  return {
    size, notes,
    defense, speed, hull, si, maneuverDefense, initiative,
    crew,
    piloting, maneuverSaveDC, saves, skills, sensorRange, passivePerception,
    traits, actions, reactions,
    suggestedSaveDC, saveDC, saveDCIsCustom, initiativeValue, crewMods,
    addSave, removeSave, addSkill, removeSkill, addEntry, removeEntry,
    damageEntry, importEntry, dehydrate, hydrate,
  }
}

export const useNpcShipStore = defineStore('npcship', npcShipStore)
