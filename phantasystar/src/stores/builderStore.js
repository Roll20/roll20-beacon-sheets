import { defineStore } from 'pinia'
import { ref } from 'vue'
import { emptyDraft, normalizeDraft } from '@/builder/draft.js'

export const useBuilderStore = defineStore('build', () => {
  const draft = ref(emptyDraft())

  const open = ref(false)
  const step = ref(0)
  const reviewing = ref(false)

  const start = () => {
    open.value = true
    reviewing.value = false
  }

  const close = () => {
    open.value = false
    reviewing.value = false
  }

  const skip = () => {
    draft.value = { ...draft.value, skipped: true }
  }

  const dehydrate = () => draft.value

  const hydrate = (stored) => {
    draft.value = normalizeDraft(stored)
  }

  return { draft, open, step, reviewing, start, close, skip, dehydrate, hydrate }
})
