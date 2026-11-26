import type { ArteDef } from '@/maker/types';

/**
 * Structured combat mechanics for an Arte, derived from its rules text. This is the
 * single source casting uses to decide what to roll - keeping the extraction here
 * (typed + testable) rather than ad-hoc in the UI. Later these can be promoted to
 * hand-authored fields on each ArteDef without changing callers.
 */
export interface ArteMechanics {
  /** The Arte requires an Arte attack roll. */
  attack: boolean;
  /** The save the target makes (Body/Mind/Soul/Concentration), 'Save' if unspecified, else null. */
  save: string | null;
  /** Primary damage/healing dice found in the text, if any. */
  dice: { count: number; sides: number } | null;
  /** Whether the dice heal rather than damage (affects card labelling). */
  heals: boolean;
}

const DMG_KEYWORDS =
  'damage|Fire|Cold|Force|Radiant|Necrotic|Lightning|Thunder|Acid|Poison|Psychic|Bludgeoning|Piercing|Slashing';
const HEAL_KEYWORDS = 'heal|restore|regain|hit points|HP';

function detectSave(desc: string): string | null {
  const m = desc.match(/\b(Body|Mind|Soul|Concentration)\b[^.]{0,24}\bsav/i);
  if (m) return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
  if (/saving throw|\bmust save\b/i.test(desc)) return 'Save';
  return null;
}

function detectAttack(desc: string): boolean {
  return (
    /\b(arte|spell|magic|ranged|melee)\s+attack\b/i.test(desc) ||
    /make an?\b[^.]*\battack\b/i.test(desc)
  );
}

/** First dice expression near a damage/healing keyword (so "1d4 rounds" isn't rolled). */
function detectDice(desc: string): {
  dice: { count: number; sides: number } | null;
  heals: boolean;
} {
  const dmg = desc.match(new RegExp(`(\\d*)d(\\d+)(?=[^.]{0,40}(?:${DMG_KEYWORDS}))`, 'i'));
  if (dmg)
    return { dice: { count: dmg[1] ? Number(dmg[1]) : 1, sides: Number(dmg[2]) }, heals: false };
  const heal = desc.match(new RegExp(`(\\d*)d(\\d+)(?=[^.]{0,40}(?:${HEAL_KEYWORDS}))`, 'i'));
  if (heal)
    return { dice: { count: heal[1] ? Number(heal[1]) : 1, sides: Number(heal[2]) }, heals: true };
  return { dice: null, heals: false };
}

export function arteMechanics(arte: ArteDef): ArteMechanics {
  const desc = arte.description || '';
  const { dice, heals } = detectDice(desc);
  return { attack: detectAttack(desc), save: detectSave(desc), dice, heals };
}
