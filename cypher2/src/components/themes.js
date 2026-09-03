// The three shipped skins. Superhero and Real-World are the book's other two genres
// but MCG supplied no printed sheet art for them — deferred to ddd-bdv, which is now
// two more [data-theme] blocks and no code.
export const THEMES = [
  { key: 'base', label: 'Base' },
  { key: 'fantasy', label: 'Fantasy' },
  { key: 'scifi', label: 'Science Fiction' }
]

const KEYS = new Set(THEMES.map((t) => t.key))

// An unknown value resolves to base rather than leaving the <select> blank or the
// sheet unthemed. A Set, not `key in {...}` — the latter would accept 'toString'.
export const resolveTheme = (key) => (KEYS.has(key) ? key : 'base')
