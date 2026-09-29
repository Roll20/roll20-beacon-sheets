export const PUBLIC = 'public'
export const GM_ONLY = 'gm'
export const BLIND = 'blind'

export const VISIBILITIES = [
  {
    id: PUBLIC,
    label: 'Public',
    short: 'Public',
    hint: 'Everyone sees the roll',
    card: null,
  },
  {
    id: GM_ONLY,
    label: 'Whisper',
    short: 'Whisper',
    hint: 'Only you and the GM',
    card: 'Whispered to the GM',
  },
  {
    id: BLIND,
    label: 'GM',
    short: 'GM',
    hint: 'GM Only',
    card: 'GM only',
  },
]

export const getVisibility = (id) => VISIBILITIES.find((v) => v.id === id) ?? VISIBILITIES[0]

export const postOptionsFor = (id) => {
  if (id === GM_ONLY) return { whisper: 'gm' }
  if (id === BLIND) return { whisper: 'gm', secret: true }
  return {}
}

export const cardNoteFor = (id) => getVisibility(id).card
