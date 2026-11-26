<script setup>
// The row's prose disclosure — the collapsed <details> every editable list closes its
// #row template with. This component owns the STRUCTURE: closed by default, the
// .row-desc skin, and the .field textarea inside it (a bare textarea in a panel is
// exactly what skin-coverage.test.js exists to catch).
//
// `field` names the schema key because the key is not uniform: equipment and attacks
// call their prose `notes` where the other six lists call it `description`
// (item-contents spec §3). The default is the majority convention; the two `notes`
// lists override it at the call site, where that difference is worth seeing.
//
// `label` is a separate prop rather than being capitalised out of `field` — the
// summary is UI wording and the field name is schema, and tying them would make a
// schema rename silently rewrite what the player reads.
defineProps({
  row: { type: Object, required: true },
  field: { type: String, default: 'description' },
  label: { type: String, default: 'Description' },
  rows: { type: Number, default: 2 }
})
</script>

<template>
  <details class="row-desc">
    <summary>{{ label }}</summary>
    <textarea class="field" v-model="row[field]" :rows="rows" />
  </details>
</template>
