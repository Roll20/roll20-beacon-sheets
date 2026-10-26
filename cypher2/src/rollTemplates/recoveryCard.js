// Pure presentation for the recovery-roll chat card (ddd-5v9; reworked by
// ddd-4uhf). Recoveries can be used in ANY order — owner ruling — so the card
// never guesses which slot is being spent: every roll reports the total plus
// the full wound-removal summary for the three timed tiers. That copy is
// static markup in index.hbs, not data — the source's emphasized "all" needs
// an <em> that Handlebars data fields would escape — so this module carries
// the numbers and, since ddd-xrug.1, the one line whose text a player can
// change: the Luck Pool's stored name belongs in an escaped data field, not in
// the template.

// Old Gods of Appalachia's Lucky descriptor (ddd-xrug.1): "When you make a recovery
// roll to recover points to any other Pool, your Luck Pool is also refreshed by the
// same number of points." The sheet cannot do that for the player, because
// rollRecovery mutates nothing: it rolls 1d6, posts this card, and the player
// distributes the points themselves — so there is no number for a refresh to mirror.
// The card therefore carries the rule and the player moves the points, exactly as they
// already move the Pool numbers the breakdown names.
//
// ddd-aqh3 is the open bead that would make a recovery apply points to Pools. When it
// ships there IS a number here, and this line becomes a report of what happened rather
// than a reminder of what to do.
//
// "other" is the descriptor's own word, kept because the spec quotes this rule verbatim
// and bars further paraphrase. The PLURAL is OURS: the book says "any other Pool",
// singular — quoted at the head of this block — and a recovery roll hands the player
// points to distribute among three Pools at once, so a line telling them what the
// refresh mirrors has to name all of them. Either number does the same work, which is
// to exclude Luck: the refresh mirrors points restored to the other Pools, not points
// restored to Luck itself.
//
// The maximum is named because the refresh stops there; the input carries `max` for
// that and nothing else. The Pool's STORED name, because a player who renamed Luck to
// Fortune must not read "Luck" in chat — the same rule the guided card's luckLine
// follows. No fallback for a blank stored name: the contract allows one and a fallback
// would print a name the document does not contain (owner decision, open).
export const luckRefreshLine = (luck) =>
  luck
    ? `${luck.name} also refreshes by the same number of points you restore to other Pools, up to its maximum of ${luck.max}.`
    : null

// `luck` is the caller's SNAPSHOT of { name, max }, never the live Luck object: the
// card describes the character who rolled, not the one who exists once the dice land.
// null for a character with no Luck Pool, which is every current-edition one, and the
// template's {{#if}} leaves those cards byte for byte as they were.
export const recoveryRollTemplateData = ({ die, bonus, luck = null }) => ({
  title: 'Recovery',
  total: die + bonus,
  breakdown: `1d6 (${die}) + ${bonus} — points to distribute among pools`,
  luck: luckRefreshLine(luck)
})
