// Input clamps that keep hand-edited state inside the schema's floors,
// so the store always exports a valid document (spec §5).
export const clampInt = (v, min = 0) => Math.max(min, Math.floor(Number(v) || 0))
export const clampNumber = (v, min = 0) => Math.max(min, Number(v) || 0)
// equipment/cypher/artifact level: integer >= 1 or null ("no level")
export const toNullableLevel = (v) => (v === '' || v === null || v === undefined ? null : clampInt(v, 1))

// ddd-9sf: when a clamp REJECTS typed input the model does not change, Vue does
// not re-render, and the box keeps text the document does not contain (level 1,
// type 0, box reads 0 while store/export/chat say 1). Every clamped number
// input's @change writes back through this DOM resync — enforced by the sweep
// in clamp-resync.test.js. null renders as an empty box (nullable level).
export const syncClamped = (event, value) => {
  event.target.value = value ?? ''
  return value
}
