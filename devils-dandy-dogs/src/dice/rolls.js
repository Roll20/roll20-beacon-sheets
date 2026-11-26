// Pure DDD dice logic. No Beacon/Vue dependencies — fully unit-testable.

const TIER_LABELS = { 3: 'Best', 2: 'Very Good', 1: 'Good' }
export const tierLabel = (count) => TIER_LABELS[count] ?? '—'

// Shadow Riven docks Best (3→2) and Very Good (2→1) by one; Good (1) is unaffected by the floor.
// A 0-value trait (Custom dog) must never gain a die from the floor.
export const effectivePool = (count, shadowRiven) =>
  shadowRiven && count > 0 ? Math.max(1, count - 1) : count

export const FACE = { EYEBROW: 'eyebrow', DUTY: 'duty', DELIGHT: 'delight' }

// Names and outcome text are quoted verbatim from the rulebook's two dice tables:
// "Dice Roll Results" (narrative) and "Dice Results for Combat". The 2–5 face is
// Devil's Duty in BOTH tables — it is never called "Success". Do not paraphrase
// these; the sheet must not invent game terms.
const FACE_TEXT = {
  [FACE.EYEBROW]: {
    narrative: {
      label: 'Devil’s Eyebrow',
      effect:
        'You didn’t just succeed on your action—you succeeded magnificently. The Devil lifts a brow and leans in to hear the story of your excellent and extraordinary success.'
    },
    combat: {
      label: 'Devil’s Tooth & Claw',
      effect:
        'You won the fight against your opponent without taking a single injury. The Devil leans in, waiting to hear the story of your extraordinary success.'
    }
  },
  [FACE.DUTY]: {
    narrative: {
      label: 'Devil’s Duty',
      effect: 'You did what you set out to do, but it wasn’t anything terribly entertaining or exciting.'
    },
    combat: {
      label: 'Devil’s Duty',
      effect: 'You succeed in your attack and are unharmed . . . but the fight’s not over yet.'
    }
  },
  [FACE.DELIGHT]: {
    narrative: {
      label: 'Devil’s Delight',
      effect:
        'You failed on your action, but you did so in the most spectacular way. The Devil laughs with delight and excitedly waits to hear the story of your excellent and extraordinary failure.'
    },
    combat: {
      label: 'Devil’s Concern',
      effect:
        'You failed your attack and became injured physically or emotionally (see Injuries, page 59). The fight may not be over yet. The Devil waits tensely, eager to hear how you fared.'
    }
  }
}

export const faceOf = (value) => {
  if (value === 6) return FACE.EYEBROW
  if (value === 1) return FACE.DELIGHT
  return FACE.DUTY // 2-5
}

export const interpretFace = (value, mode = 'narrative') => {
  const face = faceOf(value)
  return { value, face, ...FACE_TEXT[face][mode] }
}

// No success tally: DDD resolves one die at a time through Call & Response, so a
// count would misrepresent the game (and the old one excluded the 6 outright).
// `showEffect` marks the first die of each face so a three-Duty pool doesn't print
// the same sentence three times.
export const interpretTraitRoll = (values, mode = 'narrative') => {
  const seen = new Set()
  const dice = values.map((v) => {
    const die = interpretFace(v, mode)
    const showEffect = !seen.has(die.face)
    seen.add(die.face)
    return { ...die, showEffect }
  })
  return { dice, mode }
}

// Verbatim from the "Temptation Die Results" table.
export const temptationResult = (value) => {
  const band = value >= 3 ? 'drive' : 'overtaken'
  const lines =
    band === 'drive'
      ? ['Use your Drive successfully', 'Something awesome happens']
      : ['Your Drive overtakes you', 'Gain a Temptation card', 'No more actions until packmate/s aid you']
  return { value, band, lines }
}
