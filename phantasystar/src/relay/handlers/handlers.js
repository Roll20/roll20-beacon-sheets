import {
  initValues, beaconPulse, settingsPulse,
  sheetDrops, dragOverCount, refusedDropCount,
} from '../relay'
import { mayEdit } from '../permissions.js'
import { normalizeDrop, recordDrop } from '@/compendium/dropLog.js'
import { applySharedSettings } from '../sheetSettings'

export const onInit = ({ character, settings, sharedSettings, compendiumDropData }) => {
  initValues.id = character.id
  initValues.character = character
  initValues.settings = settings
  initValues.compendiumDrop = compendiumDropData ? compendiumDropData : null
  applySharedSettings(sharedSettings)
  console.log('onInit -> PS sheet relay')
}

export const onChange = async ({ character }) => {
  const old = beaconPulse.value
  beaconPulse.value = old + 1
  console.log('onChange -> PS sheet relay', character)
}

export const onSettingsChange = ({ settings }) => {
  Object.assign(initValues.settings, settings)
  settingsPulse.value += 1
}

export const onSharedSettingsChange = ({ settings }) => {
  applySharedSettings(settings)
}

export const onTranslationsRequest = () => ({})

export const onDragOver = () => {
  dragOverCount.value += 1
}

export const onDropOver = (event) => {
  if (!mayEdit(initValues.settings)) {
    refusedDropCount.value += 1
    if (import.meta.env.DEV) console.info('onDropOver refused - view-only viewer')
    return
  }

  const entry = normalizeDrop(event)
  sheetDrops.value = recordDrop(sheetDrops.value, entry)
  if (import.meta.env.DEV) console.info('onDropOver -> PS sheet relay', entry, event)
}
