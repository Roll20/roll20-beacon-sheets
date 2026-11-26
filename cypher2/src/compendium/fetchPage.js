// Fetches the dropped page (spec ⑥ §2, §5). SDK 0.1.17 drops carry only a page name,
// a category name and a book id, never attributes, so every drop costs one request.

// Which query to send (§2.1). 'category' is what atr, dnd-ogl and invincible send.
// 'root' is the form to switch to if Roll20 says the Cypher compendium needs it.
// Walkthrough item 9 decides. Both forms are tested.
export const QUERY_FORM = 'category'

const PAGE_FIELDS = 'id name properties book { name itemId } category { name }'

// JSON.stringify yields a valid GraphQL string literal, so a quote or backslash in a
// name cannot break the query the way the reference sheets' raw interpolation does.
export const buildPageQuery = ({ pageName, categoryName }, form = QUERY_FORM) => {
  const pages = `pages(name: ${JSON.stringify(pageName)}) { ${PAGE_FIELDS} }`
  return form === 'root' ? pages : `category(name: ${JSON.stringify(categoryName)}) { ${pages} }`
}

// The SDK types `errors` as an always-present array (`CompendiumResults`), and its own
// compendium utility fails a reply only when that array is non-empty. An empty list is
// a success, however the host happens to send it.
const hasErrors = (reply) => (Array.isArray(reply.errors) ? reply.errors.length > 0 : Boolean(reply.errors))

// One flat page list from any of the three reply shapes seen in the reference sheets,
// or null when the reply is not an answer at all.
export const normalizePages = (reply) => {
  if (!reply || typeof reply !== 'object' || hasErrors(reply)) return null
  const system = reply.data?.ruleSystem ?? reply.ruleSystem
  if (!system || typeof system !== 'object') return null
  if (system.category === null) return []
  const pages = system.category ? system.category.pages : system.pages
  return Array.isArray(pages) ? pages : null
}

export const fetchPage = async (
  dispatch,
  { pageName, categoryName, expansionId },
  { expired, form = QUERY_FORM, log = () => {} }
) => {
  const query = buildPageQuery({ pageName, categoryName }, form)
  // Logged before sending, so walkthrough item 9 has the query even if no reply comes.
  log('compendium request', { query, expansionId })
  // The executor turns a throw while posting into a rejection. The SDK's promise never
  // settles when no reply comes, and nothing can cancel it, so the deadline races it
  // and a late reply lands on a race that has already finished.
  const request = new Promise((resolve) => resolve(dispatch.compendiumRequest({ query })))
  const outcome = await Promise.race([
    request.then((reply) => ({ reply }), (error) => ({ failed: true, error })),
    expired.then(() => ({ expired: true }))
  ])
  if (outcome.expired) {
    log('compendium request timed out', { query, expansionId })
    return { ok: false, reason: 'timed-out' }
  }
  if (outcome.failed) {
    log('compendium request failed', { query, expansionId, error: outcome.error })
    return { ok: false, reason: 'request-error' }
  }
  log('compendium reply', { query, expansionId, reply: outcome.reply })

  const pages = normalizePages(outcome.reply)
  if (pages === null) return { ok: false, reason: 'request-error' }
  // Exact name, exact book, and on the root form exact category too (§5).
  const matches = pages.filter(
    (candidate) =>
      candidate?.name === pageName &&
      Number(candidate?.book?.itemId) === Number(expansionId) &&
      (form !== 'root' || candidate?.category?.name === categoryName)
  )
  if (matches.length === 0) return { ok: false, reason: 'not-found' }
  if (matches.length > 1) return { ok: false, reason: 'ambiguous' }
  return { ok: true, page: matches[0] }
}
