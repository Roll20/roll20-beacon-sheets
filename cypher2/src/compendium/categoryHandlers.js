// One named handler per Roll20 category (spec ⑥ §4.3, owner ruling 2026-09-16), so a
// category that later needs its own behavior has a place for it. The four share one
// helper: the envelope's kind must agree with the category, or the drop is refused as
// malformed (decision 3). Equipment and Arcs have no droppable pages and no handler.

const toList = ({ kind, list, segmentKey, segment }) => (envelope) =>
  envelope.kind === kind ? { ok: true, list, segmentKey, segment, item: envelope.item } : { ok: false }

export const onDropAbilities = toList({ kind: 'ability', list: 'abilities', segmentKey: 'characterSegment', segment: 'abilities' })
export const onDropSkills = toList({ kind: 'skill', list: 'skills', segmentKey: 'characterSegment', segment: 'skills' })
export const onDropCyphers = toList({ kind: 'cypher', list: 'cyphers', segmentKey: 'kitSegment', segment: 'cyphers' })
// No v1 book ships Artifacts pages. Kept by owner ruling (decision 11).
export const onDropArtifacts = toList({ kind: 'artifact', list: 'artifacts', segmentKey: 'kitSegment', segment: 'artifacts' })

// A Map, not an object literal: `'toString' in {}` is true.
const HANDLERS = new Map([
  ['Abilities', onDropAbilities],
  ['Skills', onDropSkills],
  ['Cyphers', onDropCyphers],
  ['Artifacts', onDropArtifacts]
])

export const handlerFor = (categoryName) => HANDLERS.get(categoryName) ?? null
