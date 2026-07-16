import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'
import { CARAC_KEYS } from '@/stores/statsStore.js'
import { computeSanteLevel, computeSanteEffet } from '@/utility/sante.js'
import { rollEnyllion, rollDamage } from '@/utility/rolls.js'

/* Fabriques de lignes (mêmes formes que l'inventaire PJ). */
const newWeapon = (extra = {}) => ({
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
  effectDmgMod: 0,
  ...extra
})
const newArmor = () => ({ _id: uuidv4(), name: '', pa: 0, lvl: 0, coveredParts: '0', weight: 0, price: '', wear: true })
const newEqp = () => ({ _id: uuidv4(), name: '', qty: 0, weight: 0, price: '', location: '', wear: true })
const newSkill = () => ({ _id: uuidv4(), name: '', carac: 'ED', bonus: 0, description: '' })
const newSpell = () => ({ _id: uuidv4(), name: '', lvl: 1, description: '' })
const newRelation = () => ({ _id: uuidv4(), name: '', loyaute: '', location: '', description: '' })

const npcStore = () => {
  const infos = reactive({
    name: '',
    race: '0',
    class: '0',
    age: '',
    sex: '',
    ethnie: '',
    divinity: '',
    guild: '',
    xp: 0,
    level: 0
  })

  const caracs = reactive(
    CARAC_KEYS.reduce((acc, k) => ((acc[k] = { base: 0, mod: 0 }), acc), {})
  )

  const hpActual = ref(0)
  const hpTotal = ref(0)
  const santeLevel = computed(() => computeSanteLevel(hpActual.value, hpTotal.value))
  const effetSante = computed(() => computeSanteEffet(santeLevel.value).effet)
  const malusSante = computed(() => computeSanteEffet(santeLevel.value).malus)

  const resMag = reactive({ resistance: '', faiblesse: '' })
  const attributs = ref('')

  const skills = ref([])
  const melee = ref([])
  const dist = ref([])
  const munitions = ref([])
  const armor = ref([])
  const equipment = ref([])
  const spells = ref([])
  const relations = ref([])

  const spliceById = (listRef, id) => {
    const i = listRef.value.findIndex((x) => x._id === id)
    if (i >= 0) listRef.value.splice(i, 1)
  }

  // Jets
  const rollCarac = (key, label) => {
    const carac = (parseInt(caracs[key].mod, 10) || 0) + malusSante.value
    return rollEnyllion({ name: label, carac, perso: infos.name })
  }
  const rollSkill = (skill) => {
    const caracMod = parseInt(caracs[skill.carac]?.mod, 10) || 0
    const carac = caracMod + malusSante.value + (parseInt(skill.bonus, 10) || 0)
    return rollEnyllion({ name: skill.name || 'Compétence', sub: skill.carac, carac, description: skill.description })
  }
  const rollWeapon = (w) => rollDamage(w)
  const rollSpell = (spell) => {
    const carac = (parseInt(caracs.PO?.mod, 10) || 0) + malusSante.value
    return rollEnyllion({ name: spell.name || 'Sort', carac, description: spell.description })
  }

  const dehydrate = () => ({
    infos: { ...infos },
    caracs: JSON.parse(JSON.stringify(caracs)),
    hpActual: hpActual.value,
    hpTotal: hpTotal.value,
    santeLevel: santeLevel.value,
    effetSante: effetSante.value,
    malusSante: malusSante.value,
    resMag: { ...resMag },
    attributs: attributs.value,
    skills: arrayToObject(skills.value),
    melee: arrayToObject(melee.value),
    dist: arrayToObject(dist.value),
    munitions: arrayToObject(munitions.value),
    armor: arrayToObject(armor.value),
    equipment: arrayToObject(equipment.value),
    spells: arrayToObject(spells.value),
    relations: arrayToObject(relations.value)
  })

  const hydrate = (data = {}) => {
    if (data.infos) Object.assign(infos, data.infos)
    if (data.caracs) {
      CARAC_KEYS.forEach((k) => {
        if (data.caracs[k]) {
          caracs[k].base = data.caracs[k].base ?? 0
          caracs[k].mod = data.caracs[k].mod ?? 0
        }
      })
    }
    hpActual.value = data.hpActual ?? hpActual.value
    hpTotal.value = data.hpTotal ?? hpTotal.value
    if (data.resMag) Object.assign(resMag, data.resMag)
    attributs.value = data.attributs ?? attributs.value
    skills.value = objectToArray(data.skills) || skills.value
    melee.value = objectToArray(data.melee) || melee.value
    dist.value = objectToArray(data.dist) || dist.value
    munitions.value = objectToArray(data.munitions) || munitions.value
    armor.value = objectToArray(data.armor) || armor.value
    equipment.value = objectToArray(data.equipment) || equipment.value
    spells.value = objectToArray(data.spells) || spells.value
    relations.value = objectToArray(data.relations) || relations.value
  }

  return {
    infos,
    caracs,
    hpActual,
    hpTotal,
    santeLevel,
    effetSante,
    malusSante,
    resMag,
    attributs,
    skills,
    melee,
    dist,
    munitions,
    armor,
    equipment,
    spells,
    relations,
    rollCarac,
    rollSkill,
    rollWeapon,
    rollSpell,
    addSkill: () => skills.value.push(newSkill()),
    removeSkill: (id) => spliceById(skills, id),
    addMelee: () => melee.value.push(newWeapon()),
    removeMelee: (id) => spliceById(melee, id),
    addDist: () => dist.value.push(newWeapon({ range: 0, munRemain: 0, munTotal: 0 })),
    removeDist: (id) => spliceById(dist, id),
    addMunition: () => munitions.value.push(newWeapon({ qty: 0 })),
    removeMunition: (id) => spliceById(munitions, id),
    addArmor: () => armor.value.push(newArmor()),
    removeArmor: (id) => spliceById(armor, id),
    addEqp: () => equipment.value.push(newEqp()),
    removeEqp: (id) => spliceById(equipment, id),
    addSpell: () => spells.value.push(newSpell()),
    removeSpell: (id) => spliceById(spells, id),
    addRelation: () => relations.value.push(newRelation()),
    removeRelation: (id) => spliceById(relations, id),
    dehydrate,
    hydrate
  }
}

export const useNpcStore = defineStore('npc', npcStore)
