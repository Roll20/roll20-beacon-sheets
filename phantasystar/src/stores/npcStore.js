import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'

import {
  ABILITY_IDS,
  DEFAULT_CREATURE_SIZE,
  monsterBonus,
  monsterPassivePerception,
  proficiencyForCR,
  xpForCR,
  statBlockFromCharacter,
  hiddenAttackIds,
  normalizeEntry,
  normalizeLegendary,
  normalizeBoss,
  normalizeCreatureTechniques,
  normalizeCreatureTechnique,
  normalizeTechniqueGroup,
  bossUses,
  spendUses,
  slugId,
  AT_WILL,
  storeActionBlock,
  loadActionBlock,
  storeCreatureTechniques,
  loadCreatureTechniques,
} from '@/rules/index.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useBioStore } from '@/stores/bioStore.js'

const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const blankAbilities = () => Object.fromEntries(ABILITY_IDS.map((id) => [id, 0]))
const blankProficiencies = () => Object.fromEntries(ABILITY_IDS.map((id) => [id, false]))

const npcStore = () => {
  const size = ref(DEFAULT_CREATURE_SIZE)
  const tokenSize = ref('')
  const creatureType = ref('')
  const tags = ref('')
  const alignment = ref('')

  const defense = ref(10)
  const defenseNote = ref('')
  const hp = ref({ current: 0, max: 0, temp: 0 })
  const hitDice = ref('')
  const speed = ref('30 ft.')
  const initiative = ref(0)

  const abilities = ref(blankAbilities())
  const saveProficiencies = ref(blankProficiencies())
  const saveBonus = ref(null)

  const cr = ref('')
  const notes = ref('')
  const skills = ref([])
  const senses = ref('')
  const languages = ref('')
  const resistances = ref('')
  const immunities = ref('')

  const addSkill = () => {
    skills.value.push({ _id: uuidv4(), name: '', bonus: 0 })
  }

  const removeSkill = (id) => {
    const i = skills.value.findIndex((s) => s._id === id)
    if (i >= 0) skills.value.splice(i, 1)
  }

  const traits = ref([])
  const actions = ref([])
  const specialActions = ref([])
  const reactions = ref([])

  const legendary = ref(normalizeLegendary())
  const boss = ref(normalizeBoss())
  const techniques = ref(normalizeCreatureTechniques())

  const blankEntry = (name = '') => ({ _id: uuidv4(), ...normalizeEntry({ name }) })

  const listFor = (kind) =>
    ({
      trait: traits.value,
      action: actions.value,
      specialAction: specialActions.value,
      reaction: reactions.value,
      legendary: legendary.value.actions,
      boss: boss.value.actions,
    })[kind] ?? actions.value

  const addEntry = (kind) => {
    listFor(kind).push(blankEntry())
  }

  const removeEntry = (kind, id) => {
    const list = listFor(kind)
    const i = list.findIndex((e) => e._id === id)
    if (i >= 0) list.splice(i, 1)
  }

  const setSection = (section, on) => {
    const block = { legendary, boss, techniques }[section]
    if (block) block.value.enabled = !!on
  }

  const spendAction = (section, entry) => {
    const block = { legendary, boss }[section]?.value
    if (!block) return false
    const total = section === 'boss' ? bossUses(block) : block.uses
    const next = spendUses(block.used, total, entry?.cost)
    if (next === null) return false
    block.used = next
    return true
  }

  const setUsed = (section, used) => {
    const block = { legendary, boss }[section]?.value
    if (block) block.used = Math.max(0, Number(used) || 0)
  }

  const addTechniqueGroup = (uses = AT_WILL) => {
    techniques.value.groups.push({ _id: uuidv4(), ...normalizeTechniqueGroup({ uses }) })
  }

  const removeTechniqueGroup = (groupId) => {
    const groups = techniques.value.groups
    const i = groups.findIndex((g) => g._id === groupId)
    if (i >= 0) groups.splice(i, 1)
  }

  const addCreatureTechnique = (groupId) => {
    const group = techniques.value.groups.find((g) => g._id === groupId)
    if (!group) return null
    const technique = { _id: uuidv4(), ...normalizeCreatureTechnique({}) }
    group.list.push(technique)
    return technique._id
  }

  const removeCreatureTechnique = (groupId, techniqueId) => {
    const group = techniques.value.groups.find((g) => g._id === groupId)
    if (!group) return
    const i = group.list.findIndex((t) => t._id === techniqueId)
    if (i >= 0) group.list.splice(i, 1)
  }

  const setTechniqueUsed = (technique, used) => {
    if (technique) technique.used = Math.max(0, Number(used) || 0)
  }

  const restoreTechniques = () => {
    techniques.value.groups.forEach((g) => g.list.forEach((t) => { t.used = 0 }))
  }

  const proficiencyBonus = computed(() => proficiencyForCR(cr.value) ?? 0)

  const xp = computed(() => xpForCR(cr.value))

  const saves = computed(() =>
    Object.fromEntries(
      ABILITY_IDS.map((id) => [
        id,
        monsterBonus(abilities.value[id], cr.value, !!saveProficiencies.value[id], saveBonus.value ?? 0),
      ]),
    ),
  )

  const passivePerception = computed(() => {
    const perception = skills.value.find((s) => /perception/i.test(s.name || ''))
    return monsterPassivePerception(
      perception ? num(perception.bonus) : num(abilities.value.wisdom),
    )
  })

  const damageEntry = (entry) =>
    [entry.damage, entry.damageType].filter(Boolean).join(' ')

  const importEntry = ({
    patch = {}, notes: prose, skills: k = [], traits: t = [], actions: a = [], reactions: r = [],
    specialActions: sa = [], legendary: leg = null, boss: bs = null, techniques: tech = null,
  } = {}) => {
    hydrate(patch)
    if (prose) notes.value = prose
    k.forEach((line) => skills.value.push({ _id: uuidv4(), name: '', bonus: 0, ...line }))
    const append = (list, rows) =>
      rows.forEach((row) => list.value.push({ ...blankEntry(), ...normalizeEntry(row) }))
    append(traits, t)
    append(actions, a)
    append(specialActions, sa)
    append(reactions, r)
    importSections({ legendary: leg, boss: bs, techniques: tech })
  }

  const importSections = ({ legendary: leg, boss: bs, techniques: tech }) => {
    const entries = (rows = []) => rows.map((row) => ({ _id: uuidv4(), ...normalizeEntry(row) }))
    const techs = (rows = []) => rows.map((row) => ({ _id: uuidv4(), ...normalizeCreatureTechnique(row) }))
    if (leg) {
      legendary.value.enabled = true
      if (leg.uses !== undefined) legendary.value.uses = leg.uses
      if (leg.text) legendary.value.text = leg.text
      legendary.value.actions.push(...entries(leg.actions))
    }
    if (bs) {
      boss.value.enabled = true
      if (bs.text) boss.value.text = bs.text
      boss.value.actions.push(...entries(bs.actions))
    }
    if (tech) {
      const block = techniques.value
      block.enabled = true
      for (const key of ['ability', 'attack', 'saveDC', 'note']) {
        if (tech[key] !== undefined && tech[key] !== '') block[key] = tech[key]
      }
      for (const group of tech.groups ?? []) {
        block.groups.push({ _id: uuidv4(), uses: group.uses, list: techs(group.list) })
      }
      const known = new Set([...block.groups.flatMap((g) => g.list), ...block.extra].map((x) => x.id))
      for (const extra of tech.extra ?? []) {
        if (!known.has(extra.id)) block.extra.push(...techs([extra]))
      }
    }
  }

  const hasCharacter = computed(() => {
    const sheet = useCharacterStore()
    return !!(
      sheet.profession ||
      sheet.species ||
      num(sheet.hp.max) > 0 ||
      sheet.attacks.length ||
      ABILITY_IDS.some((id) => num(sheet.abilities[id]) !== 0)
    )
  })

  const copyFromCharacter = () => {
    const sheet = useCharacterStore()
    const techniqueStore = useTechniqueStore()
    const bio = useBioStore()
    const parts = sheet.defenseParts

    const block = statBlockFromCharacter({
      abilities: sheet.abilities,
      saveProficiencies: sheet.saveProficiencies,
      saveBonus: sheet.saveBonusValue,
      hp: sheet.hp,
      hitDice: sheet.hitDice,
      defense: sheet.defenseValue,
      armorName: parts.armorName,
      shieldName: parts.shieldName,
      speed: sheet.speedValue,
      agility: sheet.agilityValue,
      skillRoster: sheet.skillRoster.map((s) => ({
        name: s.name,
        ranks: sheet.skills[s.id]?.ranks,
        misc: sheet.skills[s.id]?.misc,
        total: sheet.skillTotals[s.id],
      })),
      resistances: sheet.resistances,
      size: bio.size,
      species: sheet.species,
      languages: bio.languages,
      features: sheet.features,
      attacksPerAction: sheet.attacksPerAction,
      weapons: sheet.attacks
        .filter((a) => !hiddenAttackIds(bio.equipment).has(a._id))
        .map((a) => ({
          ...sheet.resolveAttack(a),
          attackPower: sheet.attackPowerFor(a).value,
        })),
      techniques: techniqueStore.techniques,
      techAttacks: techniqueStore.techAttacks,
      techAttackPower: sheet.techAttackPowerValue,
      techSaveDC: sheet.techSaveDCValue,
      techAbilityMod: sheet.techAbilityMod,
      maxTP: sheet.maxTP,
    })

    hydrate(block.patch)
    skills.value = block.skills.map((s) => ({ _id: uuidv4(), ...s }))
    traits.value = block.traits.map((t) => ({ ...blankEntry(), ...t }))
    actions.value = block.actions.map((a) => ({ ...blankEntry(), ...a }))
  }

  const dehydrate = () => ({
    size: size.value,
    tokenSize: tokenSize.value,
    creatureType: creatureType.value,
    tags: tags.value,
    alignment: alignment.value,
    defense: defense.value,
    defenseNote: defenseNote.value,
    hp: hp.value,
    hitDice: hitDice.value,
    speed: speed.value,
    initiative: initiative.value,
    abilities: abilities.value,
    saveProficiencies: saveProficiencies.value,
    saveBonus: saveBonus.value,
    cr: cr.value,
    notes: notes.value,
    skills: arrayToObject(skills.value),
    senses: senses.value,
    languages: languages.value,
    resistances: resistances.value,
    immunities: immunities.value,
    traits: arrayToObject(traits.value),
    actions: arrayToObject(actions.value),
    specialActions: arrayToObject(specialActions.value),
    reactions: arrayToObject(reactions.value),
    legendary: storeActionBlock(legendary.value, uuidv4),
    boss: storeActionBlock(boss.value, uuidv4),
    techniques: storeCreatureTechniques(techniques.value, uuidv4),
    saves: saves.value,
    passivePerception: passivePerception.value,
  })

  const hydrate = (s = {}) => {
    size.value = s.size ?? size.value
    tokenSize.value = s.tokenSize ?? tokenSize.value
    creatureType.value = s.creatureType ?? creatureType.value
    tags.value = s.tags ?? tags.value
    alignment.value = s.alignment ?? alignment.value
    defense.value = s.defense ?? defense.value
    defenseNote.value = s.defenseNote ?? defenseNote.value
    hp.value = { ...hp.value, ...(s.hp || {}) }
    hitDice.value = s.hitDice ?? hitDice.value
    speed.value = s.speed ?? speed.value
    initiative.value = s.initiative ?? initiative.value
    if (s.abilities) abilities.value = { ...blankAbilities(), ...s.abilities }
    if (s.saveProficiencies) {
      saveProficiencies.value = { ...blankProficiencies(), ...s.saveProficiencies }
    }
    if ('saveBonus' in s) saveBonus.value = s.saveBonus
    cr.value = s.cr ?? cr.value
    notes.value = s.notes ?? notes.value
    senses.value = s.senses ?? senses.value
    languages.value = s.languages ?? languages.value
    resistances.value = s.resistances ?? resistances.value
    immunities.value = s.immunities ?? immunities.value
    if (s.skills) skills.value = objectToArray(s.skills)
    if (s.traits) traits.value = objectToArray(s.traits)
    if (s.actions) actions.value = objectToArray(s.actions)
    if (s.specialActions) specialActions.value = objectToArray(s.specialActions)
    if (s.reactions) reactions.value = objectToArray(s.reactions)
    if (s.legendary) legendary.value = loadActionBlock(s.legendary, normalizeLegendary)
    if (s.boss) boss.value = loadActionBlock(s.boss, normalizeBoss)
    if (s.techniques) techniques.value = loadCreatureTechniques(s.techniques)
  }

  return {
    size, tokenSize, creatureType, tags, alignment,
    defense, defenseNote, hp, hitDice, speed, initiative,
    abilities, saveProficiencies, saveBonus,
    cr, notes, skills, senses, languages, resistances, immunities,
    traits, actions, specialActions, reactions,
    legendary, boss, techniques,
    proficiencyBonus, xp, saves,
    passivePerception, hasCharacter,
    addSkill, removeSkill, addEntry, removeEntry, damageEntry,
    setSection, spendAction, setUsed, entriesFor: listFor,
    addTechniqueGroup, removeTechniqueGroup, addCreatureTechnique, removeCreatureTechnique,
    setTechniqueUsed, restoreTechniques, slugId,
    importEntry, copyFromCharacter,
    dehydrate, hydrate,
  }
}

export const useNpcStore = defineStore('npc', npcStore)
