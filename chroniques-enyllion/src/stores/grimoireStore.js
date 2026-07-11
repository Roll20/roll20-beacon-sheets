import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'
import { useStatsStore } from '@/stores/statsStore.js'
import { rollEnyllion, rollDamage, postMessage } from '@/utility/rolls.js'

/*
 * Onglet Grimoire du PJ : sorts, familiers, relations.
 */

const newSpell = () => ({ _id: uuidv4(), name: '', lvl: 1, description: '' })

const newRelation = () => ({ _id: uuidv4(), name: '', loyaute: '', location: '', description: '' })

const newFamSkill = () => ({ _id: uuidv4(), name: '', carac: '', bonus: 0, description: '' })
const newFamAttack = () => ({ _id: uuidv4(), name: '', dmgDice: 0, dmgType: 0, dmgMod: 0, description: '' })
const newFamSpell = () => ({ _id: uuidv4(), name: '', lvl: 1, description: '' })

const newFamiliar = () => ({
  _id: uuidv4(),
  name: '',
  type: '',
  lvl: 1,
  duration: 1,
  description: '',
  requiresPowerRoll: true,
  FO: 0,
  DEX: 0,
  CON: 0,
  PO: 0,
  PE: 0,
  skills: [],
  attacks: [],
  spells: []
})

const grimoireStore = () => {
  const spells = ref([])
  const familiars = ref([])
  const relations = ref([])

  // Jet de sort : PO (modifié) + malus santé (+ modificateur demandé au lancer), avec description.
  const rollSpell = (spell) => {
    const stats = useStatsStore()
    const carac = (parseInt(stats.caracs.PO?.mod, 10) || 0) + stats.malusSante
    return rollEnyllion({ name: spell.name || 'Sort', carac, description: spell.description })
  }

  // Invoque le familier. Si un jet de pouvoir est requis, lance le PO du PJ
  // (modifié + malus santé + modificateur demandé) ; sinon poste juste l'invocation.
  const invokeFamiliar = (fam) => {
    if (fam.requiresPowerRoll) {
      const stats = useStatsStore()
      const carac = (parseInt(stats.caracs.PO?.mod, 10) || 0) + stats.malusSante
      return rollEnyllion({
        name: `Invocation — ${fam.name || 'Familier'}`,
        sub: 'PO',
        carac,
        description: fam.description
      })
    }
    return postMessage({
      name: `Invocation — ${fam.name || 'Familier'}`,
      text: fam.description || 'Le familier est invoqué.'
    })
  }

  // Jet de caractéristique d'un familier (sa propre carac, sans malus santé).
  const rollFamiliarCarac = (fam, key, label) => {
    const carac = parseInt(fam[key], 10) || 0
    return rollEnyllion({ name: label, sub: fam.name, carac })
  }

  // Attaque d'un familier (dégâts simples, sans effet).
  const rollFamiliarAttack = (fam, attack) =>
    rollDamage({
      name: `${fam.name} — ${attack.name || 'Attaque'}`,
      dmgDice: attack.dmgDice,
      dmgType: attack.dmgType,
      dmgMod: attack.dmgMod,
      effect: 0
    })

  // Sort d'un familier : PO du familier (+ modificateur demandé au lancer).
  const rollFamiliarSpell = (fam, spell) => {
    const carac = parseInt(fam.PO, 10) || 0
    return rollEnyllion({ name: spell.name || 'Sort', sub: fam.name, carac, description: spell.description })
  }

  // Ajout / suppression des lignes imbriquées d'un familier.
  const addFamSkill = (fam) => fam.skills.push(newFamSkill())
  const removeFamSkill = (fam, id) => spliceById(fam.skills, id)
  const addFamAttack = (fam) => fam.attacks.push(newFamAttack())
  const removeFamAttack = (fam, id) => spliceById(fam.attacks, id)
  const addFamSpell = (fam) => fam.spells.push(newFamSpell())
  const removeFamSpell = (fam, id) => spliceById(fam.spells, id)
  const spliceById = (arr, id) => {
    const i = arr.findIndex((x) => x._id === id)
    if (i >= 0) arr.splice(i, 1)
  }

  const addSpell = () => spells.value.push(newSpell())
  const removeSpell = (id) => removeFrom(spells, id)
  const addFamiliar = () => familiars.value.push(newFamiliar())
  const removeFamiliar = (id) => removeFrom(familiars, id)
  const addRelation = () => relations.value.push(newRelation())
  const removeRelation = (id) => removeFrom(relations, id)

  const removeFrom = (listRef, id) => {
    const i = listRef.value.findIndex((x) => x._id === id)
    if (i >= 0) listRef.value.splice(i, 1)
  }

  const dehydrate = () => ({
    spells: arrayToObject(spells.value),
    familiars: arrayToObject(familiars.value),
    relations: arrayToObject(relations.value)
  })

  const hydrate = (data = {}) => {
    spells.value = objectToArray(data.spells) || spells.value
    const fams = objectToArray(data.familiars)
    if (fams) {
      // Garantit la présence des listes imbriquées (sécurité / anciennes données).
      fams.forEach((f) => {
        f.skills = Array.isArray(f.skills) ? f.skills : []
        f.attacks = Array.isArray(f.attacks) ? f.attacks : []
        f.spells = Array.isArray(f.spells) ? f.spells : []
      })
      familiars.value = fams
    }
    relations.value = objectToArray(data.relations) || relations.value
  }

  return {
    spells,
    familiars,
    relations,
    rollSpell,
    invokeFamiliar,
    rollFamiliarCarac,
    rollFamiliarAttack,
    rollFamiliarSpell,
    addFamSkill,
    removeFamSkill,
    addFamAttack,
    removeFamAttack,
    addFamSpell,
    removeFamSpell,
    addSpell,
    removeSpell,
    addFamiliar,
    removeFamiliar,
    addRelation,
    removeRelation,
    dehydrate,
    hydrate
  }
}

export const useGrimoireStore = defineStore('grimoire', grimoireStore)
