import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  arrayToObject, objectToArray, paragraphsToObject, objectToParagraphs,
} from '@/utility/objectify'
import { refreshTechnique, sameName } from '@/compendium/drops.js'

import {
  blankTechniqueFields,
  groupByRank,
  describeCast,
  refreshFreeCasts,
  rankLabel,
  limitBreachUses,
  ADVANCED_RANK_THRESHOLD,
  MAX_RANK,
  COMBO_MIN_LEVEL,
} from '@/rules/index.js'

import { useCharacterStore } from '@/stores/characterStore.js'

const ADVANCED_RANKS = Array.from(
  { length: MAX_RANK - ADVANCED_RANK_THRESHOLD + 1 },
  (_, i) => ADVANCED_RANK_THRESHOLD + i,
)

const blankAdvancedUsed = () => Object.fromEntries(ADVANCED_RANKS.map((r) => [r, false]))

const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const migrateEntry = (entry) => {
  if (!entry?.techniqueId) return entry
  const { techniqueId, ...rest } = entry
  if (entry.fields?.name) return rest
  const name = String(techniqueId)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return { ...rest, fields: { ...blankTechniqueFields(), name, ...(entry.fields ?? {}) } }
}

const storedEntry = (entry) => ({
  ...entry,
  fields: {
    ...entry.fields,
    text: paragraphsToObject(entry.fields?.text),
    boost: paragraphsToObject(entry.fields?.boost),
  },
})

const loadedEntry = (entry) =>
  entry?.fields
    ? {
      ...entry,
      fields: {
        ...entry.fields,
        text: objectToParagraphs(entry.fields.text),
        boost: objectToParagraphs(entry.fields.boost),
      },
    }
    : entry

const techniqueStore = () => {
  const sheet = useCharacterStore()

  const known = ref([])

  const advancedUsed = ref(blankAdvancedUsed())

  const hasLimitBreach = ref(false)

  const limitBreachesUsed = ref(0)

  const combos = ref([])

  const rowUI = ref({})
  const isRowOpen = (id) => !!rowUI.value[id]?.open
  const isRowEditing = (id) => !!rowUI.value[id]?.editing
  const setRowUI = (id, patch) => {
    rowUI.value[id] = { open: false, editing: false, ...rowUI.value[id], ...patch }
  }

  const lastCast = ref({})
  const lastCastRank = (technique) => lastCast.value[technique._id] ?? technique.rank
  const setLastCast = (technique, castRank) => {
    lastCast.value[technique._id] = castRank
  }


  const techniques = computed(() =>
    known.value
      .map((entry) => {
        if (!entry.fields) return null
        return {
          ...blankTechniqueFields(),
          ...entry.fields,
          _id: entry._id,
          favourite: !!entry.favourite,
          note: entry.note ?? '',
          damage: entry.damage ?? '',
          damageType: entry.damageType ?? '',
          critExtra: entry.critExtra ?? '',
          damage2: entry.damage2 ?? '',
          damage2Type: entry.damage2Type ?? '',
          crit2Extra: entry.crit2Extra ?? '',
          healing: entry.healing ?? '',
          boostDamage: entry.boostDamage ?? '',
          boostDamage2: entry.boostDamage2 ?? '',
          boostHealing: entry.boostHealing ?? '',
          addAbilityMod: !!entry.addAbilityMod,
          saveEffect: entry.saveEffect ?? '',
          freeCasts: entry.freeCasts ?? null,
          countsAsKnown: entry.countsAsKnown !== false,
          showInAttacks: entry.showInAttacks !== false,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank || (a.name || '').localeCompare(b.name || '')),
  )

  const byRank = computed(() => groupByRank(techniques.value))

  const isOffensive = (t) => !!(t.attack || t.damage || t.damage2)

  const techAttacks = computed(() =>
    techniques.value.filter((t) => isOffensive(t) && t.showInAttacks),
  )

  const knownCount = computed(() => techniques.value.filter((t) => t.countsAsKnown).length)

  const maxLimitBreaches = computed(() =>
    hasLimitBreach.value ? limitBreachUses(sheet.techAbilityMod) : 0,
  )
  const limitBreachesLeft = computed(() =>
    Math.max(0, maxLimitBreaches.value - num(limitBreachesUsed.value)),
  )

  const advancedSlots = computed(() => {
    const cap = sheet.advancedRankValue
    if (cap == null || cap < ADVANCED_RANK_THRESHOLD) return []
    return ADVANCED_RANKS.filter((r) => r <= cap).map((rank) => ({
      rank,
      label: rankLabel(rank),
      used: !!advancedUsed.value[rank],
    }))
  })

  const castPlan = (technique, castRank = technique.rank, { useFree = true } = {}) =>
    describeCast({
      baseRank: technique.rank,
      castRank,
      currentTP: num(sheet.tp.current),
      maxTechRank: sheet.maxTechRankValue,
      advancedRank: sheet.advancedRankValue,
      rankUsed: !!advancedUsed.value[castRank],
      freeCasts: useFree ? (technique.freeCasts ?? null) : null,
    })

  const addTechnique = (fields = {}, extras = {}) => {
    const _id = uuidv4()
    known.value.push({
      _id,
      favourite: false,
      note: '',
      ...extras,
      fields: { ...blankTechniqueFields(), ...fields },
    })
    return _id
  }

  const importTechnique = ({ fields = {}, extras = {} } = {}) => {
    const i = known.value.findIndex((e) => sameName(e.fields?.name, fields.name))
    if (i < 0) return { id: addTechnique(fields, extras), updated: false }
    known.value[i] = refreshTechnique(known.value[i], { fields, extras })
    return { id: known.value[i]._id, updated: true }
  }

  const blankCombo = () => ({
    _id: uuidv4(),
    name: '',
    level: COMBO_MIN_LEVEL,
    saveAbility: null,
    damageType: '',
    note: '',
  })

  const addCombo = () => {
    const combo = blankCombo()
    combos.value.push(combo)
    setRowUI(combo._id, { open: true, editing: true })
    return combo._id
  }

  const removeCombo = (id) => {
    const i = combos.value.findIndex((c) => c._id === id)
    if (i >= 0) combos.value.splice(i, 1)
    delete rowUI.value[id]
    delete lastCast.value[id]
  }

  const comboLevel = (combo) => lastCast.value[combo._id] ?? null
  const setComboLevel = (combo, level) => {
    lastCast.value[combo._id] = level
  }

  const addCustom = () => {
    const _id = addTechnique()
    setRowUI(_id, { open: true, editing: true })
  }

  const forget = (id) => {
    const i = known.value.findIndex((e) => e._id === id)
    if (i >= 0) known.value.splice(i, 1)
    delete rowUI.value[id]
    delete lastCast.value[id]
  }

  const toggleFavourite = (id) => {
    const entry = known.value.find((e) => e._id === id)
    if (entry) entry.favourite = !entry.favourite
  }

  const spendForCast = (technique, castRank = technique.rank, { useFree = true } = {}) => {
    const plan = castPlan(technique, castRank, { useFree })
    if (!plan || !plan.allowed || !plan.affordable) return null
    if (plan.free) useFreeCast(technique._id)
    else sheet.tp.current = Math.max(0, num(sheet.tp.current) - plan.cost)
    if (plan.advanced) advancedUsed.value[castRank] = true
    setLastCast(technique, castRank)
    return plan
  }

  const spendForceBreach = (technique, castRank = technique.rank) => {
    const plan = castPlan(technique, castRank)
    if (!plan || !plan.rankSpent || !plan.affordable) return null
    sheet.tp.current = Math.max(0, num(sheet.tp.current) - plan.cost)
    return plan
  }

  const useFreeCast = (id) => {
    const e = known.value.find((x) => x._id === id)
    if (!e?.freeCasts || e.freeCasts.per === 'atWill') return false
    e.freeCasts.used = num(e.freeCasts.used) + 1
    return true
  }

  const restoreFreeCast = (id) => {
    const e = known.value.find((x) => x._id === id)
    if (!e?.freeCasts) return false
    e.freeCasts.used = Math.max(0, num(e.freeCasts.used) - 1)
    return true
  }

  const setFreeCasts = (id, freeCasts) => {
    const e = known.value.find((x) => x._id === id)
    if (!e) return
    e.freeCasts = freeCasts ? { per: 'long', max: 1, used: 0, ...freeCasts } : null
  }

  const setCountsAsKnown = (id, value) => {
    const e = known.value.find((x) => x._id === id)
    if (e) e.countsAsKnown = !!value
  }

  const setShowInAttacks = (id, value) => {
    const e = known.value.find((x) => x._id === id)
    if (e) e.showInAttacks = !!value
  }

  const toggleAdvancedRank = (rank) => {
    advancedUsed.value[rank] = !advancedUsed.value[rank]
  }

  const spendLimitBreach = () => {
    if (limitBreachesLeft.value <= 0) return false
    limitBreachesUsed.value = num(limitBreachesUsed.value) + 1
    return true
  }

  const shortRest = () => {
    known.value.forEach((e) => {
      if (e.freeCasts) e.freeCasts = refreshFreeCasts(e.freeCasts, 'short')
    })
    sheet.restResources('short')
  }

  const longRest = () => {
    known.value.forEach((e) => {
      if (e.freeCasts) e.freeCasts = refreshFreeCasts(e.freeCasts, 'long')
    })
    advancedUsed.value = blankAdvancedUsed()
    limitBreachesUsed.value = 0
    sheet.tp.current = sheet.maxTP
    sheet.fateSpent = 0
    sheet.hp.current = num(sheet.hp.max)
    sheet.hitDiceUsed = 0
    sheet.clearDeathSaves()
    sheet.restResources('long')
  }

  const dehydrate = () => ({
    known: arrayToObject(known.value.map(storedEntry)),
    hasLimitBreach: hasLimitBreach.value,
    advancedUsed: advancedUsed.value,
    limitBreachesUsed: limitBreachesUsed.value,
    combos: arrayToObject(combos.value),
  })

  const hydrate = (s = {}) => {
    if (s.known) known.value = objectToArray(s.known).map(migrateEntry).map(loadedEntry)
    advancedUsed.value = { ...blankAdvancedUsed(), ...(s.advancedUsed || {}) }
    hasLimitBreach.value = s.hasLimitBreach ?? hasLimitBreach.value
    limitBreachesUsed.value = s.limitBreachesUsed ?? limitBreachesUsed.value
    if (s.combos) combos.value = objectToArray(s.combos).map((c) => ({ ...blankCombo(), ...c }))
  }

  return {
    known, advancedUsed, hasLimitBreach, limitBreachesUsed, rowUI, lastCast, combos,
    techniques, byRank, techAttacks, isOffensive, knownCount,
    maxLimitBreaches, limitBreachesLeft, advancedSlots,
    castPlan, addTechnique, importTechnique, addCustom, forget, toggleFavourite,
    isRowOpen, isRowEditing, setRowUI, lastCastRank, setLastCast,
    addCombo, removeCombo, comboLevel, setComboLevel,
    useFreeCast, restoreFreeCast, setFreeCasts, setCountsAsKnown, setShowInAttacks,
    spendForCast, spendForceBreach, toggleAdvancedRank, spendLimitBreach,
    shortRest, longRest, dehydrate, hydrate,
  }
}

export const useTechniqueStore = defineStore('techniques', techniqueStore)
