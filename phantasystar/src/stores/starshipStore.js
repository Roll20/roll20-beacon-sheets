import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'

import {
  CREW_ROLES,
  CREW_ROLE_IDS,
  blankCrewMember,
  normalizeCrewMember,
  seatStats,
  assignCrewMember,
  pilotingBonus,
  maneuverSaveDC,
  maneuverDefenseSeat,
  maneuverDefense,
  shipDefense,
  maxHullPoints,
  maxStructuralIntegrity,
  weaponAttackPower,
  patchRepairFormula,
  zeroHullSaveDC,
  siLossThreshold,
  PATCH_REPAIR_MAX_DICE,
  STARSHIP_KIND_IDS,
  vehicleAttackPower,
  vehicleControlBonus,
} from '@/rules/index.js'

const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const blankStations = () => Object.fromEntries(CREW_ROLE_IDS.map((id) => [id, '']))

const roleName = (roleId) => CREW_ROLES.find((r) => r.id === roleId)?.name ?? ''

const starshipStore = () => {
  const owner = ref('')
  const kind = ref('starship')
  const isVehicle = computed(() => kind.value === 'vehicle')
  const setKind = (next) => {
    kind.value = STARSHIP_KIND_IDS.includes(next) ? next : 'starship'
  }
  const size = ref('')
  const crewCapacity = ref('')
  const actionStations = ref('')
  const description = ref('')

  const roster = ref([])

  const stations = ref(blankStations())

  const memberById = (id) => (id ? roster.value.find((m) => m._id === id) : undefined)

  const crew = computed(() =>
    Object.fromEntries(
      CREW_ROLE_IDS.map((id) => [id, seatStats(memberById(stations.value[id]))]),
    ),
  )

  const addCrewmember = () => {
    roster.value.push(blankCrewMember(uuidv4()))
  }

  const removeCrewmember = (id) => {
    const i = roster.value.findIndex((c) => c._id === id)
    if (i >= 0) roster.value.splice(i, 1)
    for (const role of CREW_ROLE_IDS) if (stations.value[role] === id) stations.value[role] = ''
    for (const w of weapons.value) if (w.gunnerId === id) w.gunnerId = ''
  }

  const baseDefense = ref(0)
  const maneuverability = ref(0)
  const defenseModifier = ref(0)
  const baseHullPoints = ref(0)
  const baseStructuralIntegrity = ref(0)
  const hullDie = ref('d10')
  const hullDiceTotal = ref(0)
  const interceptSpeed = ref('')
  const sensorRange = ref('')

  const defenseMisc = ref(0)
  const maneuverDefenseMisc = ref(0)

  const hullCurrent = ref(0)
  const siCurrent = ref(0)
  const patchRepairsUsed = ref(0)

  const controlSpeed = ref('')
  const strSave = ref(0)
  const conSave = ref(0)
  const immunities = ref('')

  const specialFeatures = ref('')
  const defenseSystems = ref('')
  const resistances = ref('')

  const weapons = ref([])

  const blankWeapon = () => ({
    _id: uuidv4(),
    gunnerId: '',
    name: '',
    range: '',
    damage: '',
    damageType: '',
    addDexToDamage: false,
    notes: '',
  })

  const addWeapon = () => {
    weapons.value.push(blankWeapon())
  }

  const removeWeapon = (id) => {
    const i = weapons.value.findIndex((w) => w._id === id)
    if (i >= 0) weapons.value.splice(i, 1)
  }

  const pilot = computed(() => crew.value.pilot)
  const copilot = computed(() => crew.value.copilot)
  const maneuverDefenseMember = computed(() => maneuverDefenseSeat(pilot.value, copilot.value))
  const technician = computed(() => crew.value.technician1)

  const gunnerOf = (weapon) => seatStats(memberById(weapon?.gunnerId))

  const pilotingBonusValue = computed(() =>
    pilotingBonus(pilot.value.dexterity, pilot.value.saveBonus, pilot.value.proficient),
  )

  const maneuverSaveDCValue = computed(() =>
    maneuverSaveDC(pilot.value.dexterity, pilot.value.saveBonus, pilot.value.proficient),
  )

  const maneuverDefenseValue = computed(() =>
    maneuverDefense(
      maneuverDefenseMember.value.wisdom,
      pilot.value.saveBonus,
      pilot.value.proficient,
      maneuverDefenseMisc.value,
    ),
  )

  const defenseValue = computed(() =>
    shipDefense({
      baseDefense: baseDefense.value,
      maneuverability: maneuverability.value,
      pilotDexMod: pilot.value.dexterity,
      misc: defenseMisc.value,
    }),
  )

  const initiativeBonus = computed(() => num(pilot.value.dexterity))

  const maxHull = computed(() =>
    isVehicle.value
      ? Math.max(0, num(baseHullPoints.value))
      : maxHullPoints(baseHullPoints.value, defenseModifier.value, technician.value.intelligence),
  )

  const controlBonusValue = computed(() =>
    vehicleControlBonus(pilot.value.dexterity, pilot.value.saveBonus, pilot.value.proficient),
  )

  const maxSi = computed(() =>
    maxStructuralIntegrity(baseStructuralIntegrity.value, technician.value.wisdom),
  )

  const siThreshold = computed(() => siLossThreshold(maxHull.value))

  const zeroHullDC = computed(() => zeroHullSaveDC(siCurrent.value))

  const isDisabled = computed(() => num(hullCurrent.value) <= 0)
  const isDestroyed = computed(() => maxSi.value > 0 && num(siCurrent.value) <= 0)

  const patchRepair = computed(() =>
    patchRepairFormula({
      hullDie: hullDie.value,
      dice: PATCH_REPAIR_MAX_DICE,
      technicianWisMod: technician.value.wisdom,
    }),
  )

  const weaponPower = (weapon) => {
    const gunner = gunnerOf(weapon)
    return isVehicle.value
      ? vehicleAttackPower(gunner.dexterity, gunner.attackBonus, gunner.proficient)
      : weaponAttackPower(gunner.dexterity, gunner.saveBonus, gunner.proficient)
  }

  const clearRole = (roleId) => {
    if (roleId in stations.value) stations.value[roleId] = ''
  }

  const spendSi = (points = 1) => {
    const spend = Math.max(0, num(points))
    siCurrent.value = Math.max(0, num(siCurrent.value) - spend)
    return spend
  }

  const applyRepair = (healed) => {
    hullCurrent.value = Math.min(maxHull.value, num(hullCurrent.value) + num(healed))
    patchRepairsUsed.value = num(patchRepairsUsed.value) + 1
    return hullCurrent.value
  }

  const fullRepair = ({ restoreSi = false } = {}) => {
    hullCurrent.value = maxHull.value
    patchRepairsUsed.value = 0
    if (restoreSi) siCurrent.value = maxSi.value
  }

  const isBlank = () =>
    !num(baseDefense.value) && !num(baseHullPoints.value) && !weapons.value.length

  const importEntry = ({ stats = {}, weapons: rows = [], kind: pageKind = 'starship' } = {}) => {
    const fresh = isBlank()
    setKind(pageKind)
    const fields = {
      size, crewCapacity, actionStations, baseDefense, maneuverability, defenseModifier,
      baseHullPoints, baseStructuralIntegrity, hullDie, hullDiceTotal, interceptSpeed, sensorRange,
      specialFeatures, defenseSystems, resistances, controlSpeed, strSave, conSave, immunities,
    }
    for (const [key, target] of Object.entries(fields)) {
      if (stats[key] !== undefined) target.value = stats[key]
    }
    weapons.value = rows.map((row, i) => ({
      ...blankWeapon(),
      ...row,
      gunnerId: weapons.value[i]?.gunnerId ?? '',
    }))
    if (fresh) {
      hullCurrent.value = maxHull.value
      siCurrent.value = maxSi.value
    }
    return { updated: !fresh }
  }

  const dehydrate = () => ({
    owner: owner.value,
    kind: kind.value,
    controlSpeed: controlSpeed.value,
    strSave: strSave.value,
    conSave: conSave.value,
    immunities: immunities.value,
    size: size.value,
    crewCapacity: crewCapacity.value,
    actionStations: actionStations.value,
    description: description.value,
    crew: crew.value,
    roster: arrayToObject(roster.value),
    baseDefense: baseDefense.value,
    maneuverability: maneuverability.value,
    defenseModifier: defenseModifier.value,
    baseHullPoints: baseHullPoints.value,
    baseStructuralIntegrity: baseStructuralIntegrity.value,
    hullDie: hullDie.value,
    hullDiceTotal: hullDiceTotal.value,
    interceptSpeed: interceptSpeed.value,
    sensorRange: sensorRange.value,
    defenseMisc: defenseMisc.value,
    maneuverDefenseMisc: maneuverDefenseMisc.value,
    hullCurrent: hullCurrent.value,
    siCurrent: siCurrent.value,
    patchRepairsUsed: patchRepairsUsed.value,
    specialFeatures: specialFeatures.value,
    defenseSystems: defenseSystems.value,
    resistances: resistances.value,
    weapons: arrayToObject(weapons.value),
  })

  const hydrate = (s = {}) => {
    owner.value = s.owner ?? owner.value
    if (s.kind !== undefined) setKind(s.kind)
    controlSpeed.value = s.controlSpeed ?? controlSpeed.value
    strSave.value = s.strSave ?? strSave.value
    conSave.value = s.conSave ?? conSave.value
    immunities.value = s.immunities ?? immunities.value
    size.value = s.size ?? size.value
    crewCapacity.value = s.crewCapacity ?? crewCapacity.value
    actionStations.value = s.actionStations ?? actionStations.value
    description.value = s.description ?? description.value
    hydrateCrew(s)
    baseDefense.value = s.baseDefense ?? baseDefense.value
    maneuverability.value = s.maneuverability ?? maneuverability.value
    defenseModifier.value = s.defenseModifier ?? defenseModifier.value
    baseHullPoints.value = s.baseHullPoints ?? baseHullPoints.value
    baseStructuralIntegrity.value = s.baseStructuralIntegrity ?? baseStructuralIntegrity.value
    hullDie.value = s.hullDie ?? hullDie.value
    hullDiceTotal.value = s.hullDiceTotal ?? hullDiceTotal.value
    interceptSpeed.value = s.interceptSpeed ?? interceptSpeed.value
    sensorRange.value = s.sensorRange ?? sensorRange.value
    defenseMisc.value = s.defenseMisc ?? defenseMisc.value
    maneuverDefenseMisc.value = s.maneuverDefenseMisc ?? maneuverDefenseMisc.value
    hullCurrent.value = s.hullCurrent ?? hullCurrent.value
    siCurrent.value = s.siCurrent ?? siCurrent.value
    patchRepairsUsed.value = s.patchRepairsUsed ?? patchRepairsUsed.value
    specialFeatures.value = s.specialFeatures ?? specialFeatures.value
    defenseSystems.value = s.defenseSystems ?? defenseSystems.value
    resistances.value = s.resistances ?? resistances.value
  }

  const hydrateCrew = (s) => {
    const list = s.roster ? objectToArray(s.roster).map(normalizeCrewMember) : [...roster.value]

    if (s.crew) {
      const next = { ...blankStations(), ...stations.value }
      for (const role of CREW_ROLE_IDS) {
        const seat = s.crew[role]
        if (!seat) continue
        next[role] = 'memberId' in seat
          ? seat.memberId || ''
          : assignCrewMember(list, { name: seat.name, stats: seat }, uuidv4, roleName(role))
      }
      stations.value = next
    }

    if (s.weapons) {
      weapons.value = objectToArray(s.weapons).map((w) => {
        if ('gunnerId' in w) return { ...blankWeapon(), ...w }
        const { gunner, gunnerDex, gunnerSaveBonus, proficient, ...rest } = w
        const gunnerId = assignCrewMember(
          list,
          { name: gunner, stats: { dexterity: gunnerDex, saveBonus: gunnerSaveBonus, proficient } },
          uuidv4,
          'Gunner',
        )
        return { ...blankWeapon(), ...rest, gunnerId }
      })
    }

    if (s.roster || list.length !== roster.value.length) roster.value = list

    const ids = new Set(roster.value.map((m) => m._id))
    for (const role of CREW_ROLE_IDS) {
      if (stations.value[role] && !ids.has(stations.value[role])) stations.value[role] = ''
    }
    for (const w of weapons.value) if (w.gunnerId && !ids.has(w.gunnerId)) w.gunnerId = ''
  }

  return {
    owner, kind, size, crewCapacity, actionStations, description,
    controlSpeed, strSave, conSave, immunities,
    roster, stations,
    baseDefense, maneuverability, defenseModifier,
    baseHullPoints, baseStructuralIntegrity, hullDie, hullDiceTotal,
    interceptSpeed, sensorRange,
    defenseMisc, maneuverDefenseMisc,
    hullCurrent, siCurrent, patchRepairsUsed,
    specialFeatures, defenseSystems, resistances, weapons,
    crew, pilot, copilot, maneuverDefenseMember, technician, gunnerOf,
    pilotingBonusValue, maneuverSaveDCValue, maneuverDefenseValue, defenseValue,
    initiativeBonus, maxHull, maxSi, siThreshold, zeroHullDC,
    isDisabled, isDestroyed, patchRepair, isVehicle, controlBonusValue,
    weaponPower, addCrewmember, removeCrewmember, addWeapon, removeWeapon, isBlank, importEntry,
    clearRole, spendSi, applyRepair, fullRepair, setKind,
    dehydrate, hydrate,
  }
}

export const useStarshipStore = defineStore('starship', starshipStore)
