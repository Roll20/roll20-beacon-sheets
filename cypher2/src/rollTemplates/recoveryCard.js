// Pure presentation for the recovery-roll chat card (ddd-5v9; reworked by
// ddd-4uhf). Recoveries can be used in ANY order — owner ruling — so the card
// never guesses which slot is being spent: every roll reports the total plus
// the full wound-removal summary for the three timed tiers. That copy is
// static markup in index.hbs, not data — the source's emphasized "all" needs
// an <em> that Handlebars data fields would escape — so this module carries
// only the numbers.
export const recoveryRollTemplateData = ({ die, bonus }) => ({
  title: 'Recovery',
  total: die + bonus,
  breakdown: `1d6 (${die}) + ${bonus} — points to distribute among pools`
})
