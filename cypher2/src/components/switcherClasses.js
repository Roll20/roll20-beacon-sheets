// Shared switcher styling. SegmentedControl is the only consumer now — TabBar is
// deleted — so the sizing and contrast work in spec ⑦ §4.4 item 4 is done
// once (ddd-001) and inherited, not redone.
//
// ⚠ COLOUR LIVES IN EXACTLY ONE BRANCH. Tailwind's OUTPUT order decides which utility
// wins, not the order of names in the class string. A `bg-transparent` in the base
// would beat a `bg-accent` in the active branch and the active control would stay
// transparent in every skin. switcherClasses.test.js guards this.
//
// `border-[length:...]` rather than a bare `border`, which hardcodes 1px and would
// ignore fantasy's 2px --cy-geo-rule.
export const SWITCHER_BASE = [
  'flex-none cursor-pointer',
  'px-[0.85rem] py-[0.45rem]',
  'font-cond text-[0.82rem] uppercase tracking-[var(--cy-geo-banner-tracking)]',
  'border-[length:var(--cy-geo-rule)] border-solid border-b-0',
  'rounded-[var(--cy-geo-banner-radius)] [clip-path:var(--cy-geo-banner-clip)]'
].join(' ')

export const SWITCHER_ACTIVE = 'bg-accent text-accent-contrast border-accent font-bold'

// `text-ink`, not `text-muted`: --cy-muted is the exact token .microlabel uses, so an
// inactive tab read at field-label contrast — the fault spec ⑦ §4.4 item 4 names when it
// asks for weight, spacing AND contrast. --color-ink is the sheet's primary body-text
// token (bridged in main.css's @theme block, so it re-skins per [data-theme] like every
// other semantic utility). Active still separates from inactive on background, border
// and weight, so promoting inactive to body-text contrast costs no state legibility.
export const SWITCHER_INACTIVE = 'bg-transparent text-ink border-transparent'
