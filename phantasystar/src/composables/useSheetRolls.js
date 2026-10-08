import { reactive, computed } from 'vue'
import { useAppStore } from '@/stores/index.js'
import getRollResult from '@/utility/getRollResult.js'
import postToChat from '@/utility/postToChat.js'
import { PUBLIC, VISIBILITIES, getVisibility } from '@/utility/rollVisibility.js'
import { dispatchRef, initValues } from '@/relay/relay.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import {
  NORMAL, ADVANTAGE, DISADVANTAGE, rollMode as combineModes,
  d20Count, resolveD20, attackOutcome, critDamage, critFormula, withModifier,
  deathSaveOutcome, DEATH_SAVE_DC, dieSides, hitDieHealing, healHp,
  formatModifier, rankLabel, describeCast, componentsLabel, boostSteps, boostedFormulas,
  getSkill, ABILITIES,
  patchRepairFormula, PATCH_REPAIR_MAX_DICE, CREW_ROLES, crewSaveBonus,
  getNpcShipAbility, heavyDisadvantage, armorDisadvantage, attackAbility,
  describeCombo, comboTier, comboSaveDC, pickAllows, featureRollFormula, featureRollLines, riderFormula,
} from '@/rules/index.js'

const options = reactive({
  advantage: false,
  disadvantage: false,
  visibility: PUBLIC,
  bane: null,
})

const send = (type, parameters) =>
  postToChat(type, parameters, { visibility: options.visibility })

const lastRoll = reactive({
  title: null,
  total: 0,
  dc: null,
  components: [],
  fateAdded: false,
})

const abilityName = (id) => ABILITIES.find((a) => a.id === id)?.name ?? id

export const useSheetRolls = () => {
  const store = useAppStore()
  const sheet = store.sheet
  const techniques = store.techniques
  const ship = store.starship
  const npc = store.npc
  const npcShip = store.npcship

  const mode = computed(() => {
    if (options.advantage && options.disadvantage) return NORMAL
    if (options.advantage) return ADVANTAGE
    if (options.disadvantage) return DISADVANTAGE
    return NORMAL
  })

  const characterName = computed(() => store.meta.name || 'Unnamed')

  const setMode = (next) => {
    options.advantage = next === ADVANTAGE
    options.disadvantage = next === DISADVANTAGE
  }

  const visibility = computed(() => getVisibility(options.visibility))
  const setVisibility = (next) => {
    options.visibility = getVisibility(next).id
  }

  const d20Result = async ({
    title,
    modifier = 0,
    dc = null,
    isAttack = false,
    critFrom = null,
    disadvantage = false,
  }) => {
    const rollMode = disadvantage
      ? combineModes({ advantage: mode.value === ADVANTAGE, disadvantage: true })
      : mode.value
    const count = d20Count(rollMode)
    const bane = options.bane
    let results
    try {
      results = await getRollResult([
        { key: 'd20', count, sides: 20 },
        ...(bane ? [{ key: 'bane', count: 1, sides: dieSides(bane) }] : []),
      ])
    } catch (error) {
      console.error('[PS sheet] roll failed', error)
      await send('chat', {
        characterName: characterName.value,
        title: 'Roll failed',
        subtitle: title,
        textContent: [String(error?.message ?? error)],
      })
      return null
    }
    const faces = results.d20?.faces ?? []
    const { natural, dropped } = resolveD20(faces, rollMode)

    const baneValue = bane ? (results.bane?.total ?? 0) : 0
    if (bane) options.bane = null

    const total = natural + modifier - baneValue
    const resultType = isAttack ? attackOutcome(natural, critFrom ?? undefined) : null

    const components = [{ label: 'd20', display: String(natural), value: natural, natural: true }]
    if (dropped != null) components.push({ dropped: true, value: dropped })
    if (modifier !== 0) {
      components.push({ label: 'mod', display: formatModifier(modifier), value: modifier })
    }
    if (bane) {
      components.push({ label: `bane ${bane}`, display: `-${baneValue}`, value: -baneValue })
    }

    Object.assign(lastRoll, {
      title,
      total,
      dc,
      components: [...components],
      fateAdded: false,
    })

    return { natural, total, resultType, components, rollMode }
  }

  const rollD20 = async ({ subtitle, keyValues, footnote, ...roll }) => {
    const result = await d20Result(roll)
    if (!result) return null
    const { natural, total, resultType, components, rollMode } = result

    await send('roll', {
      characterName: characterName.value,
      title: roll.title,
      subtitle: subtitle || (rollMode === NORMAL ? undefined : rollMode),
      total,
      dc: roll.dc ?? null,
      resultType,
      components,
      keyValues,
      footnote,
    })

    return { natural, total, resultType }
  }

  const canAddFateDie = computed(
    () => lastRoll.title !== null && !lastRoll.fateAdded && sheet.fate.remaining > 0,
  )

  const addFateDie = async () => {
    if (!canAddFateDie.value) return null
    const die = sheet.fate.die
    const results = await getRollResult([{ key: 'fate', count: 1, sides: dieSides(die) }])
    const value = results.fate?.total ?? 0

    sheet.fateSpent += 1
    lastRoll.fateAdded = true
    lastRoll.total += value
    lastRoll.components.push({ label: `fate ${die}`, display: `+${value}`, value })

    const tempted = sharedSettings.temptingFate && value === 1

    const left = sheet.fate.remaining
    await send('roll', {
      characterName: characterName.value,
      title: lastRoll.title,
      subtitle: `Fate point spent (${die})`,
      total: lastRoll.total,
      dc: lastRoll.dc,
      components: lastRoll.components,
      keyValues: tempted ? { 'Tempting Fate': `GM gains a bane die (${die})` } : undefined,
      footnote: `${left} fate ${left === 1 ? 'point' : 'points'} left`,
    })
    return value
  }

  const setBane = (die) => {
    options.bane = die || null
  }

  const buyOffBane = async () => {
    const die = options.bane
    if (!die || sheet.fate.remaining <= 0) return false
    sheet.fateSpent += 1
    options.bane = null
    const left = sheet.fate.remaining
    await send('chat', {
      characterName: characterName.value,
      title: 'Bane Die',
      subtitle: `${die} avoided with a fate point`,
      footnote: `${left} fate ${left === 1 ? 'point' : 'points'} left`,
    })
    return true
  }

  const addToTracker = async (value) => {
    const dispatch = dispatchRef.value
    if (value == null || typeof dispatch?.addToTracker !== 'function') return false
    const characterId = store.meta.id || initValues.character?.id
    try {
      let tokenId
      if (characterId && typeof dispatch.getTokens === 'function') {
        const { selected = [], tokens = [] } = (await dispatch.getTokens({ characterId })) ?? {}
        const mine = (t) => !t?.represents || t.represents === characterId
        tokenId = (selected.find(mine) ?? tokens[0])?.id
      }
      await dispatch.addToTracker(
        tokenId
          ? { tokenId, value }
          : { value, custom: { name: characterName.value, img: store.meta.avatar || undefined } },
      )
      return true
    } catch (error) {
      console.error('[PS sheet] could not add to the turn tracker', error)
      return false
    }
  }

  const untrainedArmor = (abilityId) => armorDisadvantage(sheet.armorState?.armorUntrained, abilityId)

  const rollInitiativeWith = async (args) => {
    const result = await rollD20({ title: 'Initiative', ...args })
    if (result) await addToTracker(result.total)
    return result
  }

  const rollInitiative = () =>
    rollInitiativeWith({
      modifier: Number(sheet.agilityValue) || 0,
      disadvantage: untrainedArmor('dexterity'),
      keyValues: { Agility: formatModifier(sheet.agilityValue) },
    })

  const rollAbilityCheck = (abilityId) =>
    rollD20({
      title: `${abilityName(abilityId)} Check`,
      modifier: sheet.abilities[abilityId] ?? 0,
      disadvantage: untrainedArmor(abilityId),
    })

  const rollSave = (abilityId) =>
    rollD20({
      title: `${abilityName(abilityId)} Save`,
      subtitle: sheet.saveProficiencies[abilityId] ? 'Trained' : undefined,
      modifier: sheet.saves[abilityId] ?? 0,
      disadvantage: untrainedArmor(abilityId),
    })

  const rollSkill = (skillId) => {
    const skill = sheet.skillRoster.find((s) => s.id === skillId) ?? getSkill(skillId)
    const ranks = sheet.skills[skillId]?.ranks ?? 0
    return rollD20({
      title: `${skill?.name ?? skillId} Check`,
      subtitle: abilityName(skill?.ability),
      modifier: sheet.skillTotals[skillId] ?? 0,
      keyValues: ranks > 0 ? { Ranks: ranks } : undefined,
      disadvantage: untrainedArmor(skill?.ability),
    })
  }

  const damageSummary = (attack) =>
    [
      [attack.damage, attack.damageType].filter(Boolean).join(' '),
      [attack.damage2, attack.damage2Type].filter(Boolean).join(' '),
    ]
      .filter(Boolean)
      .join(' + ')

  const rollAttack = (row) => {
    const attack = sheet.resolveAttack(row)
    const heavy =
      heavyDisadvantage(attack, sheet.abilities) ||
      untrainedArmor(attackAbility(attack, sheet.abilities))
    const save = attack.saveAbility
      ? [abilityName(attack.saveAbility), attack.saveDC ? `DC ${attack.saveDC}` : null]
          .filter(Boolean)
          .join(' ')
      : null

    return rollD20({
      title: attack.name || 'Attack',
      subtitle: attack.range || undefined,
      modifier: sheet.attackPowerFor(attack).value,
      isAttack: true,
      critFrom: attack.critFrom,
      disadvantage: heavy,
      keyValues: {
        Save: save || undefined,
        Effect: (attack.saveAbility && attack.saveEffect) || undefined,
        Mastery: (attack.isMastery && attack.mastery) || undefined,
      },
      footnote: attack.notes || undefined,
    })
  }

  const rollDamage = async (attack, { crit = false, riders = [] } = {}) => {
    const lines = [
      { formula: attack.damage, type: attack.damageType, extra: attack.critExtra },
      { formula: attack.damage2, type: attack.damage2Type, extra: attack.crit2Extra },
    ]
      .concat(riders.map((r) => ({ formula: r.formula, type: r.type, source: r.feature.name })))
      .map(({ formula, type, extra, source }) => ({
        type,
        source,
        formula: crit ? critFormula(formula, extra) : String(formula ?? '').trim(),
      }))
      .filter((line) => line.formula)

    if (!lines.length) return null

    const results = await getRollResult(
      lines.map((line, i) => ({ key: `dmg${i}`, formula: line.formula })),
    )

    const components = lines.map((line, i) => {
      const value = results[`dmg${i}`]?.total ?? 0
      const label = [line.formula, line.type].filter(Boolean).join(' ')
      return {
        label: line.source ? `${line.source}: ${label}` : label,
        display: String(value),
        value,
      }
    })
    const total = components.reduce((sum, c) => sum + c.value, 0)

    await send('roll', {
      characterName: characterName.value,
      title: `${attack.name || 'Attack'} Damage`,
      subtitle: crit ? 'Critical hit' : attack.damageType || undefined,
      total,
      components,
    })
    return total
  }

  const rollWeaponDamage = async (row, options = {}) => {
    const attack = sheet.resolveAttack(row)
    const riders = sheet.ridersFor(attack)
    const total = await rollDamage(attack, { ...options, riders })
    if (total !== null) sheet.spendRiders(riders)
    return total
  }

  const featureText = (feature) => {
    const picked = feature.options?.find((o) => o.name === feature.pick)
    return String(picked?.text ?? feature.text ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
  }

  const useResource = async (resourceId) => {
    const row = sheet.resources.find((r) => r._id === resourceId)
    const feature = row && sheet.features.find((f) => f._id === row.feature)
    if (!feature || sheet.usesLeftFor(feature._id) === 0) return null
    const title = row.name || feature.name
    const rolls = feature.roll && pickAllows(feature.roll, feature)
    const lines = rolls ? featureRollLines(feature.roll, sheet.diceContext()) : []
    if (lines.length) {
      const results = await getRollResult(lines.map((l, i) => ({ key: `line${i}`, formula: l.formula })))
      sheet.spendUse(feature._id)
      const type = feature.roll.type
      await send('roll', {
        characterName: characterName.value,
        title,
        subtitle: type || undefined,
        noTotal: true,
        components: lines.map((l, i) => {
          const value = results[`line${i}`]?.total ?? 0
          return { label: `${l.label}: ${l.formula}`, display: String(value), value }
        }),
      })
      return null
    }
    const roll = rolls ? featureRollFormula(feature.roll, sheet.diceContext()) : null
    if (!roll?.formula && feature.rider && feature.rider.mode !== 'always' && pickAllows(feature.rider, feature)) {
      sheet.setRider(feature._id, true)
      const formula = riderFormula(feature.rider, sheet.diceContext())
      const type = feature.rider.type === 'weapon' ? '' : feature.rider.type
      return send('chat', {
        characterName: characterName.value,
        title,
        keyValues: { Damage: [formula, type].filter(Boolean).join(' ') || undefined },
      })
    }
    if (!roll?.formula) {
      sheet.spendUse(feature._id)
      return send('chat', {
        characterName: characterName.value,
        title,
        subtitle: feature.pick || undefined,
        textContent: featureText(feature),
      })
    }
    const results = await getRollResult([{ key: 'use', formula: roll.formula }])
    const rolled = results.use?.total ?? 0
    const total = roll.min !== null ? Math.max(roll.min, rolled) : rolled
    sheet.spendUse(feature._id)
    const keyValues = {}
    if (feature.roll.heal === 'self') {
      const before = Number(sheet.hp.current) || 0
      sheet.hp.current = healHp(before, sheet.hp.max, total)
      keyValues.HP = `${before} → ${sheet.hp.current}`
    }
    await send('roll', {
      characterName: characterName.value,
      title,
      subtitle: feature.roll.heal ? 'Healing' : feature.pick || undefined,
      total,
      components: [{ label: roll.formula, display: String(total), value: total }],
      keyValues,
    })
    return total
  }

  const rollDeathSave = async () => {
    const results = await getRollResult([{ key: 'd20', count: 1, sides: 20 }])
    const natural = results.d20?.faces?.[0] ?? 0
    const bonus = Number(sheet.deathSaveBonus) || 0
    const outcome = deathSaveOutcome(natural, DEATH_SAVE_DC, bonus)

    sheet.deathSaves.survive = Math.min(3, sheet.deathSaves.survive + outcome.survive)
    sheet.deathSaves.perish = Math.min(3, sheet.deathSaves.perish + outcome.perish)
    if (outcome.revived) {
      sheet.clearDeathSaves()
      sheet.hp.current = Math.max(1, sheet.hp.current)
    }

    const resolved =
      sheet.deathSaves.survive >= 3 ? 'Stable' : sheet.deathSaves.perish >= 3 ? 'Dead' : null

    await send('roll', {
      characterName: characterName.value,
      title: 'Death Saving Throw',
      subtitle: outcome.label,
      total: natural + bonus,
      dc: DEATH_SAVE_DC,
      resultType: natural === 20 ? 'crit-success' : natural === 1 ? 'crit-fail' : null,
      components: [
        { label: 'd20', display: String(natural), value: natural, natural: true },
        ...(bonus ? [{ label: 'mod', display: formatModifier(bonus), value: bonus }] : []),
      ],
      keyValues: {
        Survive: `${sheet.deathSaves.survive} / 3`,
        Perish: `${sheet.deathSaves.perish} / 3`,
      },
      footnote: resolved || undefined,
    })
    return outcome
  }

  const spendHitDie = async () => {
    const sides = dieSides(sheet.hitDice.die)
    const max = Number(sheet.hp.max) || 0
    const before = Number(sheet.hp.current) || 0
    if (!sides || sheet.hitDice.remaining <= 0 || before >= max) return null

    const results = await getRollResult([{ key: 'hd', count: 1, sides }])
    const rolled = results.hd?.total ?? 0
    const conMod = Number(sheet.abilities.constitution) || 0
    const gained = hitDieHealing(rolled, conMod)
    const after = healHp(before, max, gained)

    sheet.hp.current = after
    sheet.hitDiceUsed = (Number(sheet.hitDiceUsed) || 0) + 1

    const components = [{ label: sheet.hitDice.die, display: String(rolled), value: rolled, natural: true }]
    if (conMod) components.push({ label: 'CON', display: formatModifier(conMod), value: conMod })

    await send('roll', {
      characterName: characterName.value,
      title: 'Hit Die',
      subtitle: 'Short rest',
      total: gained,
      components,
      keyValues: {
        HP: `${before} → ${after}`,
        'Hit Dice Left': `${sheet.hitDice.remaining} / ${sheet.hitDice.total}`,
      },
    })
    return { rolled, gained, before, after }
  }

  const techniqueEntries = (technique) => ({
    'Casting Time': technique.castingTime,
    Range: technique.range,
    Components: componentsLabel(technique.components) || undefined,
    Duration: technique.duration,
  })

  const descriptionFor = (technique) => (technique.text?.length ? technique.text : null)
  const scalingFor = (technique) => (technique.boost?.length ? technique.boost : null)

  const techniqueRolls = (technique, castRank = technique.rank) => {
    const mod = technique.addAbilityMod ? (sheet.techAbilityMod ?? 0) : 0
    const boosted = boostedFormulas(
      technique,
      boostSteps(technique.rank, castRank, sheet.effectiveLevel),
    )
    return {
      name: technique.name,
      damage: withModifier(boosted.damage, mod),
      damageType: technique.damageType,
      critExtra: technique.critExtra,
      damage2: boosted.damage2,
      damage2Type: technique.damage2Type,
      crit2Extra: technique.crit2Extra,
      healing: withModifier(boosted.healing, mod),
    }
  }

  const techniqueOutcome = (technique, castRank = technique.rank) => {
    const rolls = techniqueRolls(technique, castRank)
    return {
      Damage: damageSummary(rolls) || undefined,
      Healing: rolls.healing || undefined,
      Effect: (technique.saveAbility && technique.saveEffect) || undefined,
    }
  }

  const techniquePrompt = (technique) => {
    if (technique.saveAbility) {
      return {
        [`${abilityName(technique.saveAbility)} Save`]: `DC ${sheet.techSaveDCValue ?? '-'}`,
      }
    }
    if (technique.attack) {
      return { 'Tech Attack': formatModifier(sheet.techAttackPowerValue ?? 0) }
    }
    return {}
  }

  const postTechnique = (technique) =>
    send('technique', {
      characterName: characterName.value,
      title: technique.name || 'Untitled Technique',
      subtitle: rankLabel(technique.rank),
      rank: technique.rank,
      rankLabel: rankLabel(technique.rank),
      tpCost: describeCast({ baseRank: technique.rank }).cost,
      concentration: technique.concentration,
      keyValues: {
        ...techniqueEntries(technique),
        ...techniquePrompt(technique),
        ...techniqueOutcome(technique),
      },
      textContent: descriptionFor(technique) ?? undefined,
      boost: scalingFor(technique) ?? undefined,
    })

  const castRoll = async (technique, castRank) => {
    if (technique.attack) {
      const result = await d20Result({
        title: technique.name || 'Tech Attack',
        modifier: sheet.techAttackPowerValue ?? 0,
        isAttack: true,
      })
      if (!result) return null
      return {
        rollLabel: result.rollMode === NORMAL ? 'Tech Attack' : `Tech Attack (${result.rollMode})`,
        total: result.total,
        resultType: result.resultType,
        components: result.components,
      }
    }
    const formula = techniqueRolls(technique, castRank).healing
    if (!formula) return {}
    const results = await getRollResult([{ key: 'heal', formula }])
    const total = results.heal?.total ?? 0
    return {
      rollLabel: 'Healing',
      total,
      components: [{ label: formula, display: String(total), value: total }],
    }
  }

  const postCast = async (technique, castRank, plan, subtitle) =>
    send('technique', {
      characterName: characterName.value,
      title: technique.name || 'Untitled Technique',
      subtitle,
      rank: technique.rank,
      rankLabel: rankLabel(castRank),
      tpCost: plan.cost,
      boosted: castRank > technique.rank,
      advanced: plan.advanced,
      concentration: technique.concentration,
      tpRemaining: sheet.tp.current,
      ...(await castRoll(technique, castRank)),
      keyValues: {
        ...techniquePrompt(technique),
        ...techniqueOutcome(technique, castRank),
      },
    })

  const castTechnique = async (technique, castRank = technique.rank, { useFree = true } = {}) => {
    const plan = techniques.spendForCast(technique, castRank, { useFree })
    if (!plan) return null
    const subtitle = castRank === technique.rank ? rankLabel(technique.rank) : `Cast at ${rankLabel(castRank)}`
    await postCast(technique, castRank, plan, subtitle)
    return plan
  }

  const rollTechAttack = (technique) =>
    rollD20({
      title: `${technique.name} - Tech Attack`,
      subtitle: technique.range,
      modifier: sheet.techAttackPowerValue ?? 0,
      isAttack: true,
    })

  const castTechAttack = async (technique) => {
    if (!technique.attack) return castTechnique(technique)

    const plan = techniques.castPlan(technique, technique.rank)
    if (!plan?.allowed || !plan.affordable) return null

    const tpLeft = plan.free ? sheet.tp.current : sheet.tp.current - plan.cost
    const save = technique.saveAbility
      ? `${abilityName(technique.saveAbility)} DC ${sheet.techSaveDCValue ?? '-'}`
      : undefined

    const result = await rollD20({
      title: technique.name || 'Tech Attack',
      subtitle: `Tech Attack · ${rankLabel(technique.rank)}`,
      modifier: sheet.techAttackPowerValue ?? 0,
      isAttack: true,
      keyValues: {
        Cast: plan.free ? 'Free cast' : `${plan.cost} TP (${tpLeft} left)`,
        Save: save,
        ...techniqueOutcome(technique),
      },
    })
    if (!result) return null

    techniques.spendForCast(technique, technique.rank)
    return { plan, result }
  }

  const rollTechniqueDamage = (technique, options) =>
    rollDamage(techniqueRolls(technique, techniques.lastCastRank(technique)), options)

  const rollHealing = async (technique) => {
    const formula = techniqueRolls(technique, techniques.lastCastRank(technique)).healing
    if (!formula) return null
    const results = await getRollResult([{ key: 'heal', formula }])
    const total = results.heal?.total ?? 0
    await send('roll', {
      characterName: characterName.value,
      title: `${technique.name || 'Technique'} Healing`,
      subtitle: 'Healing',
      total,
      components: [{ label: formula, display: String(total), value: total }],
    })
    return total
  }

  const rollForceBreach = async (technique, castRank = technique.rank) => {
    const plan = techniques.castPlan(technique, castRank)
    if (!plan?.forceBreach || !plan.affordable) return null

    const abilityId = sheet.techAbility
    const { dc, damage } = plan.forceBreach

    const { total } = await rollD20({
      title: `${technique.name || 'Technique'} - Force Breach`,
      subtitle: `${abilityName(abilityId)} save at ${rankLabel(castRank)}`,
      modifier: sheet.saves[abilityId] ?? 0,
      dc,
      footnote: `On a failure: ${damage} psychic damage, and the technique fails.`,
    })

    techniques.spendForceBreach(technique, castRank)
    const succeeded = total >= dc

    if (succeeded) {
      techniques.setLastCast(technique, castRank)
      await postCast(technique, castRank, plan, `Force breached at ${rankLabel(castRank)}`)
      return { plan, succeeded, damage: null }
    }

    const results = await getRollResult([{ key: 'breach', formula: damage }])
    const dealt = results.breach?.total ?? 0
    await send('roll', {
      characterName: characterName.value,
      title: 'Force Breach Backlash',
      subtitle: 'Psychic damage',
      total: dealt,
      components: [{ label: damage, display: String(dealt), value: dealt }],
      footnote: `${technique.name || 'The technique'} fails, and the ${plan.cost} TP is spent.`,
    })
    return { plan, succeeded, damage: dealt }
  }

  const comboPlan = (combo, { otherLevels = [], tpShare = null } = {}) =>
    describeCombo({
      level: sheet.effectiveLevel,
      otherLevels,
      required: combo.level,
      fateRemaining: sheet.fate.remaining,
      currentTP: Number(sheet.tp.current) || 0,
      tpShare,
    })

  const directCombo = async (combo, { otherLevels = [], participantMods = [], tpShare = null } = {}) => {
    const plan = comboPlan(combo, { otherLevels, tpShare })
    if (!plan.levelOk || !plan.avgOk || !plan.fateOk || !plan.tpOk) return null
    const { tier } = plan

    sheet.fateSpent += plan.fateCost
    sheet.tp.current = Math.max(0, Number(sheet.tp.current) - plan.tpShare)
    techniques.setComboLevel(combo, plan.average)

    const dc = combo.saveAbility ? comboSaveDC(sheet.techSaveDCValue, participantMods) : null
    const fateLeft = sheet.fate.remaining
    await send('chat', {
      characterName: characterName.value,
      title: combo.name || 'Combo Technique',
      subtitle: 'Combo Technique · Director',
      keyValues: {
        'Average Level': plan.average,
        TP: `${plan.tpShare} of ${tier.tp}`,
        Range: `${tier.range} ft.`,
        Area: `${tier.area} ft.`,
        ...(dc != null ? { [`${abilityName(combo.saveAbility)} Save`]: `DC ${dc}` } : {}),
        Damage: [tier.damage, combo.damageType].filter(Boolean).join(' '),
      },
      footnote: `${sheet.tp.current} TP · ${fateLeft} fate ${fateLeft === 1 ? 'point' : 'points'} left`,
    })
    return plan
  }

  const joinCombo = async (combo, tpShare = 0) => {
    const share = Math.max(0, Number(tpShare) || 0)
    if (share > (Number(sheet.tp.current) || 0)) return null
    sheet.tp.current = Math.max(0, Number(sheet.tp.current) - share)
    await send('chat', {
      characterName: characterName.value,
      title: combo.name || 'Combo Technique',
      subtitle: 'Combo Technique · Participant',
      keyValues: { TP: share },
      footnote: `${sheet.tp.current} TP left`,
    })
    return share
  }

  const comboDamageTier = (combo) => comboTier(techniques.comboLevel(combo) ?? sheet.effectiveLevel)

  const rollComboDamage = (combo, options) => {
    const tier = comboDamageTier(combo)
    if (!tier) return null
    return rollDamage(
      { name: combo.name || 'Combo Technique', damage: tier.damage, damageType: combo.damageType },
      options,
    )
  }

  const rollManeuverCheck = () =>
    rollD20({
      title: 'Piloting Check',
      subtitle: ship.pilot.name || undefined,
      modifier: ship.pilotingBonusValue,
      keyValues: { 'Maneuver Save DC': ship.maneuverSaveDCValue },
    })

  const rollCrewSave = (roleId, abilityId) => {
    const member = ship.crew[roleId]
    const role = CREW_ROLES.find((r) => r.id === roleId)?.name
    return rollD20({
      title: `${abilityName(abilityId)} Save`,
      subtitle: [member?.name, role].filter(Boolean).join(' · ') || undefined,
      modifier: crewSaveBonus(member, abilityId),
    })
  }

  const rollVehicleControl = () =>
    rollD20({
      title: 'Control Check',
      subtitle: ship.pilot.name || undefined,
      modifier: ship.controlBonusValue,
    })

  const rollVehicleSave = (abilityId) =>
    rollD20({
      title: `${abilityName(abilityId)} Save`,
      subtitle: store.meta.name || undefined,
      modifier: Number(abilityId === 'strength' ? ship.strSave : ship.conSave) || 0,
    })

  const rollShipAttack = (weapon) =>
    rollD20({
      title: weapon.name || 'Ship Weapon',
      subtitle: ship.gunnerOf(weapon).name || undefined,
      modifier: ship.weaponPower(weapon),
      isAttack: true,
      keyValues: {
        Range: weapon.range ? (ship.isVehicle ? weapon.range : `${weapon.range} units`) : undefined,
      },
      footnote: weapon.notes || undefined,
    })

  const rollShipDamage = async (weapon, { crit = false } = {}) => {
    const base = crit ? critDamage(weapon.damage) : weapon.damage
    if (!base) return null
    const dex = weapon.addDexToDamage ? ship.gunnerOf(weapon).dexterity : 0
    const formula = dex !== 0 ? `${base} ${dex > 0 ? '+' : '-'} ${Math.abs(dex)}` : base

    const results = await getRollResult([{ key: 'dmg', formula }])
    const total = results.dmg?.total ?? 0

    await send('roll', {
      characterName: characterName.value,
      title: `${weapon.name || 'Ship Weapon'} Damage`,
      subtitle: crit ? 'Critical hit' : weapon.damageType || undefined,
      total,
      components: [{ label: formula, display: String(total), value: total }],
    })
    return total
  }

  const rollPatchRepair = async ({ siSpent = 0 } = {}) => {
    const spend = Math.max(0, Number(siSpent) || 0)
    if (spend > 0 && spend > Number(ship.siCurrent)) return null

    const formula = patchRepairFormula({
      hullDie: ship.hullDie,
      dice: PATCH_REPAIR_MAX_DICE,
      siSpent: spend,
      technicianWisMod: ship.technician.wisdom,
    })

    const results = await getRollResult([{ key: 'repair', formula }])
    const healed = results.repair?.total ?? 0

    if (spend > 0) ship.spendSi(spend)
    ship.applyRepair(healed)

    await send('roll', {
      characterName: characterName.value,
      title: 'Patch Repair',
      subtitle: spend > 0 ? `${spend} SI spent for ${spend} extra hull ${spend === 1 ? 'die' : 'dice'}` : undefined,
      total: healed,
      components: [{ label: formula, display: String(healed), value: healed }],
      keyValues: {
        'Hull Points': `${ship.hullCurrent} / ${ship.maxHull}`,
        SI: `${ship.siCurrent} / ${ship.maxSi}`,
      },
      footnote: 'Ends any System Failure effects accumulated from SI loss.',
    })
    return healed
  }

  const rollSystemShock = (dc = null) =>
    rollD20({
      title: 'System Shock',
      subtitle: `${ship.technician.name || 'Technician'} · Intelligence save`,
      modifier: Number(ship.technician.intelligence) || 0,
      dc,
      footnote: 'On a failure the ship loses 1 SI.',
    })

  const entryRolls = (damageText, rangeText = (r) => r) => {
    const attack = (entry) =>
      rollD20({
        title: entry.name || 'Attack',
        subtitle: entry.range ? rangeText(entry.range) : undefined,
        modifier: Number(entry.attackPower) || 0,
        isAttack: true,
      })

    const damage = async (entry, { crit = false } = {}) => {
      const formula = crit ? critDamage(entry.damage) : entry.damage
      if (!formula) return null
      const results = await getRollResult([{ key: 'dmg', formula }])
      const total = results.dmg?.total ?? 0

      await send('roll', {
        characterName: characterName.value,
        title: `${entry.name || 'Attack'} Damage`,
        subtitle: crit ? 'Critical hit' : entry.damageType || undefined,
        total,
        components: [{ label: formula, display: String(total), value: total }],
      })
      return total
    }

    const post = (entry, heading = '') =>
      send('chat', {
        characterName: characterName.value,
        title: entry.name || 'Entry',
        subtitle: heading || undefined,
        keyValues: entry.isAttack
          ? {
              'To Hit': formatModifier(entry.attackPower),
              Range: entry.range || undefined,
              Damage: damageText(entry) || undefined,
            }
          : { Damage: damageText(entry) || undefined },
        textContent: entry.text || undefined,
      })

    return { attack, damage, post }
  }

  const rollNpcAbility = (abilityId) =>
    rollD20({
      title: `${abilityName(abilityId)} Check`,
      modifier: Number(npc.abilities[abilityId]) || 0,
    })

  const rollNpcSave = (abilityId) =>
    rollD20({
      title: `${abilityName(abilityId)} Save`,
      subtitle: npc.saveProficiencies[abilityId] ? 'Proficient' : undefined,
      modifier: Number(npc.saves[abilityId]) || 0,
    })

  const rollNpcSkill = (skill) =>
    rollD20({
      title: `${skill.name || 'Skill'} Check`,
      modifier: Number(skill.bonus) || 0,
    })

  const rollNpcInitiative = () =>
    rollInitiativeWith({ modifier: Number(npc.initiative) || 0 })

  const { attack: rollNpcAttack, damage: rollNpcDamage, post: postNpcEntry } =
    entryRolls(npc.damageEntry)

  const npcTechniqueDC = () => {
    const dc = String(npc.techniques.saveDC ?? '').trim()
    return dc === '' ? null : Number(dc)
  }

  const npcTechniqueValues = (technique) => {
    const dc = npcTechniqueDC()
    return {
      Range: technique.range || undefined,
      Save: technique.saveAbility
        ? [abilityName(technique.saveAbility), dc != null ? `DC ${dc}` : null].filter(Boolean).join(' ')
        : undefined,
      Effect: (technique.saveAbility && technique.saveEffect) || undefined,
      Damage: [technique.damage, technique.damageType].filter(Boolean).join(' ') || undefined,
      Healing: technique.healing || undefined,
      Note: technique.note || undefined,
    }
  }

  const castNpcTechnique = (technique, group = null) => {
    if (!technique) return null
    if (group && group.uses !== 'at_will') npc.setTechniqueUsed(technique, (technique.used || 0) + 1)
    const text = String(technique.text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    if (technique.attack) {
      return rollD20({
        title: technique.name || 'Technique',
        subtitle: 'Tech Attack',
        modifier: Number(npc.techniques.attack) || 0,
        isAttack: true,
        keyValues: npcTechniqueValues(technique),
      })
    }
    return send('chat', {
      characterName: characterName.value,
      title: technique.name || 'Technique',
      subtitle: 'Technique',
      keyValues: npcTechniqueValues(technique),
      textContent: text.length ? text : undefined,
    })
  }

  const rollNpcTechniqueDamage = (technique, options) =>
    rollNpcDamage({ name: technique.name, damage: technique.damage, damageType: technique.damageType }, options)

  const rollNpcTechniqueHealing = (technique) =>
    rollNpcDamage({ name: `${technique.name || 'Technique'} Healing`, damage: technique.healing, damageType: 'Healing' })

  const useNpcAction = (section, entry) => {
    if (!npc.spendAction(section, entry)) return null
    const heading = section === 'boss' ? 'Boss Action' : 'Legendary Action'
    return postNpcEntry(entry, heading)
  }

  const rollNpcShipAbility = (slotId) => {
    const slot = getNpcShipAbility(slotId)
    if (!slot) return null
    return rollD20({
      title: `${slot.label} Check`,
      subtitle: `${slot.role}’s ${abilityName(slot.ability)}`,
      modifier: Number(npcShip.crewMods[slotId]) || 0,
    })
  }

  const rollNpcShipPiloting = () =>
    rollD20({
      title: 'Piloting Maneuver',
      modifier: Number(npcShip.piloting) || 0,
      keyValues: { 'Maneuver Save DC': npcShip.saveDC },
    })

  const rollNpcShipSave = (save) =>
    rollD20({
      title: `${save.name || 'Saving'} Throw`,
      modifier: Number(save.bonus) || 0,
    })

  const rollNpcShipSkill = (skill) =>
    rollD20({
      title: `${skill.name || 'Skill'} Check`,
      modifier: Number(skill.bonus) || 0,
    })

  const rollNpcShipInitiative = () =>
    rollInitiativeWith({
      modifier: Number(npcShip.initiative) || 0,
      footnote: `Passive initiative ${npcShip.initiativeValue}.`,
    })

  const {
    attack: rollNpcShipAttack,
    damage: rollNpcShipDamage,
    post: postNpcShipEntry,
  } = entryRolls(npcShip.damageEntry, (range) => `range ${range}`)

  return {
    options,
    mode,
    setMode,
    visibility,
    setVisibility,
    VISIBILITIES,
    lastRoll,
    canAddFateDie,
    addFateDie,
    setBane,
    buyOffBane,
    rollD20,
    rollInitiative,
    addToTracker,
    rollAbilityCheck,
    rollSave,
    rollSkill,
    rollAttack,
    rollWeaponDamage,
    rollDamage,
    useResource,
    rollVehicleControl,
    rollVehicleSave,
    rollDeathSave,
    spendHitDie,
    postTechnique,
    castTechnique,
    rollTechAttack,
    castTechAttack,
    rollTechniqueDamage,
    rollHealing,
    techniqueRolls,
    damageSummary,
    rollForceBreach,
    comboPlan,
    directCombo,
    joinCombo,
    comboDamageTier,
    rollComboDamage,
    rollManeuverCheck,
    rollCrewSave,
    rollShipAttack,
    rollShipDamage,
    rollPatchRepair,
    rollSystemShock,
    rollNpcAbility,
    rollNpcSave,
    rollNpcSkill,
    rollNpcInitiative,
    rollNpcAttack,
    castNpcTechnique,
    rollNpcTechniqueDamage,
    rollNpcTechniqueHealing,
    useNpcAction,
    rollNpcDamage,
    postNpcEntry,
    rollNpcShipAbility,
    rollNpcShipPiloting,
    rollNpcShipSave,
    rollNpcShipSkill,
    rollNpcShipInitiative,
    rollNpcShipAttack,
    rollNpcShipDamage,
    postNpcShipEntry,
    techniquePrompt,
    techniqueEntries,
  }
}
