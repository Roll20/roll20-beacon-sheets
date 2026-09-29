import { summarizeSheet } from '../../rules/characterSummary.js'
import {
  maxHullPoints,
  maxStructuralIntegrity,
  shipDefense,
  maneuverDefense,
  maneuverDefenseSeat,
} from '../../rules/starship.js'
import { PC, NPC, STARSHIP, sheetTypeOf, npcModeOf, isNpcShip } from '../../sheetTypes.js'

const sheetOf = (character) => character?.attributes?.sheet ?? {}
const npcOf = (character) => character?.attributes?.npc ?? {}
const shipOf = (character) => character?.attributes?.starship ?? {}
const npcShipOf = (character) => character?.attributes?.npcship ?? {}

const summaryOf = (character) => summarizeSheet(sheetOf(character))

const num = (v) => Number(v) || 0

const namedBonuses = (stored) =>
  Object.fromEntries(
    Object.values(stored ?? {})
      .filter((row) => row && String(row.name ?? '').trim() !== '')
      .map((row) => [String(row.name).trim().toLowerCase().replace(/\s+/g, '_'), num(row.bonus)]),
  )

const shipCrew = (character, role) => shipOf(character).crew?.[role] ?? {}

export const applyChange = (oldValue, newValue) => {
  const current = Number(oldValue) || 0
  if (typeof newValue === 'number') return Number.isFinite(newValue) ? newValue : current

  const text = String(newValue ?? '').trim()
  const relative = /^[+-]/.test(text)
  const parsed = parseInt(text, 10)
  if (Number.isNaN(parsed)) return current
  return relative ? current + parsed : parsed
}

const writeBlock = (dispatch, character, block, patch) =>
  dispatch.update({
    character: {
      id: character.id,
      attributes: {
        updateId: 'TOKENCHANGE',
        [block]: patch,
      },
    },
  })

export const getHp = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)

  if (type === NPC && !isShip) {
    const hp = npcOf(character).hp ?? {}
    return { current: num(hp.current), max: num(hp.max), temp: num(hp.temp) }
  }

  if (type === STARSHIP) {
    const ship = shipOf(character)
    return {
      current: num(ship.hullCurrent),
      max: maxHullPoints(
        ship.baseHullPoints,
        ship.defenseModifier,
        shipCrew(character, 'technician1').intelligence,
      ),
      temp: 0,
    }
  }

  if (isShip) {
    const hull = npcShipOf(character).hull ?? {}
    return { current: num(hull.current), max: num(hull.max), temp: 0 }
  }

  const { hp } = summaryOf(character)
  return { current: hp.current, max: hp.max, temp: hp.temp }
}

export const setHp = ({ character, dispatch }, ...args) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)

  if (type === NPC && !isShip) {
    const stored = npcOf(character).hp ?? {}
    const current = applyChange(stored.current, args[0])
    return writeBlock(dispatch, character, 'npc', { hp: { ...stored, current } })
  }

  if (type === STARSHIP) {
    const current = applyChange(shipOf(character).hullCurrent, args[0])
    return writeBlock(dispatch, character, 'starship', { hullCurrent: current })
  }

  if (isShip) {
    const stored = npcShipOf(character).hull ?? {}
    const current = applyChange(stored.current, args[0])
    return writeBlock(dispatch, character, 'npcship', { hull: { ...stored, current } })
  }

  const stored = sheetOf(character).hp ?? {}
  const current = applyChange(stored.current, args[0])
  return writeBlock(dispatch, character, 'sheet', { hp: { ...stored, current } })
}

export const getTp = ({ character }) => {
  if (sheetTypeOf(character) !== PC) return { current: 0, max: 0 }
  const { tp } = summaryOf(character)
  return { current: tp.current, max: tp.max }
}

export const setTp = ({ character, dispatch }, ...args) => {
  if (sheetTypeOf(character) !== PC) return undefined
  const stored = sheetOf(character).tp ?? {}
  const current = applyChange(stored.current, args[0])
  return writeBlock(dispatch, character, 'sheet', { tp: { ...stored, current } })
}

export const getDefense = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)

  if (type === NPC && !isShip) return { current: num(npcOf(character).defense) }

  if (isShip) return { current: num(npcShipOf(character).defense) }

  if (type === STARSHIP) {
    const ship = shipOf(character)
    return {
      current: shipDefense({
        baseDefense: ship.baseDefense,
        maneuverability: ship.maneuverability,
        pilotDexMod: shipCrew(character, 'pilot').dexterity,
        misc: ship.defenseMisc,
      }),
    }
  }

  return { current: summaryOf(character).defense }
}

export const getManeuverDefense = ({ character }) => {
  if (isNpcShip(character)) return { current: num(npcShipOf(character).maneuverDefense) }
  if (sheetTypeOf(character) !== STARSHIP) return { current: 0 }
  const pilot = shipCrew(character, 'pilot')
  const seat = maneuverDefenseSeat(pilot, shipCrew(character, 'copilot'))
  return {
    current: maneuverDefense(
      seat.wisdom,
      pilot.saveBonus,
      pilot.proficient,
      shipOf(character).maneuverDefenseMisc,
    ),
  }
}

export const getFate = ({ character }) => {
  if (sheetTypeOf(character) !== PC) return { current: 0, max: 0 }
  const { fate } = summaryOf(character)
  return { current: fate.remaining, max: fate.max }
}

export const setFate = ({ character, dispatch }, ...args) => {
  if (sheetTypeOf(character) !== PC) return undefined
  const { fate } = summaryOf(character)
  const remaining = Math.max(0, Math.min(fate.max, applyChange(fate.remaining, args[0])))
  return writeBlock(dispatch, character, 'sheet', { fateSpent: fate.max - remaining })
}

export const getSi = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)

  if (isShip) {
    const si = npcShipOf(character).si ?? {}
    return { current: num(si.current), max: num(si.max) }
  }

  if (type !== STARSHIP) return { current: 0, max: 0 }
  const ship = shipOf(character)
  return {
    current: num(ship.siCurrent),
    max: maxStructuralIntegrity(
      ship.baseStructuralIntegrity,
      shipCrew(character, 'technician1').wisdom,
    ),
  }
}

export const setSi = ({ character, dispatch }, ...args) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)

  if (isShip) {
    const stored = npcShipOf(character).si ?? {}
    const current = applyChange(stored.current, args[0])
    return writeBlock(dispatch, character, 'npcship', { si: { ...stored, current } })
  }

  if (type !== STARSHIP) return undefined
  const current = applyChange(shipOf(character).siCurrent, args[0])
  return writeBlock(dispatch, character, 'starship', { siCurrent: current })
}

export const getAbilities = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)
  if (type === NPC && !isShip) return npcOf(character).abilities ?? {}
  if (type === STARSHIP) return shipOf(character).crew ?? {}
  if (isShip) return npcShipOf(character).crewMods ?? {}
  return sheetOf(character).abilities ?? {}
}

export const getSaves = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)
  if (type === NPC && !isShip) return npcOf(character).saves ?? {}
  if (type === STARSHIP) return {}
  if (isShip) return namedBonuses(npcShipOf(character).saves)
  return summaryOf(character).saves
}

export const getSkills = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)
  if (type === NPC && !isShip) return npcOf(character).skills ?? {}
  if (type === STARSHIP) return {}
  if (isShip) return namedBonuses(npcShipOf(character).skills)
  return summaryOf(character).skillTotals
}

export const getLevel = ({ character }) =>
  sheetTypeOf(character) === PC ? summaryOf(character).level : ''

export const getProfessionName = ({ character }) =>
  sheetTypeOf(character) === PC ? sheetOf(character).profession ?? '' : ''

export const getDefenseValue = ({ character }) => getDefense({ character }).current

export const getSpeed = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)
  if (type === NPC && !isShip) return npcOf(character).speed ?? ''
  if (type === STARSHIP) return shipOf(character).interceptSpeed ?? ''
  if (isShip) return npcShipOf(character).speed ?? ''
  return summaryOf(character).speed
}

export const getAgility = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)
  if (type === NPC && !isShip) return num(npcOf(character).initiative)
  if (type === STARSHIP) return num(shipCrew(character, 'pilot').dexterity)
  if (isShip) return num(npcShipOf(character).initiative)
  return summaryOf(character).agility
}

export const getPassivePerception = ({ character }) => {
  const type = sheetTypeOf(character)
  const isShip = isNpcShip(character)
  if (type === NPC && !isShip) return num(npcOf(character).passivePerception)
  if (isShip) return num(npcShipOf(character).passivePerception)
  if (type === PC) return summaryOf(character).passivePerception
  return ''
}

export const getAttackBonus = ({ character }) =>
  sheetTypeOf(character) === PC ? summaryOf(character).attackBonus : ''

export const getSaveBonus = ({ character }) =>
  sheetTypeOf(character) === PC ? summaryOf(character).saveBonus : ''

export const getTechSaveDC = ({ character }) =>
  sheetTypeOf(character) === PC ? summaryOf(character).techSaveDC ?? '' : ''

export const getTechAttackPower = ({ character }) =>
  sheetTypeOf(character) === PC ? summaryOf(character).techAttackPower ?? '' : ''

export const getHitDice = ({ character }) => {
  if (sheetTypeOf(character) !== PC) return { current: 0, max: 0, die: '—' }
  const { hitDice } = summaryOf(character)
  return { current: hitDice.remaining, max: hitDice.total, die: hitDice.die }
}

export const getSheetTypeValue = ({ character }) => sheetTypeOf(character)

export const getNpcModeValue = ({ character }) =>
  sheetTypeOf(character) === NPC ? npcModeOf(character) : ''

export const sheetComputed = {
  hp: {
    description: 'Hit points, or a ship’s hull points (current / max)',
    tokenBarValue: true,
    get: getHp,
    set: setHp,
  },
  tp: {
    description: 'Technique points (current / max)',
    tokenBarValue: true,
    get: getTp,
    set: setTp,
  },
  defense: {
    description: 'Defense',
    tokenBarValue: true,
    get: getDefense,
  },
  si: {
    description: 'Structural integrity, on either kind of starship (current / max)',
    tokenBarValue: true,
    get: getSi,
    set: setSi,
  },
  maneuverDefense: {
    description: 'Maneuver Defense, on either kind of starship',
    tokenBarValue: true,
    get: getManeuverDefense,
  },
  fate: {
    description: 'Fate points remaining',
    tokenBarValue: true,
    get: getFate,
    set: setFate,
  },

  abilities: {
    description: 'Ability modifiers, or an NPC ship’s crew modifiers',
    tokenBarValue: false,
    get: getAbilities,
  },
  saves: { description: 'Saving throw totals', tokenBarValue: false, get: getSaves },
  skills: { description: 'Skill totals', tokenBarValue: false, get: getSkills },
  hitDice: { description: 'Hit dice remaining', tokenBarValue: false, get: getHitDice },
  level: { description: 'Character level', tokenBarValue: false, get: getLevel },
  profession: { description: 'Profession', tokenBarValue: false, get: getProfessionName },
  defenseValue: {
    description: 'Defense as a plain number',
    tokenBarValue: false,
    get: getDefenseValue,
  },
  speed: { description: 'Speed, or a ship’s intercept speed', tokenBarValue: false, get: getSpeed },
  agility: { description: 'Agility (initiative)', tokenBarValue: false, get: getAgility },
  passivePerception: {
    description: 'Passive Perception',
    tokenBarValue: false,
    get: getPassivePerception,
  },
  attackBonus: { description: 'Profession attack bonus', tokenBarValue: false, get: getAttackBonus },
  saveBonus: { description: 'Save Bonus for this level', tokenBarValue: false, get: getSaveBonus },
  techSaveDC: { description: 'Tech Save DC', tokenBarValue: false, get: getTechSaveDC },
  techAttackPower: {
    description: 'Tech Attack Power',
    tokenBarValue: false,
    get: getTechAttackPower,
  },
  sheetType: {
    description: 'Whether this is a character, an NPC or a starship',
    tokenBarValue: false,
    get: getSheetTypeValue,
  },
  npcMode: {
    description: 'On an NPC, whether it is a creature or a ship',
    tokenBarValue: false,
    get: getNpcModeValue,
  },
}

export default sheetComputed
