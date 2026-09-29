export const PC = 'pc'
export const NPC = 'npc'
export const STARSHIP = 'starship'

export const SHEET_TYPES = [
  { id: PC, name: 'Player Character' },
  { id: NPC, name: 'NPC' },
  { id: STARSHIP, name: 'Starship (Player)' },
]

export const SHEET_TYPE_IDS = SHEET_TYPES.map((t) => t.id)

export const DEFAULT_SHEET_TYPE = PC

export const getSheetType = (id) =>
  SHEET_TYPES.find((t) => t.id === id) ?? SHEET_TYPES.find((t) => t.id === DEFAULT_SHEET_TYPE)

export const sheetTypeOf = (character) =>
  getSheetType(character?.attributes?.sheetType).id

export const CREATURE = 'creature'
export const NPC_SHIP = 'ship'

export const NPC_MODES = [
  { id: CREATURE, name: 'Creature', blurb: 'A creature or person, as ch. 7 prints it.' },
  { id: NPC_SHIP, name: 'Ship', blurb: 'An enemy or other NPC ship, as ch. 8 prints it.' },
]

export const NPC_MODE_IDS = NPC_MODES.map((m) => m.id)

export const DEFAULT_NPC_MODE = CREATURE

export const getNpcMode = (id) =>
  NPC_MODES.find((m) => m.id === id) ?? NPC_MODES.find((m) => m.id === DEFAULT_NPC_MODE)

export const npcModeOf = (character) => getNpcMode(character?.attributes?.npcMode).id

export const isNpcShip = (character) =>
  sheetTypeOf(character) === NPC && npcModeOf(character) === NPC_SHIP

export const BLOCKS_BY_TYPE = {
  [PC]: ['sheet', 'techniques', 'bio'],
  [NPC]: ['npc'],
  [STARSHIP]: ['starship'],
}

export const BLOCKS_BY_NPC_MODE = {
  [CREATURE]: ['npc'],
  [NPC_SHIP]: ['npcship'],
}

export const blocksFor = (type, npcMode) =>
  getSheetType(type).id === NPC
    ? BLOCKS_BY_NPC_MODE[getNpcMode(npcMode).id]
    : BLOCKS_BY_TYPE[getSheetType(type).id]
