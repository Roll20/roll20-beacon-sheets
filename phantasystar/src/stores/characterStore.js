import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { arrayToObject, objectToArray } from '@/utility/objectify'

import {
  ABILITY_IDS, SKILLS, getSkill, summarizeSheet,
  characterAttackPower, normalizeResistances, normalizeTechOptions,
  normalizeProfessionStats, hasLevelTable, normalizeSaveOptions,
  normalizeFeature, featuresFromText, DEFAULT_FEATURE_GROUP,
  normalizeProficiencies, isWeaponProficient, planProficiency,
  rowProficiency, weaponDamage, migrateAttackRow, storeWeaponText,
  normalizeWeaponProperties, attackAbility, versatileBonus, typedDamage,
} from '@/rules/index.js'
import { sharedSettings } from '@/relay/sheetSettings.js'

const blankAbilities = () => Object.fromEntries(ABILITY_IDS.map((id) => [id, 0]))
const blankSaveProfs = () => Object.fromEntries(ABILITY_IDS.map((id) => [id, false]))
const blankSkills = () =>
  Object.fromEntries(SKILLS.map((s) => [s.id, { ranks: 0, misc: 0 }]))

const num = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const characterStore = () => {
  const species = ref('')
  const background = ref('')
  const profession = ref('')
  const professionStats = ref(normalizeProfessionStats())
  const path = ref('')
  const level = ref(1)
  const xp = ref(0)

  const abilities = ref(blankAbilities())
  const saveProficiencies = ref(blankSaveProfs())
  const saveOptions = ref(normalizeSaveOptions())

  const skills = ref(blankSkills())

  const hp = ref({ current: 0, max: 0, temp: 0 })
  const hitDiceUsed = ref(0)
  const deathSaves = ref({ survive: 0, perish: 0 })
  const tp = ref({ current: 0 })
  const techOptions = ref(normalizeTechOptions())

  const defenseParts = ref({
    armorBonus: 0,
    armorName: '',
    shieldBonus: 0,
    shieldName: '',
    armorType: 'none',
    stealthDisadvantage: false,
    techniqueMod: 0,
    techniqueNote: '',
    itemMisc: 0,
    itemMiscNote: '',
    armorItemId: '',
    armorGrade: 0,
    armorStrength: '',
    shieldItemId: '',
    shieldGrade: 0,
  })

  const speed = ref(30)
  const speedMisc = ref(0)
  const agilityMisc = ref(0)

  const fateSpent = ref(0)

  const features = ref([])

  const resistances = ref(normalizeResistances(null))
  const proficiencies = ref(normalizeProficiencies(null))

  const attacksPerAction = ref(1)
  const attacks = ref([])

  const blankAttack = () => ({
    _id: uuidv4(),
    name: '',
    type: '',
    grade: '',
    kind: 'melee',
    range: '',
    rollsToHit: true,
    ability: '',
    properties: normalizeWeaponProperties(null),
    thrownRange: '',
    ammunitionType: '',
    twoHanded: false,
    proficient: 'auto',
    attackMisc: '',
    attackPower: '',
    critFrom: 20,
    baseDamage: '',
    damageMisc: '',
    damage: '',
    damageType: '',
    critExtra: '',
    damage2: '',
    damage2Type: '',
    crit2Extra: '',
    saveAbility: '',
    saveDC: '',
    saveEffect: '',
    isMastery: 'auto',
    mastery: '',
    notes: '',
    text: [],
  })

  const addFeature = (group = DEFAULT_FEATURE_GROUP) => {
    const feature = { _id: uuidv4(), ...normalizeFeature({ group }) }
    features.value.push(feature)
    return feature._id
  }
  const removeFeature = (id) => {
    const i = features.value.findIndex((f) => f._id === id)
    if (i >= 0) features.value.splice(i, 1)
  }

  const addAttack = () => {
    attacks.value.push(blankAttack())
  }
  const removeAttack = (id) => {
    const i = attacks.value.findIndex((a) => a._id === id)
    if (i >= 0) attacks.value.splice(i, 1)
  }

  const summary = computed(() =>
    summarizeSheet({
      professionStats: professionStats.value,
      level: level.value,
      xp: xp.value,
      abilities: abilities.value,
      saveProficiencies: saveProficiencies.value,
      saveOptions: saveOptions.value,
      skills: skills.value,
      hp: hp.value,
      hitDiceUsed: hitDiceUsed.value,
      tp: tp.value,
      techOptions: techOptions.value,
      defenseParts: defenseParts.value,
      proficiencies: proficiencies.value,
      speed: speed.value,
      speedMisc: speedMisc.value,
      agilityMisc: agilityMisc.value,
      fateSpent: fateSpent.value,
    }),
  )

  const hasProfessionTable = computed(() => hasLevelTable(professionStats.value))
  const effectiveLevel = computed(() => summary.value.level)

  const saveBonusValue = computed(() => summary.value.saveBonus)
  const skillRankCap = computed(() => summary.value.skillRankCap)
  const levelForXp = computed(() => summary.value.levelForXp)

  const attackBonusValue = computed(() => summary.value.attackBonus)
  const techBonusValue = computed(() => summary.value.techBonus)
  const techAbility = computed(() => summary.value.techAbility)
  const techAbilityMod = computed(() => summary.value.techAbilityMod)

  const maxTechRankValue = computed(() => summary.value.maxTechRank)
  const advancedRankValue = computed(() => summary.value.advancedRank)
  const techniquesKnownValue = computed(() => summary.value.techniquesKnown)

  const maxTP = computed(() => summary.value.maxTP)

  const techAttackPowerValue = computed(() => summary.value.techAttackPower)
  const techSaveDCValue = computed(() => summary.value.techSaveDC)

  const saves = computed(() => summary.value.saves)
  const deathSaveBonus = computed(() => summary.value.deathSaveBonus)

  const attackPowerFor = (attack = {}) => {
    const abilityId = attackAbility(attack, abilities.value)
    const abilityMod = num(abilities.value[abilityId])
    const { proficient } = rowProficiency(attack, proficiencies.value)
    const derived = characterAttackPower({
      abilityMod,
      attackBonus: summary.value.attackBonus,
      proficient,
      misc: num(attack.attackMisc),
    })

    const typed = String(attack.attackPower ?? '').trim()
    const overridden = typed !== ''

    return {
      abilityId,
      abilityMod,
      proficient,
      bonus: proficient ? num(summary.value.attackBonus) : 0,
      misc: num(attack.attackMisc),
      derived,
      overridden,
      value: overridden ? num(typed) : derived,
    }
  }

  const damageFor = (attack = {}) => {
    const row = rowProficiency(attack, proficiencies.value)
    const abilityId = attackAbility(attack, abilities.value)
    const built = weaponDamage({
      baseDamage: attack.baseDamage,
      gradeInUse: row.gradeInUse,
      abilityMod: num(abilities.value[abilityId]),
      proficient: row.proficient,
      misc: attack.damageMisc,
      byGrade: !!sharedSettings.weaponDamageByGrade,
      versatile: versatileBonus(attack),
    })
    const typed = typedDamage(attack.damage, versatileBonus(attack))
    return { ...row, ...built, abilityId, derived: built.formula, overridden: typed !== '', value: typed || built.formula }
  }

  const resolveAttack = (attack = {}) => {
    const d = damageFor(attack)
    return { ...attack, proficient: d.proficient, isMastery: d.mastered, damage: d.value }
  }

  const skillTotals = computed(() => summary.value.skillTotals)

  const skillRoster = computed(() => summary.value.skillRoster)

  const passivePerceptionValue = computed(() => summary.value.passivePerception)

  const defenseValue = computed(() => summary.value.defense)

  const armorState = computed(() => summary.value.armor)

  const defenseDexApplied = computed(() => summary.value.defenseDexApplied)

  const agilityValue = computed(() => summary.value.agility)
  const speedValue = computed(() => summary.value.speed)

  const fate = computed(() => summary.value.fate)
  const hitDice = computed(() => summary.value.hitDice)
  const suggestedMaxHp = computed(() => summary.value.suggestedMaxHp)

  const setSkillRanks = (skillId, ranks) => {
    const entry = skills.value[skillId]
    if (!entry) return
    const capped = Math.min(skillRankCap.value, Math.max(0, num(ranks)))
    entry.ranks = entry.ranks === capped ? capped - 1 : capped
    if (entry.ranks < 0) entry.ranks = 0
  }

  const setSkillMisc = (skillId, misc) => {
    const entry = skills.value[skillId]
    if (entry) entry.misc = num(misc)
  }

  const setSkillAbility = (skillId, abilityId) => {
    const entry = skills.value[skillId]
    if (!entry) return
    const base = getSkill(skillId)?.ability ?? null
    if (!abilityId || abilityId === base || !ABILITY_IDS.includes(abilityId)) {
      delete entry.ability
    } else {
      entry.ability = abilityId
    }
  }

  const toggleResistance = (typeId) => {
    if (typeId in resistances.value && typeId !== 'other') {
      resistances.value[typeId] = !resistances.value[typeId]
    }
  }

  const toggleProficiency = (kind, id) => {
    const map = proficiencies.value[kind]
    if (!map || !(id in map)) return
    if (kind === 'mastery' && !map[id] && !isWeaponProficient(proficiencies.value, id)) return
    map[id] = !map[id]
    if (kind === 'weapon' && !map[id]) proficiencies.value.mastery[id] = false
  }

  const addProficiency = (kind, { name = '', id = '', parent = '' } = {}) => {
    const plan = planProficiency(proficiencies.value, { kind, name, id, parent })
    if (!plan) return false
    if (plan.builtIn && proficiencies.value[kind][plan.builtIn]) return false
    if (plan.builtIn) proficiencies.value[kind][plan.builtIn] = true
    else proficiencies.value.custom.push({ _id: uuidv4(), ...plan.custom })
    return true
  }

  const removeCustomProficiency = (entryId) => {
    const list = proficiencies.value.custom
    const i = list.findIndex((c) => c._id === entryId)
    if (i >= 0) list.splice(i, 1)
  }

  const toggleCustomMastery = (entryId) => {
    const entry = proficiencies.value.custom.find((c) => c._id === entryId)
    if (entry?.kind === 'weapon') entry.mastery = !entry.mastery
  }

  const toggleSaveProficiency = (abilityId) => {
    saveProficiencies.value[abilityId] = !saveProficiencies.value[abilityId]
  }

  const clearProfessionTable = () => {
    professionStats.value = { ...professionStats.value, levels: null }
  }

  const setDeathSave = (kind, count) => {
    const cur = deathSaves.value[kind]
    deathSaves.value[kind] = cur === count ? count - 1 : count
    if (deathSaves.value[kind] < 0) deathSaves.value[kind] = 0
  }

  const clearDeathSaves = () => {
    deathSaves.value = { survive: 0, perish: 0 }
  }

  const dehydrate = () => ({
    species: species.value,
    background: background.value,
    profession: profession.value,
    professionStats: professionStats.value,
    path: path.value,
    level: level.value,
    xp: xp.value,
    abilities: abilities.value,
    saveProficiencies: saveProficiencies.value,
    saveOptions: saveOptions.value,
    skills: skills.value,
    hp: hp.value,
    hitDiceUsed: hitDiceUsed.value,
    deathSaves: deathSaves.value,
    tp: tp.value,
    techOptions: techOptions.value,
    defenseParts: defenseParts.value,
    speed: speed.value,
    speedMisc: speedMisc.value,
    agilityMisc: agilityMisc.value,
    fateSpent: fateSpent.value,
    features: arrayToObject(features.value),
    originFeatures: '',
    professionFeatures: '',
    resistances: resistances.value,
    proficiencies: { ...proficiencies.value, custom: arrayToObject(proficiencies.value.custom) },
    attacksPerAction: attacksPerAction.value,
    attacks: arrayToObject(attacks.value.map((a) => ({ ...a, text: storeWeaponText(a.text) }))),
  })

  const hydrate = (s = {}) => {
    species.value = s.species ?? species.value
    background.value = s.background ?? background.value
    profession.value = s.profession ?? profession.value
    if (s.professionStats) professionStats.value = normalizeProfessionStats(s.professionStats)
    path.value = s.path ?? path.value
    level.value = s.level ?? level.value
    xp.value = s.xp ?? xp.value
    abilities.value = { ...blankAbilities(), ...(s.abilities || {}) }
    saveProficiencies.value = { ...blankSaveProfs(), ...(s.saveProficiencies || {}) }
    if (s.saveOptions) saveOptions.value = normalizeSaveOptions(s.saveOptions)
    skills.value = Object.fromEntries(
      SKILLS.map((sk) => [sk.id, { ranks: 0, misc: 0, ...(s.skills?.[sk.id] || {}) }]),
    )
    hp.value = { ...hp.value, ...(s.hp || {}) }
    hitDiceUsed.value = s.hitDiceUsed ?? hitDiceUsed.value
    deathSaves.value = { ...deathSaves.value, ...(s.deathSaves || {}) }
    tp.value = { ...tp.value, ...(s.tp || {}) }
    const legacyMaxTP = tp.value.maxOverride
    if (legacyMaxTP !== undefined) {
      const { maxOverride, ...rest } = tp.value
      tp.value = rest
      if (maxOverride !== null && maxOverride !== '' && professionStats.value.current?.maxTP == null) {
        professionStats.value = {
          ...professionStats.value,
          current: { ...professionStats.value.current, maxTP: Number(maxOverride) },
        }
      }
    }
    if (s.techOptions) techOptions.value = normalizeTechOptions(s.techOptions)
    defenseParts.value = { ...defenseParts.value, ...(s.defenseParts || {}) }
    speed.value = s.speed ?? speed.value
    speedMisc.value = s.speedMisc ?? speedMisc.value
    agilityMisc.value = s.agilityMisc ?? agilityMisc.value
    fateSpent.value = s.fateSpent ?? fateSpent.value
    if (s.features) {
      features.value = objectToArray(s.features).map((f) => ({ _id: f._id, ...normalizeFeature(f) }))
    } else if (!features.value.length) {
      const migrated = featuresFromText(s)
      if (migrated.length) features.value = migrated.map((f) => ({ _id: uuidv4(), ...f }))
    }
    resistances.value = normalizeResistances(s.resistances ?? resistances.value)
    if (s.proficiencies) {
      proficiencies.value = normalizeProficiencies({
        ...s.proficiencies,
        custom: objectToArray(s.proficiencies.custom),
      })
    }
    attacksPerAction.value = s.attacksPerAction ?? attacksPerAction.value
    if (s.attacks) {
      attacks.value = objectToArray(s.attacks).map((a) => ({
        ...blankAttack(),
        ...migrateAttackRow(a),
      }))
    }
  }

  return {
    species, background, profession, professionStats, path, level, xp,
    abilities, saveProficiencies, saveOptions, skills,
    hp, hitDiceUsed, deathSaves, tp, techOptions,
    defenseParts, speed, speedMisc, agilityMisc, fateSpent,
    features, resistances, proficiencies,
    attacksPerAction, attacks,
    hasProfessionTable, effectiveLevel, saveBonusValue, skillRankCap, levelForXp,
    attackBonusValue, techBonusValue, techAbility, techAbilityMod,
    maxTechRankValue, advancedRankValue, techniquesKnownValue, maxTP,
    techAttackPowerValue, techSaveDCValue,
    saves, deathSaveBonus, skillTotals, skillRoster, passivePerceptionValue, attackPowerFor,
    damageFor, resolveAttack,
    defenseValue, defenseDexApplied, armorState, agilityValue, speedValue,
    fate, hitDice, suggestedMaxHp,
    addFeature, removeFeature, addAttack, removeAttack, setSkillRanks, setSkillMisc, setSkillAbility,
    toggleSaveProficiency, toggleProficiency, addProficiency, removeCustomProficiency,
    toggleCustomMastery, toggleResistance, setDeathSave, clearDeathSaves,
    clearProfessionTable,
    dehydrate, hydrate,
  }
}

export const useCharacterStore = defineStore('sheet', characterStore)
