// Pure presentation for the item chat card (item-contents spec §4).
// Segments own the per-list descriptor (§3.1) because the field wording is per-list
// knowledge; this module owns the projection rules every list shares — falsy fields
// drop, an empty section is absent, nothing is trusted to be a string — so no segment
// repeats them and no two lists can drift on the shared rules.
//
// The separator is joined HERE rather than emitted by the template. Handlebars would
// need an {{#unless @last}} to avoid a trailing '·', and that is exactly the kind of
// detail that survives review and ships. A joined string cannot grow a stray one.
const FIELD_SEPARATOR = ' · '

// Trim-to-null: a textarea a player opened and closed holds '\n', which is truthy and
// would render an empty prose block with a border around it.
//
// BOOLEANS ARE DROPPED, not stringified. Descriptors write `row.enabler && 'Enabler'`,
// so an unset flag arrives as literal `false` — and String(false) is the truthy string
// 'false', which would print on the card. Numbers are NOT dropped: a currency amount of
// 0 is a real value the card must show.
const text = (v) => {
  if (v == null || typeof v === 'boolean') return null
  const s = String(v).trim()
  return s.length ? s : null
}

export const itemCardTemplateData = (list, contents = {}) => ({
  list,
  // A row whose name the player cleared still posts. `rowWhat` says "unnamed row N" on
  // the sheet, where the index is visible; a card in the chat log has no list around it
  // for an index to mean anything, so it says this instead.
  title: text(contents.title) ?? 'Unnamed',
  fields: (contents.fields ?? []).map(text).filter(Boolean).join(FIELD_SEPARATOR) || null,
  source: text(contents.source),
  prose: text(contents.prose)
})
