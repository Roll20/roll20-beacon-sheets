<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { parseAndValidate, applyDocument } from '@/contract/importer.js'
import { exportDocument, downloadDocument } from '@/contract/exporter.js'
import { validateCharacterRaw } from '@/contract/validation.js'
import { describeCharacterErrors } from '@/contract/fieldLabels.js'
import { useImportExport } from '@/components/useImportExport.js'

const sheet = useSheetStore()
const meta = useMetaStore()

// Hand-edited text fields (e.g. an emptied row name) can violate the schema's minLength
// floors, producing a file this sheet would refuse to re-import. The refusal names each
// field and where on the sheet to fix it (ddd-ag26).
const describeExportFailure = (doc) => {
  const { valid, errors } = validateCharacterRaw(doc)
  if (valid) return null
  return {
    message: 'This sheet cannot be exported yet — fix these fields first:',
    ...describeCharacterErrors(errors, doc, { mode: 'export' })
  }
}

const {
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
} = useImportExport({
  parse: parseAndValidate,
  apply: (doc) => applyDocument(doc, { sheet, meta }),
  buildExport: () => exportDocument({ sheet, meta }),
  describeExportFailure,
  download: downloadDocument
})
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
        <li v-if="failure.more">…and {{ failure.more }} more.</li>
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
        <li v-if="exportFailure.more">…and {{ exportFailure.more }} more.</li>
      </ul>
    </div>
    <p v-if="copyStatus" class="export__copy-status" :class="{ 'export__copy-status--error': !copyStatus.ok }">
      {{ copyStatus.message }}
    </p>
  </section>
</template>
