import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'
import { rollEnyllion, rollDamage } from '@/utility/rolls.js'

/*
 * Fiche Ennemi : monstres, dragons, démons (structure identique : créature + FO/DEX/PO
 * + attaques + sorts) et ennemis (PNJ hostile complet).
 */

const newAttack = () => ({
  _id: uuidv4(),
  name: '',
  dmgDice: 0,
  dmgType: 0,
  dmgMod: 0,
  effect: 0,
  effectPct: 0,
  effectTurnsDice: 0,
  effectTurnsType: 0,
  effectTurnsMod: 0,
  effectDmgMod: 0
})
const newSpell = () => ({ _id: uuidv4(), name: '', lvl: 1, description: '' })

const newCreature = () => ({
  _id: uuidv4(),
  name: '',
  hp: 0,
  xp: 0,
  encounter: '0',
  description: '',
  image: '',
  FO: 0,
  DEX: 0,
  PO: 0,
  attacks: [],
  spells: []
})

const newWeapon = () => ({ ...newAttack(), lvl: 1, range: 0, munRemain: 0, munTotal: 0 })

const newEnnemi = () => ({
  _id: uuidv4(),
  name: '',
  race: '',
  class: '',
  guild: '',
  FO: 0,
  DEX: 0,
  CON: 0,
  PO: 0,
  CH: 0,
  ED: 0,
  PE: 0,
  SF: 0,
  armor: { head: 0, torso: 0, arms: 0, hands: 0, legs: 0, feet: 0 },
  gold: 0,
  silver: 0,
  copper: 0,
  weapons: [],
  spells: []
})

const ENNEMI_CARACS = ['FO', 'DEX', 'CON', 'PO', 'CH', 'ED', 'PE', 'SF']

const enemyStore = () => {
  const monster = ref([])
  const dragon = ref([])
  const demon = ref([])
  const ennemis = ref([])

  const spliceById = (arr, id) => {
    const i = arr.findIndex((x) => x._id === id)
    if (i >= 0) arr.splice(i, 1)
  }

  // --- Créatures (monstre/dragon/démon) ---
  const rollCreatureCarac = (c, key, label) =>
    rollEnyllion({ name: label, sub: key, carac: parseInt(c[key], 10) || 0, perso: c.name })
  const rollCreatureAttack = (c, atk) => rollDamage({ ...atk, perso: c.name })
  const rollCreatureSpell = (c, spell) =>
    rollEnyllion({ name: spell.name || 'Sort', carac: parseInt(c.PO, 10) || 0, perso: c.name, description: spell.description })

  // --- Ennemis (PNJ hostile) ---
  const rollEnnemiCarac = (e, key, label) =>
    rollEnyllion({ name: label, sub: key, carac: parseInt(e[key], 10) || 0, perso: e.name })
  const rollEnnemiWeapon = (e, w) => rollDamage({ ...w, perso: e.name })
  const rollEnnemiSpell = (e, spell) =>
    rollEnyllion({ name: spell.name || 'Sort', carac: parseInt(e.PO, 10) || 0, perso: e.name, description: spell.description })

  // Ajout / suppression
  const listFor = (type) => ({ monster, dragon, demon }[type])
  const addCreature = (type) => listFor(type).value.push(newCreature())
  const removeCreature = (type, id) => spliceById(listFor(type).value, id)
  const addCreatureAttack = (c) => c.attacks.push(newAttack())
  const removeCreatureAttack = (c, id) => spliceById(c.attacks, id)
  const addCreatureSpell = (c) => c.spells.push(newSpell())
  const removeCreatureSpell = (c, id) => spliceById(c.spells, id)

  const addEnnemi = () => ennemis.value.push(newEnnemi())
  const removeEnnemi = (id) => spliceById(ennemis.value, id)
  const addEnnemiWeapon = (e) => e.weapons.push(newWeapon())
  const removeEnnemiWeapon = (e, id) => spliceById(e.weapons, id)
  const addEnnemiSpell = (e) => e.spells.push(newSpell())
  const removeEnnemiSpell = (e, id) => spliceById(e.spells, id)

  // Garantit les listes imbriquées après hydratation.
  const normCreatures = (arr) => {
    if (!arr) return null
    arr.forEach((c) => {
      c.attacks = Array.isArray(c.attacks) ? c.attacks : []
      c.spells = Array.isArray(c.spells) ? c.spells : []
    })
    return arr
  }

  const dehydrate = () => ({
    monster: arrayToObject(monster.value),
    dragon: arrayToObject(dragon.value),
    demon: arrayToObject(demon.value),
    ennemis: arrayToObject(ennemis.value)
  })
  const hydrate = (data = {}) => {
    monster.value = normCreatures(objectToArray(data.monster)) || monster.value
    dragon.value = normCreatures(objectToArray(data.dragon)) || dragon.value
    demon.value = normCreatures(objectToArray(data.demon)) || demon.value
    const ens = objectToArray(data.ennemis)
    if (ens) {
      ens.forEach((e) => {
        e.weapons = Array.isArray(e.weapons) ? e.weapons : []
        e.spells = Array.isArray(e.spells) ? e.spells : []
        e.armor = e.armor || { head: 0, torso: 0, arms: 0, hands: 0, legs: 0, feet: 0 }
      })
      ennemis.value = ens
    }
  }

  return {
    monster,
    dragon,
    demon,
    ennemis,
    ENNEMI_CARACS,
    rollCreatureCarac,
    rollCreatureAttack,
    rollCreatureSpell,
    rollEnnemiCarac,
    rollEnnemiWeapon,
    rollEnnemiSpell,
    addCreature,
    removeCreature,
    addCreatureAttack,
    removeCreatureAttack,
    addCreatureSpell,
    removeCreatureSpell,
    addEnnemi,
    removeEnnemi,
    addEnnemiWeapon,
    removeEnnemiWeapon,
    addEnnemiSpell,
    removeEnnemiSpell,
    dehydrate,
    hydrate
  }
}

export const useEnemyStore = defineStore('enemy', enemyStore)
