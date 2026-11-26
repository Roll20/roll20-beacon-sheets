const BOOK = { itemId: 45541, shortName: 'PSTR45541' }

let loading = null
const load = () => {
  loading ??= fetch('/@dev-compendium')
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  return loading
}

const unescape = (value) => value.replace(/\\(.)/g, '$1')

const toPage = (category, name, entry) => {
  const { content = '', ...properties } = entry ?? {}
  return {
    id: `${category}:${name}`,
    name,
    legacyPageId: null,
    book: BOOK,
    category: { name: category },
    properties,
    children: [],
    content,
  }
}

const pagesNamed = (book, name, category) =>
  Object.entries(book.pagesByCategory ?? {})
    .filter(([c]) => !category || c === category)
    .flatMap(([c, pages]) => (name in pages ? [toPage(c, name, pages[name])] : []))

const STRING = '"((?:[^"\\\\]|\\\\.)*)"'

export const devCompendiumRequest = async ({ query }) => {
  const book = await load()
  if (!book) return { errors: [{ message: 'No dev compendium: release/compendium/import.json is missing.' }] }
  const text = String(query ?? '')

  const listing = new RegExp(`^\\s*category\\(name: ${STRING}\\)`).exec(text)
  if (listing) {
    const category = unescape(listing[1])
    const pages = Object.entries(book.pagesByCategory?.[category] ?? {}).map(([name, entry]) => toPage(category, name, entry))
    return { data: { ruleSystem: { category: { pages } } } }
  }

  const named = new RegExp(`pages\\(name: ${STRING}(?: category: ${STRING})?\\)`).exec(text)
  if (named) {
    const pages = pagesNamed(book, unescape(named[1]), named[2] != null ? unescape(named[2]) : '')
    const scoped = /^\s*book\(itemId: (\d+)\)/.exec(text)
    if (scoped) return { data: { ruleSystem: { book: Number(scoped[1]) === BOOK.itemId ? { pages } : null } } }
    return { data: { ruleSystem: { pages } } }
  }

  return { errors: [{ message: `The dev compendium doesn't read this query: ${text.slice(0, 80)}` }] }
}
