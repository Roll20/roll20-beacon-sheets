<script setup>
import { ref } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { parseAndValidate, applyDocument } from '@/contract/importer.js'
import { exportDocument, downloadDocument } from '@/contract/exporter.js'
import { validateDocument } from '@/contract/validation.js'

const sheet = useSheetStore()
const meta = useMetaStore()

const pasted = ref('')
const failure = ref(null) // { code, message, details? } — the four distinct messages
const pending = ref(null) // validated doc awaiting the replace confirmation

const receiveText = (text) => {
  failure.value = null
  pending.value = null
  const result = parseAndValidate(text)
  if (!result.ok) {
    failure.value = result.failure
    return
  }
  pending.value = result.doc
}

const onFile = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  receiveText(await file.text())
  event.target.value = '' // allow re-selecting the same file
}

const onValidatePaste = () => receiveText(pasted.value)

const confirmImport = () => {
  applyDocument(pending.value, { sheet, meta })
  pending.value = null
  pasted.value = ''
}
const cancelImport = () => {
  pending.value = null
}

const copyStatus = ref(null) // { ok: boolean, message: string } — transient feedback for onCopy
const exportFailure = ref(null) // violations that would make the exported file un-importable

// Hand-edited text fields (e.g. an emptied name) can violate the schema's
// minLength floors, producing a file this sheet would refuse to re-import.
// Validate before handing anything out; a visible refusal beats a bad file.
const validatedExport = () => {
  exportFailure.value = null
  const doc = exportDocument({ sheet, meta })
  const { valid, errors } = validateDocument(doc)
  if (valid) return doc
  exportFailure.value = {
    message: 'This sheet cannot be exported yet — fix these fields first:',
    details: errors.slice(0, 5)
  }
  return null
}

const onDownload = () => {
  const doc = validatedExport()
  if (doc) downloadDocument(doc)
}
const onCopy = async () => {
  const doc = validatedExport()
  if (!doc) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(doc, null, 2))
    copyStatus.value = { ok: true, message: 'Copied to clipboard.' }
  } catch {
    // e.g. sandboxed-iframe CSP blocks clipboard access — surface it rather than fail silently.
    copyStatus.value = { ok: false, message: 'Could not copy to clipboard. Use Download JSON instead.' }
  }
}
</script>

<template>
  <section class="import-export">
    <h3>Import character</h3>
    <p class="import__hint">
      Accepts Cypher character JSON (schema version 2) — the native export from Cypher Tools
      or this sheet's own export.
    </p>
    <input class="import__file" type="file" accept=".json,application/json" @change="onFile" />
    <textarea
      class="import__paste field"
      v-model="pasted"
      rows="4"
      placeholder="…or paste the character JSON here"
    />
    <button class="import__validate btn" type="button" @click="onValidatePaste">Validate pasted JSON</button>

    <div v-if="failure" class="import__alert" role="alert">
      <p>{{ failure.message }}</p>
      <ul v-if="failure.details?.length">
        <li v-for="d in failure.details" :key="d">{{ d }}</li>
      </ul>
    </div>

    <div v-if="pending" class="import__confirm">
      <p>
        Replace the current sheet with <strong>{{ pending.name }}</strong
        >? Everything on this sheet will be overwritten. (Theme and other sheet settings are kept.)
      </p>
      <!-- btn--warn: this overwrites the whole sheet. Destructive and dismissive actions
           must not read as twins (ddd-5vt) — same treatment as an armed row delete. -->
      <button class="import__confirm-yes btn btn--warn" type="button" @click="confirmImport">Replace sheet</button>
      <button class="import__confirm-no btn" type="button" @click="cancelImport">Cancel</button>
    </div>

    <h3>Export character</h3>
    <button class="export__download btn" type="button" @click="onDownload">Download JSON</button>
    <button class="export__copy btn" type="button" @click="onCopy">Copy to clipboard</button>
    <div v-if="exportFailure" class="import__alert export__alert" role="alert">
      <p>{{ exportFailure.message }}</p>
      <ul>
        <li v-for="d in exportFailure.details" :key="d">{{ d }}</li>
      </ul>
    </div>
    <p v-if="copyStatus" class="export__copy-status" :class="{ 'export__copy-status--error': !copyStatus.ok }">
      {{ copyStatus.message }}
    </p>
  </section>
</template>
