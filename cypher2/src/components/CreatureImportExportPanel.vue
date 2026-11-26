<script setup>
import { useNpcStore } from '@/stores/npcStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { DEFAULT_CHARACTER_NAME } from '@/stores/index.js'
import { parseAndValidateCreature } from '@/contract/creatureImporter.js'
import { downloadCreatureDocument } from '@/contract/creatureExporter.js'
import { validateCreatureDocument } from '@/contract/creatureValidation.js'
import { useImportExport } from '@/components/useImportExport.js'

const npc = useNpcStore()
const meta = useMetaStore()

// branchToCreatureDoc copies every value verbatim apart from blank intrusions, so a
// bad value that slipped past the form would produce a file this sheet refuses to
// re-import. The creature wording and its five-line cut are unchanged (ddd-ag26 scope).
const describeExportFailure = (doc) => {
  const { valid, errors } = validateCreatureDocument(doc)
  if (valid) return null
  return {
    message: 'This creature cannot be exported yet — fix these fields first:',
    details: errors.slice(0, 5),
    more: 0
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
  parse: parseAndValidateCreature,
  // Spec §8.1 step 4. applyCreatureDoc replaces the stat block and resets current
  // health, but leaves the name alone: the name belongs to the character in both
  // modes (decision 5). Setting it here is the rename the confirmation warned about.
  apply: (doc) => {
    npc.applyCreatureDoc(doc)
    meta.name = doc.name
  },
  buildExport: () => npc.exportCreatureDoc(meta.name || DEFAULT_CHARACTER_NAME),
  describeExportFailure,
  // The file is named after the raw character name, not doc.name, which already holds the
  // DEFAULT_CHARACTER_NAME fallback. A blank name downloads as cypher-creature.json (spec §8.2).
  download: (doc) => downloadCreatureDocument(doc, meta.name)
})
</script>

<template>
  <!-- Each creature-* class is the permanent hook. The import__* / export__* class
       beside it borrows the character panel's rule in main.css, so the two panels
       cannot drift apart visually and this bead adds no CSS. -->
  <section class="creature-import-export">
    <h3>Import creature</h3>
    <p class="creature-import__hint">
      Accepts Cypher creature JSON (schema version 1) — this sheet's own creature export.
    </p>
    <input class="creature-import__file import__file" type="file" accept=".json,application/json" @change="onFile" />
    <textarea
      class="creature-import__paste import__paste field"
      v-model="pasted"
      rows="4"
      placeholder="…or paste the creature JSON here"
    />
    <button class="creature-import__validate btn" type="button" @click="onValidatePaste">Validate pasted JSON</button>

    <div v-if="failure" class="creature-import__alert import__alert" role="alert">
      <p>{{ failure.message }}</p>
      <ul v-if="failure.details?.length">
        <li v-for="d in failure.details" :key="d">{{ d }}</li>
        <li v-if="failure.more">…and {{ failure.more }} more.</li>
      </ul>
    </div>

    <div v-if="pending" class="creature-import__confirm import__confirm">
      <p>
        Import <strong>{{ pending.name }}</strong
        >? The current stat block will be replaced, and the character name will change to
        {{ pending.name }}. Current health resets to {{ pending.health }}.
      </p>
      <!-- btn--warn: this overwrites the stat block and renames the character. Destructive
           and dismissive actions must not read as twins (ddd-5vt). -->
      <button class="creature-import__confirm-yes btn btn--warn" type="button" @click="confirmImport">
        Replace stat block
      </button>
      <button class="creature-import__confirm-no btn" type="button" @click="cancelImport">Cancel</button>
    </div>

    <h3>Export creature</h3>
    <button class="creature-export__download btn" type="button" @click="onDownload">Download JSON</button>
    <button class="creature-export__copy btn" type="button" @click="onCopy">Copy to clipboard</button>
    <div v-if="exportFailure" class="creature-export__alert import__alert" role="alert">
      <p>{{ exportFailure.message }}</p>
      <ul>
        <li v-for="d in exportFailure.details" :key="d">{{ d }}</li>
        <li v-if="exportFailure.more">…and {{ exportFailure.more }} more.</li>
      </ul>
    </div>
    <p
      v-if="copyStatus"
      class="creature-export__copy-status export__copy-status"
      :class="{ 'creature-export__copy-status--error export__copy-status--error': !copyStatus.ok }"
    >
      {{ copyStatus.message }}
    </p>
  </section>
</template>
