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
import { NPC, CREATURE, NPC_SHIP } from '@/sheetTypes.js'

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
  }

  const blank = (kind) => (kind === 'ship' ? isBlankShip(npcShip) : isBlankCreature(npc))

  const apply = (plan, mapped) => {
    const name = mapped.name ?? 'The page'
    if (plan.apply === 'technique') {
      const { updated } = techniques.importTechnique(mapped)
      return notify(updated ? `Updated ${name}.` : `Added ${name} to Techniques.`)
    }
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
