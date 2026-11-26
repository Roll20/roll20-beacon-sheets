import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/index.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useLevelUpStore } from '@/stores/levelUpStore.js'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useCatalog, loadCategory } from '@/composables/useCatalog.js'
import { dispatchRef } from '@/relay/relay.js'
import { builderEnabled } from '@/relay/sheetSettings.js'
import { fetchEntry } from '@/compendium/fetchEntry.js'
import { readPage } from '@/compendium/payload.js'
import { techniqueInfo, levelRow } from '@/builder/techniques.js'
import { summarizeSheet } from '@/rules/characterSummary.js'
import {
  levelUpSteps, levelUpAllotments, levelUpPools, applyLevelUp, levelUpStarted, MAX_LEVEL,
} from '@/builder/levelUp.js'
import { normalizeProfessionStats, weaponProficiencyList } from '@/rules/index.js'
import { normalizeInitiate } from '@/rules/feats.js'
import { characterVision } from '@/rules/tokens.js'
import { updateCharacterTokens } from '@/relay/characterTokens.js'
import { PC } from '@/sheetTypes.js'

const LISTINGS = ['Species', 'Professions', 'Paths', 'Techniques', 'Feats']

const notice = ref(null)

export const useLevelUp = () => {
  const store = useLevelUpStore()
  const builder = useBuilderStore()
  const app = useAppStore()
  const sheet = useCharacterStore()
  const techniqueStore = useTechniqueStore()
  const meta = useMetaStore()
  const { lists } = useCatalog()

  const find = (category, name) =>
    name ? (lists[category]?.options ?? []).find((o) => o.pageName === name) ?? null : null
  const loaded = computed(() => LISTINGS.every((c) => lists[c] && lists[c].status !== 'loading'))

  const paths = computed(() => lists.Paths?.options ?? [])
  const techniques = computed(() => (lists.Techniques?.options ?? []).map(techniqueInfo).filter((t) => t.rank != null))
  const feats = computed(() => lists.Feats?.options ?? [])

  const ctx = computed(() => ({
    from: store.lu.from,
    profession: find('Professions', sheet.profession),
    pathName: sheet.path || '',
    path: find('Paths', sheet.path),
    species: find('Species', sheet.species),
    abilities: { ...sheet.abilities },
    skills: Object.fromEntries(Object.entries(sheet.skills ?? {}).map(([id, s]) => [id, Number(s?.ranks) || 0])),
    doubled: Object.entries(sheet.skills ?? {}).filter(([, s]) => s?.doubled).map(([id]) => id),
    known: techniqueStore.techniques.map((t) => ({ name: t.name, rank: Number(t.rank), countsAsKnown: t.countsAsKnown })),
    mastery: weaponProficiencyList(sheet.proficiencies).filter((w) => !w.mastered).map((w) => ({ id: w.id, name: w.name })),
    feats: feats.value,
    holds: {
      features: sheet.features,
      proficiencies: sheet.proficiencies,
      species: find('Species', sheet.species)?.payload?.id ?? '',
      maxTP: Number(sheet.maxTP) || 0,
    },
    professions: lists.Professions?.options ?? [],
    held: sheet.features.flatMap((f) => String(f.pick ?? '').split('|')).filter(Boolean),
    initiates: sheet.features
      .map((f) => ({ ref: f.ref || f._id, name: f.name, initiate: normalizeInitiate(f.initiate) }))
      .filter((f) => f.initiate),
  }))

  const maxTp = computed(() => {
    const at = Number(summarizeSheet({ ...sheet.dehydrate(), level: store.lu.to }).maxTP) || 0
    return {
      before: Number(sheet.maxTP) || 0,
      after: at || Number(levelRow(ctx.value.profession, store.lu.to)?.maxTP) || 0,
    }
  })

  const steps = computed(() => (ctx.value.profession ? levelUpSteps(ctx.value, store.lu, techniques.value, paths.value) : []))
  const index = computed(() => Math.min(Math.max(store.step, 0), Math.max(0, steps.value.length - 1)))
  const current = computed(() => steps.value[index.value] ?? null)
  const isDone = (step) => !!step?.done()
  const unfinished = computed(() => steps.value.filter((s) => !isDone(s)))

  const go = (i) => {
    store.reviewing = false
    store.step = Math.min(Math.max(i, 0), steps.value.length - 1)
  }
  const next = () => (index.value >= steps.value.length - 1 ? review() : go(index.value + 1))
  const previous = () => (store.reviewing ? go(steps.value.length - 1) : go(index.value - 1))
  const review = () => { store.reviewing = true }

  const wanted = computed(() => builderEnabled() && app.sheetType === PC && meta.canEdit
    && !!String(sheet.profession ?? '').trim() && (Number(sheet.level) || 1) < MAX_LEVEL)
  let asked = false
  watch(wanted, (yes) => {
    if (yes && !asked) {
      asked = true
      loadCategory('Professions')
    }
  }, { immediate: true })
  const available = computed(() => wanted.value && !!find('Professions', sheet.profession))

  const keep = (value) => { builder.draft = { ...builder.draft, levelUp: value } }

  const start = () => {
    for (const category of LISTINGS) loadCategory(category)
    notice.value = null
    const level = Number(sheet.level) || 1
    const saved = builder.draft.levelUp
    if (saved && saved.from !== level) keep(null)
    store.start(level, saved?.from === level ? saved : null)
  }

  const started = computed(() => levelUpStarted(store.lu))

  const save = () => {
    keep(JSON.parse(JSON.stringify(store.lu)))
    store.close()
  }

  const discard = () => {
    keep(null)
    store.close()
  }

  const startOver = () => {
    keep(null)
    store.start(Number(sheet.level) || 1)
  }

  watch(() => [store.lu.to, store.lu.path, loaded.value], () => {
    if (!loaded.value || !ctx.value.profession) return
    const lu = store.lu
    const totals = Object.fromEntries(levelUpAllotments(ctx.value, lu, paths.value).map((a) => [a.key, a.total]))
    const ranks = Object.fromEntries(Object.entries(lu.skills.ranks)
      .filter(([key, held]) => key in totals && Object.values(held).reduce((x, y) => x + y, 0) <= totals[key]))
    if (JSON.stringify(ranks) !== JSON.stringify(lu.skills.ranks)) lu.skills.ranks = ranks
    const pools = new Set(levelUpPools(ctx.value, lu, paths.value).map((p) => p.key))
    const picks = Object.fromEntries(Object.entries(lu.techniques.picks).filter(([key]) => pools.has(key)))
    if (JSON.stringify(picks) !== JSON.stringify(lu.techniques.picks)) lu.techniques.picks = picks
  })

  const fetchPage = async (pointer) => {
    const fetched = await fetchEntry(dispatchRef.value, pointer)
    if (!fetched.ok) return fetched
    return readPage(fetched.pages[0]) ?? { ok: false, error: `${pointer.pageName} has nothing to apply.` }
  }

  const applying = ref(false)
  const apply = async () => {
    if (applying.value) return
    applying.value = true
    try {
      const from = store.lu.from
      const to = store.lu.to
      const sightBefore = sheet.nightVision?.range ?? 0
      const { failed } = await applyLevelUp({
        ctx: ctx.value, lu: store.lu, paths: paths.value, app, fetchPage,
        hasLevelRow: (level) => !!normalizeProfessionStats(sheet.professionStats).levels?.[`lv${level}`],
      })
      const sight = sheet.nightVision?.range ?? 0
      if (sight !== sightBefore) updateCharacterTokens(characterVision(sight))
      keep(null)
      store.close()
      notice.value = failed.length
        ? { tone: 'refused', text: `Level ${to}, except: ${failed.map((f) => f.error).join(' ')}` }
        : { tone: 'ok', text: `Character level increased from ${from} to ${to}.` }
    } finally {
      applying.value = false
    }
  }

  return {
    store, ctx, paths, techniques, feats, loaded, maxTp, steps, index, current, isDone, unfinished,
    available, notice, applying, started, go, next, previous, review, start, apply, save, discard, startOver,
  }
}
