import { nextTick, ref, watch } from 'vue'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/stores/index.js'
import { readPage } from '@/compendium/payload.js'
import { buildCharacter } from '@/builder/build.js'
import { builderSetting, SETTINGS } from '@/builder/setting.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import {
  ABILITIES, FEATURE_GROUPS, ARMOR_PROFICIENCIES, featureReached, weaponProficiencyList, toolProficiencyLabels,
} from '@/rules/index.js'
import { pendingGrants } from '@/rules/featureEffects.js'
import { useBuilderPages } from '@/composables/useBuilderPages.js'

const LISTINGS = ['Species', 'Backgrounds', 'Professions', 'Paths', 'Techniques', 'Items', 'Feats']

const SIZE_NAMES = { tiny: 'Tiny', small: 'Small', medium: 'Medium', large: 'Large', huge: 'Huge', gargantuan: 'Gargantuan' }

const scratchApp = () => {
  const active = getActivePinia()
  const pinia = createPinia()
  try {
    return { pinia, app: useAppStore(pinia) }
  } finally {
    if (active) setActivePinia(active)
  }
}

const dispose = (pinia) => {
  for (const store of pinia._s.values()) store.$dispose()
}

const summarize = (app, draft, failed) => {
  const { sheet, techniques, bio } = app
  const level = sheet.effectiveLevel
  const setting = SETTINGS.find((s) => s.id === builderSetting(draft, sharedSettings.setting))?.name ?? ''
  const reached = sheet.features.filter((f) => featureReached(f, level))
  const known = techniques.techniques.map((t) => ({ name: t.name, rank: t.rank }))
  const owed = pendingGrants(sheet.features, level).map((g) => ({ name: g.name, source: g.feature }))
  return {
    identity: [
      ['Name', app.meta.name],
      ['Concept', sheet.concept],
      ['Setting', setting],
      ['Level', String(level)],
      ['Species', sheet.species ? [sheet.species, SIZE_NAMES[bio.size] ?? ''].filter(Boolean).join(', ') : ''],
      ['Background', sheet.background],
      ['Profession', [sheet.profession, sheet.path].filter(Boolean).join(', ')],
    ].filter(([, value]) => String(value ?? '').trim()),
    abilities: ABILITIES.map((a) => ({
      id: a.id,
      name: a.name,
      value: Number(sheet.abilities[a.id]) || 0,
      save: sheet.saves[a.id],
      proficient: !!sheet.saveProficiencies[a.id],
    })),
    stats: [
      ['Max HP', sheet.hp.max],
      ['Max TP', sheet.maxTP],
      ['Defense', sheet.defenseValue],
      ['Agility', sheet.agilityValue, 'modifier'],
      ['Speed', `${sheet.speedValue} ft.`],
      ['Climb', `${sheet.climbValue} ft.`],
      ['Swim', `${sheet.swimValue} ft.`],
      ['Hit Dice', sheet.profession && sheet.professionStats.hitDie ? `${sheet.hitDice.total}d${sheet.professionStats.hitDie}` : ''],
    ].filter(([, value]) => value !== '' && value != null),
    skills: sheet.skillRoster
      .filter((s) => Number(sheet.skills[s.id]?.ranks) > 0)
      .map((s) => ({ id: s.id, name: s.name, ranks: Number(sheet.skills[s.id].ranks), total: sheet.skillTotals[s.id] })),
    proficiencies: [
      ['Armor', ARMOR_PROFICIENCIES.filter((a) => sheet.proficiencies.armor?.[a.id]).map((a) => a.name)],
      ['Weapons', weaponProficiencyList(sheet.proficiencies).map((w) => (w.mastered ? `${w.name} (Mastery)` : w.name))],
      ['Tools', toolProficiencyLabels(sheet.proficiencies)],
    ].filter(([, list]) => list.length),
    features: FEATURE_GROUPS
      .map((g) => ({
        name: g.name,
        features: reached.filter((f) => f.group === g.id).map((f) => (f.pick ? `${f.name} (${f.pick.split('|').join(', ')})` : f.name)),
      }))
      .filter((g) => g.features.length),
    techniques: [...known.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name)), ...owed],
    equipment: bio.equipment
      .filter((e) => String(e.name ?? '').trim())
      .map((e) => (Number(e.quantity) > 1 ? `${e.name} (${e.quantity})` : e.name)),
    meseta: Number(bio.meseta) || 0,
    failed: failed.map((f) => f.error),
  }
}

export const useBuildPreview = (active) => {
  const { builder, lists, loaded } = useBuilderPages()
  const summary = ref(null)
  const status = ref('loading')
  let run = 0
  let timer = null

  const fetchPage = async ({ pageName, categoryName }) => {
    const option = (lists[categoryName]?.options ?? []).find((o) => o.pageName === pageName)
    if (!option) return { ok: false, error: `${pageName} isn't in the compendium's ${categoryName}.` }
    return readPage(option.page) ?? { ok: false, error: `${pageName} has nothing to apply.` }
  }

  const rebuild = async () => {
    const mine = ++run
    if (!loaded(...LISTINGS)) return
    await nextTick()
    const draft = JSON.parse(JSON.stringify(builder.draft))
    const { pinia, app } = scratchApp()
    try {
      const { failed } = await buildCharacter({ draft, app, fetchPage })
      await nextTick()
      await nextTick()
      if (mine !== run) return
      summary.value = summarize(app, draft, failed)
      status.value = 'ok'
    } catch (error) {
      if (mine === run) {
        summary.value = null
        status.value = `The preview failed: ${error?.message ?? error}`
      }
    } finally {
      dispose(pinia)
    }
  }

  watch(
    [() => JSON.stringify(builder.draft), () => LISTINGS.map((c) => lists[c]?.status ?? '').join('|'), active],
    () => {
      if (!active()) return
      clearTimeout(timer)
      timer = setTimeout(rebuild, 150)
    },
    { immediate: true },
  )

  return { summary, status }
}
