import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { post } from '@/utility/post.js'
import { createRollTemplate } from '@/rollTemplates/index.js'
import { itemCardTemplateData } from '@/rollTemplates/itemCard.js'
import {
  resolveSheetType, defaultBranch, branchToAttributes, hydrateNpcState,
  withMaxHealth, withCurrentHealth, creatureDocToBranch, branchToCreatureDoc
} from '@/creature/creature.js'

// NPC mode state (NPC spec §5). Two top-level attribute keys, sheetType and npc, beside
// sheetStore's contract paths and ui — never inside them. The rules live in
// creature.js; this store only holds state and calls them.
const npcStore = () => {
  const sheetType = ref('character')
  // null until the first switch to NPC. While null, dehydrate() emits nothing, so a
  // character that has never been an NPC saves exactly what it saved before (§5.2).
  const branch = ref(null)
  const isNpc = computed(() => sheetType.value === 'npc')

  // Switching deletes nothing in either direction (§5.3). The branch is created once.
  const switchTo = (type) => {
    sheetType.value = resolveSheetType(type)
    if (sheetType.value === 'npc' && branch.value === null) branch.value = defaultBranch()
  }

  // The edit controls only render in NPC mode, where the branch always exists. The
  // guards keep a stray call from creating a branch behind a Character sheet's back.
  const setCurrentHealth = (value) => {
    if (branch.value === null) return
    branch.value = withCurrentHealth(branch.value, value)
  }
  const setMaxHealth = (value) => {
    if (branch.value === null) return
    branch.value = withMaxHealth(branch.value, value)
  }
  const addIntrusion = () => {
    if (branch.value === null) return
    branch.value.creature.gmIntrusions.push({ _id: uuidv4(), text: '' })
  }
  const removeIntrusion = (id) => {
    if (branch.value === null) return
    const rows = branch.value.creature.gmIntrusions
    const i = rows.findIndex((r) => r._id === id)
    if (i >= 0) rows.splice(i, 1)
  }
  const addCombatAction = () => {
    if (branch.value === null) return
    branch.value.creature.combatActions.push({ _id: uuidv4(), title: '', description: '' })
  }
  const removeCombatAction = (id) => {
    if (branch.value === null) return
    const rows = branch.value.creature.combatActions
    const i = rows.findIndex((r) => r._id === id)
    if (i >= 0) rows.splice(i, 1)
  }

  // The name is NOT touched here: it is the Roll20 character name, shared by both
  // modes (decision 5). The import panel sets meta.name itself.
  // Expects a document that already passed validateCreatureDocument; it does not validate.
  const applyCreatureDoc = (doc) => {
    branch.value = creatureDocToBranch(doc)
  }
  const exportCreatureDoc = (name) => branchToCreatureDoc(branch.value, name)

  // Always public (§7.4): whisper is passed as false outright, so the hidden
  // ui.whisperItemCards setting from Character mode can never reach this card.
  const postDescription = (name) =>
    post(createRollTemplate({
      itemCard: itemCardTemplateData('creature', { title: name, prose: branch.value.creature.description })
    }), { whisper: false })

  // Always public (§7.4), like postDescription. The card passes the raw character name,
  // so a blank name drops the source line rather than printing a fallback.
  const postCombatAction = (action, name) =>
    post(createRollTemplate({
      itemCard: itemCardTemplateData('creature', { title: action.title, source: name, prose: action.description })
    }), { whisper: false })

  // Once the branch exists both keys ship in both modes: an omitted key is deleted.
  const dehydrate = () => (branch.value === null
    ? {}
    : { sheetType: sheetType.value, npc: branchToAttributes(branch.value) })

  // Replace, never merge (§5.2): sheetStore's keep-the-current-value pattern is
  // deliberately not copied. hydrateNpcState rebuilds every object, so nothing here
  // aliases the SDK's cached attributes (ddd-7ub).
  const hydrate = (attributes) => {
    const next = hydrateNpcState(attributes ?? {})
    sheetType.value = next.sheetType
    branch.value = next.branch
  }

  return {
    sheetType, branch, isNpc,
    switchTo, setCurrentHealth, setMaxHealth, addIntrusion, removeIntrusion, addCombatAction, removeCombatAction,
    applyCreatureDoc, exportCreatureDoc, postDescription, postCombatAction, dehydrate, hydrate
  }
}

export const useNpcStore = defineStore('npc', npcStore)
