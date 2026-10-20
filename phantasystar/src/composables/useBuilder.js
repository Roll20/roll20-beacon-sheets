import { computed, ref } from 'vue'
import { useAppStore, DEFAULT_CHARACTER_NAME } from '@/stores/index.js'
import { useBuilderStore } from '@/stores/builderStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { dispatchRef } from '@/relay/relay.js'
import { fetchEntry } from '@/compendium/fetchEntry.js'
import { readPage } from '@/compendium/payload.js'
import { stepsFor, stepDone, unfinishedSteps } from '@/builder/steps.js'
import { buildCharacter } from '@/builder/build.js'
import { characterVision } from '@/rules/tokens.js'
import { updateCharacterTokens } from '@/relay/characterTokens.js'

const notice = ref(null)

export const useBuilder = () => {
  const app = useAppStore()
  const builder = useBuilderStore()
  const meta = useMetaStore()

  const steps = computed(() => stepsFor(builder.draft))
  const index = computed(() => Math.min(Math.max(builder.step, 0), steps.value.length - 1))
  const current = computed(() => steps.value[index.value])
  const unfinished = computed(() => unfinishedSteps(builder.draft))
  const isDone = (step) => stepDone(step, builder.draft)

  const go = (i) => {
    builder.reviewing = false
    builder.step = Math.min(Math.max(i, 0), steps.value.length - 1)
  }
  const next = () => (index.value >= steps.value.length - 1 ? review() : go(index.value + 1))
  const previous = () => (builder.reviewing ? go(steps.value.length - 1) : go(index.value - 1))
  const review = () => { builder.reviewing = true }

  const start = () => {
    const given = String(meta.name ?? '').trim()
    if (!builder.draft.concept.name && given && given !== DEFAULT_CHARACTER_NAME) {
      builder.draft.concept.name = given
    }
    notice.value = null
    builder.start()
  }

  const fetchPage = async (pointer) => {
    const fetched = await fetchEntry(dispatchRef.value, pointer)
    if (!fetched.ok) return fetched
    return readPage(fetched.pages[0]) ?? { ok: false, error: `${pointer.pageName} has nothing to apply.` }
  }

  const building = ref(false)
  const build = async () => {
    if (building.value) return
    building.value = true
    try {
      const { failed } = await buildCharacter({ draft: builder.draft, app, fetchPage })
      updateCharacterTokens(characterVision(app.sheet.nightVision?.range ?? 0))
      builder.draft = { ...builder.draft, built: true }
      builder.close()
      notice.value = failed.length
        ? { tone: 'refused', text: `Built, except: ${failed.map((f) => f.error).join(' ')}` }
        : { tone: 'ok', text: 'Character build completed!' }
    } finally {
      building.value = false
    }
  }

  return {
    builder, steps, index, current, unfinished, isDone, notice, building,
    go, next, previous, review, start, build,
  }
}
