import { onMounted, ref, watch } from 'vue'
import { initValues, dispatchRef, sheetDrops } from '@/relay/relay.js'
import { fetchEntry } from '@/compendium/fetchEntry.js'
import { readPage } from '@/compendium/payload.js'
import {
  dropPlan, isBlankCreature, isBlankShip, professionDrop, pathDrop, choicesAtLevel,
} from '@/compendium/drops.js'
import { useAppStore } from '@/stores/index.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useBioStore } from '@/stores/bioStore.js'
import { v4 as uuidv4 } from 'uuid'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { NPC, CREATURE, NPC_SHIP, PC, STARSHIP } from '@/sheetTypes.js'
import { creatureToken, tokenDimensions } from '@/rules/tokens.js'
import { pendingGrants, grantedNames } from '@/rules/featureEffects.js'

export const dropNotice = ref(null)

export const equipmentOffer = ref(null)

const NOTICE_MS = 6000
const noticeMs = (text) => Math.min(20000, NOTICE_MS + 60 * Math.max(0, text.length - 40))
let noticeTimer = null
const notify = (text, tone = 'ok') => {
  dropNotice.value = { text, tone }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { dropNotice.value = null }, noticeMs(text))
}

export const useCompendiumDrops = () => {
  const app = useAppStore()
  const meta = useMetaStore()
  const npc = useNpcStore()
  const npcShip = useNpcShipStore()
  const starship = useStarshipStore()
  const bio = useBioStore()
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

  const sizeTokens = (token = creatureToken({ tokenSize: npc.tokenSize, size: npc.size, senses: npc.senses })) => {
    const characterId = initValues.character?.id
    const dispatch = dispatchRef.value
    if (!characterId || typeof dispatch?.updateTokensByCharacter !== 'function') return
    Promise.resolve(dispatch.updateTokensByCharacter({ characterId, token })).catch(() => {})
  }

  const sizeVehicleTokens = (mapped) => {
    if (mapped.kind === 'vehicle' && mapped.stats?.size) sizeTokens(tokenDimensions(mapped.tokenSize, mapped.stats.size))
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

  const ARMOR_WORDS = { shields: 'shields', light_armor: 'light armor', medium_armor: 'medium armor', heavy_armor: 'heavy armor' }

  const toChoose = (name, labels, verb = 'Added') =>
    labels.length ? `${verb} ${name}. To choose: ${labels.join('; ')}.` : `${verb} ${name}.`

  const applyProfession = (mapped) => {
    const check = professionDrop(character, mapped)
    if (check.refuse) return notify(check.refuse, 'refused')
    const refresh = check.mode === 'refresh'
    app.applyProfession(mapped, { refresh })
    if (refresh) return notify(`Updated ${mapped.name}.`)
    const left = [...mapped.startChoices, ...choicesAtLevel(mapped.choices, character.effectiveLevel)]
    if (mapped.startingEquipment && !character.startingEquipmentTaken) {
      equipmentOffer.value = { profession: mapped.name, ...mapped.startingEquipment }
    } else if (mapped.startingEquipment) {
      left.push('starting equipment already taken')
    }
    return notify(toChoose(mapped.name, left))
  }

  const applyPath = (mapped) => {
    const check = pathDrop(character, mapped)
    if (check.refuse) return notify(check.refuse, 'refused')
    app.applyPath(mapped)
    if (check.mode === 'refresh') return notify(`Updated ${mapped.name}.`)
    return notify(toChoose(mapped.name, choicesAtLevel(mapped.choices, character.effectiveLevel)))
  }

  const takeStartingEquipment = (option) => {
    const offer = equipmentOffer.value
    equipmentOffer.value = null
    if (!offer || !option || !offer[option]) return
    const kit = offer[option]
    app.applyStartingEquipment(kit)
    notify(toChoose(`starting equipment ${option.toUpperCase()}`, kit.choices ?? [], 'Took'))
  }

  const apply = (plan, mapped) => {
    const name = mapped.name ?? 'The page'
    if (plan.apply === 'starship' || plan.apply === 'vehicle') {
      const want = plan.apply === 'vehicle' ? 'vehicle' : 'starship'
      if (want === 'vehicle' && !mapped.hasStatBlock) {
        return notify(`${name} has no stat block. Drop it onto a character's Vehicles list.`, 'refused')
      }
      if (!starship.isBlank() && starship.kind !== want) {
        return notify(`This sheet is a ${starship.kind}. ${name} goes on a blank one.`, 'refused')
      }
      const { updated } = starship.importEntry({ ...mapped, kind: want })
      sizeVehicleTokens(mapped)
      return notify(updated ? `Updated the ${want} from ${name}.` : `Imported ${name}.`)
    }
    if (plan.apply === 'vehicleList') {
      if (bio.vehicles.some((v) => String(v.name ?? '').trim().toLowerCase() === name.toLowerCase())) {
        return notify(`${name} is already on the Vehicles list.`)
      }
      bio.vehicles.push({ _id: uuidv4(), name, role: '' })
      return notify(`Added ${name} to Vehicles.`)
    }
    if (plan.apply === 'profession') return applyProfession(mapped)
    if (plan.apply === 'path') return applyPath(mapped)
    if (plan.apply === 'feat') {
      const done = app.applyFeat(mapped)
      if (done.refuse) return notify(done.refuse, 'refused')
      if (done.mode === 'refresh') return notify(`Updated ${name}.`)
      const trained = done.armor.length ? ` Trained in ${done.armor.map((id) => ARMOR_WORDS[id]).join(' and ')}.` : ''
      return notify(`${toChoose(done.mode === 'again' ? `${name} again` : name, mapped.choices, 'Took')}${trained}`)
    }
    if (plan.apply === 'technique') {
      const { updated } = techniques.importTechnique(mapped)
      return notify(updated ? `Updated ${name}.` : `Added ${name} to Techniques.`)
    }
    if (plan.apply === 'creatureTechnique') {
      const { updated } = npc.importTechnique(mapped)
      return notify(updated ? `Updated ${name}.` : `Added ${name} to Techniques, At Will.`)
    }
    if (plan.apply === 'creatureWeapon') {
      if (!mapped.attack) return notify('Only weapons drop onto a creature.', 'refused')
      npc.addWeaponAction(mapped.attack)
      return notify(`Added ${name} to Actions.`)
    }
    if (plan.apply === 'item') {
      const { weapon, pack } = app.addItemFromCompendium(mapped)
      if (weapon) return notify(`Added ${name} to Attacks and Equipment.`)
      return notify(pack ? `Unpacked ${name} into Equipment.` : `Added ${name} to Equipment.`)
    }
    if (plan.apply === 'proficiency') return addProficiency(mapped)
    if (plan.apply === 'species' || plan.apply === 'background') {
      const left = []
      if (plan.apply === 'species') app.applySpecies(mapped)
      else {
        const { leftover } = app.applyBackground(mapped)
        if (leftover) left.push(`${leftover} skill rank${leftover === 1 ? '' : 's'} to place`)
      }
      left.push(...mapped.choices)
      return notify(left.length ? `Added ${name}. To choose: ${left.join('; ')}.` : `Added ${name}.`)
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
      const vehicle = read.kind === 'vehicle' && read.mapped.hasStatBlock
      if (read.kind === 'starship' || vehicle) {
        if (!starship.isBlank()) return
        if (read.mapped.name) meta.name = read.mapped.name
        app.setSheetType(STARSHIP)
        starship.importEntry({ ...read.mapped, kind: vehicle ? 'vehicle' : 'starship' })
        sizeVehicleTokens(read.mapped)
        initValues.compendiumDrop = null
        return notify(`Imported ${read.mapped.name ?? 'the page'}.`)
      }
      if (read.kind !== 'creature' && read.kind !== 'ship') return
      if (!blank(read.kind)) return
      fillStatBlock(read.kind, read.mapped)
      initValues.compendiumDrop = null
      notify(`Imported ${read.mapped.name ?? 'the page'}.`)
    } catch {
    }
  }

  const tried = new Set()
  const grantTechniques = async () => {
    if (!meta.canEdit || app.sheetType !== PC) return
    const pending = pendingGrants(character.features, character.effectiveLevel)
      .filter((g) => !tried.has(`${g.featureId}|${g.name}`))
    if (!pending.length) return
    for (const g of pending) tried.add(`${g.featureId}|${g.name}`)
    const learned = []
    const missing = []
    for (const g of pending) {
      try {
        const { error, read } = await load({ pageName: g.name, categoryName: 'Techniques' })
        if (error || !read?.ok || read.kind !== 'technique') {
          missing.push(g.name)
          continue
        }
        const free = g.free ? { freeCasts: { ...g.free, used: 0 } } : {}
        techniques.importTechnique({
          fields: read.mapped.fields,
          extras: { ...read.mapped.extras, countsAsKnown: false, ...free },
        })
        const feature = character.features.find((f) => f._id === g.featureId)
        if (feature) feature.granted = [...grantedNames(feature.granted), g.name].join('|')
        learned.push(g.name)
      } catch {
        missing.push(g.name)
      }
    }
    if (missing.length) notify(`Couldn't find ${missing.join(', ')} in the compendium.`, 'refused')
    else if (learned.length) {
      const showing = dropNotice.value?.tone === 'ok' ? `${dropNotice.value.text} ` : ''
      notify(`${showing}Learned ${learned.join(', ')}.`)
    }
  }

  watch(
    () => pendingGrants(character.features, character.effectiveLevel).map((g) => `${g.featureId}|${g.name}`).join(','),
    (key) => { if (key) grantTechniques() },
  )

  watch(sheetDrops, (list, previous) => {
    const newest = list?.[0]
    if (newest && newest !== previous?.[0]) onSheetDrop(newest)
  })
  onMounted(onMapDrop)

  return { dropNotice, equipmentOffer, takeStartingEquipment }
}
