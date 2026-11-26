import { dispatchRef, initValues } from '@/relay/relay.js'

export const openCompendium = (url) => {
  if (!url) return
  const dispatch = dispatchRef.value
  if (initValues.settings?.environment === 'VTT' && typeof dispatch?.openDialogFromLink === 'function') {
    dispatch.openDialogFromLink({ urlString: url })
    return
  }
  window.open(url, undefined, 'popup=true, width=770, height=620, noopener')
}
