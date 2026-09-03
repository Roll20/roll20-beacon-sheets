// Shared read-side vocabulary for the segment row templates, alongside pools.js.
//
// `level` is `integer >= 1 | null` on the three lists that carry one (cyphers,
// artifacts, equipment). Both places that READ it — the summary cell and the item-card
// descriptor (item-contents spec §3.1) — go through here, so neither the wording nor
// the collapse rule (null COLLAPSES; it never renders "Level 0") can drift between the
// two sites or between the three lists. The WRITE side is RowLevel.vue.
//
// Returns literal `false`, not null, when the level is unset. That is the `&&` shape
// every other descriptor fragment in the segments uses, and itemCardTemplateData drops
// booleans and nulls alike (rollTemplates/itemCard.js) — but the `false` is observed,
// not incidental: CyphersSegment.test.js asserts it directly.
export const levelField = (row) => row.level !== null && `Level ${row.level}`
