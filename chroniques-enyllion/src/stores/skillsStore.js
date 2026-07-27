import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { SKILLS } from '@/data/skills.js'
import { arrayToObject, objectToArray } from '@/utility/objectify.js'
import { useStatsStore } from '@/stores/statsStore.js'
import { rollEnyllion } from '@/utility/rolls.js'

/*
 * Compétences du PJ.
 * - Liste fixe (data/skills.js) : on stocke par compétence { bonus, description, checked }.
 * - Compétences personnalisées : liste libre avec nom + caractéristique éditables.
 * La case "checked" sert à épingler une compétence dans la carte de favoris en haut de l'onglet.
 */
const skillsStore = () => {
  // { [skillId]: { bonus, description, checked } }
  const entries = reactive({})
  // Compétences personnalisées ajoutées par le joueur.
  const customSkills = ref([])

  const ensure = (id) => {
    if (!entries[id]) entries[id] = { bonus: 0, description: '', checked: false }
    return entries[id]
  }
  SKILLS.forEach((s) => ensure(s.id))

  const addCustomSkill = () =>
    customSkills.value.push({
      _id: uuidv4(),
      nom: '',
      carac: 'ED',
      bonus: 0,
      description: '',
      checked: false
    })
  const removeCustomSkill = (id) => {
    const i = customSkills.value.findIndex((s) => s._id === id)
    if (i >= 0) customSkills.value.splice(i, 1)
  }

  // Jet de compétence : carac associée (modifié) + malus santé + bonus (+ modificateur demandé au lancer).
  // `skill` = { nom, carac (clé FO/ED/...), bonus, description }.
  const rollSkill = (skill) => {
    const stats = useStatsStore()
    const caracMod = parseInt(stats.caracs[skill.carac]?.mod, 10) || 0
    const bonus = parseInt(skill.bonus, 10) || 0
    const carac = caracMod + stats.malusSante + bonus
    return rollEnyllion({
      name: skill.nom || 'Compétence',
      sub: skill.carac,
      carac,
      description: skill.description || ''
    })
  }

  const dehydrate = () => ({
    entries: JSON.parse(JSON.stringify(entries)),
    customSkills: arrayToObject(customSkills.value)
  })

  const hydrate = (data = {}) => {
    if (data.entries) {
      Object.entries(data.entries).forEach(([id, val]) => {
        ensure(id)
        entries[id].bonus = val.bonus ?? 0
        entries[id].description = val.description ?? ''
        entries[id].checked = val.checked ?? false
      })
    }
    customSkills.value = objectToArray(data.customSkills) || customSkills.value
  }

  return {
    entries,
    customSkills,
    addCustomSkill,
    removeCustomSkill,
    rollSkill,
    dehydrate,
    hydrate
  }
}

export const useSkillsStore = defineStore('skills', skillsStore)
