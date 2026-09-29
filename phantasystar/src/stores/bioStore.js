import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'

import {
  DEFAULT_SIZE,
  carryingCapacity,
  describeLoad,
  getLifestyle,
  lifestyleCost,
  normalizeItem,
} from '@/rules/index.js'

import { useCharacterStore } from '@/stores/characterStore.js'

const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const bioStore = () => {
  const sheet = useCharacterStore()

  const appearance = ref('')
  const history = ref('')
  const storyBonds = ref('')
  const languages = ref('')

  const equipment = ref([])

  const size = ref(DEFAULT_SIZE)

  const addItem = () => {
    const item = normalizeItem({
      _id: uuidv4(),
      name: '',
      grade: '',
      quantity: 1,
      weight: '',
      equipped: false,
      notes: '',
    })
    equipment.value.push(item)
    return item._id
  }

  const setEquipped = (id, on) => {
    const item = equipment.value.find((e) => e._id === id)
    if (!item) return
    if (on && (item.itemType === 'armor' || item.itemType === 'shield')) {
      equipment.value.forEach((e) => {
        if (e !== item && e.itemType === item.itemType) e.equipped = false
      })
    }
    item.equipped = !!on
  }

  const removeItem = (id) => {
    const i = equipment.value.findIndex((e) => e._id === id)
    if (i >= 0) equipment.value.splice(i, 1)
  }

  const meseta = ref(0)
  const lifestyle = ref('')
  const expenses = ref('')

  const vehicles = ref([])

  const addVehicle = () => {
    vehicles.value.push({ _id: uuidv4(), name: '', role: '' })
  }

  const removeVehicle = (id) => {
    const i = vehicles.value.findIndex((v) => v._id === id)
    if (i >= 0) vehicles.value.splice(i, 1)
  }

  const totalWeight = computed(() =>
    equipment.value.reduce(
      (sum, item) => sum + num(item.weight) * Math.max(1, num(item.quantity, 1)),
      0,
    ),
  )

  const capacity = computed(() =>
    carryingCapacity(num(sheet.abilities.strength), size.value),
  )

  const load = computed(() =>
    describeLoad(totalWeight.value, num(sheet.abilities.strength), size.value),
  )

  const lifestyleData = computed(() => getLifestyle(lifestyle.value))

  const lifestyleCosts = computed(() => {
    if (!lifestyleData.value) return null
    return {
      day: lifestyleCost(lifestyle.value, 1),
      week: lifestyleCost(lifestyle.value, 7),
      month: lifestyleCost(lifestyle.value, 30),
    }
  })

  const itemCount = computed(() =>
    equipment.value.reduce((n, item) => n + Math.max(1, num(item.quantity, 1)), 0),
  )

  const dehydrate = () => ({
    appearance: appearance.value,
    history: history.value,
    storyBonds: storyBonds.value,
    languages: languages.value,
    size: size.value,
    equipment: arrayToObject(equipment.value),
    meseta: meseta.value,
    lifestyle: lifestyle.value,
    expenses: expenses.value,
    vehicles: arrayToObject(vehicles.value),
  })

  const hydrate = (s = {}) => {
    appearance.value = s.appearance ?? appearance.value
    history.value = s.history ?? history.value
    storyBonds.value = s.storyBonds ?? storyBonds.value
    languages.value = s.languages ?? languages.value
    size.value = s.size ?? size.value
    meseta.value = s.meseta ?? meseta.value
    lifestyle.value = s.lifestyle ?? lifestyle.value
    expenses.value = s.expenses ?? expenses.value
    if (s.equipment) equipment.value = objectToArray(s.equipment).map(normalizeItem)
    if (s.vehicles) vehicles.value = objectToArray(s.vehicles)
  }

  return {
    appearance, history, storyBonds, languages,
    equipment, size, meseta, lifestyle, expenses, vehicles,
    totalWeight, capacity, load, lifestyleData, lifestyleCosts, itemCount,
    addItem, removeItem, setEquipped, addVehicle, removeVehicle,
    dehydrate, hydrate,
  }
}

export const useBioStore = defineStore('bio', bioStore)
