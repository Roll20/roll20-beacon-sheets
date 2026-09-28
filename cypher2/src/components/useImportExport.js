import { ref } from 'vue'
import { FAILURE } from '@/contract/failure.js'

// The import and export logic both panels share (ddd-4l3w). It lives beside the other
// component helpers because it holds Vue refs; src/contract/ stays free of Vue so the
// creature importer loads without Pinia (failure.js).
//
//   parse(text)                -> { ok: true, doc } | { ok: false, failure }
//   apply(doc)                 -> performs the confirmed import
//   buildExport()              -> the document to hand out
//   describeExportFailure(doc) -> null when valid, else { message, details, more }
//   download(doc)              -> saves the file
export const useImportExport = ({ parse, apply, buildExport, describeExportFailure, download }) => {
  const pasted = ref('')
  const failure = ref(null) // { code, message, details?, more? }
  const pending = ref(null) // validated doc awaiting the replace confirmation

  // Each import attempt, a file pick or a Validate click, takes a number. A file read
  // that settles after a newer attempt began is ignored, so a slow read can never
  // replace a newer result or raise a stale alert.
  let importAttempt = 0
  const startImport = () => {
    importAttempt += 1
    failure.value = null
    pending.value = null
    return importAttempt
  }
  const settleImport = (result) => {
    if (result.ok) pending.value = result.doc
    else failure.value = result.failure
  }

  const onValidatePaste = () => {
    startImport()
    settleImport(parse(pasted.value))
  }

  // The input clears BEFORE the read, so the same file can be chosen again even if the
  // read never settles; the captured File stays readable. Starting the attempt closes
  // any open confirmation at once, so an older document cannot be confirmed while the
  // new read runs. A read can reject, for example when the file was moved after it was
  // chosen: that is a visible refusal like any other (NPC plan decision 19).
  const onFile = async (event) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    input.value = ''
    const attempt = startImport()
    try {
      const text = await file.text()
      if (attempt === importAttempt) settleImport(parse(text))
    } catch {
      if (attempt === importAttempt) failure.value = { code: FAILURE.NOT_JSON, message: 'Could not read this file.' }
    }
  }

  const confirmImport = () => {
    apply(pending.value)
    pending.value = null
    pasted.value = ''
  }
  const cancelImport = () => {
    pending.value = null
  }

  const copyStatus = ref(null) // { ok: boolean, message: string } — transient feedback for onCopy
  const exportFailure = ref(null) // violations that would make the exported file un-importable

  // Validate before handing anything out; a visible refusal beats a bad file. Every
  // attempt starts clean and takes a number, so neither an earlier "Copied" nor a slow
  // clipboard write that settles later can sit beside this attempt's refusal.
  let exportAttempt = 0
  const validatedExport = () => {
    exportAttempt += 1
    copyStatus.value = null
    exportFailure.value = null
    const doc = buildExport()
    const refusal = describeExportFailure(doc)
    if (!refusal) return doc
    exportFailure.value = refusal
    return null
  }

  const onDownload = () => {
    const doc = validatedExport()
    if (doc) download(doc)
  }
  const onCopy = async () => {
    const doc = validatedExport()
    if (!doc) return
    const attempt = exportAttempt
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc, null, 2))
      if (attempt === exportAttempt) copyStatus.value = { ok: true, message: 'Copied to clipboard.' }
    } catch {
      // e.g. sandboxed-iframe CSP blocks clipboard access — surface it rather than fail silently.
      if (attempt === exportAttempt) {
        copyStatus.value = { ok: false, message: 'Could not copy to clipboard. Use Download JSON instead.' }
      }
    }
  }

  return {
    pasted,
    failure,
    pending,
    onFile,
    onValidatePaste,
    confirmImport,
    cancelImport,
    copyStatus,
    exportFailure,
    onDownload,
    onCopy
  }
}
