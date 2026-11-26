// Spec ⑦ §4.1: seven global tabs become two local switches of three and four. This
// file replaces components/tabs.js — the sheet has no global tab bar any more.
export const CHARACTER_SEGMENTS = [
  { key: 'skills', label: 'Skills' },
  { key: 'abilities', label: 'Abilities' },
  { key: 'advancement', label: 'Advancement' }
]

export const KIT_SEGMENTS = [
  { key: 'attacks', label: 'Attacks' },
  { key: 'cyphers', label: 'Cyphers' },
  { key: 'artifacts', label: 'Artifacts' },
  { key: 'gear', label: 'Gear' }
]

// The full discipline of the retired resolveTab(), for the same three reasons (spec §5):
//
//   1. A Set, NOT `key in PANELS` — the latter would accept 'toString'.
//   2. Falls back to the FIRST segment. Every panel is mounted, so an unknown stored
//      key would leave no panel carrying data-active and render a blank cluster. The
//      fallback is load-bearing, not cosmetic.
//   3. Never writes back. Spec §6 requires the stored value to survive untouched, so
//      widening across the 27rem stack threshold restores the last real choice.
//
// Both the control and the panel host read ONE resolved value — SegmentCluster resolves
// nothing itself, it takes `active` already resolved (see SegmentCluster.vue). That is
// stronger than tabs.js's convention of "both callers must remember to resolve".
const makeResolver = (segments) => {
  const keys = new Set(segments.map((s) => s.key))
  const first = segments[0].key
  return (key) => (keys.has(key) ? key : first)
}

export const resolveCharacterSegment = makeResolver(CHARACTER_SEGMENTS)
export const resolveKitSegment = makeResolver(KIT_SEGMENTS)
