import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'
import { rollEnyllion, rollDamage } from '@/utility/rolls.js'

/*
 * Onglet Nécromancie : parties du corps, organes, âmes, morts-vivants créés.
 */

export const BODY_PARTS = [
  ['head', 'Tête'],
  ['torso', 'Torse'],
  ['arms', 'Bras'],
  ['legs', 'Jambes']
]

export const ORGANS = [
  ['skin', 'Peau'],
  ['brain', 'Cerveau'],
  ['heart', 'Coeur'],
  ['stomach', 'Estomac'],
  ['lungs', 'Poumons'],
  ['liver', 'Foie'],
  ['intestines', 'Intestins']
]

const newSoul = () => ({ _id: uuidv4(), counter: 0, type: '', level: 0 })

const newUndead = () => ({
  _id: uuidv4(),
  name: '',
  level: 0,
  dmgDice: 0,
  dmgType: 0,
  dmgMod: 0,
  hp: 0,
  description: '',
  FO: 0,
  DEX: 0,
  CON: 0,
  PO: 0
})

const makeParts = (defs) =>
  reactive(defs.reduce((acc, [key]) => ((acc[key] = { counter: 0, notes: '' }), acc), {}))

const necromancyStore = () => {
  const bodyParts = makeParts(BODY_PARTS)
  const organs = makeParts(ORGANS)
  const minorSoulCounter = ref(0)
  const minorSoulHeal = ref(0)
  const souls = ref([])
  const undead = ref([])

  const removeFrom = (listRef, id) => {
    const i = listRef.value.findIndex((x) => x._id === id)
    if (i >= 0) listRef.value.splice(i, 1)
  }

  // Jets des morts-vivants (caractéristique propre, sans malus santé) + attaque.
  const rollUndeadCarac = (u, key, label) => {
    const carac = parseInt(u[key], 10) || 0
    return rollEnyllion({ name: label, sub: u.name, carac })
  }
  const rollUndeadAttack = (u) =>
    rollDamage({
      name: `${u.name} — Dégâts`,
      dmgDice: u.dmgDice,
      dmgType: u.dmgType,
      dmgMod: u.dmgMod,
      effect: 0
    })

  const dehydrate = () => ({
    bodyParts: JSON.parse(JSON.stringify(bodyParts)),
    organs: JSON.parse(JSON.stringify(organs)),
    minorSoulCounter: minorSoulCounter.value,
    minorSoulHeal: minorSoulHeal.value,
    souls: arrayToObject(souls.value),
    undead: arrayToObject(undead.value)
  })

  const hydrate = (data = {}) => {
    if (data.bodyParts) Object.keys(bodyParts).forEach((k) => data.bodyParts[k] && Object.assign(bodyParts[k], data.bodyParts[k]))
    if (data.organs) Object.keys(organs).forEach((k) => data.organs[k] && Object.assign(organs[k], data.organs[k]))
    minorSoulCounter.value = data.minorSoulCounter ?? minorSoulCounter.value
    minorSoulHeal.value = data.minorSoulHeal ?? minorSoulHeal.value
    souls.value = objectToArray(data.souls) || souls.value
    undead.value = objectToArray(data.undead) || undead.value
  }

  return {
    bodyParts,
    organs,
    minorSoulCounter,
    minorSoulHeal,
    souls,
    undead,
    addSoul: () => souls.value.push(newSoul()),
    removeSoul: (id) => removeFrom(souls, id),
    addUndead: () => undead.value.push(newUndead()),
    removeUndead: (id) => removeFrom(undead, id),
    rollUndeadCarac,
    rollUndeadAttack,
    dehydrate,
    hydrate
  }
}

export const useNecromancyStore = defineStore('necromancy', necromancyStore)
