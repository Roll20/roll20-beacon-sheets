import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'
import { rollDamage } from '@/utility/rolls.js'

/*
 * Inventaire du PJ : armes de mêlée, armes à distance, munitions, armures, équipement.
 * Chaque section est un tableau de lignes (sections répétables de la fiche legacy).
 */

const newMelee = () => ({
  _id: uuidv4(),
  name: '',
  dmgDice: 0,
  dmgType: 0,
  dmgMod: 0,
  lvl: 1,
  weight: 0,
  price: '',
  wear: true,
  effect: 0,
  effectPct: 0,
  effectTurnsDice: 0,
  effectTurnsType: 0,
  effectTurnsMod: 0,
  effectDmgMod: 0
})

const newDist = () => ({
  ...newMelee(),
  _id: uuidv4(),
  range: 0,
  munRemain: 0,
  munTotal: 0
})

const newMunition = () => ({ ...newMelee(), _id: uuidv4(), qty: 0 })

const newArmor = () => ({
  _id: uuidv4(),
  name: '',
  pa: 0,
  lvl: 0,
  coveredParts: '0',
  weight: 0,
  price: '',
  wear: true
})

const newEqp = () => ({
  _id: uuidv4(),
  name: '',
  qty: 0,
  weight: 0,
  price: '',
  location: '',
  wear: true
})

const inventoryStore = () => {
  const melee = ref([])
  const dist = ref([])
  const munitions = ref([])
  const armor = ref([])
  const equipment = ref([])

  // Poids total porté (équipement uniquement, qty * poids unitaire).
  const totalEqpWeight = computed(() =>
    equipment.value.reduce((sum, e) => sum + (Number(e.qty) || 0) * (Number(e.weight) || 0), 0)
  )

  const add = (listRef, factory) => listRef.value.push(factory())
  const remove = (listRef, id) => {
    const i = listRef.value.findIndex((x) => x._id === id)
    if (i >= 0) listRef.value.splice(i, 1)
  }

  const dehydrate = () => ({
    melee: arrayToObject(melee.value),
    dist: arrayToObject(dist.value),
    munitions: arrayToObject(munitions.value),
    armor: arrayToObject(armor.value),
    equipment: arrayToObject(equipment.value)
  })

  const hydrate = (data = {}) => {
    melee.value = objectToArray(data.melee) || melee.value
    dist.value = objectToArray(data.dist) || dist.value
    munitions.value = objectToArray(data.munitions) || munitions.value
    armor.value = objectToArray(data.armor) || armor.value
    equipment.value = objectToArray(data.equipment) || equipment.value
  }

  return {
    melee,
    dist,
    munitions,
    armor,
    equipment,
    totalEqpWeight,
    addMelee: () => add(melee, newMelee),
    removeMelee: (id) => remove(melee, id),
    addDist: () => add(dist, newDist),
    removeDist: (id) => remove(dist, id),
    addMunition: () => add(munitions, newMunition),
    removeMunition: (id) => remove(munitions, id),
    addArmor: () => add(armor, newArmor),
    removeArmor: (id) => remove(armor, id),
    addEqp: () => add(equipment, newEqp),
    removeEqp: (id) => remove(equipment, id),
    rollDamage,
    dehydrate,
    hydrate
  }
}

export const useInventoryStore = defineStore('inventory', inventoryStore)
