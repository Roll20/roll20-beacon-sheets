import { defineStore } from 'pinia'
import { editFlag } from '@/relay/permissions.js'
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import {
  equipmentPlan, backgroundRanks, mergeLevelFeatures, mergeLevelResources,
} from '@/compendium/drops.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useBioStore } from '@/stores/bioStore.js'
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import {
  DEFAULT_SHEET_TYPE,
  DEFAULT_NPC_MODE,
  getSheetType,
  getNpcMode,
  blocksFor,
} from '@/sheetTypes.js'
import {
  normalizeProficiencies, normalizeWeaponProperties, defensePartsFromEquipment, normalizeItem,
  normalizeFeature, normalizeProfessionStats, normalizeResource, ABILITY_IDS,
} from '@/rules/index.js'

export const DEFAULT_CHARACTER_NAME = 'New Character'

export const useAppStore = defineStore('app', () => {
  const stores = {
    meta: useMetaStore(),
    sheet: useCharacterStore(),
    techniques: useTechniqueStore(),
    bio: useBioStore(),
    starship: useStarshipStore(),
    npc: useNpcStore(),
    npcship: useNpcShipStore(),
  }
  const storeRegistry = Object.keys(stores)

  const pageLoading = ref(false)

  const linkedAttack = (item) =>
    item?.itemType === 'weapon' && item.attackId
      ? stores.sheet.attacks.find((a) => a._id === item.attackId) ?? null
      : null

  const syncEquipment = () => {
    const { sheet, bio } = stores
    const patch = defensePartsFromEquipment(bio.equipment, sheet.defenseParts)
    if (Object.keys(patch).length) Object.assign(sheet.defenseParts, patch)
    for (const item of bio.equipment) {
      const attack = linkedAttack(item)
      if (!attack) continue
      if (item.name !== attack.name) item.name = attack.name
      const grade = String(attack.grade ?? '')
      if (String(item.grade ?? '') !== grade) item.grade = grade
    }
  }

  watch(() => [stores.bio.equipment, stores.sheet.attacks], syncEquipment, { deep: true })

  const setItemType = (item, itemType) => {
    item.itemType = itemType
    if (itemType !== 'weapon' || linkedAttack(item)) return
    stores.sheet.addAttack()
    const row = stores.sheet.attacks[stores.sheet.attacks.length - 1]
    Object.assign(row, { name: item.name ?? '', grade: String(item.grade ?? '') })
    item.attackId = row._id
    item.equipped = true
  }

  const setItemField = (item, field, value) => {
    const attack = linkedAttack(item)
    if (attack && (field === 'name' || field === 'grade')) attack[field] = value
    item[field] = value
  }

  const addItemFromCompendium = ({ equipment, attack, contents = [] }, { wear = false } = {}) => {
    const { sheet, bio } = stores
    const worn = (type) => bio.equipment.some((e) => e.itemType === type && e.equipped)
    const newRow = (row) => {
      const equipped = wear && ['armor', 'shield'].includes(row.itemType) && !worn(row.itemType)
      const item = normalizeItem({ _id: uuidv4(), equipped, notes: '', ...row })
      bio.equipment.push(item)
      return item
    }
    if (attack) {
      sheet.addAttack()
      const row = sheet.attacks[sheet.attacks.length - 1]
      Object.assign(row, attack)
      newRow({ ...equipment, itemType: 'weapon', attackId: row._id, equipped: true })
      return { weapon: true }
    }
    const rows = contents.length ? contents : [equipment]
    for (const step of equipmentPlan(bio.equipment, rows)) {
      if (step.add) newRow(step.add)
      else {
        const item = bio.equipment.find((e) => e._id === step.bump)
        item.quantity = (parseInt(item.quantity, 10) || 1) + step.by
      }
    }
    return { pack: contents.length > 0, count: rows.length }
  }

  const replaceOriginFeatures = (prefix, rows) => {
    const { sheet } = stores
    sheet.features = sheet.features.filter((f) => !String(f.source ?? '').startsWith(prefix))
    for (const row of rows) sheet.features.push({ _id: uuidv4(), ...normalizeFeature(row) })
  }

  const addOriginProficiencies = (list = []) =>
    list.filter((p) => ['weapon', 'tool', 'vehicle'].includes(p.kind))
      .filter((p) => stores.sheet.addProficiency(p.kind, { id: p.id })).length

  const applySpecies = (mapped) => {
    const { sheet, bio } = stores
    sheet.species = mapped.name
    if (mapped.size) bio.size = mapped.size
    if (Number.isInteger(mapped.speed)) sheet.speed = mapped.speed
    const known = bio.languages.toLowerCase()
    const extra = mapped.languages.filter((l) => !known.includes(l.toLowerCase()))
    if (extra.length) bio.languages = [bio.languages.trim(), ...extra].filter(Boolean).join(', ')
    addOriginProficiencies(mapped.proficiencies)
    replaceOriginFeatures('species:', mapped.features)
  }

  const applyBackground = (mapped) => {
    const { sheet, bio } = stores
    sheet.background = mapped.name
    const { set, leftover } = backgroundRanks(sheet.skills, mapped.skillRanks, sheet.skillRankCap)
    for (const [id, ranks] of Object.entries(set)) sheet.skills[id].ranks = ranks
    addOriginProficiencies(mapped.proficiencies)
    if (mapped.equipment.length) addItemFromCompendium({ equipment: {}, contents: mapped.equipment })
    bio.meseta = (Number(bio.meseta) || 0) + (mapped.meseta || 0)
    replaceOriginFeatures('background:', mapped.features)
    return { leftover }
  }

  const placeLevelFeatures = (prefix, mapped) => {
    const { sheet } = stores
    sheet.features = mergeLevelFeatures(sheet.features, mapped.features, prefix, uuidv4)
      .map((f) => ({ _id: f._id, ...normalizeFeature(f) }))
    sheet.resources = mergeLevelResources(sheet.resources, mapped.resources, sheet.features, uuidv4)
      .map((r) => ({ _id: r._id, ...normalizeResource(r) }))
  }

  const placeProfessionStats = (mapped) => {
    const { sheet } = stores
    const current = normalizeProfessionStats(sheet.professionStats)
    sheet.professionStats = normalizeProfessionStats({
      ...current,
      ...mapped.professionStats,
      pathId: current.pathId,
      current: current.current,
    })
  }

  const applyProfession = (mapped, { refresh = false } = {}) => {
    const { sheet } = stores
    sheet.profession = mapped.name
    placeProfessionStats(mapped)
    placeLevelFeatures(`profession:${mapped.id}:`, mapped)
    if (refresh) return
    for (const id of mapped.saveProficiencies) if (ABILITY_IDS.includes(id)) sheet.saveProficiencies[id] = true
    for (const p of mapped.proficiencies) {
      if (p.kind === 'armor' && p.id in sheet.proficiencies.armor) sheet.proficiencies.armor[p.id] = true
    }
    addOriginProficiencies(mapped.proficiencies)
  }

  const applyPath = (mapped) => {
    const { sheet } = stores
    sheet.path = mapped.name
    sheet.professionStats = { ...normalizeProfessionStats(sheet.professionStats), pathId: mapped.id }
    placeLevelFeatures(`path:${mapped.id}:`, mapped)
  }

  const applyStartingEquipment = (kit) => {
    const { sheet, bio } = stores
    if (!kit) return
    for (const item of kit.items ?? []) addItemFromCompendium(item, { wear: true })
    bio.meseta = (Number(bio.meseta) || 0) + (kit.meseta || 0)
    sheet.startingEquipmentTaken = true
  }

  const removePath = () => {
    const { sheet } = stores
    const id = normalizeProfessionStats(sheet.professionStats).pathId
    sheet.path = ''
    sheet.professionStats = { ...normalizeProfessionStats(sheet.professionStats), pathId: '' }
    if (id) placeLevelFeatures(`path:${id}:`, { features: [], resources: [] })
  }

  const removeProfession = () => {
    const { sheet } = stores
    const stats = normalizeProfessionStats(sheet.professionStats)
    removePath()
    sheet.profession = ''
    sheet.professionStats = normalizeProfessionStats({ current: stats.current })
    const prefix = stats.id ? `profession:${stats.id}:` : null
    if (prefix) placeLevelFeatures(prefix, { features: [], resources: [] })
  }

  const sheetType = ref(DEFAULT_SHEET_TYPE)
  const setSheetType = (next) => {
    sheetType.value = getSheetType(next).id
  }

  const npcMode = ref(DEFAULT_NPC_MODE)
  const setNpcMode = (next) => {
    npcMode.value = getNpcMode(next).id
  }

  const dehydrateStore = () => {
    const character = {
      attributes: { sheetType: sheetType.value, npcMode: npcMode.value },
    }
    const blocks = blocksFor(sheetType.value, npcMode.value)
    Object.keys(stores).forEach((key) => {
      if (key === 'meta') {
        const { name, bio, gmNotes, avatar } = stores.meta.dehydrate()
        character.name = name
        character.bio = bio
        character.gmNotes = gmNotes
        character.avatar = avatar
      } else if (blocks.includes(key)) {
        character.attributes[key] = stores[key].dehydrate()
      }
    })
    return character
  }

  const UNNAMED = new Set(['', DEFAULT_CHARACTER_NAME])

  const adoptBlockName = (partial) => {
    if (!partial || !UNNAMED.has(stores.meta.name ?? '')) return
    const stored = partial.npc?.name || partial.npcship?.name || partial.starship?.name
    if (stored) stores.meta.name = stored
  }

  const hydrateStore = (partial, meta) => {
    if (partial) {
      if (partial.sheetType !== undefined) setSheetType(partial.sheetType)
      if (partial.npcMode !== undefined) setNpcMode(partial.npcMode)
      storeRegistry.forEach((store) => {
        if (!partial[store]) return
        stores[store].hydrate(partial[store])
      })
    }
    if (meta) stores.meta.hydrate(meta)
    adoptBlockName(partial)
  }

  const setPermissions = (owned, gm) => {
    stores.meta.permissions.isOwner = editFlag(owned)
    stores.meta.permissions.isGM = editFlag(gm)
  }
  const setCampaignId = (campaignId) => {
    stores.meta.campaignId = campaignId
  }

  const loadExampleData = () => {
    if (!import.meta.env.DEV) return
    const sheet = stores.sheet
    stores.meta.name = 'Alis Landale'
    sheet.species = 'Human'
    sheet.background = 'Patrician'
    sheet.profession = 'Guardian'
    sheet.path = 'Champion'
    sheet.level = 5
    sheet.xp = 6500
    sheet.professionStats = {
      hitDie: 10,
      techAbility: 'charisma',
      levels: null,
      current: {
        attackBonus: 4, techBonus: 3, techniquesKnown: 5,
        maxTechRank: 2, advancedRank: null, maxTP: 28,
      },
    }
    sheet.abilities = {
      strength: 3, dexterity: 2, constitution: 2,
      intelligence: 0, wisdom: 1, charisma: 3,
    }
    sheet.saveProficiencies = {
      strength: false, dexterity: false, constitution: false,
      intelligence: false, wisdom: true, charisma: true,
    }
    sheet.skills.athletics = { ranks: 3, misc: 0 }
    sheet.skills.perception = { ranks: 2, misc: 0 }
    sheet.skills.persuasion = { ranks: 3, misc: 0 }
    sheet.hp = { current: 38, max: 44, temp: 0 }
    sheet.tp = { current: 28 }
    sheet.defenseParts = {
      ...sheet.defenseParts,
      armorBonus: 0, armorName: '', armorType: 'none', shieldBonus: 0, shieldName: '',
    }
    sheet.speed = 30
    sheet.proficiencies = normalizeProficiencies({
      armorLight: true, armorMedium: true, armorHeavy: true, shields: true,
      weapons: 'Axes, claws, daggers, pistols, rods, slashers, swords',
      tools: "Gunsmith's tools, Vehicles (Groundcraft)",
    })
    sheet.proficiencies.mastery.swords = true
    sheet.features = []
    const feature = (name, group, level, source) => {
      const id = sheet.addFeature(group)
      Object.assign(sheet.features.find((f) => f._id === id), { name, level, source })
    }
    feature('Adaptable', 'origin', null, 'species:human')
    feature('Resourceful', 'origin', null, 'species:human')
    feature('Versatile', 'origin', null, 'species:human')
    feature('Regenerative Force', 'profession', 1, 'profession:guardian:level-1')
    feature('Weapon Mastery', 'profession', 1, 'profession:guardian:level-1')
    feature('Fury Strike', 'profession', 2, 'profession:guardian:level-2')
    feature('Techniques', 'profession', 2, 'profession:guardian:level-2')
    feature('Extra Attack', 'profession', 5, 'profession:guardian:level-5')
    sheet.attacks = []
    sheet.addAttack()
    Object.assign(sheet.attacks[0], {
      name: 'Steel Sword', type: 'swords', grade: '2', kind: 'melee', range: '5 ft.',
      baseDamage: '1d8', damageType: 'Physical',
      properties: normalizeWeaponProperties(['versatile']),
    })
    const techniques = stores.techniques
    techniques.known = []
    techniques.addTechnique({ name: 'Anti', rank: 1, castingTime: 'Action', range: 'Touch', duration: '1 hour' })
    techniques.addTechnique(
      { name: 'Foi', rank: 1, castingTime: 'Action', range: '120 ft.', duration: 'Instant', attack: true, saveAbility: 'constitution' },
      { damage: '2d8', damageType: 'Fire' },
    )
    techniques.addTechnique(
      { name: 'Resta', rank: 1, castingTime: 'Action', range: 'Touch', duration: 'Instant' },
      { healing: '2d8', addAbilityMod: true },
    )
    techniques.addTechnique({
      name: 'Shifta', rank: 1, castingTime: 'Action', range: '30 ft.', duration: 'Up to 1 minute',
      concentration: true, components: { type: 'perishable', text: '50 mst' },
    })
    techniques.addTechnique(
      { name: 'Zan', rank: 2, castingTime: 'Action', range: '90 ft.', duration: 'Instant', attack: true },
      { damage: '2d6', damageType: 'Physical' },
    )
    techniques.addTechnique({ name: 'Recover', rank: 2, castingTime: '10 minutes', range: '30 ft.', duration: 'Instant' })

    const bio = stores.bio
    bio.appearance = "Red cloak over light carbon plate; a Palmian swordswoman with her father’s blade."
    bio.history = "Sworn to avenge her brother Nero and end King Lassic’s reign over Algol."
    bio.storyBonds = 'Myau, Odin, Lutz.'
    bio.languages = 'Common'
    bio.size = 'medium'
    bio.meseta = 1250
    bio.lifestyle = 'modest'
    bio.equipment = [
      { _id: 'eq-sword', name: 'Steel Sword', grade: '2', quantity: 1, weight: 3, equipped: true, notes: '',
        itemType: 'weapon', attackId: sheet.attacks[0]._id },
      { _id: 'eq-armor', name: 'Carbon Suit', grade: '0', quantity: 1, weight: 12, equipped: true, notes: '',
        itemType: 'armor', category: 'medium' },
      { _id: 'eq-shield', name: 'Carbon Shield', grade: '0', quantity: 1, weight: 3, equipped: true, notes: '',
        itemType: 'shield' },
      { _id: 'eq-mono', name: 'Monomate', grade: '0', quantity: 5, weight: 1, equipped: false, notes: '',
        itemType: 'consumable' },
    ].map(normalizeItem)
    bio.vehicles = [{ _id: 'v-land', name: 'Landrover', role: 'Driver' }]

    const ship = stores.starship
    ship.owner = 'Alis Landale'
    ship.size = 'large'
    ship.crewCapacity = 8
    ship.actionStations = 'Pilot 1, Technician 1, Gunner 2'
    ship.baseDefense = 10
    ship.maneuverability = 2
    ship.defenseModifier = 5
    ship.baseHullPoints = 22
    ship.baseStructuralIntegrity = 5
    ship.hullDie = 'd10'
    ship.hullDiceTotal = 4
    ship.interceptSpeed = 5
    ship.sensorRange = 14
    ship.hullCurrent = 32
    ship.siCurrent = 7
    ship.roster = [
      { _id: 'c1', name: 'Alis Landale', dexterity: 2, intelligence: 0, wisdom: 1, saveBonus: 3, proficient: true },
      { _id: 'c2', name: 'Odin', dexterity: 0, intelligence: 2, wisdom: 2, saveBonus: 3, proficient: false },
      { _id: 'c3', name: 'Myau', dexterity: 3, intelligence: 1, wisdom: 2, saveBonus: 3, proficient: true },
    ]
    ship.stations = { pilot: 'c1', copilot: '', technician1: 'c2', technician2: '' }
    ship.weapons = [
      {
        _id: 'w-laser-1', gunnerId: 'c3', name: 'Laser Cannon', range: '8',
        damage: '1d8', damageType: 'Radiant', addDexToDamage: true, notes: '',
      },
      {
        _id: 'w-laser-2', gunnerId: 'c3', name: 'Laser Cannon', range: '8',
        damage: '1d8', damageType: 'Radiant', addDexToDamage: true, notes: '',
      },
    ]
  }

  return {
    ...stores,
    storeRegistry,
    sheetType,
    setSheetType,
    npcMode,
    setNpcMode,
    dehydrateStore,
    hydrateStore,
    setPermissions,
    setCampaignId,
    pageLoading,
    loadExampleData,
    linkedAttack,
    setItemType,
    setItemField,
    addItemFromCompendium,
    applySpecies,
    applyBackground,
    applyProfession,
    applyPath,
    applyStartingEquipment,
    removeProfession,
    removePath,
  }
})
