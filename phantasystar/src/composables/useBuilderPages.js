import { computed, watchEffect } from 'vue'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useCatalog, loadCategory } from '@/composables/useCatalog.js'
import { skillsComplete, skillsBasis } from '@/builder/skills.js'
import { techniqueInfo, techniquePools, techniquesComplete, techniquesBasis } from '@/builder/techniques.js'
import { kitOf, equipmentPicks, equipmentComplete, equipmentBasis } from '@/builder/equipment.js'
import { creationSlots, currentFeats, draftHolds, featBlocks, featSlotDone, featsBasis } from '@/builder/feats.js'
import { featChoices, featOptionDone, featPrefix } from '@/builder/featChoices.js'
import { weaponProficiencies } from '@/builder/skills.js'

export const PAGE_CATEGORIES = { species: 'Species', background: 'Backgrounds', profession: 'Professions', path: 'Paths' }
const LISTINGS = [...Object.values(PAGE_CATEGORIES), 'Techniques', 'Items', 'Feats']

export const useBuilderPages = () => {
  const builder = useBuilderStore()
  const { lists } = useCatalog()
  for (const category of LISTINGS) loadCategory(category)

  const loaded = (...categories) => categories.every((c) => lists[c] && lists[c].status !== 'loading')

  const picked = computed(() => Object.fromEntries(Object.entries(PAGE_CATEGORIES).map(([kind, category]) => {
    const name = builder.draft[kind]?.pageName
    return [kind, name ? (lists[category]?.options ?? []).find((o) => o.pageName === name) ?? null : null]
  })))

  const techniques = computed(() => (lists.Techniques?.options ?? []).map(techniqueInfo).filter((t) => t.rank != null))
  const feats = computed(() => lists.Feats?.options ?? [])

  const pages = computed(() => {
    const d = builder.draft
    const held = new Set(['profession', 'path'].flatMap((kind) =>
      Object.values(d[kind]?.choices ?? {}).flatMap((v) => String(v).split('|')).filter(Boolean)))
    const ctx = {
      level: d.level,
      profession: picked.value.profession,
      professions: lists.Professions?.options ?? [],
      mastery: weaponProficiencies(picked.value).map((w) => ({ id: w.id, name: w.name })),
      held,
    }
    const taken = Object.entries(currentFeats(d)).flatMap(([slotKey, name]) => {
      const option = feats.value.find((f) => f.pageName === name)
      return option ? [{ slotKey, option, choices: featChoices(option, slotKey, ctx) }] : []
    })
    return { ...picked.value, feats: taken }
  })

  const featPickOf = (f) => builder.draft.abilities.featPicks?.[featPrefix(f.slotKey, f.option.pageName)] ?? ''

  const abilitySlots = computed(() => creationSlots(pages.value, builder.draft.level))
  const blocks = computed(() => featBlocks({
    slots: abilitySlots.value,
    chosen: currentFeats(builder.draft),
    feats: feats.value,
    holdsAt: (level) => draftHolds(pages.value, builder.draft, level),
  }))

  return { builder, lists, pages, techniques, feats, abilitySlots, blocks, featPickOf, loaded }
}

export const useStepMarks = () => {
  const { builder, lists, pages, techniques, abilitySlots, blocks, featPickOf, loaded } = useBuilderPages()
  const draft = computed(() => builder.draft)

  watchEffect(() => {
    if (!loaded('Species', 'Backgrounds', 'Professions', 'Paths', 'Feats')) return
    const d = draft.value
    const chosen = currentFeats(d)
    const done = abilitySlots.value.filter((s) => s.feat && chosen[s.key]).every((s) => featSlotDone(s, chosen, blocks.value))
      && pages.value.feats.every((f) => featOptionDone(f.choices.option, featPickOf(f)))
    const mark = done ? featsBasis(d) : ''
    if (d.abilities.featsFor !== mark) d.abilities.featsFor = mark
  })

  watchEffect(() => {
    if (!loaded('Species', 'Backgrounds', 'Professions', 'Paths')) return
    const d = draft.value
    const done = !!(d.species && d.background && d.profession) && skillsComplete(pages.value, d.skills, d.level)
    const mark = done ? skillsBasis(d) : ''
    if (d.skills.doneFor !== mark) d.skills.doneFor = mark
  })

  watchEffect(() => {
    if (!loaded('Species', 'Professions', 'Paths', 'Techniques') || lists.Techniques?.status === 'error') return
    const d = draft.value
    const profession = d.profession?.pageName ?? ''
    const done = !!profession
      && techniquesComplete(techniquePools(pages.value, d.level), d.techniques.picks, techniques.value, profession)
    const mark = done ? techniquesBasis(d) : ''
    if (d.techniques.doneFor !== mark) d.techniques.doneFor = mark
  })

  watchEffect(() => {
    if (!loaded('Species', 'Backgrounds', 'Professions', 'Items')) return
    const d = draft.value
    const kit = kitOf(pages.value.profession)
    const picks = equipmentPicks({
      professionName: d.profession?.pageName ?? '',
      kitPicks: d.equipment.kit === 'a' ? kit?.a?.picks ?? [] : [],
      backgroundName: d.background?.pageName ?? '',
      backgroundPicks: pages.value.background?.payload?.equipmentPicks ?? [],
    }, d.equipment.picks)
    const done = !!kit && equipmentComplete(d.equipment.kit, picks, d.equipment.picks)
    const mark = done ? equipmentBasis(d) : ''
    if (d.equipment.doneFor !== mark) d.equipment.doneFor = mark
  })
}
