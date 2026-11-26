import { reactive } from 'vue'
import { dispatchRef } from '@/relay/relay.js'
import { categoryQuery, readCategory } from '@/builder/catalog.js'

const lists = reactive({})

const fetchCategory = async (category) => {
  const dispatch = dispatchRef.value
  if (typeof dispatch?.compendiumRequest !== 'function') {
    return { ok: false, error: 'This relay cannot reach a compendium.' }
  }
  try {
    return readCategory(await dispatch.compendiumRequest({ query: categoryQuery(category) }), category)
  } catch (error) {
    return { ok: false, error: `The compendium request failed: ${error?.message ?? error}` }
  }
}

export const loadCategory = (category) => {
  if (!category || (lists[category] && lists[category].status !== 'error')) return
  lists[category] = { status: 'loading', options: [], error: '' }
  fetchCategory(category).then((read) => {
    lists[category] = read.ok
      ? { status: 'ok', options: read.options, error: '' }
      : { status: 'error', options: [], error: read.error }
  })
}

export const useCatalog = () => ({ lists, loadCategory })
