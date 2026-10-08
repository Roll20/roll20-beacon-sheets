import { reactive } from 'vue'
import { dispatchRef } from './relay.js'

export const SHEET_OPTIONS = [
  {
    key: 'forceBreach',
    name: 'Force Breach',
    default: false,
    hint: 'Variant rule for Limit Breach (see ch. 6 of the core book)',
  },
  {
    key: 'fatePool',
    name: 'Fate Pool',
    default: false,
    hint: 'Variant rule for Fate Points (see ch. 1 of the core book)',
  },
  {
    key: 'temptingFate',
    name: 'Tempting Fate',
    default: false,
    hint: 'Variant rule for Fate Points (see ch. 1 of the core book)',
  },
  {
    key: 'comboTechniques',
    name: 'Combo Techniques',
    default: false,
    hint: 'Variant rule for techniques (see ch. 6 of the core book)',
  },
  {
    key: 'weaponDamageByGrade',
    name: 'Weapon Damage by Grade',
    default: false,
    hint: 'Variant rule for weapon damage (see ch. 5 of the core book)',
  },
  {
    key: 'milestone',
    name: 'Milestone Advancement',
    default: false,
    hint: 'Removes XP tracking. Characters level during events or milestones set by the GM.',
  },
]

export const DEFAULT_SHEET_SETTINGS = Object.fromEntries(
  SHEET_OPTIONS.map((o) => [o.key, o.default]),
)

export const sharedSettings = reactive({ ...DEFAULT_SHEET_SETTINGS })

export const applySharedSettings = (incoming = {}) => {
  for (const option of SHEET_OPTIONS) {
    const value = incoming?.[option.key]
    sharedSettings[option.key] = value === undefined ? option.default : !!value
  }
  return sharedSettings
}

export const saveSharedSettings = async (patch = {}) => {
  Object.assign(sharedSettings, patch)
  const dispatch = dispatchRef.value
  if (!dispatch?.updateSharedSettings) return null
  return dispatch.updateSharedSettings({ settings: { ...sharedSettings } })
}
