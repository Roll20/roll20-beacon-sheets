/*
Decoding a stored ARRAY back from the layer.

This is NOT in objectify.js on purpose: that file is pinned byte-identical to the Dog
sheet's copy (objectify-identity.test.js) so the two sheets can never disagree about row
ordering, and a Cypher-only helper in it would either break that guard or push dead code
into the other sheet.
 */

// The marker prefix the VTT host wraps a stored array in when it hands back the onInit
// payload (sandbox ground truth, ddd-bt6).
export const ARRAY_MARKER = '$__$'

/*
A stored array, whichever of its three readback shapes arrived. Firebase-backed storage and
the VTT host between them produce all three on a real document (beacon-mapping §3.2,
ddd-bt6): the array itself, a numeric-keyed object, and a '$__$<json>' marker STRING.

Every reader of a stored array goes through here. The decode was written out twice inside
sheetStore, and a third reader would have been a third chance for the three spellings to
drift — the duplicate-seed defect ddd-iohk was filed over.

`fallback` is returned for anything that is not one of the three, for a marker string whose
JSON does not parse, and for one that parses to a non-array.
 */
export const decodeStoredArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.startsWith(ARRAY_MARKER)) {
    try {
      const parsed = JSON.parse(value.slice(ARRAY_MARKER.length))
      return Array.isArray(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }
  // Numeric keys iterate ascending, so the object form preserves the stored order.
  if (value !== null && typeof value === 'object') return Object.values(value)
  return fallback
}
