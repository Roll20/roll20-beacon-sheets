import { onMounted, ref, watch } from 'vue'
import { initValues, dispatchRef, sheetDrops } from '@/relay/relay.js'
import { fetchEntry } from '@/compendium/fetchEntry.js'
import { readPage } from '@/compendium/payload.js'
import { dropPlan, isBlankCreature, isBlankShip } from '@/compendium/drops.js'
import { useAppStore } from '@/stores/index.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { NPC, CREATURE, NPC_SHIP } from '@/sheetTypes.js'
import { creatureToken } from '@/rules/tokens.js'

export const dropNotice = ref(null)

const NOTICE_MS = 6000
let noticeTimer = null
const notify = (text, tone = 'ok') => {
  dropNotice.value = { text, tone }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { dropNotice.value = null }, NOTICE_MS)
}

export const useCompendiumDrops = () => {
  const app = useAppStore()
  const meta = useMetaStore()
  const npc = useNpcStore()
  const npcShip = useNpcShipStore()
  const techniques = useTechniqueStore()
  const character = useCharacterStore()

  const load = async (pointer) => {
    const fetched = await fetchEntry(dispatchRef.value, pointer)
    if (!fetched.ok) return { error: fetched.error }
    const page = fetched.pages[0]
    return { page, read: readPage(page) }
  }

  const fillStatBlock = (kind, mapped) => {
    if (mapped.name) meta.name = mapped.name
    app.setSheetType(NPC)
    app.setNpcMode(kind === 'ship' ? NPC_SHIP : CREATURE)
    ;(kind === 'ship' ? npcShip : npc).importEntry(mapped)
    if (kind === 'creature') sizeTokens()
  }

  const sizeTokens = () => {
    const characterId = initValues.character?.id
    const dispatch = dispatchRef.value
    if (!characterId || typeof dispatch?.updateTokensByCharacter !== 'function') return
    const token = creatureToken({ tokenSize: npc.tokenSize, size: npc.size, senses: npc.senses })
    Promise.resolve(dispatch.updateTokensByCharacter({ characterId, token })).catch(() => {})
  }

  const blank = (kind) => (kind === 'ship' ? isBlankShip(npcShip) : isBlankCreature(npc))

  const addProficiency = ({ kind, id, name, parent }) => {
    const label = name || id
    if (kind === 'armor') {
      const map = character.proficiencies.armor
      if (!id || !(id in map)) return notify(`${label} isn't an armor type this sheet knows.`, 'refused')
      if (map[id]) return notify(`Already trained in ${label}.`)
      map[id] = true
      return notify(`Added ${label} training.`)
    }
    if (!['weapon', 'tool', 'vehicle'].includes(kind)) {
      return notify(`${label} pages can't be dropped yet.`, 'refused')
    }
    const added = character.addProficiency(kind, { id, name, parent })
    return notify(added ? `Added ${label} proficiency.` : `Already proficient with ${label}.`)
  }

  const apply = (plan, mapped) => {
    const name = mapped.name ?? 'The page'
    if (plan.apply === 'technique') {
      const { updated } = techniques.importTechnique(mapped)
      return notify(updated ? `Updated ${name}.` : `Added ${name} to Techniques.`)
    }
    if (plan.apply === 'item') {
      const { weapon, pack } = app.addItemFromCompendium(mapped)
      if (weapon) return notify(`Added ${name} to Attacks and Equipment.`)
      return notify(pack ? `Unpacked ${name} into Equipment.` : `Added ${name} to Equipment.`)
    }
    if (plan.apply === 'proficiency') return addProficiency(mapped)
    if (!blank(plan.apply)) return notify('This stat block already has stats.', 'refused')
    fillStatBlock(plan.apply, mapped)
    notify(`Imported ${name}.`)
  }

  const onSheetDrop = async (drop) => {
    if (!drop?.pageName) return
    try {
      const { error, read } = await load(drop)
      if (error) return notify(error, 'refused')
      if (!read) return notify('Only Phantasy Star compendium pages drop onto this sheet.', 'refused')
      if (!read.ok) return notify(read.error, 'refused')
      const plan = dropPlan(read.kind, { sheetType: app.sheetType, npcMode: app.npcMode })
      if (plan.refuse) return notify(plan.refuse, 'refused')
      apply(plan, read.mapped)
    } catch (error) {
      notify(`The drop failed: ${error?.message ?? error}`, 'refused')
    }
  }

  const onMapDrop = async () => {
    const pointer = initValues.compendiumDrop
    if (!pointer?.pageName || !meta.canEdit) return
    try {
      const { error, read } = await load(pointer)
      if (error || !read || !read.ok) return
      if (read.kind !== 'creature' && read.kind !== 'ship') return
      if (!blank(read.kind)) return
      fillStatBlock(read.kind, read.mapped)
      initValues.compendiumDrop = null
      notify(`Imported ${read.mapped.name ?? 'the page'}.`)
    } catch {
    }
  }

  watch(sheetDrops, (list, previous) => {
    const newest = list?.[0]
    if (newest && newest !== previous?.[0]) onSheetDrop(newest)
  })
  onMounted(onMapDrop)

  return { dropNotice }
}
