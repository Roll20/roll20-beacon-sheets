// The four import failure codes, shared by the character and creature importers.
// A module of its own so creatureImporter.js can use them without importing
// importer.js, which pulls in sheetStore.js and with it Vue, Pinia and the Beacon SDK.
export const FAILURE = {
  NOT_JSON: 'not-json',
  WRONG_KIND: 'wrong-kind',
  NEWER_VERSION: 'newer-version',
  SCHEMA_INVALID: 'schema-invalid'
}
